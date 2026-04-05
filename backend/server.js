import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

function parseBoolean(value, fallback = false) {
  if (typeof value !== "string") return fallback;
  const normalized = value.trim().toLowerCase();
  if (normalized === "true") return true;
  if (normalized === "false") return false;
  return fallback;
}

function parseAllowedOrigins(value) {
  if (!value || typeof value !== "string") return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

const PORT = Number(process.env.PORT) || 5000;
const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE || "";
const TRUST_PROXY = parseBoolean(process.env.TRUST_PROXY, false);
const allowedOrigins = parseAllowedOrigins(process.env.CORS_ORIGIN);

app.set("trust proxy", TRUST_PROXY);

const corsOptions = {
  origin(origin, callback) {
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.length === 0) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "x-admin-passcode"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const uploadsDir = path.join(__dirname, "uploads");
const dataFilePath = path.join(__dirname, "data.json");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

if (!fs.existsSync(dataFilePath)) {
  fs.writeFileSync(
    dataFilePath,
    JSON.stringify(
      {
        memories: [],
        stories: [],
      },
      null,
      2,
    ),
  );
}

app.use("/uploads", express.static(uploadsDir));

function readData() {
  try {
    const raw = fs.readFileSync(dataFilePath, "utf8");
    const parsed = JSON.parse(raw);

    return {
      memories: Array.isArray(parsed.memories) ? parsed.memories : [],
      stories: Array.isArray(parsed.stories) ? parsed.stories : [],
    };
  } catch {
    return {
      memories: [],
      stories: [],
    };
  }
}

function writeData(data) {
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
}

function requireAdmin(req, res, next) {
  const passcode = req.header("x-admin-passcode");

  if (!ADMIN_PASSCODE) {
    return res.status(500).json({
      success: false,
      message: "Admin passcode is not configured on the server.",
    });
  }

  if (!passcode || passcode !== ADMIN_PASSCODE) {
    return res.status(401).json({
      success: false,
      message: "Invalid admin passcode.",
    });
  }

  next();
}

function sortStories(items, sort = "asc") {
  return [...items].sort((a, b) => {
    const first = new Date(a.date).getTime();
    const second = new Date(b.date).getTime();

    if (sort === "desc") {
      return second - first;
    }

    return first - second;
  });
}

function paginate(items, page = 1, limit = 5) {
  const currentPage = Math.max(1, Number(page) || 1);
  const currentLimit = Math.max(1, Number(limit) || 5);
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / currentLimit));
  const startIndex = (currentPage - 1) * currentLimit;
  const endIndex = startIndex + currentLimit;

  return {
    items: items.slice(startIndex, endIndex),
    pagination: {
      page: currentPage,
      limit: currentLimit,
      total,
      totalPages,
      hasMore: currentPage < totalPages,
    },
  };
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadsDir);
  },
  filename(req, file, cb) {
    const safeName = file.originalname.replace(/\s+/g, "-");
    cb(null, `${Date.now()}-${safeName}`);
  },
});

const upload = multer({ storage });

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/stories", (req, res) => {
  const data = readData();
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 5;
  const sort = req.query.sort === "desc" ? "desc" : "asc";
  const search = String(req.query.search || "")
    .trim()
    .toLowerCase();

  let stories = sortStories(data.stories, sort);

  if (search) {
    stories = stories.filter((item) => {
      const title = String(item.title || "").toLowerCase();
      const text = String(item.text || "").toLowerCase();
      const date = String(item.date || "").toLowerCase();

      return (
        title.includes(search) || text.includes(search) || date.includes(search)
      );
    });
  }

  const result = paginate(stories, page, limit);

  res.json({
    success: true,
    data: result,
  });
});

app.post("/api/stories", requireAdmin, (req, res) => {
  const { date, title, text } = req.body || {};

  if (!date || !title || !text) {
    return res.status(400).json({
      success: false,
      message: "Date, title, and text are required.",
    });
  }

  const data = readData();

  const newStory = {
    id: Date.now(),
    date: String(date).trim(),
    title: String(title).trim(),
    text: String(text).trim(),
  };

  data.stories.push(newStory);
  writeData(data);

  return res.status(201).json({
    success: true,
    data: newStory,
  });
});

app.put("/api/stories/:id", requireAdmin, (req, res) => {
  const { id } = req.params;
  const { date, title, text } = req.body || {};

  if (!date || !title || !text) {
    return res.status(400).json({
      success: false,
      message: "Date, title, and text are required.",
    });
  }

  const data = readData();
  const storyId = Number(id);
  const index = data.stories.findIndex((item) => Number(item.id) === storyId);

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: "Story not found.",
    });
  }

  data.stories[index] = {
    ...data.stories[index],
    date: String(date).trim(),
    title: String(title).trim(),
    text: String(text).trim(),
  };

  writeData(data);

  return res.json({
    success: true,
    data: data.stories[index],
  });
});

app.delete("/api/stories/:id", requireAdmin, (req, res) => {
  const { id } = req.params;
  const data = readData();
  const storyId = Number(id);

  const nextStories = data.stories.filter(
    (item) => Number(item.id) !== storyId,
  );

  if (nextStories.length === data.stories.length) {
    return res.status(404).json({
      success: false,
      message: "Story not found.",
    });
  }

  data.stories = nextStories;
  writeData(data);

  return res.json({
    success: true,
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
