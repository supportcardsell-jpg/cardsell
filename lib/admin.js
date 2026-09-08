import { cookies } from "next/headers";
import { db } from "../firebase";
import { hash, normalizeGmail } from "../lib";

export async function requireAdmin() {
  const token = cookies().get("cardsell_session")?.value;
  if (!token) throw new Error("UNAUTHENTICATED");
  const session = await db.collection("sessions").doc(hash(token)).get();
  if (!session.exists || session.data().expiresAt.toMillis() <= Date.now()) throw new Error("UNAUTHENTICATED");
  const userSnap = await db.collection("users").doc(session.data().userId).get();
  if (!userSnap.exists) throw new Error("UNAUTHENTICATED");
  const user = userSnap.data();
  const adminEmail = normalizeGmail(process.env.ADMIN_GMAIL || "");
  if (!adminEmail || normalizeGmail(user.gmail) !== adminEmail) throw new Error("FORBIDDEN");
  return { id: userSnap.id, ...user };
}
export function adminError(e) {
  if (e?.message === "UNAUTHENTICATED") return Response.json({ ok:false, message:"Please login first." }, {status:401});
  if (e?.message === "FORBIDDEN") return Response.json({ ok:false, message:"Admin access required." }, {status:403});
  console.error(e); return Response.json({ok:false,message:"Something went wrong. Please try again."},{status:500});
}
