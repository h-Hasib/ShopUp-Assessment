// POST /api/coupons
import { PrismaClient } from "../../../../generated/prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const { code, type, discountType, value, userId, maxUsage, expiresAt } = await req.json();

  if (!code || !type || !discountType || value === undefined) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const coupon = await prisma.coupon.create({
      data: {
        code,
        type,
        discountType,
        value,
        userId: type === "USER_SPECIFIC" ? userId : null,
        maxUsage: type === "TIME_SPECIFIC" ? maxUsage : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });
    return NextResponse.json(coupon, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create coupon" }, { status: 500 });
  }
}
