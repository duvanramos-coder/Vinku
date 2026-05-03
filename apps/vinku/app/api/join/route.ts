import { NextResponse } from "next/server";
import { db } from "@workspace/db";
import { plans, usersToPlans } from "@workspace/db/schema";
import { eq, sql } from "drizzle-orm";

/**
 * POST /api/join
 * Allows a user to join a plan. This involves a transaction to ensure data integrity.
 * @param {Request} req The incoming request, expected to have a JSON body with `planId` and `userId`.
 * @returns {Promise<NextResponse>} A JSON response confirming the success or failure of the operation.
 */
export async function POST(req: Request) {
  try {
    const { planId, userId } = await req.json();

    if (!planId || !userId) {
      return NextResponse.json(
        { error: "planId and userId are required" },
        { status: 400 }
      );
    }

    // Perform a transaction to ensure both operations succeed or neither does.
    const result = await db.transaction(async (tx) => {
      // 1. Decrement the available spots for the plan.
      const updatedPlan = await tx
        .update(plans)
        .set({ available_cupos: sql`${plans.available_cupos} - 1` })
        .where(eq(plans.id, planId))
        .returning({ availableCupos: plans.available_cupos });

      if (updatedPlan[0]?.availableCupos < 0) {
        // If we ran out of spots, roll back the transaction.
        tx.rollback();
        return { error: "No available spots for this plan" };
      }

      // 2. Insert the user-plan relationship.
      await tx.insert(usersToPlans).values({ userId, planId });

      return { success: true };
    });

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 409 }); // 409 Conflict
    }

    return NextResponse.json({ message: "Successfully joined plan" });
  } catch (error) {
    console.error("Error joining plan:", error);
    return NextResponse.json(
      { error: "Failed to join plan" },
      { status: 500 }
    );
  }
}
