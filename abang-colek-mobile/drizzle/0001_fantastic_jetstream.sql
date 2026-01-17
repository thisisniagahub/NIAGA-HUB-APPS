CREATE TABLE `wocs_app_configs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`appName` varchar(50) NOT NULL,
	`configKey` varchar(100) NOT NULL,
	`configValue` text NOT NULL,
	`updatedBy` int,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `wocs_app_configs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `wocs_attachments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`taskId` varchar(20) NOT NULL,
	`type` enum('image','video','audio','document') NOT NULL,
	`originalName` varchar(255),
	`storageUrl` text NOT NULL,
	`mimeType` varchar(100),
	`sizeBytes` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `wocs_attachments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `wocs_landing_versions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`pageSlug` varchar(100) NOT NULL,
	`version` int NOT NULL,
	`content` text NOT NULL,
	`status` enum('draft','published','archived') NOT NULL DEFAULT 'draft',
	`publishedAt` timestamp,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `wocs_landing_versions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `wocs_task_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`taskId` varchar(20) NOT NULL,
	`action` varchar(50) NOT NULL,
	`actorId` int,
	`details` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `wocs_task_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `wocs_tasks` (
	`id` varchar(20) NOT NULL,
	`type` varchar(50) NOT NULL,
	`commandRaw` text NOT NULL,
	`payload` text NOT NULL,
	`status` enum('pending','awaiting_approval','running','done','failed','cancelled','rolled_back') NOT NULL DEFAULT 'pending',
	`priority` enum('high','normal','low') NOT NULL DEFAULT 'normal',
	`requestedBy` int,
	`assignedTo` int,
	`scheduledAt` timestamp,
	`startedAt` timestamp,
	`completedAt` timestamp,
	`errorMessage` text,
	`result` text,
	`retryCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `wocs_tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `wocs_users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`role` enum('admin','agent','viewer') NOT NULL,
	`waNumber` varchar(20) NOT NULL,
	`status` enum('active','inactive') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `wocs_users_id` PRIMARY KEY(`id`),
	CONSTRAINT `wocs_users_waNumber_unique` UNIQUE(`waNumber`)
);
