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
  const form = await request.formData()
  const file = form.get("file") as File | null
  const key = (form.get("key") as string) || ""
  const bucket = process.env.R2_BUCKET_NAME as string
  const publicUrl = (process.env.R2_PUBLIC_URL as string || "").replace(/\s|`/g, "")
  if (!file || !bucket || !key || !publicUrl) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 })
  }
  const arrayBuffer = await file.arrayBuffer()
  const body = Buffer.from(arrayBuffer)
  const client = getClient()
  await client.send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: body,
    ContentType: file.type || "application/octet-stream",
  }))
  return NextResponse.json({ url: `${publicUrl}/${key}` })
}
