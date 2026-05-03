
import { Router } from 'express';

const router = Router();

// tRPC routes have been commented out as per user instruction.
// An empty Express router is exported to prevent build failures.

/*
import { db, plansTable, usersTable, planAttendeesTable } from "@workspace/db";
import { publicProcedure, router as trpcRouter } from "../trpc";
import { z } from "zod";
import { eq } from "drizzle-orm";

export const appRouter = trpcRouter({
  getPlans: publicProcedure.query(async () => {
    return db.select().from(plansTable);
  }),

  join: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        planId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      await db.transaction(async (tx) => {
        const [plan] = await tx
          .select()
          .from(plansTable)
          .where(eq(plansTable.id, input.planId));

        if (!plan || plan.availableCupos <= 0) {
          throw new Error("No available spots or plan not found.");
        }

        await tx
          .update(plansTable)
          .set({ availableCupos: plan.availableCupos - 1 })
          .where(eq(plansTable.id, input.planId));

        await tx.insert(planAttendeesTable).values({
          planId: input.planId,
          userId: input.userId,
        });
      });

      return { success: true };
    }),
});

export type AppRouter = typeof appRouter;
*/

export default router;
