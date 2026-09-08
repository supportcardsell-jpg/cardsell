import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { db } from "../../../firebase";
import { normalizeGmail, verifyPassword, makeToken, makeOtp, sendOtpEmail, hash, jsonError } from "../../../lib";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request) {
  try {
    const { gmail, password } = await request.json();
    const email = normalizeGmail(gmail);
    const r = await db.collection("users").where("gmail", "==", email).limit(1).get();
    if (r.empty || !verifyPassword(String(password || ""), r.docs[0].data().passwordHash)) return jsonError("Invalid Gmail or password.", 401);
    const user = r.docs[0].data();

    // Pending accounts can verify directly from Login. A fresh OTP is sent and the normal OTP page can be used.
    if (user.status !== "active") {
      const signupToken = makeToken();
      const otp = makeOtp();
      const otpRef = db.collection("otpChallenges").doc();
      const signupRef = db.collection("signupSessions").doc(hash(signupToken));
      await otpRef.set({ userId: r.docs[0].id, email: user.gmail, otpHash: hash(otp), purpose: "signup", attempts: 0, verifiedAt: null, createdAt: FieldValue.serverTimestamp(), expiresAt: Timestamp.fromMillis(Date.now() + 10 * 60 * 1000) });
      await signupRef.set({ userId: r.docs[0].id, otpId: otpRef.id, expiresAt: Timestamp.fromMillis(Date.now() + 15 * 60 * 1000), createdAt: FieldValue.serverTimestamp() });
      try {
        await sendOtpEmail({ to: user.gmail, name: user.name, otp });
      } catch (e) {
        console.error("Login verification email error", e);
        await Promise.all([otpRef.delete(), signupRef.delete()]);
        return jsonError("We could not send the verification OTP. Please try again.", 502);
      }
      const response = Response.json({ ok: true, pending: true, email: user.gmail, message: "Your Gmail is not verified. A new OTP has been sent." });
      response.headers.append("Set-Cookie", `cardsell_signup=${signupToken}; HttpOnly; ${process.env.NODE_ENV === "production" ? "Secure; " : ""}SameSite=Lax; Path=/; Max-Age=900`);
      return response;
    }

    const token = makeToken();
    const sessionRef = db.collection("sessions").doc(hash(token));
    await sessionRef.set({ userId: r.docs[0].id, expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), createdAt: new Date() });
    const response = Response.json({ ok: true, name: user.name });
    response.headers.append("Set-Cookie", `cardsell_session=${token}; HttpOnly; ${process.env.NODE_ENV === "production" ? "Secure; " : ""}SameSite=Lax; Path=/; Max-Age=2592000`);
    return response;
  } catch (e) { console.error(e); return jsonError("Login failed. Please try again.", 500); }
}
