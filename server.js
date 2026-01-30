const express = require("express");
const cors = require("cors");
const http = require("http");
const dotenv = require("dotenv");

dotenv.config();

// Create express app
const app = express();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const headerRoutes = require("./routes/headerRoutes");
const tradeRoutes = require("./routes/tradeRoutes");
const priceRoutes = require("./routes/priceRoutes");
const priceWS = require("./websocket/priceWebSocket");

// ===================== CORS =====================
const allowedOrigins = [
  "https://www.pasameme.in",
  "https://pasameme.in",
  "http://localhost:5173"
];

// Use the cors package
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin like mobile apps or Postman
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// ===================== MIDDLEWARE =====================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===================== DATABASE =====================
connectDB();

// ===================== ROUTES =====================
app.get("/", (req, res) => res.status(200).send("PasaMeme API Live"));

app.use("/api/auth", authRoutes);
app.use("/api/header", headerRoutes);
app.use("/api/trade", tradeRoutes);
app.use("/api/prices", priceRoutes);

// ===================== SERVER =====================
const server = http.createServer(app);
if (priceWS && priceWS.init) priceWS.init(server);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
