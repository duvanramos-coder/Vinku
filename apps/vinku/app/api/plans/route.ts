import { NextResponse } from "next/server";
import { db } from "@workspace/db";
import { plans } from "@workspace/db/schema";

// Force dynamic routing and prevent caching.
export const revalidate = 0;

/**
 * GET /api/plans
 * Fetches all plans from the database.
 * @returns {Promise<NextResponse>} A JSON response with the list of all plans or an error.
 */
export async function GET() {
  try {
    const allPlans = await db.select().from(plans);
    return NextResponse.json(allPlans);
  } catch (error) {
    console.error("Error fetching plans:", error);
    return NextResponse.json(
      { error: "Failed to fetch plans" },
      { status: 500 }
    );
  }
}
