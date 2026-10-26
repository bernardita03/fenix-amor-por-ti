CREATE TABLE `bookings` (
	`id` text PRIMARY KEY NOT NULL,
	`service_id` text NOT NULL,
	`service` text NOT NULL,
	`duration` integer NOT NULL,
	`deposit` integer NOT NULL,
	`modality` text NOT NULL,
	`date` text NOT NULL,
	`date_label` text NOT NULL,
	`time` text NOT NULL,
	`name` text NOT NULL,
	`phone` text NOT NULL,
	`email` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`receipt_key` text,
	`receipt_name` text,
	`receipt_type` text,
	`hold_until` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_bookings_date_time` ON `bookings` (`date`,`time`);--> statement-breakpoint
CREATE INDEX `idx_bookings_status_created` ON `bookings` (`status`,`created_at`);