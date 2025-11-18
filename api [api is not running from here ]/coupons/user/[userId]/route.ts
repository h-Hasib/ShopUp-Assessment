// GET /api/coupons/user/[userId]/route.ts
import { PrismaClient } from "../../../../../../../generated/prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(req: Request, { params }: { params: { userId: string } }) {
  const { userId } = params;

  const coupons = await prisma.coupon.findMany({
    where: { userId },
  });

  return NextResponse.json(coupons);
}
