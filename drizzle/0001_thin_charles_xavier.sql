DROP INDEX "Book_userId_title_author_key";--> statement-breakpoint
ALTER TABLE "book" ADD CONSTRAINT "book_userId_title_author_unique" UNIQUE("userId","title","author");