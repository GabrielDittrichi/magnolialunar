"use client"
import { useState } from "react"

export default function DeleteButton({ slug }: { slug: string }) {
  const [loading, setLoading] = useState(false)
  async function onDelete() {
    if (!slug) return
    if (!confirm("Tem certeza que deseja apagar esta terapeuta?")) return
    setLoading(true)
    await fetch(`/api/therapists?slug=${encodeURIComponent(slug)}`, { method: "DELETE" })
    setLoading(false)
    window.location.reload()
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
