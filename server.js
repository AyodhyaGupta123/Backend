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

// Middleware
const corsOptions = {
  origin: [
    "https://www.pasameme.in",
    "https://meme-ou3u.vercel.app"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(express.json());

// Database Connection  
connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/header", headerRoutes);
app.use("/api/trade", tradeRoutes);
app.use("/api/prices", priceRoutes);

// Create HTTP Server
const server = http.createServer(app);

// Initialize WebSocket with the HTTP server
// This ensures your WebSocket and Express app run on the same PORT
if (priceWS.init) {
    priceWS.init(server);
}

const PORT = process.env.PORT || 5000;

// IMPORTANT: Use server.listen, NOT app.listen
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});