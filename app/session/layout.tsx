import { DashboardNavigation } from "@/components/dashboard-navigation";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col min-h-screen">
      <DashboardNavigation />
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
