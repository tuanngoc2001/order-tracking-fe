"use client";

import { useEffect, useMemo, useState } from "react";
import { Boxes, Check, ChevronDown, Search, ShoppingBag, ShoppingCart, X } from "lucide-react";
import { useAppAction } from "@/components/app-action-provider";
import { useToast } from "@/hooks/use-toast";

type MmoProduct = {
  id: string;
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  name: string;
  price: number;
  amount: number;
  description: string;
  flag: string | null;
  min: string;
  max: string;
};

type MmoCategory = {
  id: string;
  name: string;
  icon: string;
  count: number;
};

const MMO_PRICE_MARKUP = 10_000;

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function numberFromText(value: string, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function getDisplayPrice(product: MmoProduct) {
  return product.price + MMO_PRICE_MARKUP;
}

function ProductLogo({ icon, name }: { icon: string; name: string }) {
  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-sky-50 to-white shadow-sm ring-1 ring-slate-100 dark:from-slate-800 dark:to-slate-900 dark:ring-slate-700">
      {icon ? (
        <img src={icon} alt={name} className="h-8 w-8 object-contain" />
      ) : (
        <ShoppingBag className="h-5 w-5 text-sky-600 dark:text-sky-300" />
      )}
    </div>
  );
}

export default function UserMmoPage() {
  const { beginBlocking } = useAppAction();
  const { toast } = useToast();
  const [products, setProducts] = useState<MmoProduct[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<MmoProduct | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState("");

  useEffect(() => {
    const release = beginBlocking("Đang tải sản phẩm MMO...");

    fetch("/api/mmo-products")
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Không thể tải danh sách sản phẩm MMO.");
        }

        return response.json() as Promise<{ products: MmoProduct[] }>;
      })
      .then((data) => {
        setProducts(data.products);
        setError("");
      })
      .catch((reason) => {
        setError(reason instanceof Error ? reason.message : "Không thể tải dữ liệu.");
      })
      .finally(release);
  }, [beginBlocking]);

  useEffect(() => {
    if (!selectedProduct) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [selectedProduct]);

  const categories = useMemo<MmoCategory[]>(() => {
    const byId = new Map<string, MmoCategory>();

    products.forEach((product) => {
      const current = byId.get(product.categoryId);
      byId.set(product.categoryId, {
        id: product.categoryId,
        name: product.categoryName,
        icon: product.categoryIcon,
        count: (current?.count ?? 0) + 1,
      });
    });

    return Array.from(byId.values()).sort((a, b) => b.count - a.count);
  }, [products]);

  const selectedCategory = useMemo(
    () => categories.find((item) => item.id === category) ?? null,
    [categories, category],
  );

  const filteredProducts = useMemo(() => {
    const keyword = normalizeSearch(search);

    return products
      .filter((product) => product.amount > 0)
      .filter((product) => category === "all" || product.categoryId === category)
      .filter((product) => {
        if (!keyword) return true;

        const haystack = normalizeSearch(
          [
            product.id,
            product.name,
            product.description,
            product.categoryName,
            product.flag ?? "",
            getDisplayPrice(product).toString(),
            product.amount.toString(),
          ].join(" "),
        );

        return haystack.includes(keyword);
      })
      .slice(0, 80);
  }, [category, products, search]);

  const chooseCategory = (nextCategory: string) => {
    setCategory(nextCategory);
    setCategoryOpen(false);
  };

  const openProductDetail = (product: MmoProduct) => {
    setSelectedProduct(product);
    setQuantity(numberFromText(product.min, 1));
    setCategoryOpen(false);
  };

  const handleBuyProduct = () => {
    if (!selectedProduct) return;

    toast({
      title: "Đã chọn sản phẩm",
      description: `Sản phẩm #${selectedProduct.id} - số lượng ${quantity}. Cần endpoint tạo đơn mua hàng để xử lý thanh toán thật.`,
    });
  };

  const selectedMin = selectedProduct ? numberFromText(selectedProduct.min, 1) : 1;
  const selectedMax = selectedProduct
    ? Math.max(
        selectedMin,
        Math.min(numberFromText(selectedProduct.max, selectedProduct.amount || selectedMin), selectedProduct.amount || selectedMin),
      )
    : 1;
  const canBuySelectedProduct = Boolean(selectedProduct && selectedProduct.amount > 0);
  const selectedTotal = selectedProduct ? getDisplayPrice(selectedProduct) * quantity : 0;

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300">
            <Boxes className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold leading-tight text-slate-900 dark:text-white md:text-3xl">
              MMO
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Danh sách sản phẩm MMO và mô tả chi tiết từ Taphoasieure.
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_320px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm theo tên, mô tả, danh mục..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:ring-sky-500/20"
            />
            {search ? (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
                aria-label="Xóa tìm kiếm"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setCategoryOpen((value) => !value)}
              className="flex h-11 w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 text-left text-sm text-slate-800 outline-none transition hover:border-sky-200 hover:bg-sky-50/40 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:border-sky-500/40 dark:hover:bg-slate-800 dark:focus:ring-sky-500/20"
            >
              <span className="flex min-w-0 items-center gap-2">
                {selectedCategory ? (
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-50 ring-1 ring-slate-100 dark:bg-slate-800 dark:ring-slate-700">
                    {selectedCategory.icon ? (
                      <img src={selectedCategory.icon} alt="" className="h-5 w-5 object-contain" />
                    ) : (
                      <Boxes className="h-4 w-4 text-sky-500" />
                    )}
                  </span>
                ) : (
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300">
                    <Boxes className="h-4 w-4" />
                  </span>
                )}
                <span className="min-w-0">
                  <span className="block truncate font-semibold">
                    {selectedCategory ? selectedCategory.name : "Tất cả danh mục"}
                  </span>
                  <span className="block text-xs text-slate-400">
                    {selectedCategory ? `${selectedCategory.count} sản phẩm` : `${products.length} sản phẩm`}
                  </span>
                </span>
              </span>
              <ChevronDown
                className={`h-4 w-4 shrink-0 text-slate-400 transition ${
                  categoryOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {categoryOpen ? (
              <div className="absolute right-0 z-30 mt-2 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/70 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/30">
                <div className="max-h-80 overflow-y-auto p-2">
                  <button
                    type="button"
                    onClick={() => chooseCategory("all")}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition ${
                      category === "all"
                        ? "bg-sky-600 text-white"
                        : "text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                    }`}
                  >
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                        category === "all"
                          ? "bg-white/15 text-white"
                          : "bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300"
                      }`}
                    >
                      <Boxes className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold">Tất cả danh mục</span>
                      <span className={`block text-xs ${category === "all" ? "text-white/80" : "text-slate-400"}`}>
                        {products.length} sản phẩm
                      </span>
                    </span>
                    {category === "all" ? <Check className="h-4 w-4" /> : null}
                  </button>

                  {categories.map((item) => {
                    const active = category === item.id;

                    return (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => chooseCategory(item.id)}
                        className={`mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition ${
                          active
                            ? "bg-sky-600 text-white"
                            : "text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                        }`}
                      >
                        <span
                          className={`flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg ${
                            active
                              ? "bg-white/15"
                              : "bg-slate-50 ring-1 ring-slate-100 dark:bg-slate-800 dark:ring-slate-700"
                          }`}
                        >
                          {item.icon ? (
                            <img src={item.icon} alt="" className="h-5 w-5 object-contain" />
                          ) : (
                            <ShoppingBag className="h-4 w-4 text-sky-500" />
                          )}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-semibold">{item.name}</span>
                          <span className={`block text-xs ${active ? "text-white/80" : "text-slate-400"}`}>
                            {item.count} sản phẩm
                          </span>
                        </span>
                        {active ? <Check className="h-4 w-4" /> : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span>
            Hiển thị <b className="text-slate-900 dark:text-white">{filteredProducts.length}</b>/
            {products.length} sản phẩm
          </span>
          {(search || category !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setCategory("all");
                setCategoryOpen(false);
              }}
              className="font-semibold text-sky-600 transition hover:text-sky-700 dark:text-sky-300"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
          {error}
        </div>
      ) : null}

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {filteredProducts.map((product) => (
          <button
            type="button"
            key={product.id}
            onClick={() => openProductDetail(product)}
            className="group flex min-w-0 flex-col rounded-2xl border border-slate-200 bg-white p-3 text-left shadow-sm outline-none transition hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-md focus:border-sky-400 focus:ring-2 focus:ring-sky-100 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-sky-500/40 dark:focus:ring-sky-500/20"
          >
            <div className="flex items-start gap-3">
              <ProductLogo icon={product.categoryIcon} name={product.name} />

              <div className="min-w-0 flex-1">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="max-w-[70%] truncate rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-semibold text-sky-700 dark:bg-sky-500/10 dark:text-sky-200">
                    {product.categoryName}
                  </span>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                      product.amount > 0
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200"
                        : "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-200"
                    }`}
                  >
                    {product.amount > 0 ? `${product.amount} còn` : "Hết hàng"}
                  </span>
                </div>
                <h2 className="mt-2 line-clamp-2 text-sm font-bold leading-5 text-slate-900 dark:text-white">
                  {product.name}
                </h2>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-950/70">
              <div className="min-w-0">
                <p className="text-[11px] text-slate-400 dark:text-slate-500">Giá</p>
                <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                  {formatCurrency(getDisplayPrice(product))}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-[11px] text-slate-400 dark:text-slate-500">Min / Max</p>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                  {product.min || "-"} / {product.max || "-"}
                </p>
              </div>
            </div>

            <p className="mt-3 line-clamp-3 whitespace-pre-line text-sm leading-6 text-slate-600 dark:text-slate-300">
              {product.description || "Sản phẩm chưa có mô tả."}
            </p>
          </button>
        ))}

        {!error && filteredProducts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 md:col-span-2 xl:col-span-3 2xl:col-span-4">
            Không có sản phẩm phù hợp. Hãy thử từ khóa khác hoặc xóa bộ lọc.
          </div>
        ) : null}
      </div>

      {selectedProduct ? (
        <div
          className="fixed inset-0 z-50 flex touch-none items-end bg-slate-950/55 p-3 backdrop-blur-sm md:items-center md:justify-center"
          onWheel={(event) => event.preventDefault()}
          onTouchMove={(event) => {
            if (event.target === event.currentTarget) {
              event.preventDefault();
            }
          }}
        >
          <div className="max-h-[88vh] w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 md:max-w-2xl">
            <div className="flex items-start gap-3 border-b border-slate-100 p-4 dark:border-slate-800">
              <ProductLogo icon={selectedProduct.categoryIcon} name={selectedProduct.name} />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-sky-600 dark:text-sky-300">
                  {selectedProduct.categoryName}
                </p>
                <h2 className="mt-1 text-lg font-bold leading-6 text-slate-900 dark:text-white">
                  {selectedProduct.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
                aria-label="Đóng chi tiết"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div
              className="max-h-[calc(88vh-92px)] space-y-4 overflow-y-auto p-4"
              onWheel={(event) => event.stopPropagation()}
              onTouchMove={(event) => event.stopPropagation()}
            >
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-950/70">
                  <p className="text-xs text-slate-400">Mã sản phẩm</p>
                  <p className="mt-1 font-bold text-slate-900 dark:text-white">#{selectedProduct.id}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-950/70">
                  <p className="text-xs text-slate-400">Giá</p>
                  <p className="mt-1 font-bold text-slate-900 dark:text-white">
                    {formatCurrency(getDisplayPrice(selectedProduct))}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-950/70">
                  <p className="text-xs text-slate-400">Còn hàng</p>
                  <p className="mt-1 font-bold text-slate-900 dark:text-white">{selectedProduct.amount}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-950/70">
                  <p className="text-xs text-slate-400">Min / Max</p>
                  <p className="mt-1 font-bold text-slate-900 dark:text-white">
                    {selectedProduct.min || "-"} / {selectedProduct.max || "-"}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-sky-100 bg-sky-50 p-4 dark:border-sky-500/20 dark:bg-sky-500/10">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-sky-600 dark:text-sky-300">
                      Mua hàng
                    </p>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                      Chọn số lượng trước khi tạo đơn.
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Tạm tính</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">
                      {formatCurrency(selectedTotal)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-[160px_1fr]">
                  <label className="block">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Số lượng</span>
                    <input
                      type="number"
                      min={selectedMin}
                      max={selectedMax}
                      value={quantity}
                      disabled={!canBuySelectedProduct}
                      onChange={(event) => {
                        const value = Number(event.target.value);
                        const nextQuantity = Number.isFinite(value) ? value : selectedMin;
                        setQuantity(Math.min(Math.max(nextQuantity, selectedMin), selectedMax));
                      }}
                      className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-sky-500/20 dark:disabled:bg-slate-800"
                    />
                  </label>

                  <button
                    type="button"
                    disabled={!canBuySelectedProduct}
                    onClick={handleBuyProduct}
                    className="flex h-11 items-center justify-center gap-2 self-end rounded-xl bg-sky-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 dark:disabled:bg-slate-800 dark:disabled:text-slate-500"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    {canBuySelectedProduct ? "Mua hàng" : "Hết hàng"}
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
