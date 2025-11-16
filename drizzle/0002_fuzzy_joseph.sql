CREATE TABLE `activations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`licenseId` int NOT NULL,
	`hardwareId` varchar(255) NOT NULL,
	`machineName` varchar(255),
	`os` varchar(100),
	`activatedAt` timestamp NOT NULL DEFAULT (now()),
	`lastSeenAt` timestamp NOT NULL DEFAULT (now()),
	`status` enum('active','deactivated') NOT NULL DEFAULT 'active',
	CONSTRAINT `activations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `licenses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`licenseKey` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`purchaseId` varchar(255),
	`maxActivations` int NOT NULL DEFAULT 1,
	`currentActivations` int NOT NULL DEFAULT 0,
	`expiresAt` timestamp,
	`status` enum('active','expired','revoked') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `licenses_id` PRIMARY KEY(`id`),
	CONSTRAINT `licenses_licenseKey_unique` UNIQUE(`licenseKey`)
);
--> statement-breakpoint
CREATE TABLE `purchases` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`amount` int NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'USD',
	`quantity` int NOT NULL DEFAULT 1,
	`paymentMethod` varchar(50),
	`paymentId` varchar(255),
	`status` enum('pending','completed','failed','refunded') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `purchases_id` PRIMARY KEY(`id`)
);
