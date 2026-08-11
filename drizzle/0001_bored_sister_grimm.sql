CREATE INDEX `poems_public_idx` ON `poems` (`status`,`published_at`);--> statement-breakpoint
CREATE INDEX `poems_owner_idx` ON `poems` (`owner_id`,`updated_at`);--> statement-breakpoint
CREATE INDEX `projects_public_idx` ON `projects` (`status`,`display_order`);--> statement-breakpoint
CREATE INDEX `projects_owner_idx` ON `projects` (`owner_id`,`updated_at`);