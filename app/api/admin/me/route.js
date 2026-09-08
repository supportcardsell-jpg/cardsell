import { cookies } from "next/headers";
import { db } from "../../../../firebase";
import { hash, normalizeGmail } from "../../../../lib";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const token = cookies().get("cardsell_admin_session")?.value;
    if (!token) return Response.json({ authenticated: false });
    const snap = await db.collection("adminSessions").doc(hash(token)).get();
    if (!snap.exists) return Response.json({ authenticated: false });
    const data = snap.data();
    const expires = data.expiresAt?.toDate ? data.expiresAt.toDate().getTime() : new Date(data.expiresAt).getTime();
    const adminEmail = normalizeGmail(process.env.ADMIN_GMAIL || "");
    if (!expires || expires <= Date.now() || normalizeGmail(data.gmail) !== adminEmail) return Response.json({ authenticated: false });
    return Response.json({ authenticated: true, gmail: adminEmail });
  } catch (e) {
    console.error(e);
    return Response.json({ authenticated: false }, { status: 500 });
  }
}
