const express = require("express");
const multer = require("multer");
const cors = require("cors");
const { Pool } = require("pg");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 5050; // Change to 5050 or any other free port


// Enable CORS (allow frontend to talk to backend)
app.use(cors());
app.use(express.json());

// PostgreSQL Database Connection
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "glasses_db",
  password: "yourpassword", // Replace with your actual password
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
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  },
});
const upload = multer({ storage });

// File Upload API (Upload 3D Model)
app.post("/upload", upload.single("file"), async (req, res) => {
  const { file } = req;
  const { modelName } = req.body;

  if (!file || !modelName) {
    return res.status(400).json({ message: "File and model name are required." });
  }

  try {
    await pool.query(
      "INSERT INTO models (name, file_path) VALUES ($1, $2)",
      [modelName, file.filename]
    );
    res.json({ message: "Model uploaded successfully!" });
  } catch (error) {
    console.error("Error saving model:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Fetch all models from the database
app.get("/models", async (req, res) => {
    try {
      const result = await pool.query("SELECT name, file_path FROM models");
      res.json(result.rows); // Send models as JSON
    } catch (error) {
      console.error("Error fetching models:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  

// Serve uploaded models (3D files)
// app.use("/models", express.static(UPLOADS_DIR));

// Serve uploaded models from backend/uploads
app.use("/models", express.static(path.join(__dirname, "uploads")));


// Start Backend Server
app.listen(PORT, () => {
  console.log(`✅ Backend running at http://localhost:${PORT}`);
});
