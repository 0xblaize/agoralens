import { DashboardNav } from "@/src/components/dashboard-nav";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="isolate min-h-screen overflow-x-hidden bg-[#15151d] pb-28 text-white md:pb-0">
      <DashboardNav />
      <div className="relative z-10 mx-auto max-w-[1440px] space-y-10 overflow-x-hidden px-5 py-8 md:px-8 md:py-12">
        {children}
      </div>
    </main>
  );
}
