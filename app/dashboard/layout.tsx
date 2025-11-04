import { DashboardNavigation } from "@/components/dashboard-navigation";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <DashboardNavigation />
      {children}
    </div>
  );
}
