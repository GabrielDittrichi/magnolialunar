import { pool } from "@/lib/db";

export async function GET() {
  try {
    const conn = await pool.getConnection();
    await conn.query("SELECT 1");
    conn.release();
    return Response.json({ ok: true, message: "Conexão com MySQL OK" });
  } catch (err) {
    return Response.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
