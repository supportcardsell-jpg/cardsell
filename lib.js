import crypto from "crypto";
import nodemailer from "nodemailer";

export function normalizeGmail(value) { return String(value || "").trim().toLowerCase(); }
export function normalizeMobile(value) { return String(value || "").replace(/\D/g, ""); }
export function hash(value) { return crypto.createHash("sha256").update(String(value)).digest("hex"); }
export function makeToken() { return crypto.randomBytes(32).toString("hex"); }
export function makeOtp() { return String(crypto.randomInt(100000, 1000000)); }

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${derived}`;
}
export function verifyPassword(password, stored) {
  try {
    const [scheme, salt, key] = String(stored).split(":");
    if (scheme !== "scrypt" || !salt || !key) return false;
    const derived = crypto.scryptSync(password, salt, 64).toString("hex");
    return crypto.timingSafeEqual(Buffer.from(derived, "hex"), Buffer.from(key, "hex"));
  } catch { return false; }
}

export function cookieOptions(maxAge) {
  return { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge };
}

export async function sendOtpEmail({ to, name, otp }) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT || 465),
    secure: String(process.env.SMTP_SECURE || "true") === "true",
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  await transporter.sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to,
    subject: "Your CardSell Gmail verification OTP",
    text: `Hi ${name},\n\nYour CardSell verification OTP is ${otp}. It expires in 10 minutes.\n\nNever share this OTP with anyone.`,
    html: `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:24px"><h2 style="color:#0b1d2e">CardSell Gmail Verification</h2><p>Hi ${name},</p><p>Your 6-digit verification OTP is:</p><div style="font-size:34px;font-weight:700;letter-spacing:8px;padding:18px;background:#eef7f6;border-radius:12px;text-align:center">${otp}</div><p>This OTP expires in <b>10 minutes</b>.</p><p style="color:#777">Never share your OTP with anyone.</p></div>`,
  });
}

export function jsonError(message, status = 400) { return Response.json({ ok: false, message }, { status }); }
