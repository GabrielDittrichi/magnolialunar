"use client"

export default function AdminLogoutButton() {
  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  return (
    <button 
      onClick={handleLogout}
      className="text-xs uppercase tracking-widest text-slate-400 hover:text-slate-700 transition"
    >
      Sair
    </button>
  )
}
