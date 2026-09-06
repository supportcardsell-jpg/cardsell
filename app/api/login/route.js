import { cookies } from "next/headers";
import { db } from "../../../firebase";
import { normalizeGmail, verifyPassword, makeToken, hash, jsonError } from "../../../lib";

export async function POST(request) {
  try {
    const { gmail, password } = await request.json();
    const email = normalizeGmail(gmail);
    const r = await db.collection("users").where("gmail", "==", email).limit(1).get();
    if (r.empty || !verifyPassword(String(password || ""), r.docs[0].data().passwordHash)) return jsonError("Invalid Gmail or password.", 401);
    const user = r.docs[0].data();
    if (user.status !== "active") return jsonError("Please verify your Gmail before logging in.", 403);
    const token = makeToken();
    const sessionRef = db.collection("sessions").doc(hash(token));
    await sessionRef.set({ userId: r.docs[0].id, expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), createdAt: new Date() });
    const response = Response.json({ ok: true, name: user.name });
    response.headers.append("Set-Cookie", `cardsell_session=${token}; HttpOnly; ${process.env.NODE_ENV === "production" ? "Secure; " : ""}SameSite=Lax; Path=/; Max-Age=2592000`);
    return response;
  } catch (e) { console.error(e); return jsonError("Login failed. Please try again.", 500); }
}
