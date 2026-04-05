import express from "express";
import cors from "cors";
import multer from "multer";
import fs from "fs/promises";
import fsSync from "fs";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.disable("x-powered-by");

const PORT = Number(process.env.PORT) || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";
const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE || "";
const TRUST_PROXY =
  String(process.env.TRUST_PROXY || "false").toLowerCase() === "true";

const uploadsDir = path.join(__dirname, "uploads");
const dataFile = path.join(__dirname, "data.json");

const MEMORY_TYPES = ["photo", "video", "story"];

const IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const VIDEO_MIME_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
const ALLOWED_MIME_TYPES = [...IMAGE_MIME_TYPES, ...VIDEO_MIME_TYPES];

const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
const VIDEO_EXTENSIONS = [".mp4", ".webm", ".mov"];
const ALLOWED_EXTENSIONS = [...IMAGE_EXTENSIONS, ...VIDEO_EXTENSIONS];

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const MAX_TITLE_LENGTH = 120;
const MAX_DESCRIPTION_LENGTH = 1500;
const MAX_STORY_TITLE_LENGTH = 120;
const MAX_STORY_TEXT_LENGTH = 6000;

if (TRUST_PROXY) {
  app.set("trust proxy", 1);
}

if (!fsSync.existsSync(uploadsDir)) {
  fsSync.mkdirSync(uploadsDir, { recursive: true });
}

function createDefaultData() {
  return {
    memories: [],
    stories: [],
  };
}

