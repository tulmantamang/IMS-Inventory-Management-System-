const express = require("express");
const { MongoDBconfig } = require('./libs/mongoconfig');
const { Server } = require("socket.io");
const http = require("http");
const cors = require('cors');
const cookieParser = require("cookie-parser");
const authrouter = require('./Routers/authRouther');
const productrouter = require('./Routers/ProductRouter');
const categoryrouter = require("./Routers/categoryRouter")
const salesrouter = require('./Routers/salesRouter');
const supplierrouter = require('./Routers/supplierrouter');
const stockLogRouter = require('./Routers/stockLogRouter');
const reportrouter = require('./Routers/reportRouter');

const path = require('path');
require("dotenv").config({ path: path.join(__dirname, '.env') });

const PORT = process.env.PORT || 3003;

const FRONTEND_URLS = (process.env.FRONTEND_URLS || "http://localhost:3000,http://localhost:5173,https://advanced-inventory-management-system.vercel.app").split(",").map(u => u.trim());

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: FRONTEND_URLS,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

app.use(cors({
  origin: FRONTEND_URLS,
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
  optionSuccessStatus: 200
}));

io.on("connection", (socket) => {
  console.log("A user connected");
  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
})

app.use(express.json({ limit: "10mb" }));
app.set("io", io);
app.use(cookieParser());

// APIs
const purchaserouter = require("./Routers/purchaserouter")
const adjustmentRouter = require("./Routers/Adjustmentrouter");
const dashboardRouter = require("./Routers/dashboardRouter");
const settingRouter = require("./Routers/settingRouter");
const { seedDefaults } = require("./controller/settingcontroller");

app.use('/api/auth', authrouter);
app.use('/api/product', productrouter);
app.use('/api/category', categoryrouter);
app.use('/api/sales', salesrouter);
app.use('/api/supplier', supplierrouter);
app.use("/api/stock", stockLogRouter);
app.use('/api/reports', reportrouter);
app.use('/api/purchase', purchaserouter);
app.use('/api/adjustments', adjustmentRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/settings', settingRouter);

// Removed unused routes: inventory, activity, order

server.listen(PORT, async () => {
  await MongoDBconfig();
  await seedDefaults();
  console.log(`The server is running at port ${PORT}`);
});

module.exports = { io, server };