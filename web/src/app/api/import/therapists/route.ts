import { NextResponse } from "next/server"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { promises as fs } from "fs"
import path from "path"

function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
}

function getClient() {
  const accountId = process.env.R2_ACCOUNT_ID as string
  const accessKeyId = process.env.R2_ACCESS_KEY_ID as string
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY as string
  const endpoint = `https://${accountId}.r2.cloudflarestorage.com`
  return new S3Client({
    region: "auto",
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
  })
}

async function uploadBufferToR2(key: string, body: Buffer, contentType: string) {
  const bucket = process.env.R2_BUCKET_NAME as string
  const publicUrl = (process.env.R2_PUBLIC_URL as string || "").replace(/\s|`/g, "")
  const client = getClient()
  await client.send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: body,
    ContentType: contentType || "application/octet-stream",
  }))
  return `${publicUrl}/${key}`
}

async function downloadAsBuffer(url: string) {
  const res = await fetch(url, { cache: "no-store" })
  if (!res.ok) throw new Error(`download_failed_${res.status}`)
  const arrayBuffer = await res.arrayBuffer()
  const contentType = res.headers.get("content-type") || "application/octet-stream"
  return { buffer: Buffer.from(arrayBuffer), contentType }
}

function findImageUrlForName(html: string, name: string): string | null {
  const altPattern = new RegExp(`<img[^>]*alt=["']?[^"']*${name}[^"']*["'][^>]*src=["']([^"']+)["']`, "i")
  const byAlt = html.match(altPattern)
  if (byAlt && byAlt[1]) return byAlt[1]
  const nameIdx = html.toLowerCase().indexOf(name.toLowerCase())
  if (nameIdx !== -1) {
    const context = html.slice(Math.max(0, nameIdx - 2000), nameIdx + 2000)
    const srcMatch = context.match(/<img[^>]*src=["']([^"']+)["']/i)
    if (srcMatch && srcMatch[1]) return srcMatch[1]
  }
  const anyImg = html.match(/<img[^>]*src=["']([^"']+)["']/i)
  if (anyImg && anyImg[1]) return anyImg[1]
  return null
}

export async function GET() {
  try {
    const sourceUrl = "https://www.magnolialunarspa.pt/terapeutas/"
    const res = await fetch(sourceUrl, { cache: "no-store" })
    if (!res.ok) {
      return NextResponse.json({ error: "source_fetch_failed" }, { status: 502 })
    }
    const html = await res.text()
    const names = ["Beatriz", "Diana", "Luiza"]
    const updates: { name: string; slug: string; image?: string }[] = []

    for (const name of names) {
      let imageUrl = findImageUrlForName(html, name)
      if (!imageUrl) {
        const origin = new URL(sourceUrl).origin
        const slug = slugify(name)
        const profileRes = await fetch(`${origin}/terapeutas/${slug}`, { cache: "no-store" })
        if (profileRes.ok) {
          const profileHtml = await profileRes.text()
          const ogMatch = profileHtml.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)
          if (ogMatch && ogMatch[1]) {
            imageUrl = ogMatch[1]
          }
        }
        if (!imageUrl) {
          updates.push({ name, slug })
          continue
        }
      }
      const origin = new URL(sourceUrl).origin
      if (!/^https?:\/\//i.test(imageUrl)) {
        imageUrl = origin + (imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`)
      }
      const { buffer, contentType } = await downloadAsBuffer(imageUrl)
      const ext = contentType.includes("jpeg") ? "jpg"
        : contentType.includes("png") ? "png"
        : contentType.includes("webp") ? "webp"
        : "bin"
      const slug = slugify(name)
      const key = `therapists/${slug}/profile-import.${ext}`
      const publicImage = await uploadBufferToR2(key, buffer, contentType)
      updates.push({ name, slug, image: publicImage })
    }

    const dataPath = path.join(process.cwd(), "src", "data", "therapists.json")
    const raw = await fs.readFile(dataPath, "utf-8").catch(() => "[]")
    const list = JSON.parse(raw) as Array<Record<string, unknown>>

    const next = list.slice()
    for (const up of updates) {
      const idx = next.findIndex(t => typeof t === "object" && t && (t as any).slug === up.slug)
      const specialties = [
        "Massagem Nuru",
        "Massagem a 4 Mãos",
        "Massagem Casal",
        "Massagem Shower",
        "Massagem Mútua",
        "Massagem Body to Body",
      ]
      const baseRecord = {
        id: up.slug,
        name: up.name,
        slug: up.slug,
        specialties,
        image: up.image || "",
        bio: "",
        phone: "",
        gallery: [] as string[],
      }
      if (idx === -1) {
        next.push(baseRecord)
      } else {
        const existing = next[idx] as any
        next[idx] = {
          ...existing,
          name: baseRecord.name,
          specialties: baseRecord.specialties,
          image: baseRecord.image || existing.image || "",
        }
      }
    }

    await fs.writeFile(dataPath, JSON.stringify(next, null, 2))
    return NextResponse.json({ ok: true, imported: updates })
  } catch (e) {
    const message = e instanceof Error ? e.message : "unknown_error"
    return NextResponse.json({ error: "import_failed", message }, { status: 500 })
  }
}
