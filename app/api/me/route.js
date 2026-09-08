import { cookies } from "next/headers";
import { db } from "../../../firebase";
import { hash } from "../../../lib";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export async function GET() {
  try {
    const token = cookies().get("cardsell_session")?.value;
    if (!token) return Response.json({ authenticated: false });
    const session = await db.collection("sessions").doc(hash(token)).get();
    if (!session.exists || session.data().expiresAt.toMillis() <= Date.now()) return Response.json({ authenticated: false });
    const userSnap = await db.collection("users").doc(session.data().userId).get();
    if (!userSnap.exists) return Response.json({ authenticated: false });
    const u = userSnap.data();
    return Response.json({ authenticated: true, user: { id: userSnap.id, name: u.name, mobile: u.mobile, gmail: u.gmail, defaultUpiId: u.defaultUpiId || "", status: u.status } });
  } catch (e) { console.error(e); return Response.json({ authenticated: false }, { status: 500 }); }
}
