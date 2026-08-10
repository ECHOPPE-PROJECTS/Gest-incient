"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import api from "@/lib/api";
import Header from "@/components/header";
import { toast } from "sonner";

interface Comment {
  id: number;
  author: { first_name: string; last_name: string };
  content: string;
  created_at: string;
}

interface IncidentDetail {
  id: number;
  numero_ticket: string;
  title: string;
  description: string;
  author: { first_name: string; last_name: string };
  technician: { first_name: string; last_name: string } | null;
  category: { name: string };
  priority: { name: string; level: number };
  status: { name: string };
  comments: Comment[];
  created_at: string;
  resolved_at: string | null;
  closed_at: string | null;
}

export default function IncidentDetailPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [incident, setIncident] = useState<IncidentDetail | null>(null);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user || !params.id) return;
    api.get(`/incidents/${params.id}/`).then((res) => setIncident(res.data));
  }, [user, params.id]);

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      await api.post("/comments/", {
        incident: Number(params.id),
        content: newComment,
      });
      setNewComment("");
      const res = await api.get(`/incidents/${params.id}/`);
      setIncident(res.data);
      toast.success("Commentaire ajouté");
    } catch {
      toast.error("Erreur");
    }
  };

  const handleClose = async () => {
    try {
      await api.post(`/incidents/${params.id}/close/`);
      const res = await api.get(`/incidents/${params.id}/`);
      setIncident(res.data);
      toast.success("Incident fermé");
    } catch {
      toast.error("Erreur");
    }
  };

  if (loading || !incident)
    return <div className="p-8 text-center">Chargement...</div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <button
          onClick={() => router.push("/incidents")}
          className="mb-4 text-sm text-gray-500 hover:text-gray-700"
        >
          &larr; Retour
        </button>

        <div className="rounded-xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500">{incident.numero_ticket}</p>
              <h1 className="text-2xl font-bold text-gray-900">
                {incident.title}
              </h1>
            </div>
            <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
              {incident.status.name}
            </span>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-500">Catégorie</span>
              <p className="text-gray-900">{incident.category.name}</p>
            </div>
            <div>
              <span className="font-medium text-gray-500">Priorité</span>
              <p className="text-gray-900">{incident.priority.name}</p>
            </div>
            <div>
              <span className="font-medium text-gray-500">Auteur</span>
              <p className="text-gray-900">
                {incident.author.first_name} {incident.author.last_name}
              </p>
            </div>
            <div>
              <span className="font-medium text-gray-500">Technicien</span>
              <p className="text-gray-900">
                {incident.technician
                  ? `${incident.technician.first_name} ${incident.technician.last_name}`
                  : "Non assigné"}
              </p>
            </div>
            <div>
              <span className="font-medium text-gray-500">Créé le</span>
              <p className="text-gray-900">
                {new Date(incident.created_at).toLocaleDateString("fr-FR", {
                  dateStyle: "long",
                })}
              </p>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="mb-2 text-sm font-medium text-gray-500">
              Description
            </h3>
            <p className="whitespace-pre-wrap text-gray-900">
              {incident.description}
            </p>
          </div>

          {incident.status.name !== "Ferme" && (
            <div className="mb-8 flex gap-3">
              <button
                onClick={handleClose}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Fermer l&apos;incident
              </button>
            </div>
          )}
        </div>

        <div className="mt-6 rounded-xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Commentaires ({incident.comments.length})
          </h2>

          <div className="mb-6 space-y-4">
            {incident.comments.map((c) => (
              <div
                key={c.id}
                className="rounded-lg bg-gray-50 p-4"
              >
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">
                    {c.author.first_name} {c.author.last_name}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(c.created_at).toLocaleDateString("fr-FR", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </span>
                </div>
                <p className="text-sm text-gray-700">{c.content}</p>
              </div>
            ))}
            {incident.comments.length === 0 && (
              <p className="text-sm text-gray-400">Aucun commentaire</p>
            )}
          </div>

          <form onSubmit={handleComment} className="flex gap-3">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Ajouter un commentaire..."
              rows={2}
              className="block flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700"
            >
              Envoyer
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