if (!fsSync.existsSync(dataFile)) {
  fsSync.writeFileSync(dataFile, JSON.stringify(createDefaultData(), null, 2));
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

    if (allowedOrigins.length === 0) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS."));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "x-admin-passcode"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json({ limit: "10mb" }));
app.use(
  "/uploads",
  express.static(uploadsDir, {
    maxAge: NODE_ENV === "production" ? "7d" : 0,
    etag: true,
  }),
);

function success(res, data, status = 200) {
  return res.status(status).json({
    success: true,
    data,
  });
}

function failure(res, message, status = 400) {
  return res.status(status).json({
    success: false,
    message,
  });
}

function sanitizeText(value) {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim();
}

function isNonEmptyString(value) {
  return typeof value === "string" && sanitizeText(value).length > 0;
}

function isValidMemoryType(type) {
  return MEMORY_TYPES.includes(type);
}

function getFileExtension(filename = "") {
  return path.extname(filename).toLowerCase();
}

function isAllowedFile(file) {
  if (!file) return false;

  const extension = getFileExtension(file.originalname);
  return (
    ALLOWED_MIME_TYPES.includes(file.mimetype) &&
    ALLOWED_EXTENSIONS.includes(extension)
  );
}

function isImageFile(file) {
  if (!file) return false;
  return (
    IMAGE_MIME_TYPES.includes(file.mimetype) &&
    IMAGE_EXTENSIONS.includes(getFileExtension(file.originalname))
  );
}

function isVideoFile(file) {
  if (!file) return false;
  return (
    VIDEO_MIME_TYPES.includes(file.mimetype) &&
    VIDEO_EXTENSIONS.includes(getFileExtension(file.originalname))
  );
}

function safeFileName(originalName) {
  const extension = getFileExtension(originalName);
  const baseName = path.basename(originalName, extension);

  const cleanedBase = baseName
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  const safeBase = cleanedBase || "file";
  return `${safeBase}${extension.toLowerCase()}`;
}

function parseBoolean(value) {
  if (typeof value === "boolean") return value;
  if (typeof value !== "string") return false;
  return ["true", "1", "yes", "on"].includes(value.toLowerCase());
}

function parseId(value) {
  const id = Number(value);
  return Number.isFinite(id) ? id : null;
}

function ensureDataShape(data) {
  return {
    memories: Array.isArray(data?.memories) ? data.memories : [],
    stories: Array.isArray(data?.stories) ? data.stories : [],
  };
}

async function readData() {
  try {
    const raw = await fs.readFile(dataFile, "utf-8");
    const parsed = JSON.parse(raw);
    return ensureDataShape(parsed);
  } catch {
    const fallback = createDefaultData();
    await safeWriteData(fallback);
    return fallback;
  }
}

async function safeWriteData(data) {
  const safeData = ensureDataShape(data);
  const tempFile = `${dataFile}.tmp`;
  await fs.writeFile(tempFile, JSON.stringify(safeData, null, 2), "utf-8");
  await fs.rename(tempFile, dataFile);
}

async function deletePhysicalFile(fileUrl) {
  if (!fileUrl || typeof fileUrl !== "string") return;
  if (!fileUrl.startsWith("/uploads/")) return;

  const filePath = path.join(__dirname, fileUrl.replace(/^\//, ""));
  try {
    await fs.unlink(filePath);
  } catch {
    // ignore missing file
  }
}

async function cleanupUploadedFile(file) {
  if (!file?.filename) return;
  await deletePhysicalFile(`/uploads/${file.filename}`);
}

function paginate(items, pageValue, limitValue) {
  const total = items.length;
  const page = Math.max(1, Number.parseInt(pageValue, 10) || 1);
  const limit = Math.min(
    50,
    Math.max(1, Number.parseInt(limitValue, 10) || 10),
  );

  const startIndex = (page - 1) * limit;
  const paginatedItems = items.slice(startIndex, startIndex + limit);

  return {
    items: paginatedItems,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      hasMore: startIndex + limit < total,
    },
  };
}

function requireAdmin(req, res, next) {
  if (!ADMIN_PASSCODE) return next();

  const providedPasscode = req.headers["x-admin-passcode"];
  if (providedPasscode !== ADMIN_PASSCODE) {
    return failure(res, "Unauthorized action.", 401);
  }

  next();
}

function validateStoryInput({ date, title, text }) {
  const cleanDate = sanitizeText(date);
  const cleanTitle = sanitizeText(title);
  const cleanText = sanitizeText(text);

  if (!isNonEmptyString(cleanDate)) {
    return { valid: false, message: "Date is required." };
  }

  if (!isNonEmptyString(cleanTitle)) {
    return { valid: false, message: "Title is required." };
  }

  if (!isNonEmptyString(cleanText)) {
    return { valid: false, message: "Story text is required." };
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(cleanDate)) {
    return { valid: false, message: "Date must be in YYYY-MM-DD format." };
  }

  const parsedDate = new Date(`${cleanDate}T00:00:00`);
  if (Number.isNaN(parsedDate.getTime())) {
    return { valid: false, message: "Invalid date." };
  }

  if (cleanTitle.length > MAX_STORY_TITLE_LENGTH) {
    return {
      valid: false,
      message: `Title must be ${MAX_STORY_TITLE_LENGTH} characters or fewer.`,
    };
  }

  if (cleanText.length > MAX_STORY_TEXT_LENGTH) {
    return {
      valid: false,
      message: `Story text must be ${MAX_STORY_TEXT_LENGTH} characters or fewer.`,
    };
  }

  return {
    valid: true,
    value: {
      date: cleanDate,
      title: cleanTitle,
      text: cleanText,
    },
  };
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadsDir);
  },
  filename(req, file, cb) {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}-${safeFileName(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter(req, file, cb) {
    if (!isAllowedFile(file)) {
      return cb(
        new Error("Only valid image and video files are allowed for upload."),
      );
    }

    cb(null, true);
  },
});

app.get("/", (req, res) => {
  return success(res, { message: "PINK backend is running." });
});

app.get("/api/health", async (req, res) => {
  try {
    const data = await readData();
    return success(res, {
      status: "ok",
      memories: data.memories.length,
      stories: data.stories.length,
      uptimeSeconds: Math.floor(process.uptime()),
      environment: NODE_ENV,
    });
  } catch {
    return failure(res, "Health check failed.", 500);
  }
});

app.get("/api/stats", async (req, res) => {
  try {
    const data = await readData();
    const photoCount = data.memories.filter(
      (item) => item.type === "photo",
    ).length;
    const videoCount = data.memories.filter(
      (item) => item.type === "video",
    ).length;
    const storyMemoryCount = data.memories.filter(
      (item) => item.type === "story",
    ).length;
    const pinnedCount = data.memories.filter((item) => item.isPinned).length;

    return success(res, {
      totalMemories: data.memories.length,
      totalStories: data.stories.length,
      photoCount,
      videoCount,
      storyMemoryCount,
      pinnedCount,
    });
  } catch {
    return failure(res, "Failed to fetch stats.", 500);
  }
});

app.get("/api/memories", async (req, res) => {
  try {
    const { page, limit, type, search } = req.query;
    const data = await readData();

    let filteredMemories = [...data.memories];

    const cleanType = sanitizeText(type || "").toLowerCase();
    const cleanSearch = sanitizeText(search || "").toLowerCase();

    if (cleanType && isValidMemoryType(cleanType)) {
      filteredMemories = filteredMemories.filter(
        (item) => item.type === cleanType,
      );
    }

    if (cleanSearch) {
      filteredMemories = filteredMemories.filter((item) => {
        const title = sanitizeText(item.title).toLowerCase();
        const description = sanitizeText(item.description).toLowerCase();
        return title.includes(cleanSearch) || description.includes(cleanSearch);
      });
    }

    const sortedMemories = filteredMemories.sort((a, b) => {
      if ((b.isPinned ? 1 : 0) !== (a.isPinned ? 1 : 0)) {
        return (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0);
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return success(res, paginate(sortedMemories, page, limit));
  } catch {
    return failure(res, "Failed to fetch memories.", 500);
  }
});

app.post(
  "/api/memories",
  requireAdmin,
  upload.single("file"),
  async (req, res) => {
    try {
      const title = sanitizeText(req.body.title);
      const description = sanitizeText(req.body.description);
      const type = sanitizeText(req.body.type).toLowerCase();
      const file = req.file || null;

      if (!isNonEmptyString(title)) {
        if (file) await cleanupUploadedFile(file);
        return failure(res, "Title is required.", 400);
      }

      if (!isNonEmptyString(description)) {
        if (file) await cleanupUploadedFile(file);
        return failure(res, "Description is required.", 400);
      }

      if (!isValidMemoryType(type)) {
        if (file) await cleanupUploadedFile(file);
        return failure(res, "Invalid memory type.", 400);
      }

      if (title.length > MAX_TITLE_LENGTH) {
        if (file) await cleanupUploadedFile(file);
        return failure(
          res,
          `Title must be ${MAX_TITLE_LENGTH} characters or fewer.`,
          400,
        );
      }

      if (description.length > MAX_DESCRIPTION_LENGTH) {
        if (file) await cleanupUploadedFile(file);
        return failure(
          res,
          `Description must be ${MAX_DESCRIPTION_LENGTH} characters or fewer.`,
          400,
        );
      }

      if (type === "story" && file) {
        await cleanupUploadedFile(file);
        return failure(
          res,
          "Story memories cannot have an uploaded file.",
          400,
        );
      }

      if (type === "photo" && !file) {
        return failure(
          res,
          "A photo file is required for photo memories.",
          400,
        );
      }

      if (type === "video" && !file) {
        return failure(
          res,
          "A video file is required for video memories.",
          400,
        );
      }

      if (type === "photo" && file && !isImageFile(file)) {
        await cleanupUploadedFile(file);
        return failure(res, "Photo memories only accept image files.", 400);
      }

      if (type === "video" && file && !isVideoFile(file)) {
        await cleanupUploadedFile(file);
        return failure(res, "Video memories only accept video files.", 400);
      }

      const data = await readData();

      const newMemory = {
        id: Date.now(),
        title,
        description,
        type,
        fileUrl: file ? `/uploads/${file.filename}` : "",
        createdAt: new Date().toISOString(),
        isPinned: false,
      };

      data.memories.push(newMemory);
      await safeWriteData(data);

      return success(res, newMemory, 201);
    } catch (error) {
      if (req.file) {
        await cleanupUploadedFile(req.file);
      }
      console.error("POST /api/memories failed:", error);
      return failure(res, "Failed to save memory.", 500);
    }
  },
);

app.put(
  "/api/memories/:id",
  requireAdmin,
  upload.single("file"),
  async (req, res) => {
    try {
      const id = parseId(req.params.id);
      if (id === null) {
        if (req.file) await cleanupUploadedFile(req.file);
        return failure(res, "Invalid memory id.", 400);
      }

      const title = sanitizeText(req.body.title);
      const description = sanitizeText(req.body.description);
      const type = sanitizeText(req.body.type).toLowerCase();
      const removeFile = parseBoolean(req.body.removeFile);
      const newFile = req.file || null;

      if (!isNonEmptyString(title)) {
        if (newFile) await cleanupUploadedFile(newFile);
        return failure(res, "Title is required.", 400);
      }

      if (!isNonEmptyString(description)) {
        if (newFile) await cleanupUploadedFile(newFile);
        return failure(res, "Description is required.", 400);
      }

      if (!isValidMemoryType(type)) {
        if (newFile) await cleanupUploadedFile(newFile);
        return failure(res, "Invalid memory type.", 400);
      }

      if (title.length > MAX_TITLE_LENGTH) {
        if (newFile) await cleanupUploadedFile(newFile);
        return failure(
          res,
          `Title must be ${MAX_TITLE_LENGTH} characters or fewer.`,
          400,
        );
      }

      if (description.length > MAX_DESCRIPTION_LENGTH) {
        if (newFile) await cleanupUploadedFile(newFile);
        return failure(
          res,
          `Description must be ${MAX_DESCRIPTION_LENGTH} characters or fewer.`,
          400,
        );
      }

      const data = await readData();
      const memoryIndex = data.memories.findIndex((item) => item.id === id);

      if (memoryIndex === -1) {
        if (newFile) await cleanupUploadedFile(newFile);
        return failure(res, "Memory not found.", 404);
      }

      const existingMemory = data.memories[memoryIndex];
      const existingFileUrl = existingMemory.fileUrl || "";
      const hasExistingFile = Boolean(existingFileUrl);
      const willRemoveExistingFile = removeFile || type === "story";
      const finalHasFile = newFile
        ? true
        : hasExistingFile && !willRemoveExistingFile;

      if (type === "story" && newFile) {
        await cleanupUploadedFile(newFile);
        return failure(
          res,
          "Story memories cannot have an uploaded file.",
          400,
        );
      }

      if (type === "photo" && newFile && !isImageFile(newFile)) {
        await cleanupUploadedFile(newFile);
        return failure(res, "Photo memories only accept image files.", 400);
      }

      if (type === "video" && newFile && !isVideoFile(newFile)) {
        await cleanupUploadedFile(newFile);
        return failure(res, "Video memories only accept video files.", 400);
      }

      if ((type === "photo" || type === "video") && !finalHasFile) {
        if (newFile) await cleanupUploadedFile(newFile);
        return failure(
          res,
          `A ${type} file is required for ${type} memories.`,
          400,
        );
      }

      if (
        type === "photo" &&
        hasExistingFile &&
        !newFile &&
        !willRemoveExistingFile
      ) {
        const existingExt = getFileExtension(existingFileUrl);
        if (!IMAGE_EXTENSIONS.includes(existingExt)) {
          return failure(
            res,
            "This memory currently has a non-image file. Replace or remove it first.",
            400,
          );
        }
      }

      if (
        type === "video" &&
        hasExistingFile &&
        !newFile &&
        !willRemoveExistingFile
      ) {
        const existingExt = getFileExtension(existingFileUrl);
        if (!VIDEO_EXTENSIONS.includes(existingExt)) {
          return failure(
            res,
            "This memory currently has a non-video file. Replace or remove it first.",
            400,
          );
        }
      }

      let nextFileUrl = existingFileUrl;

      if (willRemoveExistingFile) {
        nextFileUrl = "";
      }

      if (newFile) {
        nextFileUrl = `/uploads/${newFile.filename}`;
      }

      data.memories[memoryIndex] = {
        ...existingMemory,
        title,
        description,
        type,
        fileUrl: nextFileUrl,
      };

      await safeWriteData(data);

      if ((willRemoveExistingFile || newFile) && hasExistingFile) {
        await deletePhysicalFile(existingFileUrl);
      }

      return success(res, data.memories[memoryIndex]);
    } catch (error) {
      if (req.file) {
        await cleanupUploadedFile(req.file);
      }
      console.error("PUT /api/memories/:id failed:", error);
      return failure(res, "Failed to update memory.", 500);
    }
  },
);

app.patch("/api/memories/:id/pin", requireAdmin, async (req, res) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      return failure(res, "Invalid memory id.", 400);
    }

    const data = await readData();
    const memoryIndex = data.memories.findIndex((item) => item.id === id);

    if (memoryIndex === -1) {
      return failure(res, "Memory not found.", 404);
    }

    data.memories[memoryIndex].isPinned = !data.memories[memoryIndex].isPinned;
    await safeWriteData(data);

    return success(res, data.memories[memoryIndex]);
  } catch (error) {
    console.error("PATCH /api/memories/:id/pin failed:", error);
    return failure(res, "Failed to update pin status.", 500);
  }
});

app.delete("/api/memories/:id", requireAdmin, async (req, res) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      return failure(res, "Invalid memory id.", 400);
    }

    const data = await readData();
    const memoryToDelete = data.memories.find((item) => item.id === id);

    if (!memoryToDelete) {
      return failure(res, "Memory not found.", 404);
    }

    data.memories = data.memories.filter((item) => item.id !== id);
    await safeWriteData(data);

    if (memoryToDelete.fileUrl) {
      await deletePhysicalFile(memoryToDelete.fileUrl);
    }

    return success(res, { message: "Memory deleted successfully." });
  } catch (error) {
    console.error("DELETE /api/memories/:id failed:", error);
    return failure(res, "Failed to delete memory.", 500);
  }
});

