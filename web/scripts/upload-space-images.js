const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const fs = require("fs");
const path = require("path");

// Carregar variáveis de ambiente manualmente
const envPath = path.join(__dirname, "../.env.local");
const envContent = fs.readFileSync(envPath, "utf-8");
envContent.split("\n").forEach(line => {
  const [key, value] = line.split("=");
  if (key && value) {
    process.env[key.trim()] = value.trim();
  }
});

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucket = process.env.R2_BUCKET_NAME;
const publicUrl = process.env.R2_PUBLIC_URL;

const client = new S3Client({
  region: "auto",
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId, secretAccessKey },
});

const sourceDir = "C:\\Users\\gabsn\\Downloads\\magnolia\\espaco";
const files = fs.readdirSync(sourceDir);

async function upload() {
  console.log("Iniciando upload...");
  const uploadedUrls = [];

  for (const file of files) {
    const filePath = path.join(sourceDir, file);
    const fileContent = fs.readFileSync(filePath);
    const ext = path.extname(file).toLowerCase();
    
    const contentType = ext === ".mp4" ? "video/mp4" : "image/jpeg";
    
    // Gerar nome limpo e único
    const cleanName = `space/magnolia-lunar-${Date.now()}-${path.basename(file).replace(/[^a-zA-Z0-9.-]/g, "").replace(/\s+/g, "-")}`;
    
    await client.send(new PutObjectCommand({
      Bucket: bucket,
      Key: cleanName,
      Body: fileContent,
      ContentType: contentType,
    }));
    
    const url = `${publicUrl}/${cleanName}`;
    console.log(`Uploaded: ${file} -> ${url}`);
    uploadedUrls.push({ original: file, url, type: contentType });
  }
  
  console.log("\nRESULT_JSON_START");
  console.log(JSON.stringify(uploadedUrls, null, 2));
  console.log("RESULT_JSON_END");
}

upload().catch(console.error);
