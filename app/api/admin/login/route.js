import { cookies } from "next/headers";
import { firebaseAuth, db } from "../../../../firebase";
import { hash, makeToken, normalizeGmail, cookieOptions, jsonError } from "../../../../lib";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request) {
  try {
    const { gmail, password } = await request.json();
    const email = normalizeGmail(gmail);
    if (!/^\S+@\S+\.\S+$/.test(email) || !password) return jsonError("Enter your Admin Gmail and password.", 400);

    const adminEmail = normalizeGmail(process.env.ADMIN_GMAIL || "");
    if (!adminEmail || email !== adminEmail) return jsonError("Invalid Admin Gmail or password.", 401);
    const apiKey = process.env.FIREBASE_WEB_API_KEY;
    if (!apiKey) return jsonError("Admin authentication is not configured yet. Add FIREBASE_WEB_API_KEY in Vercel.", 500);

    const authResponse = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${encodeURIComponent(apiKey)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: String(password), returnSecureToken: true }),
      cache: "no-store",
    });
    const authData = await authResponse.json();
    if (!authResponse.ok || !authData.idToken) return jsonError("Invalid Admin Gmail or password.", 401);

    const decoded = await firebaseAuth.verifyIdToken(authData.idToken);
    if (normalizeGmail(decoded.email) !== adminEmail) return jsonError("Admin access is not allowed for this account.", 403);

    const token = makeToken();
    await db.collection("adminSessions").doc(hash(token)).set({
      uid: decoded.uid,
      gmail: adminEmail,
      expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000),
      createdAt: new Date(),
    });

    const response = Response.json({ ok: true, message: "Admin login successful." });
    response.headers.append("Set-Cookie", `cardsell_admin_session=${token}; HttpOnly; ${process.env.NODE_ENV === "production" ? "Secure; " : ""}SameSite=Lax; Path=/; Max-Age=28800`);
    return response;
  } catch (e) {
    console.error("Admin login error", e);
    return jsonError("Admin login failed. Please try again.", 500);
  }
}
