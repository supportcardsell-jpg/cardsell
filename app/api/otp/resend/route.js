import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { cookies } from "next/headers";
import { db } from "../../../../firebase";
import { hash, makeOtp, sendOtpEmail, jsonError } from "../../../../lib";

export async function POST() {
  try {
    const signup = cookies().get("cardsell_signup")?.value;
    if (!signup) return jsonError("Your registration session expired. Please register again.", 401);
    const signupSnap = await db.collection("signupSessions").doc(hash(signup)).get();
    if (!signupSnap.exists || signupSnap.data().expiresAt.toMillis() <= Date.now()) return jsonError("Your registration session expired. Please register again.", 401);
    const { userId } = signupSnap.data();
    const userSnap = await db.collection("users").doc(userId).get();
    if (!userSnap.exists || userSnap.data().status !== "pending") return jsonError("Your registration session expired. Please register again.", 401);
    const u = userSnap.data();
    const recent = await db.collection("otpChallenges").where("userId", "==", userId).where("purpose", "==", "signup").orderBy("createdAt", "desc").limit(1).get();
    if (!recent.empty) {
      const createdAt = recent.docs[0].data().createdAt;
      if (createdAt && Date.now() - createdAt.toMillis() < 45000) return jsonError("Please wait 45 seconds before requesting another OTP.", 429);
    }
    const otp = makeOtp();
    const newRef = db.collection("otpChallenges").doc();
    await db.runTransaction(async tx => {
      const old = await db.collection("otpChallenges").where("userId", "==", userId).where("purpose", "==", "signup").where("verifiedAt", "==", null).get();
      old.docs.forEach(d => tx.update(d.ref, { verifiedAt: FieldValue.serverTimestamp() }));
      tx.set(newRef, { userId, email: u.gmail, otpHash: hash(otp), purpose: "signup", attempts: 0, verifiedAt: null, createdAt: FieldValue.serverTimestamp(), expiresAt: Timestamp.fromMillis(Date.now() + 10 * 60 * 1000) });
    });
    await sendOtpEmail({ to: u.gmail, name: u.name, otp });
    return Response.json({ ok: true, message: "A new OTP has been sent." });
  } catch (e) { console.error(e); return jsonError("Could not resend OTP. Please try again.", 500); }
}
