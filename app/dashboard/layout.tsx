import { DashboardNavigation } from "@/components/dashboard-navigation";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <DashboardNavigation />
      {children}
    </div>
  );
}
