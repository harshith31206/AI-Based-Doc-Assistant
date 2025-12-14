AI Doc Assistant — Example project (Login / Signup / JWT / PDF upload)

What you get:
- backend/ : Node.js + Express backend with /signup, /login (JWT), /upload (protected)
- frontend/: Static HTML pages (index.html, signup.html, dashboard.html)
- uploads/ : folder where uploaded PDFs will be stored (backend/uploads)

Quick start:

1) Backend
  - cd backend
  - npm install
  - edit .env and set SECRET_KEY (recommended)
  - npm start
  - Backend listens on http://localhost:5000

2) Frontend
  - open frontend/index.html in your browser (or serve it via simple static server)
  - create account on signup page, then login
  - after login you'll be redirected to dashboard where you can upload PDFs

Notes:
- This is a demo. Users are stored in backend/users.json (not production-safe).
- For production: use a database (Mongo/Postgres), secure secrets, HTTPS, and better validation.
- The backend exposes uploaded files at /uploads/<filename>

Enjoy!
