"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Upload } from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import { useAppAction } from "@/components/app-action-provider";
import {
  createTaskPost,
  deleteTaskPost,
  getAdminTaskPosts,
  type TaskResponse,
} from "@/lib/api-client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type TaskForm = {
  title: string;
  howToBuy: string;
  productLink: string;
  liveLink: string;
  finalPrice: string;
  address: string;
  sampleImage: string;
  accent: string;
};

const initialForm: TaskForm = {
  title: "",
  howToBuy: "",
  productLink: "https://shopee.vn/",
  liveLink: "",
  finalPrice: "",
  address: "",
  sampleImage: "",
  accent: "from-sky-900 via-blue-900 to-indigo-950",
};

function formatCurrencyInput(value: string) {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  return `${new Intl.NumberFormat("vi-VN").format(Number(digits))} đ`;
}

export default function AdminPostsPage() {
  const { toast } = useToast();
  const { runAction, isBlocking, beginBlocking } = useAppAction();
  const [tasks, setTasks] = useState<TaskResponse[]>([]);
  const [form, setForm] = useState<TaskForm>(initialForm);
  const [openSampleDialog, setOpenSampleDialog] = useState(false);

  useEffect(() => {
    const release = beginBlocking("Đang tải nhiệm vụ...");
    getAdminTaskPosts()
      .then(setTasks)
      .catch(console.error)
      .finally(release);
  }, [beginBlocking]);

  const handleChange = (field: keyof TaskForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleFinalPriceChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      finalPrice: formatCurrencyInput(value),
    }));
  };

  const handleSampleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        setForm((prev) => ({ ...prev, sampleImage: result }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddTask = async () => {
    if (!form.title.trim() || !form.howToBuy.trim() || !form.finalPrice.trim()) {
      toast({
        title: "Thiếu thông tin",
        description: "Cần nhập ít nhất tên nhiệm vụ, cách mua và giá chốt.",
        variant: "destructive",
      });
      return;
    }

    const created = await runAction(
      async () =>
        createTaskPost({
          title: form.title.trim(),
          howToBuy: form.howToBuy.trim(),
          productLink: form.productLink.trim() || "https://shopee.vn/",
          liveLink: form.liveLink.trim() || null,
          finalPrice: form.finalPrice.trim(),
          address: form.address.trim() || "-",
          sampleImage: form.sampleImage || null,
          sampleLabel: "Ảnh mẫu nhiệm vụ",
          sampleHint: "Xem ảnh mẫu trước khi thao tác.",
          accent: form.accent,
          active: true,
        }),
      {
        loadingMessage: "Đang thêm nhiệm vụ...",
        successTitle: "Đã thêm nhiệm vụ",
        successDescription: "User home sẽ đọc được nhiệm vụ mới từ API.",
      }
    );

    if (!created) return;

    setTasks((prev) => [created, ...prev]);
    setForm(initialForm);
  };

  const handleDeleteTask = async (id: number) => {
    const removed = await runAction(
      async () => {
        await deleteTaskPost(id);
        return true;
      },
      {
        loadingMessage: "Đang xóa nhiệm vụ...",
        successTitle: "Đã xóa nhiệm vụ",
        successDescription: "User home sẽ cập nhật theo dữ liệu mới.",
      }
    );

    if (!removed) return;
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const inputClass =
    "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Bài viết - Nhiệm vụ</h1>
        <p className="mt-1 text-sm text-slate-500">
          Admin thêm nhiệm vụ tại đây, bên user home sẽ đọc cùng dữ liệu.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Thêm nhiệm vụ mới</h2>
          <div className="mt-4 grid gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Tên nhiệm vụ</label>
              <input
                value={form.title}
                onChange={(event) => handleChange("title", event.target.value)}
                className={inputClass}
                placeholder="Ví dụ: Shopee Campaign"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Cách mua, mỗi dòng một ý
              </label>
              <textarea
                value={form.howToBuy}
                onChange={(event) => handleChange("howToBuy", event.target.value)}
                className="min-h-[120px] w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                placeholder={"Bắt buộc mua đúng link\nKiểm tra tồn kho trước khi đặt"}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Link sản phẩm</label>
                <input
                  value={form.productLink}
                  onChange={(event) => handleChange("productLink", event.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Link live</label>
                <input
                  value={form.liveLink}
                  onChange={(event) => handleChange("liveLink", event.target.value)}
                  className={inputClass}
                  placeholder="Có thể để trống"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Giá chốt</label>
                <input
                  value={form.finalPrice}
                  onChange={(event) => handleFinalPriceChange(event.target.value)}
                  className={inputClass}
                  inputMode="numeric"
                  placeholder="Ví dụ: 990.000 đ"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Màu card</label>
                <select
                  value={form.accent}
                  onChange={(event) => handleChange("accent", event.target.value)}
                  className={inputClass}
                >
                  <option value="from-sky-900 via-blue-900 to-indigo-950">Xanh dương</option>
                  <option value="from-slate-900 via-cyan-950 to-blue-950">Xanh đậm</option>
                  <option value="from-violet-950 via-indigo-900 to-blue-950">Tím xanh</option>
                  <option value="from-rose-950 via-fuchsia-900 to-indigo-950">Hồng tím</option>
                  <option value="from-emerald-950 via-teal-900 to-cyan-950">Xanh ngọc</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Địa chỉ nhận hàng</label>
              <input
                value={form.address}
                onChange={(event) => handleChange("address", event.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Ảnh mẫu</label>
              <button
                type="button"
                onClick={() => setOpenSampleDialog(true)}
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <Upload className="h-4 w-4 text-sky-500" />
                {form.sampleImage ? "Xem / đổi ảnh mẫu" : "Tải ảnh mẫu"}
              </button>
            </div>

            <button
              type="button"
              onClick={handleAddTask}
              disabled={isBlocking}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-sky-500 px-4 text-sm font-semibold text-white transition hover:bg-sky-600 disabled:opacity-60"
            >
              <Plus className="h-4 w-4" />
              Thêm nhiệm vụ
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Danh sách nhiệm vụ hiện có</h2>
          <div className="mt-4 space-y-3">
            {tasks.map((task) => (
              <div key={task.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{task.title}</p>
                    <p className="mt-1 text-xs text-slate-500">{task.finalPrice}</p>
                    <p className="mt-2 text-xs leading-5 text-slate-600">
                      {task.howToBuy}
                    </p>
                    {!task.active ? (
                      <p className="mt-2 text-[11px] font-medium text-amber-600">Đang tắt hiển thị với user</p>
                    ) : null}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteTask(task.id)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-rose-200 bg-white text-rose-500 transition hover:bg-rose-50"
                    title="Xóa nhiệm vụ"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Dialog open={openSampleDialog} onOpenChange={setOpenSampleDialog}>
        <DialogContent className="max-w-lg border-slate-200 bg-white">
          <DialogHeader>
            <DialogTitle>Ảnh mẫu</DialogTitle>
            <DialogDescription>
              Tải ảnh mẫu lên. Bên user sẽ bấm icon mắt để xem popup ảnh này.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <label className="flex min-h-[220px] cursor-pointer items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center transition hover:border-sky-300 hover:bg-sky-50/50">
              <input type="file" accept="image/*" className="hidden" onChange={handleSampleImageChange} />
              {form.sampleImage ? (
                <img
                  src={form.sampleImage}
                  alt="Ảnh mẫu"
                  className="max-h-[260px] rounded-lg object-contain"
                />
              ) : (
                <div className="space-y-2">
                  <Upload className="mx-auto h-8 w-8 text-sky-500" />
                  <p className="text-sm font-medium text-slate-700">Bấm để chọn ảnh mẫu</p>
                  <p className="text-xs text-slate-500">Hỗ trợ ảnh JPG, PNG, WEBP</p>
                </div>
              )}
            </label>

            {form.sampleImage ? (
              <button
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, sampleImage: "" }))}
                className="text-sm font-medium text-rose-500 transition hover:text-rose-600"
              >
                Xóa ảnh mẫu hiện tại
              </button>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
