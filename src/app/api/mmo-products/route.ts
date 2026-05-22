import { NextResponse } from "next/server";

const PRODUCTS_URL =
  "https://taphoasieure.vn/api/products.php?api_key=fda1a640df74b0c84d0a00bb9f41e770QMWG3SpqNdOyAJjXIaczhV6sg8kFwURY";

type ExternalProduct = {
  id: string;
  name: string;
  price: string;
  amount: number;
  description: string;
  flag: string | null;
  min: string;
  max: string;
};

type ExternalCategory = {
  id: string;
  name: string;
  icon: string;
  products?: ExternalProduct[];
};

type ExternalResponse = {
  categories?: ExternalCategory[];
};

function cleanText(value: string) {
  return value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<li>/gi, "- ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/<[^>]+>/g, "")
    .replace(/\r/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function GET() {
  const response = await fetch(PRODUCTS_URL, {
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    return NextResponse.json(
      { message: "Không thể tải danh sách sản phẩm MMO." },
      { status: 502 }
    );
  }

  const payload = (await response.json()) as ExternalResponse;
  const categories = payload.categories ?? [];
  const products = categories.flatMap((category) =>
    (category.products ?? []).map((product) => ({
      id: product.id,
      categoryId: category.id,
      categoryName: category.name,
      categoryIcon: category.icon,
      name: cleanText(product.name),
      price: Number(product.price) || 0,
      amount: Number(product.amount) || 0,
      description: cleanText(product.description),
      flag: product.flag,
      min: product.min,
      max: product.max,
    }))
  );

  return NextResponse.json({
    products,
    total: products.length,
  });
}
