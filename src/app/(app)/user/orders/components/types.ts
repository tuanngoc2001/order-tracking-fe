export type UserOrderStatus = "pending" | "processing" | "shipping" | "completed" | "cancelled";

export type UserOrder = {
  id: string;
  trackingCode: string;
  amount: number;
  status: UserOrderStatus;
  createdAt: string;
  proofImageUrl?: string;
};
