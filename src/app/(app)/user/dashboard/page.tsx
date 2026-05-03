import OrderTracker from "./components/order-tracker";
import DashboardTasks from "./components/dashboard-tasks";

export default function UserDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Theo dõi Vận Đơn</h1>
        <p className="text-muted-foreground">
          Kiểm tra trạng thái đơn hàng của bạn.
        </p>
      </div>
      <OrderTracker />
      <DashboardTasks />
    </div>
  );
}
