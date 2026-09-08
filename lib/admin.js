import { cookies } from "next/headers";
import { db } from "../firebase";
import { hash, normalizeGmail } from "../lib";

export async function requireAdmin() {
  const token = cookies().get("cardsell_admin_session")?.value;
  if (!token) throw new Error("UNAUTHENTICATED");
  const session = await db.collection("adminSessions").doc(hash(token)).get();
  if (!session.exists) throw new Error("UNAUTHENTICATED");
  const data = session.data();
  const expires = data.expiresAt?.toDate ? data.expiresAt.toDate().getTime() : new Date(data.expiresAt).getTime();
  if (!expires || expires <= Date.now()) throw new Error("UNAUTHENTICATED");
  const adminEmail = normalizeGmail(process.env.ADMIN_GMAIL || "");
  if (!adminEmail || normalizeGmail(data.gmail) !== adminEmail) throw new Error("FORBIDDEN");
  return { uid: data.uid, gmail: adminEmail };
}

export function adminError(e) {
  if (e?.message === "UNAUTHENTICATED") return Response.json({ ok:false, message:"Please login as Admin first." }, {status:401});
  if (e?.message === "FORBIDDEN") return Response.json({ ok:false, message:"Admin access required." }, {status:403});
  console.error(e); return Response.json({ok:false,message:"Something went wrong. Please try again."},{status:500});
}
