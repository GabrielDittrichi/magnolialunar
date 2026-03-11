import mysql from "mysql2/promise"
import { promises as fs } from "fs"
import path from "path"

const therapistsDataPath = path.join(process.cwd(), "src", "data", "therapists.json")
const massagesDataPath = path.join(process.cwd(), "src", "data", "massages.json")

export const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  port: Number(process.env.MYSQL_PORT) || 3306,
  database: process.env.MYSQL_DATABASE,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  waitForConnections: true,
  connectionLimit: 10,
  connectTimeout: 10000,
})

export function getPool() {
  return pool
}

export async function initDB() {
  const conn = await pool.getConnection()
  try {
    await conn.query(`
      CREATE TABLE IF NOT EXISTS therapists (
        id VARCHAR(36) PRIMARY KEY,
        slug VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        specialties JSON,
        image TEXT,
        bio TEXT,
        phone VARCHAR(50),
        gallery JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    await conn.query(`
      CREATE TABLE IF NOT EXISTS massages (
        id VARCHAR(36) PRIMARY KEY,
        slug VARCHAR(255) UNIQUE NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        duration VARCHAR(50),
        price DECIMAL(10,2),
        image TEXT,
        therapists JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
  } finally {
    conn.release()
  }
}

export const ensureSchema = initDB

export function safeParseArray(input: any): string[] {
  try {
    if (Array.isArray(input)) return input
    if (typeof input === "string") return JSON.parse(input || "[]")
    return []
  } catch {
    return []
  }
}

export async function getTherapists() {
  try {
    await ensureSchema()
    const pool = getPool()
    const [rows] = await pool.query(`
      SELECT slug, name, specialties, image, bio, phone, gallery
      FROM therapists
      ORDER BY name ASC
    `)
    return (rows as any[]).map(r => ({
      slug: r.slug,
      name: r.name,
      specialties: safeParseArray(r.specialties),
      image: r.image || "",
      bio: r.bio || "",
      phone: r.phone || "",
      gallery: safeParseArray(r.gallery),
      id: r.slug,
    }))
  } catch {
    const raw = await fs.readFile(therapistsDataPath, "utf-8").catch(() => "[]")
    return JSON.parse(raw || "[]")
  }
}

export async function getMassages() {
  try {
    await ensureSchema()
    const pool = getPool()
    const [rows] = await pool.query(`
      SELECT slug, title, description, duration, price, image, therapists
      FROM massages
      ORDER BY title ASC
    `)
    return (rows as any[]).map(r => ({
      slug: r.slug,
      id: r.slug,
      title: r.title,
      description: r.description || "",
      duration: r.duration || "60 min",
      price: Number(r.price ?? 0),
      image: r.image || "",
      therapists: safeParseArray(r.therapists),
    }))
  } catch {
    const raw = await fs.readFile(massagesDataPath, "utf-8").catch(() => "[]")
    return JSON.parse(raw || "[]")
  }
}

export async function getTherapistBySlug(slug: string) {
  try {
    await ensureSchema()
    const pool = getPool()
    const [rows] = await pool.query(`
      SELECT slug, name, specialties, image, bio, phone, gallery
      FROM therapists
      WHERE slug = ?
    `, [slug])
    
    if ((rows as any[]).length === 0) return null
    
    const r = (rows as any[])[0]
    return {
      slug: r.slug,
      name: r.name,
      specialties: safeParseArray(r.specialties),
      image: r.image || "",
      bio: r.bio || "",
      phone: r.phone || "",
      gallery: safeParseArray(r.gallery),
      id: r.slug,
    }
  } catch {
    const raw = await fs.readFile(therapistsDataPath, "utf-8").catch(() => "[]")
    const data = JSON.parse(raw || "[]")
    return data.find((t: any) => t.slug === slug) || null
  }
}

export async function getMassageBySlug(slug: string) {
  try {
    await ensureSchema()
    const pool = getPool()
    const [rows] = await pool.query(`
      SELECT slug, title, description, duration, price, image, therapists
      FROM massages
      WHERE slug = ?
    `, [slug])

    if ((rows as any[]).length === 0) return null

    const r = (rows as any[])[0]
    return {
      slug: r.slug,
      id: r.slug,
      title: r.title,
      description: r.description || "",
      duration: r.duration || "60 min",
      price: Number(r.price ?? 0),
      image: r.image || "",
      therapists: safeParseArray(r.therapists),
    }
  } catch {
    const raw = await fs.readFile(massagesDataPath, "utf-8").catch(() => "[]")
    const data = JSON.parse(raw || "[]")
    return data.find((m: any) => m.slug === slug) || null
  }
}
