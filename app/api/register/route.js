import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { cookies } from "next/headers";
import { db } from "../../../firebase";
import { normalizeGmail, normalizeMobile, hashPassword, makeOtp, hash, makeToken, sendOtpEmail, jsonError } from "../../../lib";

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

    const userId = db.collection("users").doc().id;
    const emailKey = hash(gmail);
    const mobileKey = hash(mobile);
    const userRef = db.collection("users").doc(userId);
    const emailUniqueRef = db.collection("uniqueEmails").doc(emailKey);
    const mobileUniqueRef = db.collection("uniqueMobiles").doc(mobileKey);

    await db.runTransaction(async tx => {
      const [emailUnique, mobileUnique] = await Promise.all([tx.get(emailUniqueRef), tx.get(mobileUniqueRef)]);
      if (emailUnique.exists) throw Object.assign(new Error("This Gmail address is already registered."), { code: "EMAIL_EXISTS" });
      if (mobileUnique.exists) throw Object.assign(new Error("This mobile number is already registered."), { code: "MOBILE_EXISTS" });
      tx.set(userRef, {
        name, mobile, gmail, passwordHash: hashPassword(password), status: "pending",
        gmailVerifiedAt: null, defaultUpiId: "", defaultQrPath: "", createdAt: FieldValue.serverTimestamp()
      });
      tx.set(emailUniqueRef, { userId, createdAt: FieldValue.serverTimestamp() });
      tx.set(mobileUniqueRef, { userId, createdAt: FieldValue.serverTimestamp() });
    });

    const otp = makeOtp();
    const signupToken = makeToken();
    const otpRef = db.collection("otpChallenges").doc();
    const signupRef = db.collection("signupSessions").doc(hash(signupToken));
    await otpRef.set({ userId, email: gmail, otpHash: hash(otp), purpose: "signup", attempts: 0, verifiedAt: null, createdAt: FieldValue.serverTimestamp(), expiresAt: Timestamp.fromMillis(Date.now() + 10 * 60 * 1000) });
    // Store the active OTP document ID in the signup session. This avoids Firestore composite-index requirements during verification.
    await signupRef.set({ userId, otpId: otpRef.id, expiresAt: Timestamp.fromMillis(Date.now() + 15 * 60 * 1000), createdAt: FieldValue.serverTimestamp() });

    try { await sendOtpEmail({ to: gmail, name, otp }); }
    catch (mailErr) {
      console.error("OTP email error", mailErr);
      await Promise.all([
        userRef.delete(), emailUniqueRef.delete(), mobileUniqueRef.delete(), otpRef.delete(), signupRef.delete()
      ]);
      return jsonError("We could not send the OTP email. Please check the SMTP settings and try again.", 502);
    }

    const response = Response.json({ ok: true, email: gmail, message: "OTP sent to your Gmail." });
    response.headers.append("Set-Cookie", `cardsell_signup=${signupToken}; HttpOnly; ${process.env.NODE_ENV === "production" ? "Secure; " : ""}SameSite=Lax; Path=/; Max-Age=900`);
    return response;
  } catch (e) {
    console.error(e);
    if (e?.code === "EMAIL_EXISTS" || e?.code === "MOBILE_EXISTS") return jsonError(e.message, 409);
    return jsonError("Registration failed. Please try again.", 500);
  }
}
