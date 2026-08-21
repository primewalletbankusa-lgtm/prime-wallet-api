const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ✅ TEST ROUTE — Check if API is alive
app.get('/api/health', (req, res) => {
  res.json({ status: '✅ Prime Wallet Bank API — ONLINE', time: new Date().toISOString() });
});

// ✅ RECIPIENT LOOKUP — Real owner verification
app.post('/api/lookup-account', (req, res) => {
  const { accountNumber, bankCode } = req.body;
  
  // Your verified database — expand this!
  const database = {
    "2024567890": { name: "William Kevin", bank: "Prime Wallet Bank - USA" },
    "2024567891": { name: "Sarah Johnson", bank: "Chase Bank" },
    "NG00123456": { name: "Adebayo Ogunlesi", bank: "Prime Wallet Bank - Nigeria" }
  };

  if (database[accountNumber]) {
    res.json({ found: true, ...database[accountNumber] });
  } else {
    res.json({ found: false, message: "Account not found" });
  }
});

// ✅ TRANSACTION SUBMIT
app.post('/api/transfer', (req, res) => {
  res.json({
    success: true,
    message: "✅ Transaction submitted — Pending admin review",
    reference: "TXN" + Date.now(),
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => console.log(`🚀 API running on port ${PORT}`));
