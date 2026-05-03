
import { pgTable, primaryKey, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { usersTable } from './users.js';
import { plansTable } from './plans.js';

export const planAttendeesTable = pgTable('users_to_plans',
    {
        userId: integer('user_id').notNull().references(() => usersTable.id),
        planId: integer('plan_id').notNull().references(() => plansTable.id),
    },
    (t) => ({
        pk: primaryKey({ columns: [t.userId, t.planId] }),
    }),
);

export const usersToPlansRelations = relations(planAttendeesTable, ({ one }) => ({
    plan: one(plansTable, {
        fields: [planAttendeesTable.planId],
        references: [plansTable.id],
    }),
    user: one(usersTable, {
        fields: [planAttendeesTable.userId],
        references: [usersTable.id],
    }),
}));
