require("dotenv").config();

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");

const app = express();

const PORT = Number(process.env.PORT) || 5000;
const ADMIN_PASSCODE = String(process.env.ADMIN_PASSCODE || "").trim();
const TRUST_PROXY =
  String(process.env.TRUST_PROXY || "false").toLowerCase() === "true";

if (TRUST_PROXY) {
  app.set("trust proxy", true);
}

const ROOT_DIR = __dirname;
const DATA_FILE = path.join(ROOT_DIR, "data.json");

ensureDataFile();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

const allowedOriginsFromEnv = parseAllowedOrigins(process.env.CORS_ORIGIN);

app.use(
  cors({
    origin(origin, callback) {
      try {
        if (isOriginAllowed(origin, allowedOriginsFromEnv)) {
          return callback(null, true);
        }

        return callback(
          new Error(`Origin not allowed by CORS: ${origin || "unknown"}`),
        );
      } catch (error) {
        return callback(error);
      }
    },
    credentials: false,
  }),
);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024,
  },
});

app.get("/api/health", (_req, res) => {
  return res.json({
    success: true,
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/dashboard/stats", (_req, res) => {
  const db = readDatabase();
  const memories = Array.isArray(db.memories) ? db.memories : [];
  const stories = Array.isArray(db.stories) ? db.stories : [];

  const photoCount = memories.filter(
    (item) => normalizeMemoryType(item.type) === "photo",
  ).length;
  const videoCount = memories.filter(
    (item) => normalizeMemoryType(item.type) === "video",
  ).length;

  return res.json({
    success: true,
    data: {
      totalMemories: memories.length,
      totalStories: stories.length,
      photoCount,
      videoCount,
    },
  });
});

app.get("/api/dashboard/latest", (_req, res) => {
  const db = readDatabase();
  const memories = Array.isArray(db.memories) ? db.memories : [];

  const sorted = [...memories].sort((a, b) => {
    return (
      new Date(b.createdAt || 0).getTime() -
      new Date(a.createdAt || 0).getTime()
    );
  });

  return res.json({
    success: true,
    data: {
      items: sorted.slice(0, 1),
    },
  });
});

app.get("/api/stories", (req, res) => {
  const db = readDatabase();
  const stories = Array.isArray(db.stories) ? db.stories : [];

  const search = String(req.query.search || "")
    .trim()
    .toLowerCase();
  const sort =
    String(req.query.sort || "asc").toLowerCase() === "desc" ? "desc" : "asc";
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.max(Number(req.query.limit) || 5, 1);

  let filtered = [...stories];

  if (search) {
    filtered = filtered.filter((item) => {
      return [item.title, item.text, item.date]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(search);
    });
  }

  filtered.sort((a, b) => {
    const aTime = new Date(a.date || 0).getTime();
    const bTime = new Date(b.date || 0).getTime();
    return sort === "desc" ? bTime - aTime : aTime - bTime;
  });

  const paginated = paginate(filtered, page, limit);

  return res.json({
    success: true,
    data: {
      items: paginated.items,
      pagination: paginated.pagination,
    },
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

  const db = readDatabase();

  const story = {
    id: Date.now(),
    date: String(date).trim(),
    title: String(title).trim(),
    text: String(text).trim(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.stories = Array.isArray(db.stories) ? db.stories : [];
  db.stories.unshift(story);

  writeDatabase(db);

  return res.status(201).json({
    success: true,
    data: story,
  });
});

app.put("/api/stories/:id", requireAdmin, (req, res) => {
  const storyId = String(req.params.id);
  const { date, title, text } = req.body || {};

  if (!date || !title || !text) {
    return res.status(400).json({
      success: false,
      message: "Date, title, and text are required.",
    });
  }

  const db = readDatabase();
  db.stories = Array.isArray(db.stories) ? db.stories : [];

  const index = db.stories.findIndex((item) => String(item.id) === storyId);

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: "Story not found.",
    });
  }

  const existing = db.stories[index];

  const updated = {
    ...existing,
    date: String(date).trim(),
    title: String(title).trim(),
    text: String(text).trim(),
    updatedAt: new Date().toISOString(),
  };

  db.stories[index] = updated;
  writeDatabase(db);

  return res.json({
    success: true,
    data: updated,
  });
});

app.delete("/api/stories/:id", requireAdmin, (req, res) => {
  const storyId = String(req.params.id);

  const db = readDatabase();
  db.stories = Array.isArray(db.stories) ? db.stories : [];

  const beforeCount = db.stories.length;
  db.stories = db.stories.filter((item) => String(item.id) !== storyId);

  if (db.stories.length === beforeCount) {
    return res.status(404).json({
      success: false,
      message: "Story not found.",
    });
  }

  writeDatabase(db);

  return res.json({
    success: true,
    message: "Story deleted successfully.",
  });
});

app.get("/api/memories", (req, res) => {
  const db = readDatabase();
  const memories = Array.isArray(db.memories) ? db.memories : [];

  const search = String(req.query.search || "")
    .trim()
    .toLowerCase();
  const sort =
    String(req.query.sort || "desc").toLowerCase() === "asc" ? "asc" : "desc";
  const type = String(req.query.type || "")
    .trim()
    .toLowerCase();
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.max(Number(req.query.limit) || 12, 1);

  let filtered = [...memories];

  if (type && type !== "all") {
    filtered = filtered.filter(
      (item) => normalizeMemoryType(item.type) === type,
    );
  }

  if (search) {
    filtered = filtered.filter((item) => {
      return [item.title, item.description, item.type]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(search);
    });
  }

  filtered.sort((a, b) => {
    const aTime = new Date(a.createdAt || 0).getTime();
    const bTime = new Date(b.createdAt || 0).getTime();
    return sort === "asc" ? aTime - bTime : bTime - aTime;
  });

  const paginated = paginate(filtered, page, limit);

  return res.json({
    success: true,
    data: {
      items: paginated.items,
      pagination: paginated.pagination,
    },
  });
});

app.post(
  "/api/memories",
  requireAdmin,
  upload.any(),
  async (req, res, next) => {
    try {
      const { title, description, type } = req.body || {};
      const normalizedType = normalizeMemoryType(type);

      if (!title || !description || !normalizedType) {
        return res.status(400).json({
          success: false,
          message: "Title, description, and type are required.",
        });
      }

      if (
        normalizedType !== "photo" &&
        normalizedType !== "video" &&
        normalizedType !== "note"
      ) {
        return res.status(400).json({
          success: false,
          message: "Type must be photo, video, or note.",
        });
      }

      const uploadedFile = pickUploadedFile(req.files);

      if (normalizedType !== "note" && !uploadedFile) {
        return res.status(400).json({
          success: false,
          message: "A photo or video file is required for this memory type.",
        });
      }

      let cloudinaryUpload = null;

      if (uploadedFile) {
        cloudinaryUpload = await uploadBufferToCloudinary(
          uploadedFile.buffer,
          normalizedType,
          uploadedFile.originalname,
        );
      }

      const db = readDatabase();
      db.memories = Array.isArray(db.memories) ? db.memories : [];

      const memory = {
        id: Date.now(),
        title: String(title).trim(),
        description: String(description).trim(),
        type: normalizedType,
        fileUrl: cloudinaryUpload?.secure_url || "",
        cloudinaryPublicId: cloudinaryUpload?.public_id || "",
        cloudinaryResourceType: cloudinaryUpload?.resource_type || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isPinned: false,
      };

      db.memories.unshift(memory);
      writeDatabase(db);

      return res.status(201).json({
        success: true,
        data: memory,
      });
    } catch (error) {
      return next(error);
    }
  },
);

app.put(
  "/api/memories/:id",
  requireAdmin,
  upload.any(),
  async (req, res, next) => {
    try {
      const memoryId = String(req.params.id);
      const { title, description, type, isPinned } = req.body || {};
      const normalizedType = normalizeMemoryType(type);

      const db = readDatabase();
      db.memories = Array.isArray(db.memories) ? db.memories : [];

      const index = db.memories.findIndex(
        (item) => String(item.id) === memoryId,
      );

      if (index === -1) {
        return res.status(404).json({
          success: false,
          message: "Memory not found.",
        });
      }

      if (!title || !description || !normalizedType) {
        return res.status(400).json({
          success: false,
          message: "Title, description, and type are required.",
        });
      }

      const existing = db.memories[index];
      const uploadedFile = pickUploadedFile(req.files);

      let nextFileUrl = existing.fileUrl || "";
      let nextPublicId = existing.cloudinaryPublicId || "";
      let nextResourceType = existing.cloudinaryResourceType || "";

      if (uploadedFile) {
        const cloudinaryUpload = await uploadBufferToCloudinary(
          uploadedFile.buffer,
          normalizedType,
          uploadedFile.originalname,
        );

        if (existing.cloudinaryPublicId) {
          await deleteFromCloudinary(
            existing.cloudinaryPublicId,
            existing.cloudinaryResourceType || "image",
          );
        }

        nextFileUrl = cloudinaryUpload.secure_url || "";
        nextPublicId = cloudinaryUpload.public_id || "";
        nextResourceType = cloudinaryUpload.resource_type || "";
      }

      if (normalizedType === "note") {
        if (existing.cloudinaryPublicId) {
          await deleteFromCloudinary(
            existing.cloudinaryPublicId,
            existing.cloudinaryResourceType || "image",
          );
        }

        nextFileUrl = "";
        nextPublicId = "";
        nextResourceType = "";
      }

      const updated = {
        ...existing,
        title: String(title).trim(),
        description: String(description).trim(),
        type: normalizedType,
        fileUrl: nextFileUrl,
        cloudinaryPublicId: nextPublicId,
        cloudinaryResourceType: nextResourceType,
        isPinned:
          typeof isPinned === "boolean"
            ? isPinned
            : String(isPinned).toLowerCase() === "true",
        updatedAt: new Date().toISOString(),
      };

      db.memories[index] = updated;
      writeDatabase(db);

      return res.json({
        success: true,
        data: updated,
      });
    } catch (error) {
      return next(error);
    }
  },
);

app.delete("/api/memories/:id", requireAdmin, async (req, res, next) => {
  try {
    const memoryId = String(req.params.id);

    const db = readDatabase();
    db.memories = Array.isArray(db.memories) ? db.memories : [];

    const existing = db.memories.find((item) => String(item.id) === memoryId);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Memory not found.",
      });
    }

    db.memories = db.memories.filter((item) => String(item.id) !== memoryId);
    writeDatabase(db);

    if (existing.cloudinaryPublicId) {
      await deleteFromCloudinary(
        existing.cloudinaryPublicId,
        existing.cloudinaryResourceType || "image",
      );
    }

    return res.json({
      success: true,
      message: "Memory deleted successfully.",
    });
  } catch (error) {
    return next(error);
  }
});

