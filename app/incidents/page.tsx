"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import api from "@/lib/api";
import Header from "@/components/header";

interface Incident {
  id: number;
  numero_ticket: string;
  title: string;
  category: { name: string };
  priority: { name: string; level: number };
  status: { name: string };
  created_at: string;
}

export default function IncidentsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    const params = statusFilter
      ? `?status=${encodeURIComponent(statusFilter)}`
      : "";
    api.get(`/incidents/${params}`).then((res) => {
      setIncidents(res.data.results || res.data);
    });
  }, [user, statusFilter]);

  if (loading) return <div className="p-8 text-center">Chargement...</div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Mes incidents</h1>
          <button
            onClick={() => router.push("/incidents/new")}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            + Nouveau
          </button>
        </div>

        <div className="mb-4 flex gap-2">
          {["", "Nouveau", "En cours", "Resolu", "Ferme"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                statusFilter === s
                  ? "bg-green-600 text-white"
                  : "bg-white text-gray-600 ring-1 ring-gray-300 hover:bg-gray-50"
              }`}
            >
              {s || "Tous"}
            </button>
          ))}
        </div>

        <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Ticket</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Titre</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Catégorie</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Priorité</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Date</th>
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
                  <td className="px-6 py-4 text-sm text-gray-700">{inc.title}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{inc.category.name}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                      {inc.status.name}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{inc.priority.name}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {new Date(inc.created_at).toLocaleDateString("fr-FR")}
                  </td>
                </tr>
              ))}
              {incidents.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-400">
                    Aucun incident trouvé
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
