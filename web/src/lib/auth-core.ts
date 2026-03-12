// Using standard Web Crypto API for Edge compatibility
const SECRET = process.env.ADMIN_SECRET || "default_secret_dev_only";

async function sign(value: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(SECRET);
  const data = encoder.encode(value);

  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", key, data);
  
  // Convert buffer to hex string
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function createSessionToken(): Promise<string> {
  const payload = `admin:${Date.now()}`;
  const sig = await sign(payload);
  // Using custom base64 to avoid Buffer in Edge
  return btoa(`${payload}:${sig}`);
}

export async function verifySessionToken(token: string): Promise<boolean> {
  try {
    const decoded = atob(token);
    const lastColon = decoded.lastIndexOf(":");
    
    if (lastColon === -1) return false;
    
    const payload = decoded.slice(0, lastColon);
    const sig = decoded.slice(lastColon + 1);
    
    const expectedSig = await sign(payload);
    return sig === expectedSig;
  } catch {
    return false;
  }
}
