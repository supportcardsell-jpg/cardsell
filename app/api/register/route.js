export const dynamic = "force-dynamic";
export const revalidate = 0;

import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { db } from "../../../firebase";
import { normalizeGmail, normalizeMobile, hashPassword, makeOtp, hash, makeToken, sendOtpEmail, jsonError } from "../../../lib";

async function startVerification(userId, gmail, name, responseMessage="OTP sent to your Gmail.") {
  const otp = makeOtp();
  const signupToken = makeToken();
  const otpRef = db.collection("otpChallenges").doc();
  const signupRef = db.collection("signupSessions").doc(hash(signupToken));
  await otpRef.set({ userId, email: gmail, otpHash: hash(otp), purpose: "signup", attempts: 0, verifiedAt: null, createdAt: FieldValue.serverTimestamp(), expiresAt: Timestamp.fromMillis(Date.now() + 10 * 60 * 1000) });
  await signupRef.set({ userId, otpId: otpRef.id, expiresAt: Timestamp.fromMillis(Date.now() + 15 * 60 * 1000), createdAt: FieldValue.serverTimestamp() });
  try {
    await sendOtpEmail({ to: gmail, name, otp });
  } catch (mailErr) {
    console.error("OTP email error", mailErr);
    await Promise.all([otpRef.delete(), signupRef.delete()]);
    throw Object.assign(new Error("We could not send the OTP email. Please check the SMTP settings and try again."), { code: "MAIL_FAILED" });
  }
  const response = Response.json({ ok: true, email: gmail, message: responseMessage });
  response.headers.append("Set-Cookie", `cardsell_signup=${signupToken}; HttpOnly; ${process.env.NODE_ENV === "production" ? "Secure; " : ""}SameSite=Lax; Path=/; Max-Age=900`);
  return response;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const name = String(body.name || "").trim();
    const mobile = normalizeMobile(body.mobile);
    const gmail = normalizeGmail(body.gmail);
    const password = String(body.password || "");
    if (name.length < 2) return jsonError("Please enter your full name.");
    if (!/^[6-9]\d{9}$/.test(mobile)) return jsonError("Enter a valid 10-digit Indian mobile number.");
    if (!/^[^\s@]+@gmail\.com$/.test(gmail)) return jsonError("Please use a valid Gmail address.");
    if (password.length < 8) return jsonError("Password must be at least 8 characters.");

    const emailKey = hash(gmail);
    const mobileKey = hash(mobile);
    const emailUniqueRef = db.collection("uniqueEmails").doc(emailKey);
    const mobileUniqueRef = db.collection("uniqueMobiles").doc(mobileKey);
    const [emailUnique, mobileUnique] = await Promise.all([emailUniqueRef.get(), mobileUniqueRef.get()]);

    // If the exact same account exists but is still unverified, continue verification instead of blocking re-registration.
    if (emailUnique.exists || mobileUnique.exists) {
      if (!emailUnique.exists || !mobileUnique.exists) return jsonError("This Gmail or mobile number is already registered.", 409);
      const existingUserId = emailUnique.data().userId;
      if (existingUserId !== mobileUnique.data().userId) return jsonError("This Gmail or mobile number is already registered.", 409);
      const userRef = db.collection("users").doc(existingUserId);
      const userSnap = await userRef.get();
      if (!userSnap.exists) return jsonError("This account could not be found. Please try again.", 409);
      const user = userSnap.data();
      if (user.status === "active") return jsonError("This account is already active. Please log in.", 409);
      if (user.gmail !== gmail || user.mobile !== mobile) return jsonError("This Gmail or mobile number is already registered.", 409);
      // Update profile/password with the latest signup form, then send a fresh verification OTP.
      await userRef.update({ name, passwordHash: hashPassword(password) });
      return await startVerification(existingUserId, gmail, name, "A new OTP has been sent to your Gmail.");
    }

    const userId = db.collection("users").doc().id;
    const userRef = db.collection("users").doc(userId);
    await db.runTransaction(async tx => {
      const [emailCheck, mobileCheck] = await Promise.all([tx.get(emailUniqueRef), tx.get(mobileUniqueRef)]);
      if (emailCheck.exists) throw Object.assign(new Error("This Gmail address is already registered."), { code: "EMAIL_EXISTS" });
      if (mobileCheck.exists) throw Object.assign(new Error("This mobile number is already registered."), { code: "MOBILE_EXISTS" });
      tx.set(userRef, { name, mobile, gmail, passwordHash: hashPassword(password), status: "pending", gmailVerifiedAt: null, defaultUpiId: "", defaultQrPath: "", createdAt: FieldValue.serverTimestamp() });
      tx.set(emailUniqueRef, { userId, createdAt: FieldValue.serverTimestamp() });
      tx.set(mobileUniqueRef, { userId, createdAt: FieldValue.serverTimestamp() });
    });

    try {
      return await startVerification(userId, gmail, name);
    } catch (mailErr) {
      if (mailErr.code === "MAIL_FAILED") await Promise.all([userRef.delete(), emailUniqueRef.delete(), mobileUniqueRef.delete()]);
      throw mailErr;
    }
  } catch (e) {
    console.error(e);
    if (e?.code === "EMAIL_EXISTS" || e?.code === "MOBILE_EXISTS") return jsonError(e.message, 409);
    if (e?.code === "MAIL_FAILED") return jsonError(e.message, 502);
    return jsonError("Registration failed. Please try again.", 500);
  }
}
