"use client"
import { useState } from "react"

export default function DeleteMassageButton({ slug }: { slug: string }) {
  const [loading, setLoading] = useState(false)
  async function onDelete() {
    if (!slug) return
    if (!confirm("Tem certeza que deseja apagar esta massagem?")) return
    setLoading(true)
    try {
      const res = await fetch(`/api/massages?slug=${encodeURIComponent(slug)}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Falha ao apagar")
      window.location.reload()
    } catch (error) {
      console.error(error)
      alert("Erro ao apagar massagem. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }
  return (
    <button
      onClick={onDelete}
      disabled={loading}
      className="text-xs border border-red-600 text-red-600 px-3 py-2 tracking-widest uppercase rounded-sm hover:bg-red-600 hover:text-white transition-colors disabled:opacity-50"
    >
      {loading ? "Apagando..." : "Apagar"}
    </button>
  )
}