app.get("/api/stories", async (req, res) => {
  try {
    const { page, limit, search, sort = "asc" } = req.query;
    const data = await readData();

    let filteredStories = [...data.stories];
    const cleanSearch = sanitizeText(search || "").toLowerCase();

    if (cleanSearch) {
      filteredStories = filteredStories.filter((item) => {
        const title = sanitizeText(item.title).toLowerCase();
        const text = sanitizeText(item.text).toLowerCase();
        return title.includes(cleanSearch) || text.includes(cleanSearch);
      });
    }

    const sortedStories = filteredStories.sort((a, b) => {
      if (sanitizeText(sort).toLowerCase() === "desc") {
        return new Date(b.date) - new Date(a.date);
      }
      return new Date(a.date) - new Date(b.date);
    });

    return success(res, paginate(sortedStories, page, limit));
  } catch (error) {
    console.error("GET /api/stories failed:", error);
    return failure(res, "Failed to fetch stories.", 500);
  }
});

app.post("/api/stories", requireAdmin, async (req, res) => {
  try {
    const validation = validateStoryInput(req.body);

    if (!validation.valid) {
      return failure(res, validation.message, 400);
    }

    const data = await readData();

    const newStory = {
      id: Date.now(),
      date: validation.value.date,
      title: validation.value.title,
      text: validation.value.text,
      createdAt: new Date().toISOString(),
    };

    data.stories.push(newStory);
    await safeWriteData(data);

    return success(res, newStory, 201);
  } catch (error) {
    console.error("POST /api/stories failed:", error);
    return failure(res, "Failed to create story.", 500);
  }
});

