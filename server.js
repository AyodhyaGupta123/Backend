const express = require("express");
const cors = require("cors");
const http = require("http");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const headerRoutes = require("./routes/headerRoutes");
const tradeRoutes = require("./routes/tradeRoutes");
const priceRoutes = require("./routes/priceRoutes");

// IMPORT: Ensure this matches your singleton export (module.exports = priceWSInstance)
const priceWS = require("./websocket/priceWebSocket");

const app = express();

// ===================== CORS FIX =====================
// Allow your frontend domains and handle preflight requests
const allowedOrigins = [
  "https://www.pasameme.in",
  "https://meme-ou3u.vercel.app"
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin like Postman or mobile apps
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = "The CORS policy for this site does not allow access from the specified Origin.";
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Handle preflight requests for all routes
app.options("*", cors());

// ===================== MIDDLEWARE =====================
app.use(express.json());

// ===================== DATABASE =====================
connectDB();

// ===================== ROUTES =====================
app.use("/api/auth", authRoutes);
app.use("/api/header", headerRoutes);
app.use("/api/trade", tradeRoutes);
app.use("/api/prices", priceRoutes);

// ===================== HTTP SERVER =====================
const server = http.createServer(app);

// Initialize WebSocket with the HTTP server
if (priceWS.init) {
  priceWS.init(server);
}

const PORT = process.env.PORT || 5000;

// Use server.listen for WebSocket support
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
