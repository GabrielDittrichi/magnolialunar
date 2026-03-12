"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/admin";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        throw new Error("Usuário ou senha incorretos");
      }

      router.push(redirectPath);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-slate-50 min-h-screen flex items-start justify-center pt-32">
      <div className="max-w-sm w-full mx-auto bg-white p-8 rounded shadow-sm border border-slate-100">
        <h1 className="font-philosopher text-2xl text-slate-900 mb-2">Área Restrita</h1>
        <div className="w-8 h-0.5 bg-[#dabe65] mb-8"></div>

        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label className="block uppercase tracking-widest text-xs text-slate-500 mb-2">
              Usuário
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="border border-slate-200 rounded-sm px-3 py-2 w-full focus:outline-none focus:border-slate-400"
              required
            />
          </div>

          <div>
            <label className="block uppercase tracking-widest text-xs text-slate-500 mb-2">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-slate-200 rounded-sm px-3 py-2 w-full focus:outline-none focus:border-slate-400"
              required
            />
          </div>

          {error && <p className="text-red-600 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white uppercase tracking-widest text-xs py-3 hover:bg-slate-700 transition disabled:opacity-50"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <LoginForm />
    </Suspense>
  );
}
