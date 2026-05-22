import { NextRequest, NextResponse } from "next/server";

const ORDER_URL = "https://taphoasieure.vn/api/order.php";
const API_KEY = "fda1a640df74b0c84d0a00bb9f41e770QMWG3SpqNdOyAJjXIaczhV6sg8kFwURY";

export async function GET(request: NextRequest) {
  const order = request.nextUrl.searchParams.get("order")?.trim();

  if (!order) {
    return NextResponse.json({ message: "Thiếu mã đơn hàng." }, { status: 400 });
  }

  const response = await fetch(
    `${ORDER_URL}?api_key=${encodeURIComponent(API_KEY)}&order=${encodeURIComponent(order)}`,
    { cache: "no-store" },
  );

  if (!response.ok) {
    return NextResponse.json(
      { message: "Không thể tải chi tiết đơn hàng MMO." },
      { status: response.status },
    );
  }

  const payload = (await response.json()) as unknown;
  return NextResponse.json(payload);
}
