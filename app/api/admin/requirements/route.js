export const dynamic = "force-dynamic";
export const revalidate = 0;
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { db } from "../../../../firebase";
import { adminError, requireAdmin } from "../../../../lib/admin";

function cleanDoc(doc) {
  const d = doc.data();
  const ts = v => v?.toDate ? v.toDate().toISOString() : (v instanceof Date ? v.toISOString() : v || null);
  return { id: doc.id, ...d, startAt: ts(d.startAt), expiresAt: ts(d.expiresAt), createdAt: ts(d.createdAt), updatedAt: ts(d.updatedAt) };
}

export async function GET() {
  try {
    await requireAdmin();
    const snap = await db.collection("giftCardRequirements").orderBy("createdAt", "desc").limit(100).get();
    return Response.json({ ok: true, requirements: snap.docs.map(cleanDoc) });
  } catch (e) { return adminError(e); }
}

export async function POST(request) {
  try {
    const admin = await requireAdmin();
    const body = await request.json();
    const brand = String(body.brand || "").trim();
    const requiredAmount = Number(body.requiredAmount);
    const minDiscount = Number(body.minDiscount);
    const maxDiscount = Number(body.maxDiscount);
    const startAt = new Date(body.startAt);
    const expiresAt = new Date(body.expiresAt);
    const note = String(body.note || "").trim().slice(0, 500);
    if (!brand) return Response.json({ ok:false, message:"Enter gift card brand." }, {status:400});
    if (!Number.isFinite(requiredAmount) || requiredAmount <= 0) return Response.json({ ok:false, message:"Enter a valid required amount." }, {status:400});
    if (!Number.isFinite(minDiscount) || !Number.isFinite(maxDiscount) || minDiscount < 3 || maxDiscount < minDiscount || maxDiscount > 100) return Response.json({ ok:false, message:"Discount must be valid and minimum discount is 3%." }, {status:400});
    if (Number.isNaN(startAt.getTime()) || Number.isNaN(expiresAt.getTime()) || expiresAt <= startAt) return Response.json({ ok:false, message:"Check start and expiry dates." }, {status:400});
    const ref = db.collection("giftCardRequirements").doc();
    await ref.set({ brand, requiredAmount, receivedAmount: 0, remainingAmount: requiredAmount, minDiscount, maxDiscount, status: "active", startAt: Timestamp.fromDate(startAt), expiresAt: Timestamp.fromDate(expiresAt), note, createdBy: admin.id, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });
    const doc = await ref.get();
    return Response.json({ ok:true, requirement: cleanDoc(doc) });
  } catch (e) { return adminError(e); }
}
