CREATE TABLE `google_oauth2_user` (
	`google_id` VARCHAR(40) NOT NULL,
	`email` VARCHAR(50) NOT NULL DEFAULT '0',
	`name` VARCHAR(40) NOT NULL,
	`given_name` VARCHAR(40) NOT NULL,
	`family_name` VARCHAR(40) NOT NULL,
	`picture` VARCHAR(256) NOT NULL,
	`link` VARCHAR(40) NOT NULL,
	`hd` VARCHAR(40) NOT NULL,
	UNIQUE INDEX `google_id` (`google_id`, `email`)
)
COLLATE='utf8_general_ci'
ENGINE=InnoDB
;
