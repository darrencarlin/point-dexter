import { DashboardNavigation } from "@/components/dashboard-navigation";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <DashboardNavigation />
      {children}
    </>
  );
}
