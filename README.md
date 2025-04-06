# 👓 Visual Try-On Platform

A full-stack web application for virtual glasses try-on. This project uses **Node.js**, **React**, and **PostgreSQL**.

---

## 📦 Installation Guide

### 1. Install Node.js

1. Visit [https://nodejs.org](https://nodejs.org)
2. Download the **LTS version** suitable for your operating system
3. Install by following the setup wizard
4. Verify installation by running:

```bash
node -v
npm -v
```

###2. Install PostgreSQL

1. Visit https://www.postgresql.org/download/
2. Choose your OS and download the installer
3. During installation, set:
  Username: e.g., postgres
  Password: your preferred password
  Port: (default is 5432)
4. After installation, you can use either pgAdmin or psql to access the database

###3. Install Visual Studio Code (VS Code)

1. Visit https://code.visualstudio.com/
2. Download and install it following the setup instructions

###4. Backend Setup
1. Locate to backend
```bash
cd backend
npm install
```
2. Create .env file inside the backend folder with the following content:
```env
PORT=5050
JWT_SECRET=your-secret-key
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-db-password
POSTGRES_DB=glasses_try_on
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
```
3. Start the backend server:
```bash
node server.js
```
###5. Frontend Setup
1. locate to program directory
```bash
cd frontend
npm install
```
2. Start the React frontend:
```bash
npm run dev
```
###6. Initial Database Setup (One-time only)
Open psql or pgAdmin, and run the following SQL commands:
```bash
CREATE TABLE IF NOT EXISTS users (
  user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS glasses (
  glasses_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  model_file TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  try_count INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS favorites (
  user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
  glasses_id UUID REFERENCES glasses(glasses_id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, glasses_id)
);

```
