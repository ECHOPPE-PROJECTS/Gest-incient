"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function Header() {
  const { user } = useAuth();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!user) return;
    api.get("/notifications/unread_count/").then((res) => setUnread(res.data.count)).catch(() => {});
    const interval = setInterval(() => {
      api.get("/notifications/unread_count/").then((res) => setUnread(res.data.count)).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, [user]);

  return (
    <header className="border-b border-gray-200 bg-white">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/dashboard" className="text-xl font-bold text-gray-900">
          Echoppe gest-incident
        </Link>

        {user && (
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Tableau de bord
            </Link>
            <Link
              href="/incidents"
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Mes incidents
            </Link>
            <Link
              href="/notifications"
              className="relative text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Notifications
              {unread > 0 && (
                <span className="absolute -right-3 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {unread}
                </span>
              )}
            </Link>
            <Link
              href="/profile"
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Profil
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
