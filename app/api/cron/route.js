import { NextResponse } from "next/server";
// import seedDatabase from "@/app/scripts/seed";
import seedAwardedTenders from "@/app/scripts/seed-awarded";

export async function GET(request) {
  try {
    await Promise.allSettled([seedAwardedTenders()]);
    return NextResponse.json({ message: "Database seeded successfully" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
