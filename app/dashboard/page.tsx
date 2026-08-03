"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import api from "@/lib/api";
import Header from "@/components/header";

interface Stats {
  total: number;
  open: number;
  in_progress: number;
  resolved: number;
}

interface Incident {
  id: number;
  numero_ticket: string;
  title: string;
  status: { name: string };
  priority: { name: string; level: number };
  created_at: string;
}

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    open: 0,
    in_progress: 0,
    resolved: 0,
  });

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    api.get("/incidents/").then((res) => {
      const items: Incident[] = res.data.results || res.data;
      setIncidents(items.slice(0, 5));
      setStats({
        total: items.length,
        open: items.filter((i) => i.status.name === "Nouveau").length,
        in_progress: items.filter(
          (i) => i.status.name === "En cours" || i.status.name === "Assigne"
        ).length,
        resolved: items.filter((i) => i.status.name === "Resolu").length,
      });
    });
  }, [user]);

  if (loading) return <div className="p-8 text-center">Chargement...</div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            Bonjour, {user.first_name || user.email}
          </h1>
          <button
            onClick={logout}
            className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-gray-300 hover:bg-gray-50"
          >
            D&eacute;connexion
          </button>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Total", value: stats.total, color: "bg-blue-500" },
            { label: "Ouverts", value: stats.open, color: "bg-yellow-500" },
            { label: "En cours", value: stats.in_progress, color: "bg-orange-500" },
            { label: "Résolus", value: stats.resolved, color: "bg-green-500" },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200"
            >
              <div className={`mb-2 h-2 w-12 rounded-full ${s.color}`} />
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-sm text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Derniers incidents
          </h2>
          <button
            onClick={() => router.push("/incidents/new")}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            + Nouveau signalement
          </button>
        </div>

        <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Ticket
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Titre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Priorité
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {incidents.map((inc) => (
                <tr
                  key={inc.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => router.push(`/incidents/${inc.id}`)}
                >
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                    {inc.numero_ticket}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {inc.title}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                      {inc.status.name}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {inc.priority.name}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {new Date(inc.created_at).toLocaleDateString("fr-FR")}
                  </td>
                </tr>
              ))}
              {incidents.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-sm text-gray-400"
                  >
                    Aucun incident pour le moment
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
