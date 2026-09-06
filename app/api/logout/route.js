import { cookies } from "next/headers";
import { db } from "../../../firebase";
import { hash } from "../../../lib";
export async function POST() {
  try {
    const token = cookies().get("cardsell_session")?.value;
    if (token) await db.collection("sessions").doc(hash(token)).delete();
  } catch (e) { console.error(e); }
  const response = Response.json({ ok: true });
  response.headers.append("Set-Cookie", "cardsell_session=; HttpOnly; Path=/; Max-Age=0");
  return response;
}
