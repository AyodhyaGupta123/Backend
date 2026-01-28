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


// Preflight error fix (Strictly use this syntax for Node 22)
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.sendStatus(204);
  }
  next();
});

// ===================== CORS FINAL FIX ===================== //
app.use(cors({
  origin: ["https://www.pasameme.in/" , "www.pasameme.in" , "http://pasameme.in" , "http://www.pasameme.in" ], 
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));



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