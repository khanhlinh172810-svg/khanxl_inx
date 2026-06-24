const mongoose = require("mongoose");

const productVariantSchema = new mongoose.Schema(
  {
    variant_id: { type: Number },
    product_id: { type: Number },
    color: { type: String },
    price: { type: Number },
    stock_quantity: { type: Number },
    sku: { type: String },
    sale_price: { type: Number, default: null },
  },
  {
    collection: "product_variants",
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  },
);

module.exports = mongoose.model("ProductVariant", productVariantSchema);
