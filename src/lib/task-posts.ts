"use client";

export type TaskInfo = {
  id: number;
  title: string;
  howToBuy: string[];
  requirements: {
    label: string;
    href?: string;
  }[];
  finalPrice: string;
  address: string;
  sampleImage?: string;
  sampleLabel: string;
  sampleHint: string;
  accent: string;
};

export const TASK_POSTS_STORAGE_KEY = "admin_task_posts";

export const defaultTaskPosts: TaskInfo[] = [
  {
    id: 1,
    title: "Caryn L40",
    howToBuy: [
      "Bắt buộc mua đúng link mới được tính công và nhận hàng",
      "Mua đúng số lượng như mẫu",
    ],
    requirements: [
      { label: "Link sản phẩm", href: "https://shopee.vn/" },
      { label: "Link live", href: "https://shopee.vn/" },
    ],
    finalPrice: "1.245.000 đ",
    address:
      "Kí hiệu Na - Xx đường Nguyễn Văn Hới, Phường Cát Bi, Quận Hải An, Hải Phòng.",
    sampleLabel: "Ảnh đơn hàng và ảnh sản phẩm sau khi chốt",
    sampleHint: "Mở popup để xem ảnh mẫu trước khi thao tác đơn.",
    accent: "from-sky-900 via-blue-900 to-indigo-950",
  },
  {
    id: 2,
    title: "Shopee Flash Deal",
    howToBuy: [
      "Đặt đúng mẫu được giao trong ca làm việc",
      "Kiểm tra tồn kho trước khi xác nhận đơn",
    ],
    requirements: [
      { label: "Link shop", href: "https://shopee.vn/" },
      { label: "Link sản phẩm", href: "https://shopee.vn/" },
    ],
    finalPrice: "680.000 đ",
    address:
      "Kí hiệu SP - 18 Lê Văn Sỹ, Phường 10, Quận Phú Nhuận, TP. Hồ Chí Minh.",
    sampleLabel: "Ảnh bill thanh toán và mã vận đơn",
    sampleHint: "Mở popup để đối chiếu bill và vận đơn mẫu.",
    accent: "from-slate-900 via-cyan-950 to-blue-950",
  },
  {
    id: 3,
    title: "Mall Voucher Push",
    howToBuy: [
      "Ưu tiên đặt đúng shop có gắn nhãn Mall",
      "Chỉ chốt khi sản phẩm còn hiển thị voucher",
    ],
    requirements: [
      { label: "Link sản phẩm", href: "https://shopee.vn/" },
      { label: "Link live", href: "https://shopee.vn/" },
    ],
    finalPrice: "915.000 đ",
    address:
      "Kí hiệu MV - 93 Trần Não, Phường An Khánh, TP. Thủ Đức, TP. Hồ Chí Minh.",
    sampleLabel: "Ảnh sản phẩm chốt voucher và ảnh đơn sau thanh toán",
    sampleHint: "Mở popup để xem mẫu đơn áp voucher trước khi thao tác.",
    accent: "from-violet-950 via-indigo-900 to-blue-950",
  },
  {
    id: 4,
    title: "TikTok Combo Săn Sale",
    howToBuy: [
      "Đặt đủ combo theo danh sách được giao",
      "Không đổi phân loại nếu chưa xác nhận lại nhiệm vụ",
    ],
    requirements: [
      { label: "Link sản phẩm", href: "https://shopee.vn/" },
      { label: "Link live", href: "https://shopee.vn/" },
    ],
    finalPrice: "1.080.000 đ",
    address:
      "Kí hiệu TK - 15 Nguyễn Thị Minh Khai, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh.",
    sampleLabel: "Ảnh combo sản phẩm và ảnh xác nhận thanh toán",
    sampleHint: "Mở popup để đối chiếu combo mẫu trước khi đặt.",
    accent: "from-rose-950 via-fuchsia-900 to-indigo-950",
  },
  {
    id: 5,
    title: "Shopee Brand Day",
    howToBuy: [
      "Canh đúng khung giờ thương hiệu để vào đơn",
      "Đặt xong cần lưu lại mã vận đơn đúng mẫu",
    ],
    requirements: [
      { label: "Link shop", href: "https://shopee.vn/" },
      { label: "Link live", href: "https://shopee.vn/" },
    ],
    finalPrice: "760.000 đ",
    address:
      "Kí hiệu BD - 28 Phạm Văn Đồng, Phường Dịch Vọng Hậu, Quận Cầu Giấy, Hà Nội.",
    sampleLabel: "Ảnh thương hiệu đang chạy sale và ảnh bill xác nhận",
    sampleHint: "Mở popup để xem đúng mẫu bill của nhiệm vụ thương hiệu.",
    accent: "from-emerald-950 via-teal-900 to-cyan-950",
  },
];

export function getTaskPosts(): TaskInfo[] {
  if (typeof window === "undefined") {
    return defaultTaskPosts;
  }

  const raw = window.localStorage.getItem(TASK_POSTS_STORAGE_KEY);
  if (!raw) {
    return defaultTaskPosts;
  }

  try {
    const parsed = JSON.parse(raw) as TaskInfo[];
    return parsed.length ? parsed : defaultTaskPosts;
  } catch {
    return defaultTaskPosts;
  }
}

export function saveTaskPosts(tasks: TaskInfo[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TASK_POSTS_STORAGE_KEY, JSON.stringify(tasks));
}
