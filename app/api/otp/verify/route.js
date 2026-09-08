import { FieldValue } from "firebase-admin/firestore";
import { cookies } from "next/headers";
import { db } from "../../../../firebase";
import { hash, makeToken, jsonError } from "../../../../lib";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request) {
  try {
    const signup = cookies().get("cardsell_signup")?.value;
    const { otp } = await request.json();
    if (!signup) return jsonError("Your registration session expired. Please register again.", 401);
    if (!/^\d{6}$/.test(String(otp || ""))) return jsonError("Enter the 6-digit OTP.");

    const signupRef = db.collection("signupSessions").doc(hash(signup));
    const signupSnap = await signupRef.get();
    if (!signupSnap.exists || signupSnap.data().expiresAt.toMillis() <= Date.now()) return jsonError("Your registration session expired. Please register again.", 401);

    const { userId, otpId } = signupSnap.data();
    const userRef = db.collection("users").doc(userId);
    const userSnap = await userRef.get();
    if (!userSnap.exists || userSnap.data().status !== "pending") return jsonError("Your registration session expired. Please register again.", 401);
    if (!otpId) return jsonError("No active OTP found. Please resend the OTP.");

    const otpRef = db.collection("otpChallenges").doc(otpId);
    const otpSnap = await otpRef.get();
    if (!otpSnap.exists) return jsonError("No active OTP found. Please resend the OTP.");
    const otpData = otpSnap.data();
    if (otpData.verifiedAt) return jsonError("This OTP is no longer active. Please resend the OTP.");
    if (otpData.expiresAt.toMillis() <= Date.now()) return jsonError("OTP expired. Please request a new OTP.");
    if ((otpData.attempts || 0) >= 5) return jsonError("Too many incorrect attempts. Please resend the OTP.", 429);
    if (hash(otp) !== otpData.otpHash) {
      await otpRef.update({ attempts: FieldValue.increment(1) });
      return jsonError("Incorrect OTP. Please try again.");
    }

    const loginToken = makeToken();
    const sessionRef = db.collection("sessions").doc(hash(loginToken));
    const batch = db.batch();
    batch.update(userRef, { status: "active", gmailVerifiedAt: FieldValue.serverTimestamp() });
    batch.update(otpRef, { verifiedAt: FieldValue.serverTimestamp() });
    batch.set(sessionRef, { userId, expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), createdAt: FieldValue.serverTimestamp() });
    batch.delete(signupRef);
    await batch.commit();

    const response = Response.json({ ok: true, message: "Gmail verified successfully." });
    response.headers.append("Set-Cookie", `cardsell_session=${loginToken}; HttpOnly; ${process.env.NODE_ENV === "production" ? "Secure; " : ""}SameSite=Lax; Path=/; Max-Age=2592000`);
    response.headers.append("Set-Cookie", "cardsell_signup=; HttpOnly; Path=/; Max-Age=0");
    return response;
  } catch (e) { console.error(e); return jsonError("OTP verification failed. Please try again.", 500); }
}
