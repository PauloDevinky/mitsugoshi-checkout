import { ReactNode, useEffect } from "react";
import { AdminSidebar } from "./AdminSidebar";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  useEffect(() => {
    // Apply saved theme on mount
    const savedTheme = localStorage.getItem("admin-theme") || "dark";
    const container = document.getElementById("admin-layout");
    if (container) {
      container.classList.remove("light", "dark");
      container.classList.add(savedTheme);
    }
  }, []);

  return (
    <div id="admin-layout" className="admin-theme dark min-h-screen flex bg-background">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-6 lg:p-10 max-w-[1600px]">
          {children}
        </div>
      </main>
    </div>
  );
}
