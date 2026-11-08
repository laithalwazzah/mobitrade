import type { Metadata } from "next";
import AdminDashboard from "@/components/admin/AdminDashboard";

export const metadata: Metadata = { title: "لوحة الإدارة", description: "مراجعة طلبات اعتماد المحلات للمستخدم الإداري المصرح." };

export default function AdminPage() { return <AdminDashboard />; }
