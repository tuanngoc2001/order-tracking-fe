"use client";

import { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Eye,
  ExternalLink,
  MapPin,
  ShoppingCart,
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { type TaskResponse } from "@/lib/api-client";

type TaskBoardProps = {
  tasks: TaskResponse[];
  onCopyAddress: (address: string, title: string) => void;
  title?: string;
};

const TASKS_PER_PAGE = 3;

export function TaskBoard({
  tasks,
  onCopyAddress,
  title = "Nhiệm vụ có thể làm",
}: TaskBoardProps) {
  const [selectedSample, setSelectedSample] = useState<TaskResponse | null>(null);
  const [taskPage, setTaskPage] = useState(1);

  const totalTaskPages = Math.max(1, Math.ceil(tasks.length / TASKS_PER_PAGE));

  const visibleTasks = useMemo(() => {
    const start = (taskPage - 1) * TASKS_PER_PAGE;
    return tasks.slice(start, start + TASKS_PER_PAGE);
  }, [taskPage, tasks]);

  const pageDots = useMemo(() => Array.from({ length: totalTaskPages }, (_, index) => index + 1), [totalTaskPages]);

  return (
    <>
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          {tasks.length > TASKS_PER_PAGE ? (
            <div className="flex items-center justify-between gap-3 sm:justify-end">
              <div className="flex items-center gap-1.5">
                {pageDots.map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setTaskPage(page)}
                    aria-label={`Trang ${page}`}
                    className={`h-2.5 w-2.5 rounded-full transition ${
                      taskPage === page ? "bg-sky-500" : "bg-slate-200 hover:bg-slate-300"
                    }`}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <button
                  type="button"
                  onClick={() => setTaskPage((prev) => Math.max(1, prev - 1))}
                  disabled={taskPage === 1}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="min-w-12 text-center font-medium">
                  {taskPage}/{totalTaskPages}
                </span>
                <button
                  type="button"
                  onClick={() => setTaskPage((prev) => Math.min(totalTaskPages, prev + 1))}
                  disabled={taskPage === totalTaskPages}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : null}
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2 md:gap-4 xl:grid-cols-3">
          {visibleTasks.map((task) => (
            <div key={task.id} className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="break-words font-semibold text-slate-900">{task.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">{task.finalPrice}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedSample(task)}
                  className="rounded-md bg-sky-50 p-2 text-sky-600"
                >
                  <Eye className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-3 space-y-2 text-sm text-slate-600">
                <div className="flex flex-wrap gap-3">
                  {task.productLink ? (
                    <a
                      href={task.productLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 font-medium text-sky-600 transition hover:text-sky-700"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      <span>Link sản phẩm</span>
                    </a>
                  ) : null}
                  {task.liveLink ? (
                    <a
                      href={task.liveLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 font-medium text-sky-600 transition hover:text-sky-700"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span>Link live</span>
                    </a>
                  ) : null}
                </div>
                <p className="line-clamp-3 whitespace-pre-line">{task.howToBuy}</p>
                <p className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-sky-500" />
                  <span className="line-clamp-2 break-words">{task.address}</span>
                </p>
              </div>

              <button
                type="button"
                onClick={() => onCopyAddress(task.address, task.title)}
                className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-sky-600"
              >
                <Copy className="h-4 w-4" />
                Sao chép địa chỉ
              </button>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={!!selectedSample} onOpenChange={(open) => !open && setSelectedSample(null)}>
        <DialogContent className="w-[calc(100vw-1.5rem)] max-w-md border-slate-200 bg-white p-0">
          {selectedSample ? (
            <>
              <DialogHeader className="border-b border-slate-100 px-5 py-4 text-left">
                <DialogTitle className="text-base text-slate-900">Ảnh mẫu - {selectedSample.title}</DialogTitle>
                <DialogDescription className="text-xs text-slate-500">{selectedSample.sampleHint}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 p-5">
                {selectedSample.sampleImage ? (
                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                    <img
                      src={selectedSample.sampleImage}
                      alt={selectedSample.sampleLabel}
                      className="max-h-[420px] w-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="rounded-2xl bg-slate-50 p-8 text-center text-sm text-slate-500">
                    Chưa có ảnh mẫu cho nhiệm vụ này.
                  </div>
                )}
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
