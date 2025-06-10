import { NextResponse } from "next/server";
import { seedDatabase } from "@/app/scripts/seed";

export async function GET() {
  try {
    await seedDatabase();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
