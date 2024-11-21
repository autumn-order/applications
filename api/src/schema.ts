import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

// Join Stats Tables

export const Stats = sqliteTable('stats', {
    id: integer('id').primaryKey(),
    corporation_id: integer('corporation_id').notNull(),
    members: integer('members').notNull(),
    ships_destroyed: integer('ships_destroyed').notNull(),
    date: text('date').notNull(),
});

// Auth Tables

export const Corporation = sqliteTable('corporation', {
    id: integer('id').primaryKey(),
    corporation_id: integer('corporation_id').notNull().unique(),
    corporation_name: text('corporation_name').notNull(),
});

export const Character = sqliteTable('character', {
    id: integer('id').primaryKey(),
    character_id: integer('character_id').notNull().unique(),
    character_name: text('character_name').notNull(),
    corporation_id: integer('corporation_id').notNull().references(() => Corporation.corporation_id),
    last_updated: text('last_updated').notNull(),
    created: text('created').notNull(),
})

export const User = sqliteTable('user', {
    id: integer('id').primaryKey(),
    seat_user_id: integer('seat_user_id').unique(),
    main_character_id: integer('main_character_id').notNull().references(() => Character.character_id),
    created: text('created').notNull(),
});

export const CharacterOwnership = sqliteTable('character_ownership', {
    id: integer('id').primaryKey(),
    user_id: integer('user_id').notNull().references(() => User.id),
    character_id: integer('character_id').notNull().unique().references(() => Character.character_id),
    owner_hash: text('owner_hash').notNull(),
})

// Application Tables

export const Application = sqliteTable('application', {
    id: integer('id').primaryKey(),
    user_id: integer('user_id').notNull().references(() => User.id),
    status: text('status').notNull(),
    rejection_reason: text('rejection_reason').notNull().default(''),
    reviewer_user_id: integer('reviewer_user_id').references(() => User.id),
    location: text('location').notNull(),
    seat_completed: integer('seat_completed').notNull().default(0),
    discord_completed: integer('discord_completed').notNull().default(0),
    questions_completed: integer('questions_completed').notNull().default(0),
    referrer: text('referrer'),
    region: text('region'),
    end_goals: text('end_goals').notNull().default(''),
    why_autumn: text('why_autumn').notNull().default(''),
    created: text('created').notNull(),
    last_updated: text('last_updated').notNull(),
});

export const Language = sqliteTable('language', {
    id: integer('id').primaryKey(),
    application_id: integer('application_id').notNull().references(() => Application.id),
    language: text('language').notNull(),
});

export const Interests = sqliteTable('interests', {
    id: integer('id').primaryKey(),
    application_id: integer('application_id').notNull().references(() => Application.id),
    interest: text('interest').notNull(),
})

// SeAT Roles

export const SeatRole = sqliteTable('seat_role', {
    id: integer('id').primaryKey(),
    seat_role_id: integer('role_id').notNull().unique(),
    name: text('name').notNull(),
});

export const SeatRoleUser = sqliteTable('seat_user_role', {
    id: integer('id').primaryKey(),
    seat_user_id: integer('seat_user_id').notNull().references(() => User.seat_user_id),
    seat_role_id: integer('seat_role_id').notNull().references(() => SeatRole.seat_role_id),
});

export const SeatRolePermissions = sqliteTable('seat_role_permissions', {
    id: integer('id').primaryKey(),
    seat_role_id: integer('seat_role_id').notNull().references(() => SeatRole.seat_role_id),
    permission: text('permission').notNull(),
})

// Settings

export const Settings = sqliteTable('settings', {
    id: integer('id').primaryKey(),
    key: text('key').notNull().unique(),
    value: text('value').notNull(),
});