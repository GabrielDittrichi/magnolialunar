import { NextResponse } from "next/server"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"

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

export async function POST(request: Request) {
  try {
    const { url, key } = await request.json() as { url?: string, key?: string }
    const bucket = process.env.R2_BUCKET_NAME as string
    const publicUrl = (process.env.R2_PUBLIC_URL as string || "").replace(/\s|`/g, "")
    if (!url || !key || !bucket || !publicUrl) {
      return NextResponse.json({ error: "invalid_request" }, { status: 400 })
    }
    const res = await fetch(url, { cache: "no-store" })
    if (!res.ok) return NextResponse.json({ error: "download_failed" }, { status: 502 })
    const arrayBuffer = await res.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const contentType = res.headers.get("content-type") || "application/octet-stream"
    const client = getClient()
    await client.send(new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }))
    return NextResponse.json({ url: `${publicUrl}/${key}` })
  } catch (e) {
    return NextResponse.json({ error: "upload_from_url_failed" }, { status: 500 })
  }
}

