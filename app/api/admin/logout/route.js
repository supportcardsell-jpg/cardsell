import { cookies } from "next/headers";
import { db } from "../../../../firebase";
import { hash } from "../../../../lib";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const token = cookies().get("cardsell_admin_session")?.value;
    if (token) await db.collection("adminSessions").doc(hash(token)).delete();
  } catch (e) { console.error(e); }
  const response = Response.json({ ok: true });
  response.headers.append("Set-Cookie", "cardsell_admin_session=; HttpOnly; Path=/; Max-Age=0");
  return response;
}
