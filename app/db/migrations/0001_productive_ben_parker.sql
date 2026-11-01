CREATE TABLE `post_drafts` (
	`post_id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`summary` text NOT NULL,
	`authors` text NOT NULL,
	`tags` text NOT NULL,
	`post_content` text NOT NULL,
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `published_posts` (
	`post_id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`summary` text NOT NULL,
	`authors` text NOT NULL,
	`tags` text NOT NULL,
	`post_content` text NOT NULL,
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE no action
);
