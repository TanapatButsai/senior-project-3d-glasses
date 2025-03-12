const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { Pool } = require("pg");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5050;
const saltRounds = 10;

// ✅ Ensure `JWT_SECRET` is set
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  console.error("❌ ERROR: JWT_SECRET is missing in .env file!");
  process.exit(1); // Stop the server if secret key is not set
}

app.use(cors());
app.use(express.json());

// ✅ PostgreSQL Database Configuration
const pool = new Pool({
  user: process.env.POSTGRES_USER || "postgres",
  host: process.env.POSTGRES_HOST || "localhost",
  database: process.env.POSTGRES_DB || "glasses_try_on",
//   password: process.env.POSTGRES_PASSWORD || "postgresql",
  password: process.env.POSTGRES_PASSWORD || "yourpassword",

  port: process.env.POSTGRES_PORT || 5432,
});

// ✅ Ensure 'uploads' directory exists
const UPLOADS_DIR = path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR);
}

// ✅ Multer Configuration for File Uploads
const storage = multer.diskStorage({
  destination: UPLOADS_DIR,
  filename: (req, file, cb) => {
    const safeFilename = file.originalname.replace(/\s+/g, "_");
    cb(null, Date.now() + "_" + safeFilename);
  },
});
const upload = multer({ storage });

/* ===================================================
 ✅ USER AUTHENTICATION ROUTES
=================================================== */

// ✅ User Sign-Up
app.post("/auth/signup", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: "Email already in use." });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    await pool.query(
      "INSERT INTO users (user_id, name, email, password_hash, created_at, updated_at) VALUES (gen_random_uuid(), $1, $2, $3, NOW(), NOW())",
      [name, email, hashedPassword]
    );

    res.json({ message: "User registered successfully!" });
  } catch (error) {
    console.error("Error during sign-up:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// ✅ User Sign-In
app.post("/auth/signin", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

    if (user.rows.length === 0) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.rows[0].password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    const token = jwt.sign({ userId: user.rows[0].user_id }, jwtSecret, {
      expiresIn: "1h",
    });

    res.json({ message: "Login successful", token });
  } catch (error) {
    console.error("Error during sign-in:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

/* ===================================================
 ✅ MODEL MANAGEMENT ROUTES
=================================================== */

// ✅ Upload a 3D Model
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

// ✅ Get All Models
app.get("/models", async (req, res) => {
  try {
    const result = await pool.query("SELECT glasses_id, name, type, model_file FROM glasses");

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No models found." });
    }

    res.json(result.rows);
  } catch (error) {
    console.error("Error retrieving models:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// ✅ Delete a Model
app.delete("/models/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const checkExists = await pool.query("SELECT * FROM glasses WHERE glasses_id = $1", [id]);
    if (checkExists.rows.length === 0) {
      return res.status(404).json({ message: "Model not found." });
    }

    await pool.query("DELETE FROM glasses WHERE glasses_id = $1", [id]);
    res.json({ message: "Model deleted successfully." });
  } catch (error) {
    console.error("Error deleting model:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

/* ===================================================
 ✅ STATIC FILES & SERVER CONFIGURATION
=================================================== */

// ✅ Serve Uploaded Models
// ✅ Serve Uploaded 3D Model Files Correctly
app.use("/models", express.static(path.join(__dirname, "uploads")));


// ✅ Start Server
app.listen(PORT, () => {
  console.log(`✅ Backend running at http://localhost:${PORT}`);
});
