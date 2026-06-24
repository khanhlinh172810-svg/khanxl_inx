const Product = require("../models/productModel");
const mongoose = require("mongoose");

// ── Helper: lấy giá hiển thị từ variants ─────────────────────────────────
function getDisplayPrice(variants = []) {
  if (!variants.length) return { price: 0, sale_price: null, discount_pct: 0 };

  const withSale = variants.filter((v) => v.sale_price != null);
  const base = withSale.length
    ? withSale.reduce((a, b) => (a.sale_price < b.sale_price ? a : b))
    : variants.reduce((a, b) => (a.price < b.price ? a : b));

  const price = base.price;
  const sale_price = base.sale_price ?? null;
  const discount_pct = sale_price
    ? Math.round(((price - sale_price) / price) * 100)
    : 0;

  return { price, sale_price, discount_pct };
}

// ── Aggregation pipeline: join product_variants ───────────────────────────
function buildPipeline(matchStage, sortStage, skip, limit) {
  const pipeline = [
    { $match: matchStage },
    {
      $lookup: {
        from: "product_variants",
        localField: "product_id",
        foreignField: "product_id",
        as: "variants",
      },
    },
    { $sort: sortStage },
  ];
  if (skip != null) pipeline.push({ $skip: skip });
  if (limit != null) pipeline.push({ $limit: limit });
  return pipeline;
}

// ── Helper: chuẩn hóa output gửi về FE ───────────────────────────────────
function formatProduct(p) {
  const { price, sale_price, discount_pct } = getDisplayPrice(p.variants || []);
  return {
    id: p.product_id,
    ten: p.product_name,
    slug: p.slug,
    thuongHieu: p.brand_name || "",
    thumbnail: p.thumbnail || "",
    moTa: p.short_description || "",
    gia: price,
    giaSale: sale_price,
    giamGia: discount_pct,
    danhGia: p.avg_rating || 0,
    luotDanhGia: p.review_count || 0,
    luotBan: p.total_sold || 0,
    badge: p.badge || "",
    categoryName: p.category_name || "",
    warranty: p.warranty || "",
    variants: (p.variants || []).map((v) => ({
      variant_id: v.variant_id,
      color: v.color || "",
      price: v.price || 0,
      sale_price: v.sale_price ?? null,
      stock_quantity: v.stock_quantity || 0,
      sku: v.sku || "",
    })),
  };
}

// ── [GET] /api/products/featured ─────────────────────────────────────────
exports.getFeatured = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6;

    const products = await Product.aggregate(
      buildPipeline(
        { status: "active" },
        { avg_rating: -1, total_sold: -1 },
        null,
        limit,
      ),
    );

    res.json({
      success: true,
      data: products.map((p) => {
        const { price, sale_price, discount_pct } = getDisplayPrice(p.variants);
        return {
          id: p.product_id,
          ten: p.product_name,
          slug: p.slug,
          thuongHieu: p.brand_name || "",
          thumbnail: p.thumbnail || "",
          moTa: p.short_description || "",
          gia: price,
          giaSale: sale_price,
          giamGia: discount_pct,
          danhGia: p.avg_rating || 0,
          luotDanhGia: p.review_count || 0,
          badge: p.badge || "",
        };
      }),
    });
  } catch (err) {
    console.error("[getFeatured]", err);
    res
      .status(500)
      .json({ success: false, message: "Lỗi server", error: err.message });
  }
};

// ── [GET] /api/products/best-selling ─────────────────────────────────────
exports.getBestSelling = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 4;

    const products = await Product.aggregate(
      buildPipeline(
        { status: "active" },
        { total_sold: -1, avg_rating: -1 },
        null,
        limit,
      ),
    );

    const fmt = (n) => (n >= 1000 ? (n / 1000).toFixed(1) + "K" : String(n));

    res.json({
      success: true,
      data: products.map((p, i) => {
        const { price, sale_price, discount_pct } = getDisplayPrice(p.variants);
        return {
          id: p.product_id,
          ten: p.product_name,
          slug: p.slug,
          thuongHieu: p.brand_name || "",
          thumbnail: p.thumbnail || "",
          moTa: p.short_description || "",
          gia: price,
          giaSale: sale_price,
          giamGia: discount_pct,
          danhGia: p.avg_rating || 0,
          luotBan: fmt(p.total_sold || 0),
          rank: i + 1,
        };
      }),
    });
  } catch (err) {
    console.error("[getBestSelling]", err);
    res
      .status(500)
      .json({ success: false, message: "Lỗi server", error: err.message });
  }
};

// ── [GET] /api/products ───────────────────────────────────────────────────
exports.getAll = async (req, res) => {
  try {
    const {
      category_id,
      brand_id,
      search,
      sort = "newest",
      page = 1,
      limit = 12,
    } = req.query;

    const filter = { status: "active" };
    if (category_id) filter.category_id = parseInt(category_id);
    if (brand_id) filter.brand_id = parseInt(brand_id);
    if (search) filter.product_name = { $regex: search, $options: "i" };

    const sortMap = {
      newest: { created_at: -1 },
      price_asc: { minPrice: 1 },
      price_desc: { minPrice: -1 },
      rating: { avg_rating: -1 },
      sold: { total_sold: -1 },
    };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Product.countDocuments(filter);

    const products = await Product.aggregate(
      buildPipeline(
        filter,
        sortMap[sort] || sortMap.newest,
        skip,
        parseInt(limit),
      ),
    );

    res.json({
      success: true,
      data: products.map((p) => {
        const { price, sale_price, discount_pct } = getDisplayPrice(p.variants);
        return {
          id: p.product_id,
          ten: p.product_name,
          slug: p.slug,
          thuongHieu: p.brand_name || "",
          thumbnail: p.thumbnail || "",
          moTa: p.short_description || "",
          gia: price,
          giaSale: sale_price,
          giamGia: discount_pct,
          danhGia: p.avg_rating || 0,
          luotBan: p.total_sold || 0,
          badge: p.badge || "",
        };
      }),
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error("[getAll]", err);
    res
      .status(500)
      .json({ success: false, message: "Lỗi server", error: err.message });
  }
};

// ── [GET] /api/products/:slug ─────────────────────────────────────────────
exports.getBySlug = async (req, res) => {
  try {
    const results = await Product.aggregate(
      buildPipeline(
        { slug: req.params.slug, status: "active" },
        { _id: 1 },
        null,
        1,
      ),
    );

    if (!results.length)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy sản phẩm" });

    res.json({ success: true, data: formatProduct(results[0]) });
  } catch (err) {
    console.error("[getBySlug]", err);
    res
      .status(500)
      .json({ success: false, message: "Lỗi server", error: err.message });
  }
};
