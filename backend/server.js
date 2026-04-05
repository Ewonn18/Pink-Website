const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

const PORT = Number(process.env.PORT) || 5000;
const ADMIN_PASSCODE = String(process.env.ADMIN_PASSCODE || "").trim();
const TRUST_PROXY =
  String(process.env.TRUST_PROXY || "false").toLowerCase() === "true";

const DATA_FILE = path.join(__dirname, "data.json");
const UPLOADS_DIR = path.join(__dirname, "uploads");

if (TRUST_PROXY) {
  app.set("trust proxy", true);
}

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

function parseAllowedOrigins(value) {
  if (!value || typeof value !== "string") return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

const allowedOrigins = parseAllowedOrigins(process.env.CORS_ORIGIN);

const corsOptions = {
  origin(origin, callback) {
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`Origin not allowed by CORS: ${origin}`));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "x-admin-passcode"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(UPLOADS_DIR));

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, UPLOADS_DIR);
  },
  filename(req, file, cb) {
    const safeOriginal = String(file.originalname || "file")
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9._-]/g, "");

    cb(
      null,
      `${Date.now()}-${Math.round(Math.random() * 1e9)}-${safeOriginal}`,
    );
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 30 * 1024 * 1024,
  },
});

function ensureDataFile() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(
      DATA_FILE,
      JSON.stringify({ memories: [], stories: [] }, null, 2),
      "utf8",
    );
  }
}

function readData() {
  ensureDataFile();

  try {
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw || "{}");

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

function writeData(nextData) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(nextData, null, 2), "utf8");
}

function success(res, data = {}, status = 200) {
  return res.status(status).json({
    success: true,
    data,
  });
}

function fail(res, message = "Request failed.", status = 400) {
  return res.status(status).json({
    success: false,
    message,
  });
}

function requireAdmin(req, res, next) {
  if (!ADMIN_PASSCODE) {
    return fail(res, "Admin passcode is not configured on the server.", 500);
  }

  const incoming = String(req.headers["x-admin-passcode"] || "").trim();

  if (!incoming || incoming !== ADMIN_PASSCODE) {
    return fail(res, "Invalid admin passcode.", 401);
  }

  next();
}

function sortStories(items, sort = "asc") {
  const copy = [...items];

  copy.sort((a, b) => {
    const aTime = new Date(a.date || 0).getTime();
    const bTime = new Date(b.date || 0).getTime();

    return sort === "desc" ? bTime - aTime : aTime - bTime;
  });

  return copy;
}

function sortMemoriesNewest(items) {
  return [...items].sort((a, b) => {
    const aTime = new Date(a.createdAt || 0).getTime();
    const bTime = new Date(b.createdAt || 0).getTime();
    return bTime - aTime;
  });
}

app.get("/", (req, res) => {
  return res.json({
    success: true,
    message: "Pink backend is running.",
  });
});

