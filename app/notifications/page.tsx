"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import api from "@/lib/api";
import Header from "@/components/header";

interface Notification {
  id: number;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function NotificationsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    api.get("/notifications/").then((res) => {
      setNotifications(res.data.results || res.data);
    });
  }, [user]);

  const markRead = async (id: number) => {
    await api.post(`/notifications/${id}/mark_read/`);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  const markAllRead = async () => {
    await api.post("/notifications/mark_all_read/");
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  if (loading) return <div className="p-8 text-center">Chargement...</div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          {notifications.some((n) => !n.is_read) && (
            <button
              onClick={markAllRead}
              className="text-sm font-medium text-green-600 hover:text-green-700"
            >
              Tout marquer comme lu
            </button>
          )}
        </div>

        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.is_read && markRead(n.id)}
              className={`cursor-pointer rounded-xl p-4 shadow-sm ring-1 transition-colors ${
                n.is_read
                  ? "bg-white ring-gray-200"
                  : "bg-green-50 ring-green-200"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p
                    className={`text-sm font-medium ${
                      n.is_read ? "text-gray-900" : "text-green-900"
                    }`}
                  >
                    {n.title}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">{n.message}</p>
                </div>
                <span className="whitespace-nowrap text-xs text-gray-400">
                  {new Date(n.created_at).toLocaleString("fr-FR", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </span>
              </div>
            </div>
          ))}
          {notifications.length === 0 && (
            <p className="py-12 text-center text-sm text-gray-400">
              Aucune notification
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
