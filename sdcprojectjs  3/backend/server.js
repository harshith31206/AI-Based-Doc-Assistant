const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const connectDB = require("./db");
const User = require("./models/User");
const Document = require("./models/Document");
const pdfParse = require("pdf-parse");
const officeParser = require("officeparser");
const { HfInference } = require("@huggingface/inference");
require('dotenv').config();

connectDB();

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "../frontend")));



const SECRET_KEY = process.env.SECRET_KEY || "CHANGE_THIS_SECRET";

const UPLOADS_DIR = path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_DIR);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const id = uuidv4();
    cb(null, req.user.username + "_" + Date.now() + "_" + id + ext);
  }
});


const upload = multer({ storage });


// Signup
app.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ message: "Missing fields" });
  }
  try {
    const userExists = await User.findOne({ $or: [{ username }, { email }] });
    if (userExists) {
      return res.status(409).json({ message: "User already exists" });
    }
    const hashed = bcrypt.hashSync(password, 10);
    await User.create({ username, email, password: hashed });
    res.json({ message: "User created" });
  } catch (err) {
    res.status(500).json({ message: "Server error: " + err.message });
  }
});

// Login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: "Missing fields" });
  try {
    const user = await User.findOne({ $or: [{ username }, { email: username }] });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });
    const ok = bcrypt.compareSync(password, user.password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });
    const token = jwt.sign({ id: user._id, username: user.username, email: user.email }, SECRET_KEY, { expiresIn: "2h" });
    res.json({ message: "Login successful", token });
  } catch (err) {
    res.status(500).json({ message: "Server error: " + err.message });
  }
});

// Middleware to verify token
function authenticate(req, res, next) {
  const auth = req.headers["authorization"];
  if (!auth) return res.status(401).json({ message: "No token" });
  const parts = auth.split(" ");
  if (parts.length !== 2) return res.status(401).json({ message: "Invalid auth format" });
  const token = parts[1];
  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = user;
    next();
  });
}

const { publishToQueue } = require("./mq/producer");

// Protected upload route
app.post("/upload", authenticate, upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  try {
    const ext = path.extname(req.file.originalname).toLowerCase();
    if (!['.pdf', '.ppt', '.pptx', '.docx'].includes(ext)) {
      return res.status(400).json({ message: "Unsupported file type" });
    }

    const doc = await Document.create({
      user: req.user.id,
      filename: req.file.filename,
      originalname: req.file.originalname,
      path: req.file.path,
      extractedText: "", // Will be populated by worker
      status: "pending"
    });

    // Send job to queue
    await publishToQueue({
      fileId: doc._id,
      filePath: req.file.path,
      ext,
      userId: req.user.id
    });

    res.json({
      message: "File uploaded and queued for processing",
      filename: req.file.filename,
      id: doc._id,
      status: "pending"
    });
  } catch (err) {
    console.error("Upload Error:", err);
    res.status(500).json({ message: "Upload failed: " + err.message });
  }
});

// Protected route to list user's uploads
app.get("/my-uploads", authenticate, async (req, res) => {
  try {
    const docs = await Document.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json({ uploads: docs });
  } catch (err) {
    res.status(500).json({ message: "Error fetching uploads" });
  }
});

// Chat endpoint
app.post("/chat", authenticate, async (req, res) => {
  const { question, fileId } = req.body;
  if (!question || !fileId) return res.status(400).json({ message: "Missing question or fileId" });

  try {
    const doc = await Document.findById(fileId);
    if (!doc) return res.status(404).json({ message: "Document not found" });
    if (doc.user.toString() !== req.user.id) return res.status(403).json({ message: "Not authorized" });

    const systemPromptTemplate = `You are an intelligent expert analyst. Your task is to answer the user's question based *only* on the provided document content.
- Read the entire document context carefully.
- Synthesize the information to provide a clear, efficient, and comprehensive answer.
- Do NOT just quote the text; explain the answer in your own words.
- If the answer is not in the document, state that clearly.

Document Context:
{{CONTEXT}}`;

    // Truncate context to safe limit (approx 1500 tokens)
    // 1 token ~= 4 chars, so 6000 chars is roughly 1500 tokens
    const MAX_CONTEXT_CHARS = 6000;
    let contextText = doc.extractedText || "";
    if (contextText.length > MAX_CONTEXT_CHARS) {
      contextText = contextText.substring(0, MAX_CONTEXT_CHARS) + "...[TRUNCATED]";
    }

    // Using chatCompletion (requires model support for chat templates)
    console.log(`[DEBUG] Calling HF Chat with model: google/gemma-2-2b-it`);
    console.log(`[DEBUG] Context length: ${contextText.length}`);

    const completion = await hf.chatCompletion({
      model: "google/gemma-2-2b-it",
      messages: [
        { role: "system", content: systemPromptTemplate.replace("{{CONTEXT}}", contextText) },
        { role: "user", content: question }
      ],
      max_tokens: 1000
    });

    const text = completion.choices[0].message.content;

    res.json({ answer: text });
  } catch (err) {
    console.error("Chat Error:", err);
    res.status(500).json({ message: "Chat failed: " + err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Backend running on http://localhost:" + PORT));
