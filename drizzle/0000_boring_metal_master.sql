-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TYPE "public"."Status" AS ENUM('NOT_READ', 'READ');--> statement-breakpoint
CREATE TABLE "book" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" varchar(32) NOT NULL,
	"title" varchar(255) NOT NULL,
	"author" text,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL,
	"description" varchar(1024),
	"status" "Status" DEFAULT 'NOT_READ' NOT NULL,
	"coverImageUrl" text
);
--> statement-breakpoint
CREATE UNIQUE INDEX "Book_userId_title_author_key" ON "book" USING btree ("userId" text_ops,"title" text_ops,"author" text_ops);
*/