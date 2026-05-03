CREATE TABLE "plans" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(256) NOT NULL,
	"category" varchar(128) NOT NULL,
	"description" text NOT NULL,
	"location" varchar(256) NOT NULL,
	"date" date NOT NULL,
	"time" time NOT NULL,
	"total_cupos" integer NOT NULL,
	"available_cupos" integer NOT NULL,
	"image" text
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "users_to_plans" (
	"user_id" integer NOT NULL,
	"plan_id" integer NOT NULL,
	CONSTRAINT "users_to_plans_user_id_plan_id_pk" PRIMARY KEY("user_id","plan_id")
);
--> statement-breakpoint
ALTER TABLE "users_to_plans" ADD CONSTRAINT "users_to_plans_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users_to_plans" ADD CONSTRAINT "users_to_plans_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE no action ON UPDATE no action;