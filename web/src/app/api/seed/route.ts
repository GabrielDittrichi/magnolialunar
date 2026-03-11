import { NextResponse } from "next/server"
import { ensureSchema, getPool } from "@/lib/db"
import { promises as fs } from "fs"
import path from "path"

export async function POST(request: Request) {
  let mode = ""
  try {
    const body = await request.json().catch(() => ({}))
    console.log("Seed Body:", body)
    mode = body.mode
  } catch {}

  try {
    await ensureSchema()
    const pool = getPool()
    const therapistsPath = path.join(process.cwd(), "src", "data", "therapists.json")
    const massagesPath = path.join(process.cwd(), "src", "data", "massages.json")
    const tRaw = await fs.readFile(therapistsPath, "utf-8").catch(() => "[]")
    const mRaw = await fs.readFile(massagesPath, "utf-8").catch(() => "[]")
    const therapists = JSON.parse(tRaw || "[]")
    const massages = JSON.parse(mRaw || "[]")

    if (mode === "sync") {
      let tSynced = 0
      let mSynced = 0

      // Sync Therapists
      for (const t of therapists) {
        await pool.query(`
          INSERT INTO therapists (id, slug, name, specialties, image, bio, phone, gallery)
          VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            name = VALUES(name),
            specialties = VALUES(specialties),
            image = VALUES(image),
            bio = VALUES(bio),
            phone = VALUES(phone),
            gallery = VALUES(gallery)
        `, [
          t.slug, t.name, JSON.stringify(t.specialties || []), t.image || "", t.bio || "", t.phone || "", JSON.stringify(t.gallery || []),
        ])
        tSynced++
      }

      // Sync Massages
      for (const m of massages) {
        await pool.query(`
          INSERT INTO massages (id, slug, title, description, duration, price, image, therapists)
          VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            title = VALUES(title),
            description = VALUES(description),
            duration = VALUES(duration),
            price = VALUES(price),
            image = VALUES(image),
            therapists = VALUES(therapists)
        `, [
          m.slug, m.title, m.description || "", m.duration || "60 min", Number(m.price || 0), m.image || "", JSON.stringify(m.therapists || []),
        ])
        mSynced++
      }
      
      return NextResponse.json({ ok: true, synced: { therapists: tSynced, massages: mSynced } })
    }

    // Default Seed Behavior (Insert only if not exists)
    for (const t of therapists) {
      const [existsRows] = await pool.query(`SELECT slug FROM therapists WHERE slug = ?`, [t.slug])
      if ((existsRows as any[]).length === 0) {
        await pool.query(`
          INSERT INTO therapists (id, slug, name, specialties, image, bio, phone, gallery)
          VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?)
        `, [
          t.slug, t.name, JSON.stringify(t.specialties || []), t.image || "", t.bio || "", t.phone || "", JSON.stringify(t.gallery || []),
        ])
      }
    }

    for (const m of massages) {
      const [existsRows] = await pool.query(`SELECT slug FROM massages WHERE slug = ?`, [m.slug])
      if ((existsRows as any[]).length === 0) {
        await pool.query(`
          INSERT INTO massages (id, slug, title, description, duration, price, image, therapists)
          VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?)
        `, [
          m.slug, m.title, m.description || "", m.duration || "60 min", Number(m.price || 0), m.image || "", JSON.stringify(m.therapists || []),
        ])
      }
    }

    return NextResponse.json({ ok: true, imported: { therapists: therapists.length, massages: massages.length } })
  } catch (e) {
    console.error("Seed/Sync failed:", e)
    return NextResponse.json({ error: "seed_failed" }, { status: 500 })
  }
}

