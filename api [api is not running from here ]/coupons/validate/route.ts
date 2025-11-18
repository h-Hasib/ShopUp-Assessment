// POST /api/coupons/validate
import { PrismaClient } from "../../../../../../generated/prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const { code, userId } = await req.json();
  let success = false;
  let reason = "";

  try {
    const coupon = await prisma.coupon.findUnique({ where: { code } });

    if (!coupon) {
      reason = "Coupon not found";
      return logAndReturn();
    }
    console.log("Testing")

    const now = new Date();

    if (coupon.type === "USER_SPECIFIC") {
      if (coupon.userId !== userId) {
        reason = "Not valid for this user";
        return logAndReturn();
      }
      if (coupon.isUsed) {
        reason = "Already used";
        return logAndReturn();
      }
      success = true;
      await prisma.coupon.update({ where: { id: coupon.id }, data: { isUsed: true } });
    } else if (coupon.type === "TIME_SPECIFIC") {
      if (coupon.expiresAt && now > coupon.expiresAt) {
        reason = "Coupon expired";
        return logAndReturn();
      }
      if (coupon.maxUsage !== null && coupon.usageCount >= coupon.maxUsage) {
        reason = "Coupon usage limit reached";
        return logAndReturn();
      }
      success = true;
      await prisma.coupon.update({ where: { id: coupon.id }, data: { usageCount: { increment: 1 } } });
    }

    return logAndReturn();

    async function logAndReturn() {
      // Async logging, fire-and-forget || ensures <100ms response time
      prisma.couponUsageLog.create({
        data: {
          couponId: coupon?.id || "unknown",
          userId,
          success,
          reason,
        },
      }).catch(err => console.error("Logging error:", err));

      return NextResponse.json({ success, reason });
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Validation failed" }, { status: 500 });
  }
}
