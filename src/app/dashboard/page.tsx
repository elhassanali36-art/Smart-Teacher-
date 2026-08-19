"use client";
import { useAuthStore } from "@/store/auth";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StudentDashboard } from "@/components/dashboards/StudentDashboard";
import { AdminDashboard } from "@/components/dashboards/AdminDashboard";

export default function DashboardPage() {
  const { user } = useAuthStore();
  return (
    <DashboardLayout>
      {user?.role === "student" && <StudentDashboard />}
      {user?.role === "admin"   && <AdminDashboard />}
    </DashboardLayout>
  );
}
