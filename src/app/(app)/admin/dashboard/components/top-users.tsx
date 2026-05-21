"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { TopUser } from "@/lib/definitions";

interface TopUsersProps {
  users: TopUser[];
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

export default function TopUsers({ users }: TopUsersProps) {

  return (
    <div className="space-y-4">
      {users.map((user, index) => (
        <div key={user.id} className="flex items-center gap-4">
          <Avatar className="h-9 w-9">
            <AvatarImage
              src={`https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(user.name)}`}
              alt={user.name}
            />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="grid gap-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-sm text-muted-foreground">
              {user.orderCount} Ä‘Æ¡n hÃ ng
            </p>
          </div>
          <div className="ml-auto font-medium">
            {formatCurrency(user.profit)}
          </div>
        </div>
      ))}
    </div>
  );
}
