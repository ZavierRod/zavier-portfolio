CREATE TABLE `admin_login_attempts` (
	`attempt_key` text PRIMARY KEY NOT NULL,
	`attempts` integer NOT NULL,
	`window_started` text NOT NULL
);