app.use((error, _req, res, _next) => {
  console.error("Unhandled server error:", error);

  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File is too large. Maximum upload size is 25MB.",
      });
    }

    return res.status(400).json({
      success: false,
      message: error.message || "Upload failed.",
    });
  }

  if (String(error.message || "").includes("CORS")) {
    return res.status(403).json({
      success: false,
      message: error.message,
    });
  }

  return res.status(500).json({
    success: false,
    message: error.message || "Internal server error.",
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

function requireAdmin(req, res, next) {
  const incomingPasscode = String(req.headers["x-admin-passcode"] || "").trim();

  if (!ADMIN_PASSCODE) {
    return res.status(500).json({
      success: false,
      message: "ADMIN_PASSCODE is not configured on the server.",
    });
  }

  if (!incomingPasscode || incomingPasscode !== ADMIN_PASSCODE) {
    return res.status(401).json({
      success: false,
      message: "Invalid admin passcode.",
    });
  }

  return next();
}

function ensureDataFile() {
  if (!fs.existsSync(DATA_FILE)) {
    const initialData = {
      memories: [],
      stories: [],
    };

    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2), "utf-8");
    return;
  }

  try {
    const current = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
    const next = {
      memories: Array.isArray(current.memories) ? current.memories : [],
      stories: Array.isArray(current.stories) ? current.stories : [],
    };

    fs.writeFileSync(DATA_FILE, JSON.stringify(next, null, 2), "utf-8");
  } catch {
    const safeData = {
      memories: [],
      stories: [],
    };

    fs.writeFileSync(DATA_FILE, JSON.stringify(safeData, null, 2), "utf-8");
  }
}