app.get("/health", (req, res) => {
  return res.json({
    success: true,
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/health", (req, res) => {
  return res.json({
    success: true,
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

/* -----------------------------
   STORIES
----------------------------- */

app.get("/api/stories", (req, res) => {
  const data = readData();

  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.max(Number(req.query.limit) || 5, 1);
  const sort = req.query.sort === "desc" ? "desc" : "asc";
  const search = String(req.query.search || "")
    .trim()
    .toLowerCase();

  let items = Array.isArray(data.stories) ? data.stories : [];

  if (search) {
    items = items.filter((item) => {
      const title = String(item.title || "").toLowerCase();
      const text = String(item.text || "").toLowerCase();
      const date = String(item.date || "").toLowerCase();

      return (
        title.includes(search) || text.includes(search) || date.includes(search)
      );
    });
  }

  items = sortStories(items, sort);

  const total = items.length;
  const totalPages = Math.max(Math.ceil(total / limit), 1);
  const startIndex = (page - 1) * limit;
  const pagedItems = items.slice(startIndex, startIndex + limit);

  return success(res, {
    items: pagedItems,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasMore: page < totalPages,
    },
  });
});

app.post("/api/stories", requireAdmin, (req, res) => {
  const { date, title, text } = req.body || {};

  if (!date || !title || !text) {
    return fail(res, "Date, title, and text are required.", 400);
  }

  const data = readData();

  const newStory = {
    id: Date.now(),
    date: String(date).trim(),
    title: String(title).trim(),
    text: String(text).trim(),
    createdAt: new Date().toISOString(),
  };

  data.stories.unshift(newStory);
  writeData(data);

  return success(res, newStory, 201);
});

app.put("/api/stories/:id", requireAdmin, (req, res) => {
  const { id } = req.params;
  const { date, title, text } = req.body || {};

  if (!date || !title || !text) {
    return fail(res, "Date, title, and text are required.", 400);
  }

  const data = readData();
  const index = data.stories.findIndex(
    (item) => String(item.id) === String(id),
  );

  if (index === -1) {
    return fail(res, "Story not found.", 404);
  }

  data.stories[index] = {
    ...data.stories[index],
    date: String(date).trim(),
    title: String(title).trim(),
    text: String(text).trim(),
    updatedAt: new Date().toISOString(),
  };

  writeData(data);

  return success(res, data.stories[index]);
});

app.delete("/api/stories/:id", requireAdmin, (req, res) => {
  const { id } = req.params;

  const data = readData();
  const index = data.stories.findIndex(
    (item) => String(item.id) === String(id),
  );

  if (index === -1) {
    return fail(res, "Story not found.", 404);
  }

  const removed = data.stories[index];
  data.stories.splice(index, 1);
  writeData(data);

  return success(res, removed);
});

/* -----------------------------
   MEMORIES
----------------------------- */

app.get("/api/memories", (req, res) => {
  const data = readData();

  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.max(Number(req.query.limit) || 12, 1);
  const search = String(req.query.search || "")
    .trim()
    .toLowerCase();
  const type = String(req.query.type || "")
    .trim()
    .toLowerCase();

  let items = sortMemoriesNewest(data.memories);

  if (type) {
    items = items.filter(
      (item) => String(item.type || "").toLowerCase() === type,
    );
  }

  if (search) {
    items = items.filter((item) => {
      const title = String(item.title || "").toLowerCase();
      const description = String(item.description || "").toLowerCase();
      return title.includes(search) || description.includes(search);
    });
  }

  const total = items.length;
  const totalPages = Math.max(Math.ceil(total / limit), 1);
  const startIndex = (page - 1) * limit;
  const pagedItems = items.slice(startIndex, startIndex + limit);

  return success(res, {
    items: pagedItems,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasMore: page < totalPages,
    },
  });
});

app.post("/api/memories", requireAdmin, upload.single("file"), (req, res) => {
  const data = readData();

  const title = String(req.body.title || "").trim();
  const description = String(req.body.description || "").trim();
  const type = String(req.body.type || "")
    .trim()
    .toLowerCase();

  if (!title || !type) {
    return fail(res, "Title and type are required.", 400);
  }

  let fileUrl = String(req.body.fileUrl || "").trim();

  if (req.file) {
    fileUrl = `/uploads/${req.file.filename}`;
  }

  const newMemory = {
    id: Date.now(),
    title,
    description,
    type,
    fileUrl,
    createdAt: new Date().toISOString(),
    isPinned: false,
  };

  data.memories.unshift(newMemory);
  writeData(data);

  return success(res, newMemory, 201);
});

app.put(
  "/api/memories/:id",
  requireAdmin,
  upload.single("file"),
  (req, res) => {
    const { id } = req.params;
    const data = readData();

    const index = data.memories.findIndex(
      (item) => String(item.id) === String(id),
    );

    if (index === -1) {
      return fail(res, "Memory not found.", 404);
    }

    const current = data.memories[index];

    let fileUrl = current.fileUrl || "";

    if (req.file) {
      fileUrl = `/uploads/${req.file.filename}`;
    } else if (req.body.fileUrl) {
      fileUrl = String(req.body.fileUrl).trim();
    }

    data.memories[index] = {
      ...current,
      title: String(req.body.title || current.title || "").trim(),
      description: String(
        req.body.description || current.description || "",
      ).trim(),
      type: String(req.body.type || current.type || "")
        .trim()
        .toLowerCase(),
      fileUrl,
      isPinned:
        typeof req.body.isPinned === "undefined"
          ? current.isPinned
          : String(req.body.isPinned) === "true" || req.body.isPinned === true,
      updatedAt: new Date().toISOString(),
    };

    writeData(data);

    return success(res, data.memories[index]);
  },
);

app.delete("/api/memories/:id", requireAdmin, (req, res) => {
  const { id } = req.params;
  const data = readData();

  const index = data.memories.findIndex(
    (item) => String(item.id) === String(id),
  );

  if (index === -1) {
    return fail(res, "Memory not found.", 404);
  }

  const removed = data.memories[index];
  data.memories.splice(index, 1);
  writeData(data);

  return success(res, removed);
});

/* -----------------------------
   DASHBOARD
----------------------------- */

app.get("/api/stats", (req, res) => {
  const data = readData();
  const memories = Array.isArray(data.memories) ? data.memories : [];
  const stories = Array.isArray(data.stories) ? data.stories : [];

  const photoCount = memories.filter((item) => item.type === "photo").length;
  const videoCount = memories.filter((item) => item.type === "video").length;

  return success(res, {
    totalMemories: memories.length,
    totalStories: stories.length,
    photoCount,
    videoCount,
  });
});

app.get("/api/latest-memory", (req, res) => {
  const data = readData();
  const items = sortMemoriesNewest(data.memories);
  const latest = items[0] || null;

  return success(res, {
    items: latest ? [latest] : [],
  });
});

/* -----------------------------
   ERROR HANDLING
----------------------------- */

app.use((error, req, res, next) => {
  console.error("Unhandled server error:", error);

  if (error instanceof multer.MulterError) {
    return fail(res, error.message || "Upload failed.", 400);
  }

  if (error && error.message && error.message.includes("CORS")) {
    return fail(res, error.message, 403);
  }

  return fail(res, "Internal server error.", 500);
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
