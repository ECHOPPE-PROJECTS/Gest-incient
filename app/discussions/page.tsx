"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import api from "@/lib/api";
import Header from "@/components/header";
import { toast } from "sonner";

interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  role?: { name: string } | null;
}

interface Message {
  id: number;
  user: User;
  discussion: number;
  content: string;
  created_at: string;
}

interface Discussion {
  id: number;
  title: string;
  participants: User[];
  created_at: string;
  last_message: Message | null;
  messages_count: number;
}

export default function DiscussionsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    api.get("/discussions/").then((res) => {
      setDiscussions(res.data.results || res.data);
    });
  }, [user]);

  useEffect(() => {
    if (!user) return;
    api.get("/users/").then((res) => {
      const users = res.data.results || res.data;
      const admin = users.find((u: User) => u.role?.name === "Administrateur");
      setAdminUser(admin || null);
    });
  }, [user]);

  useEffect(() => {
    if (selectedId) {
      api.get(`/discussions/${selectedId}/`).then((res) => {
        setMessages(res.data.messages || []);
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      });
    }
  }, [selectedId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedId) return;
    try {
      await api.post("/messages/", {
        discussion: selectedId,
        content: newMessage,
      });
      setNewMessage("");
      const res = await api.get(`/discussions/${selectedId}/`);
      setMessages(res.data.messages || []);
      const listRes = await api.get("/discussions/");
      setDiscussions(listRes.data.results || listRes.data);
    } catch {
      toast.error("Erreur lors de l'envoi");
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminUser) {
      toast.error("Administrateur introuvable");
      return;
    }
    try {
      const res = await api.post("/discussions/", {
        title: newTitle || null,
        participants: [user!.id, adminUser.id],
      });
      setShowCreate(false);
      setNewTitle("");
      const listRes = await api.get("/discussions/");
      setDiscussions(listRes.data.results || listRes.data);
      setSelectedId(res.data.id);
      toast.success("Discussion créée");
    } catch {
      toast.error("Erreur lors de la création");
    }
  };

  const selectedDiscussion = discussions.find((d) => d.id === selectedId);

  if (loading || !user) return <div className="p-8 text-center">Chargement...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <button
            onClick={() => setShowCreate(true)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Nouvelle discussion
          </button>
        </div>

        {showCreate && (
          <div className="mb-6 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Nouvelle discussion avec l&apos;administrateur
            </h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Titre (optionnel)"
                className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={!adminUser}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  Créer
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="flex gap-6">
          <div className="w-80 flex-shrink-0 space-y-2">
            {discussions.map((d) => (
              <button
                key={d.id}
                onClick={() => setSelectedId(d.id)}
                className={`w-full rounded-xl p-4 text-left ring-1 transition ${
                  selectedId === d.id
                    ? "bg-blue-50 ring-blue-200"
                    : "bg-white ring-gray-200 hover:bg-gray-50"
                }`}
              >
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {d.title || `Discussion #${d.id}`}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {d.messages_count} message{d.messages_count !== 1 ? "s" : ""}
                </p>
                {d.last_message && (
                  <p className="mt-1 text-xs text-gray-400 truncate">
                    {d.last_message.user.first_name}: {d.last_message.content}
                  </p>
                )}
              </button>
            ))}
            {discussions.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-8">
                Aucune discussion
              </p>
            )}
          </div>

          <div className="flex-1 rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
            {selectedId && selectedDiscussion ? (
              <div className="flex h-[600px] flex-col">
                <div className="border-b border-gray-200 px-6 py-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {selectedDiscussion.title || `Discussion #${selectedId}`}
                  </h2>
                  <p className="text-xs text-gray-500">
                    {selectedDiscussion.participants
                      .map((p) => `${p.first_name} ${p.last_name}`)
                      .join(", ")}
                  </p>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex ${m.user.id === user.id ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs rounded-xl px-4 py-2.5 ${
                          m.user.id === user.id
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        {m.user.id !== user.id && (
                          <p className="mb-1 text-xs font-semibold text-blue-600">
                            {m.user.first_name} {m.user.last_name}
                          </p>
                        )}
                        <p className="text-sm">{m.content}</p>
                        <p
                          className={`mt-1 text-[10px] ${
                            m.user.id === user.id ? "text-blue-200" : "text-gray-400"
                          }`}
                        >
                          {new Date(m.created_at).toLocaleTimeString("fr-FR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSend} className="border-t border-gray-200 px-6 py-4 flex gap-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Écrire un message..."
                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    Envoyer
                  </button>
                </form>
              </div>
            ) : (
              <div className="flex h-[600px] items-center justify-center text-gray-400">
                Sélectionnez une discussion
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
