DROP TABLE `categories`;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_transactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`payer_id` integer NOT NULL,
	`amount` real NOT NULL,
	`description` text,
	`transaction_date` integer NOT NULL,
	`is_shared` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`payer_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_transactions`("id", "payer_id", "amount", "description", "transaction_date", "is_shared", "created_at", "updated_at") SELECT "id", "payer_id", "amount", "description", "transaction_date", "is_shared", "created_at", "updated_at" FROM `transactions`;--> statement-breakpoint
DROP TABLE `transactions`;--> statement-breakpoint
ALTER TABLE `__new_transactions` RENAME TO `transactions`;--> statement-breakpoint
PRAGMA foreign_keys=ON;