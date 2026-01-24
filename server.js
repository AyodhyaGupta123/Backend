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

const priceWS = require("./websocket/priceWebSocket");

const app = express();

// ===================== 1. SIMPLIFIED CORS (BEST FOR PRODUCTION) =====================
const allowedOrigins = [
  "https://www.pasameme.in",
  "https://meme-ou3u.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || origin.includes('vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Pre-flight requests ko handle karne ke liye (Ye zaroori hai)
app.options('(.*)', cors());

// ===================== 2. MIDDLEWARE =====================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===================== 3. DATABASE CONNECTION =====================
connectDB();

// ===================== 4. ROUTES =====================
// Base route for health check
app.get("/", (req, res) => res.send("API is running..."));

app.use("/api/auth", authRoutes);
app.use("/api/header", headerRoutes);
app.use("/api/trade", tradeRoutes);
app.use("/api/prices", priceRoutes);

// ===================== 5. HTTP SERVER & WEBSOCKET =====================
const server = http.createServer(app);

if (priceWS && typeof priceWS.init === 'function') {
  priceWS.init(server);
}

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});