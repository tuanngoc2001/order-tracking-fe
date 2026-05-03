"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAppAction } from "@/components/app-action-provider";
import { TaskBoard } from "../../components/task-board";
import { getTaskPosts, type TaskResponse } from "@/lib/api-client";

export default function DashboardTasks() {
  const { toast } = useToast();
  const { beginBlocking } = useAppAction();
  const [tasks, setTasks] = useState<TaskResponse[]>([]);

  useEffect(() => {
    const release = beginBlocking("Đang tải nhiệm vụ...");
    getTaskPosts()
      .then(setTasks)
      .catch(console.error)
      .finally(release);
  }, [beginBlocking]);

  const handleCopyAddress = async (address: string, title: string) => {
    try {
      await navigator.clipboard.writeText(address);
      toast({ title: "Đã sao chép địa chỉ", description: title });
    } catch {
      toast({
        title: "Không thể sao chép",
        description: "Trình duyệt chưa cho phép truy cập clipboard.",
        variant: "destructive",
      });
    }
  };

  return <TaskBoard tasks={tasks} onCopyAddress={handleCopyAddress} />;
}
