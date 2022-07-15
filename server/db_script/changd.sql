create sequence jobs_job_id_seq;

create sequence jobs_job_id_seq2;

create table if not exists users
(
	user_id varchar default (md5(((random())::text || (clock_timestamp())::text)))::uuid not null,
	firstname varchar,
	lastname varchar,
	email varchar,
	date_created timestamp with time zone,
	last_login timestamp with time zone,
	password varchar,
	user_type integer,
	reset_password_token text,
	reset_password_expires timestamp with time zone,
	device_uuid varchar,
	push_token varchar,
	company_id varchar,
	status integer default 1,
	account_type integer default 0
);
create unique index if not exists users_user_id_uindex
	on users (user_id);

create unique index if not exists users_email_uindex
	on users (email);


create table if not exists user_log
(
	log_date timestamp with time zone,
	data varchar,
	user_id varchar,
	log_id varchar default (md5(((random())::text || (clock_timestamp())::text)))::uuid not null
);

create unique index if not exists user_log_log_id_uindex
	on user_log (log_id);

create table if not exists error_log
(
	log_id varchar default (md5(((random())::text || (clock_timestamp())::text)))::uuid,
	error_date timestamp with time zone default now(),
	error varchar
);

create table if not exists jobs
(
	job_id integer default nextval('jobs_job_id_seq2'::regclass) not null
		constraint jobs_pk2
			primary key,
	job_name varchar not null,
	user_id varchar not null,
	url varchar,
	last_run timestamp with time zone,
	next_run timestamp with time zone,
	created timestamp with time zone default now(),
	status integer default 1 not null,
	frequency integer default 60 not null,
	run_count integer default 0,
	latest_screenshot varchar default '0.png'::character varying,
	diff_percent integer default 5,
	error_count integer default 0,
	latest_error varchar,
	latest_diff_percent integer,
	latest_success timestamp with time zone,
	delay integer default 2,
	xpath varchar,
	job_type integer default 0
);

alter sequence jobs_job_id_seq2 owned by jobs.job_id;

create unique index if not exists jobs_job_id_uindex2
	on jobs (job_id);


create table if not exists history
(
	history_id varchar default (md5(((random())::text || (clock_timestamp())::text)))::uuid not null
		constraint history_pk
			primary key,
	datetime timestamp with time zone default now(),
	change_percent integer,
	screenshot varchar,
	notifications varchar,
	job_id integer not null,
	diff_screenshot varchar,
	source_screenshot varchar,
	log varchar,
	status integer,
	run_type varchar
);

create unique index if not exists history_history_id_uindex
	on history (history_id);


create table if not exists user_notifications
(
	notification_id varchar default (md5(((random())::text || (clock_timestamp())::text)))::uuid not null
		constraint user_channel_pk
			primary key,
	user_id varchar not null,
	type varchar,
	param_1 varchar,
	name varchar
);

create unique index if not exists user_channel_channel_id_uindex
	on user_notifications (notification_id);


create table if not exists job_notifications
(
	job_notification_id varchar default (md5(((random())::text || (clock_timestamp())::text)))::uuid not null
		constraint job_notifications_pk
			primary key,
	notification_id varchar not null,
	job_id integer not null,
	user_id varchar
);

create unique index if not exists job_notifications_job_notification_id_uindex
	on job_notifications (job_notification_id);