import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { TopUser } from "@/lib/definitions";
import { PlaceHolderImages } from "@/lib/placeholder-images";

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
  const getAvatar = (id: string) =>
    PlaceHolderImages.find((img) => img.id === id);

  return (
    <div className="space-y-4">
      {users.map((user, index) => (
        <div key={user.id} className="flex items-center gap-4">
          <Avatar className="h-9 w-9">
            <AvatarImage
              src={getAvatar(user.avatarId)?.imageUrl}
              alt={user.name}
              data-ai-hint={getAvatar(user.avatarId)?.imageHint}
            />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="grid gap-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-sm text-muted-foreground">
              {user.orderCount} đơn hàng
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
