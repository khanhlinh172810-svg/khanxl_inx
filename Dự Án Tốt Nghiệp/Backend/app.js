const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
// Sửa lỗi nhỏ: Bỏ bớt 1 dòng const app = express() ở trên đầu để tránh khai báo trùng lặp biến
require("dotenv").config();

const productRoutes = require("./routes/product");
const authRoutes = require("./routes/auth");
const cartRoutes = require("./routes/cart");
const categoryRoutes = require("./routes/category");
const brandRoutes = require("./routes/brand");
const questionRoutes = require("./routes/questionRoutes");
const userRoutes = require("./routes/userRoutes");
const app = express();
const PORT = process.env.PORT || 5000;
const BASE_URL = process.env.API_BASE_URL || `http://localhost:${PORT}`;

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/users", userRoutes);
app.get("/api/health", (_, res) =>
  res.json({ status: "ok", time: new Date().toISOString() }),
);

app.use((_, res) =>
  res.status(404).json({ success: false, message: "Route không tồn tại" }),
);

app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Lỗi server" });
});

// ── Kết nối MongoDB rồi mới lắng nghe ─────────────────────────────────────
// 👉 BỔ SUNG ĐOẠN NÀY ĐỂ KẾT NỐI VÀ CHẠY SERVER KHÔNG BỊ CRASH

module.exports = app;
