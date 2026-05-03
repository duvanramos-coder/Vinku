
import { pgTable, serial, text, varchar, integer, date, time } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { planAttendeesTable } from './usersToPlans.js';

export const plansTable = pgTable('plans', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 256 }).notNull(),
  category: varchar('category', { length: 128 }).notNull(),
  description: text('description').notNull(),
  location: varchar('location', { length: 256 }).notNull(),
  date: date('date').notNull(),
  time: time('time').notNull(),
  totalCupos: integer('total_cupos').notNull(),
  availableCupos: integer('available_cupos').notNull(),
  image: text('image'),
});

export const plansTableRelations = relations(plansTable, ({ many }) => ({
    usersToPlans: many(planAttendeesTable),
}));