function readDatabase() {
  ensureDataFile();

  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
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

function writeDatabase(data) {
  const safeData = {
    memories: Array.isArray(data.memories) ? data.memories : [],
    stories: Array.isArray(data.stories) ? data.stories : [],
  };

  fs.writeFileSync(DATA_FILE, JSON.stringify(safeData, null, 2), "utf-8");
}

function paginate(items, page, limit) {
  const total = items.length;
  const totalPages = Math.max(Math.ceil(total / limit), 1);
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedItems = items.slice(startIndex, endIndex);

  return {
    items: paginatedItems,
    pagination: {
      page: currentPage,
      limit,
      total,
      totalPages,
      hasMore: currentPage < totalPages,
    },
  };
}

function normalizeMemoryType(value) {
  const next = String(value || "")
    .trim()
    .toLowerCase();

  if (next === "image") return "photo";
  if (next === "text") return "note";

  return next;
}

function pickUploadedFile(files) {
  if (!Array.isArray(files) || files.length === 0) {
    return null;
  }

  const preferredFieldNames = ["file", "media", "image", "photo", "video"];

  for (const fieldName of preferredFieldNames) {
    const matched = files.find((item) => item.fieldname === fieldName);
    if (matched) return matched;
  }

  return files[0] || null;
}

function parseAllowedOrigins(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function isOriginAllowed(origin, envOrigins) {
  if (!origin) return true;

  if (envOrigins.includes(origin)) return true;

  if (
    origin === "http://localhost:5173" ||
    origin === "http://127.0.0.1:5173" ||
    origin === "http://localhost:4173" ||
    origin === "http://127.0.0.1:4173"
  ) {
    return true;
  }

  try {
    const hostname = new URL(origin).hostname;

    if (hostname.endsWith(".vercel.app")) return true;
    if (hostname.endsWith(".onrender.com")) return true;
  } catch {
    return false;
  }

  return false;
}

async function uploadBufferToCloudinary(buffer, memoryType, originalName) {
  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    throw new Error("Cloudinary environment variables are missing.");
  }

  const resourceType = memoryType === "video" ? "video" : "image";
  const folder =
    memoryType === "video" ? "pink-website/videos" : "pink-website/photos";
  const publicIdBase = sanitizePublicId(originalName || `memory-${Date.now()}`);

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        public_id: `${Date.now()}-${publicIdBase}`,
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        return resolve(result);
      },
    );

    stream.end(buffer);
  });
}

async function deleteFromCloudinary(publicId, resourceType) {
  if (!publicId) return;

  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType || "image",
    });
  } catch (error) {
    console.error("Failed to delete asset from Cloudinary:", error);
  }
}

function sanitizePublicId(filename) {
  const extension = path.extname(String(filename || ""));
  const baseName = path.basename(String(filename || "file"), extension);

  return baseName
    .replace(/[^\w\-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}
