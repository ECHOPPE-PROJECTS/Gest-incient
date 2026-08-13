"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import api from "@/lib/api";
import Header from "@/components/header";
import { toast } from "sonner";

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [updating, setUpdating] = useState(false);

  if (loading) return <div className="p-8 text-center">Chargement...</div>;
  if (!user) {
    router.push("/login");
    return null;
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await api.put("/users/change_password/", { old_password: oldPassword, new_password: newPassword });
      toast.success("Mot de passe modifié");
      setOldPassword("");
      setNewPassword("");
    } catch {
      toast.error("Erreur - vérifiez votre ancien mot de passe");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Mon profil</h1>

        <div className="mb-6 rounded-xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-500">Nom</span>
              <p className="text-gray-900">{user.last_name}</p>
            </div>
            <div>
              <span className="font-medium text-gray-500">Prénom</span>
              <p className="text-gray-900">{user.first_name}</p>
            </div>
            <div>
              <span className="font-medium text-gray-500">Email</span>
              <p className="text-gray-900">{user.email}</p>
            </div>
            <div>
              <span className="font-medium text-gray-500">Rôle</span>
              <p className="text-gray-900">{user.role?.name || "-"}</p>
            </div>
            <div>
              <span className="font-medium text-gray-500">Département</span>
              <p className="text-gray-900">{user.department?.name || "-"}</p>
            </div>
            <div>
              <span className="font-medium text-gray-500">Téléphone</span>
              <p className="text-gray-900">{user.phone || "-"}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Changer le mot de passe
          </h2>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Ancien mot de passe
              </label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
                className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nouveau mot de passe
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-400"
              />
            </div>
            <button
              type="submit"
              disabled={updating}
              className="rounded-lg bg-green-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
            >
              {updating ? "..." : "Modifier le mot de passe"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
