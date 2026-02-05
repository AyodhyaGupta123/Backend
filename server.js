const express = require("express");
const cors = require("cors");
const http = require("http");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server & Postman
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        "https://www.pasameme.in",
        "https://pasameme.in",
        "http://localhost:5173",
      ];

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);


// 🔥 THIS IS THE KEY FIX FOR RENDER
app.options("*", cors({
  origin: [
    "https://www.pasameme.in",
    "https://pasameme.in",
    "http://localhost:5173",
  ],
  credentials: true,
}));


// ===================== MIDDLEWARE =====================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===================== DB & ROUTES =====================
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const headerRoutes = require("./routes/headerRoutes");
const tradeRoutes = require("./routes/tradeRoutes");
const priceRoutes = require("./routes/priceRoutes");
const priceWS = require("./websocket/priceWebSocket");

connectDB();

app.get("/", (req, res) => {
  res.status(200).send("PasaMeme API Live");
});

app.use("/api/auth", authRoutes);
app.use("/api/header", headerRoutes);
app.use("/api/trade", tradeRoutes);
app.use("/api/prices", priceRoutes);

// ===================== SERVER =====================
const server = http.createServer(app);

if (priceWS?.init) {
  priceWS.init(server);
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
