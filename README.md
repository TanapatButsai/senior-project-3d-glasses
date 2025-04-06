# 👓 Visual Try-On Platform

A full-stack web application for virtual glasses try-on. This project uses **Node.js**, **React**, and **PostgreSQL**.

---

## 📂 Clone the Repository

First, clone this project to your local machine:

```bash
git clone https://github.com/TanapatButsai/senior-project-3d-glasses.git
cd senior-project-3d-glasses
```
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

📖 How to Use the System
1. Open the Application
Users can launch the web application directly via a browser to begin using the system.

![image](https://github.com/user-attachments/assets/6ed37831-f4a3-4c67-a331-701353295254)
*Figure Main interface of the application*

2. Register
New users can register to create an account. However, users who choose not to register will still be able to access some features, but certain functions will be restricted.
> 🛑 **Admin Access:**  
> To access admin features, you must log in with the following credentials:  
> **Email:** `admin@gmail.com`  
> **Password:** `123456`
![image](https://github.com/user-attachments/assets/1ca769ed-8872-414b-845d-1355b345375c)
*Figure Registration interface*


3. Login for Users and Admins
Both users and administrators can log in through the login page. The system will identify the role of the user, and each role will have its own separate interface and privileges.

> ✅ Make sure to use `admin@gmail.com` with password `123456` to log in as an **Admin**.
![image](https://github.com/user-attachments/assets/35f79e41-ef72-4c9b-a24e-1e35d3844860)
*Figure Login interface*

4. Upload Glasses Models (Admin)
Admins can upload 3D glasses model files (.obj) to the system.

![image](https://github.com/user-attachments/assets/8c8d4f83-21aa-4fb0-9a54-362833f630cf)
*Figure Glasses upload interface*

5. Manage Glasses Models (Admin)
This interface allows admins to edit or delete glasses models, categorize them, and manage their display status.

![image](https://github.com/user-attachments/assets/6308dcbb-bc34-4191-bb6e-7c6baade2853)
*Figure Glasses management interface*
![image](https://github.com/user-attachments/assets/24e4f8de-1eba-4984-bf76-cc81e70dc3f6)
*Figure Edit glasses information interface*
![image](https://github.com/user-attachments/assets/f9c19fb4-2f99-4f99-a64f-48e042bf2c56)
*Figure Delete glasses model interface*

6. Browse Glasses Models (User and Admin)
All users can browse available glasses models and preview them. Logged-in users will see the Add to Favorites button, while guests (non-logged-in users) will not have access to this function.

![image](https://github.com/user-attachments/assets/2fad23cd-451e-434c-a412-6a0e93ef8b77)
*Figure Browsing interface for guests*
![image](https://github.com/user-attachments/assets/a01a26c3-c16a-4495-a3bc-9b8108b12b35)
*Figure Browsing interface for logged-in users*

7. Try-On Glasses (User)
The system displays virtual glasses on the user's face in real-time using their webcam.
![image](https://github.com/user-attachments/assets/46a83e7c-a932-495f-8626-f546b25fb64b)
*Figure Virtual try-on interface*

