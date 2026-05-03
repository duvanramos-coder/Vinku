
import { pgTable, serial, text } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { planAttendeesTable } from './usersToPlans.js';

export const usersTable = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
});

export const usersRelations = relations(usersTable, ({ many }) => ({
    usersToPlans: many(planAttendeesTable),
}));
