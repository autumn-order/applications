CREATE TABLE `seat_role_permissions` (
	`id` integer PRIMARY KEY NOT NULL,
	`seat_role_id` integer NOT NULL,
	`permission` text NOT NULL,
	FOREIGN KEY (`seat_role_id`) REFERENCES `seat_role`(`role_id`) ON UPDATE no action ON DELETE no action
);
