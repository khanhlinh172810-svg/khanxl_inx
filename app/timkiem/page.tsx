"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Star,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Search,
} from "lucide-react";

const API = "http://localhost:5000";

interface SanPham {
  id: number;
  ten: string;
  slug: string;
  thuongHieu: string;
  thumbnail: string;
  moTa: string;
  gia: number;
  giaSale: number | null;
  giamGia: number;
  danhGia: number;
  luotBan: number;
  badge: string;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

function formatGia(gia: number) {
  return gia.toLocaleString("vi-VN") + " đ";
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`w-3 h-3 ${s <= Math.round(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
        />
      ))}
      <span className="text-xs text-gray-500 ml-1">{rating.toFixed(1)}</span>
    </div>
  );
}

export default function TimKiemPage() {
  const searchParams = useSearchParams();
  const keyword = searchParams.get("q") || "";

  const [sanPham, setSanPham] = useState<SanPham[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(false);
  const [sapXep, setSapXep] = useState("newest");
  const [trang, setTrang] = useState(1);

  const fetchKetQua = useCallback(async () => {
    if (!keyword.trim()) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search: keyword,
        page: String(trang),
        limit: "12",
        sort: sapXep,
      });
      const res = await fetch(`${API}/api/products?${params}`);
      const data = await res.json();
      if (data.success) {
        setSanPham(data.data);
        setPagination(data.pagination);
      }
    } catch {
      setSanPham([]);
    } finally {
      setLoading(false);
    }
  }, [keyword, trang, sapXep]);

  useEffect(() => {
    setTrang(1);
  }, [keyword]);

  useEffect(() => {
    fetchKetQua();
  }, [fetchKetQua]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3 text-sm text-gray-500">
          <Link href="/" className="hover:text-red-500">
            Trang chủ
          </Link>
          <span className="mx-2">›</span>
          <span className="text-gray-900 font-medium">Kết quả tìm kiếm</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Search className="w-5 h-5 text-gray-400" />
            <h1 className="text-xl font-bold text-gray-900">
              Kết quả tìm kiếm cho{" "}
              <span className="text-red-500">"{keyword}"</span>
            </h1>
          </div>
          {pagination && !loading && (
            <p className="text-sm text-gray-500 ml-7">
              Tìm thấy{" "}
              <span className="font-semibold text-gray-900">
                {pagination.total}
              </span>{" "}
              sản phẩm
            </p>
          )}
        </div>

        {/* Toolbar sắp xếp */}
        {sanPham.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 mb-4 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Trang <span className="font-medium text-gray-900">{trang}</span> /{" "}
              {pagination?.totalPages}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 hidden sm:block">
                Sắp xếp:
              </span>
              <div className="relative">
                <select
                  value={sapXep}
                  onChange={(e) => {
                    setSapXep(e.target.value);
                    setTrang(1);
                  }}
                  className="appearance-none border border-gray-300 rounded-lg pl-3 pr-8 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400 bg-white cursor-pointer hover:border-red-300 transition-colors"
                >
                  <option value="newest">Mới nhất</option>
                  <option value="price_asc">Giá tăng dần</option>
                  <option value="price_desc">Giá giảm dần</option>
                  <option value="rating">Đánh giá cao</option>
                  <option value="sold">Bán chạy nhất</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        )}

        {/* Nội dung */}
        {!keyword.trim() ? (
          <div className="text-center py-20">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400">Nhập từ khóa để tìm kiếm sản phẩm</p>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse"
              >
                <div className="aspect-square bg-gray-200" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : sanPham.length === 0 ? (
          <div className="text-center py-20">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-lg text-gray-500 mb-1">
              Không tìm thấy sản phẩm nào cho{" "}
              <span className="font-medium">"{keyword}"</span>
            </p>
            <p className="text-sm text-gray-400 mb-4">
              Thử tìm với từ khóa khác
            </p>
            <Link
              href="/sanpham"
              className="inline-block bg-red-500 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
            >
              Xem tất cả sản phẩm
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {sanPham.map((sp) => (
                <Link href={`/sanpham/${sp.slug}`} key={sp.id}>
                  <div className="bg-white rounded-xl border border-gray-200 hover:shadow-lg hover:border-red-200 transition-all duration-200 overflow-hidden group h-full flex flex-col">
                    <div className="relative aspect-square bg-gray-50 overflow-hidden">
                      {sp.thumbnail ? (
                        <img
                          src={sp.thumbnail}
                          alt={sp.ten}
                          className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://placehold.co/300x300?text=No+Image";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                          No image
                        </div>
                      )}
                      {sp.giamGia > 0 && (
                        <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                          -{sp.giamGia}%
                        </span>
                      )}
                      <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => e.preventDefault()}
                          className="bg-red-500 text-white p-1.5 rounded-full shadow-lg hover:bg-red-600"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="p-3 flex flex-col flex-1">
                      {sp.thuongHieu && (
                        <p className="text-xs text-red-500 font-medium mb-1">
                          {sp.thuongHieu}
                        </p>
                      )}
                      <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-red-500 transition-colors flex-1">
                        {sp.ten}
                      </h3>
                      {sp.danhGia > 0 && (
                        <div className="mb-2">
                          <StarRating rating={sp.danhGia} />
                        </div>
                      )}
                      <div className="mt-auto">
                        {sp.giaSale ? (
                          <>
                            <p className="text-base font-bold text-red-500">
                              {formatGia(sp.giaSale)}
                            </p>
                            <p className="text-xs text-gray-400 line-through">
                              {formatGia(sp.gia)}
                            </p>
                          </>
                        ) : (
                          <p className="text-base font-bold text-gray-900">
                            {formatGia(sp.gia)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Phân trang */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => setTrang((p) => Math.max(1, p - 1))}
                  disabled={trang === 1}
                  className="p-2 border border-gray-300 rounded-lg disabled:opacity-40 hover:border-red-400 hover:text-red-500 bg-white transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter(
                    (t) =>
                      t === 1 ||
                      t === pagination.totalPages ||
                      Math.abs(t - trang) <= 2,
                  )
                  .reduce<(number | string)[]>((acc, t, i, arr) => {
                    if (i > 0 && (t as number) - (arr[i - 1] as number) > 1)
                      acc.push("...");
                    acc.push(t);
                    return acc;
                  }, [])
                  .map((t, i) =>
                    t === "..." ? (
                      <span key={`d-${i}`} className="px-2 text-gray-400">
                        ...
                      </span>
                    ) : (
                      <button
                        key={t}
                        onClick={() => setTrang(t as number)}
                        className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                          trang === t
                            ? "bg-red-500 text-white"
                            : "border border-gray-300 bg-white hover:border-red-400 hover:text-red-500"
                        }`}
                      >
                        {t}
                      </button>
                    ),
                  )}
                <button
                  onClick={() =>
                    setTrang((p) => Math.min(pagination.totalPages, p + 1))
                  }
                  disabled={trang === pagination.totalPages}
                  className="p-2 border border-gray-300 rounded-lg disabled:opacity-40 hover:border-red-400 hover:text-red-500 bg-white transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
