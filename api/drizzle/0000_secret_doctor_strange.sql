CREATE TABLE `application` (
	`id` integer PRIMARY KEY NOT NULL,
	`user_id` integer NOT NULL,
	`status` text NOT NULL,
	`rejection_reason` text DEFAULT '' NOT NULL,
	`reviewer_user_id` integer,
	`location` text NOT NULL,
	`seat_completed` integer DEFAULT 0 NOT NULL,
	`discord_completed` integer DEFAULT 0 NOT NULL,
	`referrer` text,
	`region` text,
	`end_goals` text DEFAULT '' NOT NULL,
	`why_autumn` text DEFAULT '' NOT NULL,
	`created` text NOT NULL,
	`last_updated` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`reviewer_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `character` (
	`id` integer PRIMARY KEY NOT NULL,
	`character_id` integer NOT NULL,
	`character_name` text NOT NULL,
	`corporation_id` integer NOT NULL,
	`last_updated` text NOT NULL,
	`created` text NOT NULL,
	FOREIGN KEY (`corporation_id`) REFERENCES `corporation`(`corporation_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `character_character_id_unique` ON `character` (`character_id`);--> statement-breakpoint
CREATE TABLE `character_ownership` (
	`id` integer PRIMARY KEY NOT NULL,
	`user_id` integer NOT NULL,
	`character_id` integer NOT NULL,
	`owner_hash` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`character_id`) REFERENCES `character`(`character_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `character_ownership_character_id_unique` ON `character_ownership` (`character_id`);--> statement-breakpoint
CREATE TABLE `corporation` (
	`id` integer PRIMARY KEY NOT NULL,
	`corporation_id` integer NOT NULL,
	`corporation_name` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `corporation_corporation_id_unique` ON `corporation` (`corporation_id`);--> statement-breakpoint
CREATE TABLE `interests` (
	`id` integer PRIMARY KEY NOT NULL,
	`application_id` integer NOT NULL,
	`interest` text NOT NULL,
	FOREIGN KEY (`application_id`) REFERENCES `application`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `language` (
	`id` integer PRIMARY KEY NOT NULL,
	`application_id` integer NOT NULL,
	`language` text NOT NULL,
	FOREIGN KEY (`application_id`) REFERENCES `application`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `seat_role` (
	`id` integer PRIMARY KEY NOT NULL,
	`role_id` integer NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `seat_role_role_id_unique` ON `seat_role` (`role_id`);--> statement-breakpoint
CREATE TABLE `seat_user_role` (
	`id` integer PRIMARY KEY NOT NULL,
	`seat_user_id` integer NOT NULL,
	`seat_role_id` integer NOT NULL,
	FOREIGN KEY (`seat_user_id`) REFERENCES `user`(`seat_user_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`seat_role_id`) REFERENCES `seat_role`(`role_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `stats` (
	`id` integer PRIMARY KEY NOT NULL,
	`corporation_id` integer NOT NULL,
	`members` integer NOT NULL,
	`ships_destroyed` integer NOT NULL,
	`date` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` integer PRIMARY KEY NOT NULL,
	`seat_user_id` integer,
	`main_character_id` integer NOT NULL,
	`created` text NOT NULL,
	FOREIGN KEY (`main_character_id`) REFERENCES `character`(`character_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_seat_user_id_unique` ON `user` (`seat_user_id`);