app.put("/api/stories/:id", requireAdmin, async (req, res) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      return failure(res, "Invalid story id.", 400);
    }

    const validation = validateStoryInput(req.body);

    if (!validation.valid) {
      return failure(res, validation.message, 400);
    }

    const data = await readData();
    const storyIndex = data.stories.findIndex((item) => item.id === id);

    if (storyIndex === -1) {
      return failure(res, "Story not found.", 404);
    }

    data.stories[storyIndex] = {
      ...data.stories[storyIndex],
      date: validation.value.date,
      title: validation.value.title,
      text: validation.value.text,
    };

    await safeWriteData(data);
    return success(res, data.stories[storyIndex]);
  } catch (error) {
    console.error("PUT /api/stories/:id failed:", error);
    return failure(res, "Failed to update story.", 500);
  }
});

app.delete("/api/stories/:id", requireAdmin, async (req, res) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      return failure(res, "Invalid story id.", 400);
    }

    const data = await readData();
    const storyExists = data.stories.find((item) => item.id === id);

    if (!storyExists) {
      return failure(res, "Story not found.", 404);
    }

    data.stories = data.stories.filter((item) => item.id !== id);
    await safeWriteData(data);

    return success(res, { message: "Story deleted successfully." });
  } catch (error) {
    console.error("DELETE /api/stories/:id failed:", error);
    return failure(res, "Failed to delete story.", 500);
  }
});

app.use((req, res) => {
  return failure(res, "Route not found.", 404);
});

app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return failure(
        res,
        `File is too large. Maximum size is ${Math.round(MAX_FILE_SIZE / 1024 / 1024)}MB.`,
        400,
      );
    }

    return failure(res, error.message, 400);
  }

  if (error) {
    if (error.message === "Not allowed by CORS.") {
      return failure(res, "Request blocked by CORS policy.", 403);
    }

    console.error("Unhandled error:", error);
    return failure(res, error.message || "Something went wrong.", 400);
  }

  next();
});

const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

function shutdown(signal) {
  console.log(`${signal} received. Shutting down gracefully...`);
  server.close(() => {
    console.log("HTTP server closed.");
    process.exit(0);
  });

  setTimeout(() => {
    console.error("Forced shutdown after timeout.");
    process.exit(1);
  }, 10000).unref();
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
