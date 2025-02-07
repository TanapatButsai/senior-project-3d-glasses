const express = require("express");
const multer = require("multer");
const cors = require("cors");
const { Pool } = require("pg");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 5050;

// Enable CORS
app.use(cors());

// PostgreSQL Configuration
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "glasses_try_on", // Update this to your database name
  password: "yourpassword",   // Replace with your database password
  port: 5432,
});

// Ensure 'uploads' directory exists
const UPLOADS_DIR = path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR);
}

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: UPLOADS_DIR,
  filename: (req, file, cb) => {
    const safeFilename = file.originalname.replace(/\s+/g, "_");
    cb(null, Date.now() + "_" + safeFilename);
  },
});
const upload = multer({ storage });

// POST /upload - Upload and save a model
app.post("/upload", upload.single("file"), async (req, res) => {
  const { file } = req;
  const { modelName, type } = req.body;

  if (!file || !modelName || !type) {
    return res.status(400).json({ message: "All fields are required: model name, type, and file." });
  }

  try {
    await pool.query(
      "INSERT INTO glasses (glasses_id, name, type, model_file, created_at, updated_at, try_count) VALUES (gen_random_uuid(), $1, $2, $3, NOW(), NOW(), 0)",
      [modelName, type, file.filename]
    );
    res.json({ message: "Model uploaded successfully!" });
  } catch (error) {
    console.error("Error saving model:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// GET /models - Fetch all models
app.get("/models", async (req, res) => {
  try {
    const result = await pool.query("SELECT glasses_id, name, type, model_file, created_at, try_count FROM glasses");
    res.json(result.rows);
  } catch (error) {
    console.error("Error retrieving models:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// DELETE /models/:id - Delete a model
app.delete("/models/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query("DELETE FROM glasses WHERE glasses_id = $1", [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Model not found." });
    }
    res.json({ message: "Model deleted successfully." });
  } catch (error) {
    console.error("Error deleting model:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Serve uploaded models
app.use("/models", express.static(UPLOADS_DIR));

// Start Backend Server
app.listen(PORT, () => {
  console.log(`✅ Backend running at http://localhost:${PORT}`);
});
