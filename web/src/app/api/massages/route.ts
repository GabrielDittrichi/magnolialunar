import { NextResponse } from "next/server"
import { getPool, initDB, safeParseArray } from "@/lib/db"
import { promises as fs } from "fs"
import path from "path"
import { revalidatePath } from "next/cache"

const dataPath = path.join(process.cwd(), "src", "data", "massages.json")
const therapistsDataPath = path.join(process.cwd(), "src", "data", "therapists.json")

export async function GET() {
  try {
    await initDB()
    const pool = getPool()
    const [rows] = await pool.query(`
      SELECT slug, title, description, duration, price, image, therapists
      FROM massages
      ORDER BY title ASC
    `)
    const list = (rows as any[]).map(r => ({
      slug: r.slug,
      id: r.slug,
      title: r.title,
      description: r.description || "",
      duration: r.duration || "60 min",
      price: Number(r.price ?? 0),
      image: r.image || "",
      therapists: safeParseArray(r.therapists),
    }))
    return NextResponse.json(list)
  } catch {
    const raw = await fs.readFile(dataPath, "utf-8").catch(() => "[]")
    const data = JSON.parse(raw || "[]")
    return NextResponse.json(data)
  }
}

export async function POST(request: Request) {
  const payload = await request.json()
  try {
    await initDB()
    const pool = getPool()
    const [existsRows] = await pool.query(`SELECT slug FROM massages WHERE slug = ?`, [payload.slug])
    if ((existsRows as any[]).length > 0) return NextResponse.json({ error: "exists" }, { status: 409 })
    await pool.query(`
      INSERT INTO massages (id, slug, title, description, duration, price, image, therapists)
      VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?)
    `, [
      payload.slug,
      payload.title,
      payload.description || "",
      payload.duration || "60 min",
      Number(payload.price || 0),
      payload.image || "",
      JSON.stringify(payload.therapists || []),
    ])

    revalidatePath("/massagens")
    revalidatePath("/admin/massagens")
    revalidatePath(`/massagens/${payload.slug}`)

    return NextResponse.json({ ok: true })
  } catch {
    const raw = await fs.readFile(dataPath, "utf-8").catch(() => "[]")
    const data = JSON.parse(raw || "[]")
    const exists = data.some((m: any) => m.slug === payload.slug)
    if (exists) return NextResponse.json({ error: "exists" }, { status: 409 })
    data.push(payload)
    await fs.writeFile(dataPath, JSON.stringify(data, null, 2))
    return NextResponse.json({ ok: true }, { headers: { "X-Data-Source": "fallback" } })
  }
}

export async function PUT(request: Request) {
  const payload = await request.json()
  try {
    await initDB()
    const pool = getPool()
    const [existsRows] = await pool.query(`SELECT slug FROM massages WHERE slug = ?`, [payload.slug])
    if ((existsRows as any[]).length === 0) return NextResponse.json({ error: "not_found" }, { status: 404 })
    await pool.query(`
      UPDATE massages
      SET title = ?, description = ?, duration = ?, price = ?, image = ?, therapists = ?
      WHERE slug = ?
    `, [
      payload.title,
      payload.description || "",
      payload.duration || "60 min",
      Number(payload.price || 0),
      payload.image || "",
      JSON.stringify(payload.therapists || []),
      payload.slug,
    ])

    revalidatePath("/massagens")
    revalidatePath("/admin/massagens")
    revalidatePath(`/massagens/${payload.slug}`)

    return NextResponse.json({ ok: true })
  } catch {
    const raw = await fs.readFile(dataPath, "utf-8").catch(() => "[]")
    const data = JSON.parse(raw || "[]")
    const idx = data.findIndex((m: any) => m.slug === payload.slug)
    if (idx === -1) return NextResponse.json({ error: "not_found" }, { status: 404 })
    data[idx] = payload
    await fs.writeFile(dataPath, JSON.stringify(data, null, 2))
    return NextResponse.json({ ok: true }, { headers: { "X-Data-Source": "fallback" } })
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get("slug")
  if (!slug) return NextResponse.json({ error: "missing_slug" }, { status: 400 })
  try {
    await initDB()
    const pool = getPool()

    // Cascade delete: remove massage slug from all therapists
    try {
      const [therapists] = await pool.query(`SELECT slug, specialties FROM therapists`)
      for (const t of (therapists as any[])) {
        const sList = safeParseArray(t.specialties)
        if (sList.includes(slug)) {
          const nextSList = sList.filter(s => s !== slug)
          await pool.query(`UPDATE therapists SET specialties = ? WHERE slug = ?`, [
            JSON.stringify(nextSList),
            t.slug
          ])
        }
      }
    } catch (e) {
      console.error("Failed to cascade delete in MySQL:", e)
    }

    await pool.query(`DELETE FROM massages WHERE slug = ?`, [slug])
    
    // Revalidate paths to update cache
    revalidatePath("/massagens")
    revalidatePath("/admin/massagens")
    revalidatePath(`/massagens/${slug}`)
    revalidatePath("/terapeutas")
    revalidatePath("/admin/terapeutas")
    
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Error deleting massage (MySQL):", error)

    // Fallback JSON cascade
    try {
      const tRaw = await fs.readFile(therapistsDataPath, "utf-8").catch(() => "[]")
      const therapists = JSON.parse(tRaw || "[]")
      let changed = false
      const nextTherapists = therapists.map((t: any) => {
        if (t.specialties && Array.isArray(t.specialties) && t.specialties.includes(slug)) {
          t.specialties = t.specialties.filter((s: string) => s !== slug)
          changed = true
        }
        return t
      })
      if (changed) {
        await fs.writeFile(therapistsDataPath, JSON.stringify(nextTherapists, null, 2))
      }
    } catch (e) {
      console.error("Failed to cascade delete in JSON:", e)
    }

    const raw = await fs.readFile(dataPath, "utf-8").catch(() => "[]")
    const data = JSON.parse(raw || "[]")
    const next = data.filter((m: any) => m.slug !== slug)
    await fs.writeFile(dataPath, JSON.stringify(next, null, 2))
    return NextResponse.json({ ok: true })
  }
}
