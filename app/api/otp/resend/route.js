import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { cookies } from "next/headers";
import { db } from "../../../../firebase";
import { hash, makeOtp, sendOtpEmail, jsonError } from "../../../../lib";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST() {
  try {
    const signup = cookies().get("cardsell_signup")?.value;
    if (!signup) return jsonError("Your registration session expired. Please register again.", 401);
    const signupRef = db.collection("signupSessions").doc(hash(signup));
    const signupSnap = await signupRef.get();
    if (!signupSnap.exists || signupSnap.data().expiresAt.toMillis() <= Date.now()) return jsonError("Your registration session expired. Please register again.", 401);
    const { userId, otpId } = signupSnap.data();
    const userRef = db.collection("users").doc(userId);
    const userSnap = await userRef.get();
    if (!userSnap.exists || userSnap.data().status !== "pending") return jsonError("Your registration session expired. Please register again.", 401);
    const u = userSnap.data();

    if (otpId) {
      const oldRef = db.collection("otpChallenges").doc(otpId);
      const oldSnap = await oldRef.get();
      if (oldSnap.exists) {
        const createdAt = oldSnap.data().createdAt;
        if (createdAt && Date.now() - createdAt.toMillis() < 45000) return jsonError("Please wait 45 seconds before requesting another OTP.", 429);
      }
    }

    const otp = makeOtp();
    const newRef = db.collection("otpChallenges").doc();
    if (otpId) {
      const oldRef = db.collection("otpChallenges").doc(otpId);
      await oldRef.update({ verifiedAt: FieldValue.serverTimestamp() }).catch(() => {});
    }
    await newRef.set({ userId, email: u.gmail, otpHash: hash(otp), purpose: "signup", attempts: 0, verifiedAt: null, createdAt: FieldValue.serverTimestamp(), expiresAt: Timestamp.fromMillis(Date.now() + 10 * 60 * 1000) });
    await signupRef.update({ otpId: newRef.id, expiresAt: Timestamp.fromMillis(Date.now() + 15 * 60 * 1000) });
    try {
      await sendOtpEmail({ to: u.gmail, name: u.name, otp });
    } catch (e) {
      console.error("OTP resend email error", e);
      return jsonError("Could not send the new OTP email. Please try again.", 502);
    }
    return Response.json({ ok: true, message: "A new OTP has been sent." });
  } catch (e) { console.error(e); return jsonError("Could not resend OTP. Please try again.", 500); }
}
