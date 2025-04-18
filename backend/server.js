/**
 * Licensed under the Apache License, Version 2.0
 * Additional restrictions apply – see LICENSE file for details.
 * Attribution: Computer Science Department, Faculty of Science, Kasetsart University
 */
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

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  console.error("❌ ERROR: JWT_SECRET is missing in .env file!");
  process.exit(1);
}

app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: process.env.POSTGRES_USER || "postgres",
  host: process.env.POSTGRES_HOST || "localhost",
  database: process.env.POSTGRES_DB || "glasses_try_on",
  password: process.env.POSTGRES_PASSWORD || "yourpassword",
  port: process.env.POSTGRES_PORT || 5432,
});

const UPLOADS_DIR = path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR);
}

const storage = multer.diskStorage({
  destination: UPLOADS_DIR,
  filename: (req, file, cb) => {
    const safeFilename = file.originalname.replace(/\s+/g, "_");
    cb(null, Date.now() + "_" + safeFilename);
  },
});
const upload = multer({ storage });

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

    res.json({ message: "Login successful", token, userId: user.rows[0].user_id });
  } catch (error) {
    console.error("Error during sign-in:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

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

app.get("/models", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT glasses_id, name, type, model_file, try_count FROM glasses ORDER BY try_count DESC"
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No models found." });
    }

    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error retrieving models:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

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

app.post("/favorites", async (req, res) => {
  const { user_id, glasses_id } = req.body;
  if (!user_id || !glasses_id) {
    return res.status(400).json({ success: false, message: "Missing user_id or glasses_id" });
  }

  try {
    await pool.query(
      "INSERT INTO favorites (user_id, glasses_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
      [user_id, glasses_id]
    );
    res.json({ success: true, message: "Added to favorites." });
  } catch (error) {
    console.error("❌ Error adding favorite:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
});

app.delete("/favorites", async (req, res) => {
  const { user_id, glasses_id } = req.body;
  if (!user_id || !glasses_id) {
    return res.status(400).json({ success: false, message: "Missing user_id or glasses_id" });
  }

  try {
    await pool.query(
      "DELETE FROM favorites WHERE user_id = $1 AND glasses_id = $2",
      [user_id, glasses_id]
    );
    res.json({ success: true, message: "Removed from favorites." });
  } catch (error) {
    console.error("❌ Error removing favorite:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
});

app.get("/favorites/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query(
      "SELECT glasses_id FROM favorites WHERE user_id = $1",
      [userId]
    );
    const favoriteIds = result.rows.map(row => row.glasses_id);
    res.json({ success: true, favorites: favoriteIds });
  } catch (error) {
    console.error("❌ Error fetching favorites:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
});

app.use("/models", express.static(path.join(__dirname, "uploads")));

app.listen(PORT, () => {
  console.log(`✅ Backend running at http://localhost:${PORT}`);
});

app.put("/models/:id", async (req, res) => {
  const { id } = req.params;
  const { name, type } = req.body;

  try {
    const result = await pool.query(
      "UPDATE glasses SET name = $1, type = $2, updated_at = NOW() WHERE glasses_id = $3 RETURNING *",
      [name, type, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Model not found" });
    }

    res.json({ message: "Model updated successfully!", model: result.rows[0] });
  } catch (error) {
    console.error("Error updating model:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/models/increment-try/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "UPDATE glasses SET try_count = try_count + 1 WHERE glasses_id = $1 RETURNING try_count",
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Glasses not found" });
    }

    res.json({ success: true, try_count: result.rows[0].try_count });
  } catch (error) {
    console.error("❌ Error updating try_count:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
});
