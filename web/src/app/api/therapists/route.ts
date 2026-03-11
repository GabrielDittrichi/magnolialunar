import { NextResponse } from "next/server"
import { getPool, initDB, safeParseArray } from "@/lib/db"
import { promises as fs } from "fs"
import path from "path"
const dataPath = path.join(process.cwd(), "src", "data", "therapists.json")
const massagesDataPath = path.join(process.cwd(), "src", "data", "massages.json")

export async function GET() {
  try {
    await initDB()
    const pool = getPool()
    const [rows] = await pool.query(`
      SELECT slug, name, specialties, image, bio, phone, gallery
      FROM therapists
      ORDER BY name ASC
    `)
    const list = (rows as any[]).map(r => ({
      slug: r.slug,
      name: r.name,
      specialties: safeParseArray(r.specialties),
      image: r.image || "",
      bio: r.bio || "",
      phone: r.phone || "",
      gallery: safeParseArray(r.gallery),
      id: r.slug,
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
    const [existsRows] = await pool.query(`SELECT slug FROM therapists WHERE slug = ?`, [payload.slug])
    if ((existsRows as any[]).length > 0) return NextResponse.json({ error: "exists" }, { status: 409 })
    await pool.query(`
      INSERT INTO therapists (id, slug, name, specialties, image, bio, phone, gallery)
      VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?)
    `, [
      payload.slug,
      payload.name,
      JSON.stringify(payload.specialties || []),
      payload.image || "",
      payload.bio || "",
      payload.phone || "",
      JSON.stringify(payload.gallery || []),
    ])
    return NextResponse.json({ ok: true })
  } catch {
    const raw = await fs.readFile(dataPath, "utf-8").catch(() => "[]")
    const data = JSON.parse(raw || "[]")
    const exists = data.some((t: any) => t.slug === payload.slug)
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
    const [existsRows] = await pool.query(`SELECT slug FROM therapists WHERE slug = ?`, [payload.slug])
    if ((existsRows as any[]).length === 0) return NextResponse.json({ error: "not_found" }, { status: 404 })
    await pool.query(`
      UPDATE therapists
      SET name = ?, specialties = ?, image = ?, bio = ?, phone = ?, gallery = ?
      WHERE slug = ?
    `, [
      payload.name,
      JSON.stringify(payload.specialties || []),
      payload.image || "",
      payload.bio || "",
      payload.phone || "",
      JSON.stringify(payload.gallery || []),
      payload.slug,
    ])
    return NextResponse.json({ ok: true })
  } catch {
    const raw = await fs.readFile(dataPath, "utf-8").catch(() => "[]")
    const data = JSON.parse(raw || "[]")
    const idx = data.findIndex((t: any) => t.slug === payload.slug)
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
    
    // Cascade delete: remove therapist slug from all massages
    try {
      const [massages] = await pool.query(`SELECT slug, therapists FROM massages`)
      for (const m of (massages as any[])) {
        const tList = safeParseArray(m.therapists)
        if (tList.includes(slug)) {
          const nextTList = tList.filter(t => t !== slug)
          await pool.query(`UPDATE massages SET therapists = ? WHERE slug = ?`, [
            JSON.stringify(nextTList),
            m.slug
          ])
        }
      }
    } catch (e) {
      console.error("Failed to cascade delete in MySQL:", e)
    }

    await pool.query(`DELETE FROM therapists WHERE slug = ?`, [slug])
    return NextResponse.json({ ok: true })
  } catch {
    // Fallback JSON cascade
    try {
      const mRaw = await fs.readFile(massagesDataPath, "utf-8").catch(() => "[]")
      const massages = JSON.parse(mRaw || "[]")
      let changed = false
      const nextMassages = massages.map((m: any) => {
        if (m.therapists && Array.isArray(m.therapists) && m.therapists.includes(slug)) {
          m.therapists = m.therapists.filter((t: string) => t !== slug)
          changed = true
        }
        return m
      })
      if (changed) {
        await fs.writeFile(massagesDataPath, JSON.stringify(nextMassages, null, 2))
      }
    } catch (e) {
      console.error("Failed to cascade delete in JSON:", e)
    }

    const raw = await fs.readFile(dataPath, "utf-8").catch(() => "[]")
    const data = JSON.parse(raw || "[]")
    const next = data.filter((t: any) => t.slug !== slug)
    await fs.writeFile(dataPath, JSON.stringify(next, null, 2))
    return NextResponse.json({ ok: true })
  }
}
