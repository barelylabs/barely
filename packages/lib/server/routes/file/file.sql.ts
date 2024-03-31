import { ALLOWED_FILE_TYPES } from '@uploadthing/shared';
import { relations } from 'drizzle-orm';
import {
	boolean,
	index,
	integer,
	pgTable,
	primaryKey,
	unique,
	varchar,
} from 'drizzle-orm/pg-core';

import { dbId, lexorank, primaryId, timestamps } from '../../../utils/sql';
import { VidRenders } from '../../vid-render.sql';
import { PressKits } from '../press-kit/press-kit.sql';
import { Products } from '../product/product.sql';
import { Tracks } from '../track/track.sql';
import { Users } from '../user/user.sql';
import { Workspaces } from '../workspace/workspace.sql';
import { FileFolders } from './file-folder.sql';

export const allowedFileExtensions = ['mp3', 'wav', 'jpg', 'png', 'mp4', 'mov'] as const;

export const Files = pgTable(
	'Files',
	{
		...primaryId,

		workspaceId: dbId('workspaceId')
			.notNull()
			.references(() => Workspaces.id, {
				onUpdate: 'cascade',
				onDelete: 'cascade',
			}),

		...timestamps,

		type: varchar('type', {
			length: 255,
			enum: ALLOWED_FILE_TYPES,
		}).notNull(),
		bucket: varchar('bucket', { length: 255 }).notNull(),
		key: varchar('key', { length: 255 }).notNull(),
		folder: varchar('folder', { length: 255 }).notNull(),
		name: varchar('name', { length: 255 }).notNull(),
		extension: varchar('extension', { length: 255 }), // deprecated in favor of type - remove in future

		uploadStatus: varchar('uploadStatus', {
			length: 255,
			enum: ['pending', 'uploading', 'processing', 'complete', 'failed'],
		}),

		description: varchar('description', { length: 255 }),
		src: varchar('src', { length: 255 }).notNull(),
		url: varchar('url', { length: 255 }), // deprecated in favor of src - remove in future
		size: integer('size').notNull(),
		width: integer('width'),
		height: integer('height'),
		fps: integer('fps'),
		duration: integer('duration'), // in ms
		internal: boolean('internal').notNull(), // is this stored on barely s3 bucket or not
		metaId: varchar('metaId', { length: 255 }),

		// relations
		folderId: dbId('folderId').references(() => FileFolders.id, {
			onUpdate: 'cascade',
			onDelete: 'cascade',
		}),
		createdById: dbId('createdById').notNull(),
		uploadedById: dbId('uploadedById').notNull(),
		trackId: dbId('trackId'),
		thumbnailForId: dbId('thumbnailForId'),
		vidRenderId: dbId('vidRenderId'),
	},
	table => ({
		workspace: index('Files_workspace_idx').on(table.workspaceId),
		key: unique('Files_key_unique').on(table.workspaceId, table.key),
	}),
);

export const File_Relations = relations(Files, ({ one, many }) => ({
	// one-to-one
	thumbnailFor: one(Files, {
		fields: [Files.thumbnailForId],
		references: [Files.id],
	}),
	vidRender: one(VidRenders, {
		fields: [Files.vidRenderId],
		references: [VidRenders.id],
	}),
	createdBy: one(Users, {
		relationName: 'filesCreatedByUser',
		fields: [Files.createdById],
		references: [Users.id],
	}),
	workspace: one(Workspaces, {
		fields: [Files.workspaceId],
		references: [Workspaces.id],
	}),
	uploadedBy: one(Users, {
		relationName: 'filesUploadedByUser',
		fields: [Files.uploadedById],
		references: [Users.id],
	}),
	track: one(Tracks, {
		fields: [Files.trackId],
		references: [Tracks.id],
	}),

	// one-to-many
	folder: one(FileFolders, {
		fields: [Files.folderId],
		references: [FileFolders.id],
	}),
	// many-to-one
	parentForVidRender: many(VidRenders),

	// many-to-many
	_pressKits: many(_Files_To_PressKits_PressPhotos, {
		relationName: '_pressKit_pressPhoto',
	}),
	_products: many(_Files_To_Products__Images, {
		relationName: '_image_product',
	}),
}));

/* join tables */

// workspace
export const _Files_To_Workspaces__AvatarImage = pgTable(
	'_Files_To_Workspaces__Avatar',
	{
		workspaceId: dbId('workspaceId')
			.notNull()
			.references(() => Workspaces.id, { onDelete: 'cascade' }),
		fileId: dbId('fileId')
			.notNull()
			.references(() => Files.id, { onDelete: 'cascade' }),
		current: boolean('current').notNull(),
	},
	table => ({
		pk: primaryKey({ columns: [table.workspaceId, table.fileId] }),
		index: index('currentWorkspaceAvatar').on(table.workspaceId, table.current),
	}),
);

export const _Files_To_Workspaces__AvatarImage_Relations = relations(
	_Files_To_Workspaces__AvatarImage,
	({ one }) => ({
		workspace: one(Workspaces, {
			fields: [_Files_To_Workspaces__AvatarImage.workspaceId],
			references: [Workspaces.id],
		}),
		file: one(Files, {
			fields: [_Files_To_Workspaces__AvatarImage.fileId],
			references: [Files.id],
		}),
	}),
);

export const _Files_To_Workspaces__HeaderImage = pgTable(
	'_Files_To_Workspaces__Header',
	{
		workspaceId: dbId('workspaceId')
			.notNull()
			.references(() => Workspaces.id, {
				onDelete: 'cascade',
			}),
		fileId: dbId('fileId')
			.notNull()
			.references(() => Files.id, {
				onDelete: 'cascade',
			}),
		current: boolean('current').notNull(),
	},
	table => ({
		pk: primaryKey({ columns: [table.workspaceId, table.fileId] }),
		index: index('currentWorkspaceHeader').on(table.workspaceId, table.current),
	}),
);

export const _Files_To_Workspaces__HeaderImage_Relations = relations(
	_Files_To_Workspaces__HeaderImage,
	({ one }) => ({
		workspace: one(Workspaces, {
			fields: [_Files_To_Workspaces__HeaderImage.workspaceId],
			references: [Workspaces.id],
		}),
		file: one(Files, {
			fields: [_Files_To_Workspaces__HeaderImage.fileId],
			references: [Files.id],
		}),
	}),
);

// tracks
export const _Files_To_Tracks__Audio = pgTable(
	'_Files_To_Tracks__Audio',
	{
		fileId: dbId('fileId')
			.notNull()
			.references(() => Files.id, { onDelete: 'cascade' }),
		trackId: dbId('trackId')
			.notNull()
			.references(() => Tracks.id, { onDelete: 'cascade' }),

		masterCompressed: boolean('masterCompressed'),
		masterWav: boolean('masterWav'),
		instrumentalCompressed: boolean('instrumentalCompressed'),
		instrumentalWav: boolean('instrumentalWav'),
		stem: boolean('stem'),
	},
	table => ({
		pk: primaryKey({ columns: [table.fileId, table.trackId] }),
		masterCompressedUnique: unique('uniqueMasterCompressed').on(
			table.trackId,
			table.masterCompressed,
		),
		masterWavUnique: unique('uniqueMasterWav').on(table.trackId, table.masterWav),
		instrumentalCompressedUnique: unique('uniqueInstrumentalCompressed').on(
			table.trackId,
			table.instrumentalCompressed,
		),
		instrumentalWavUnique: unique('uniqueInstrumentalWav').on(
			table.trackId,
			table.instrumentalWav,
		),
	}),
);

export const _Files_To_Tracks__Audio_Relations = relations(
	_Files_To_Tracks__Audio,
	({ one }) => ({
		file: one(Files, {
			fields: [_Files_To_Tracks__Audio.fileId],
			references: [Files.id],
		}),
		track: one(Tracks, {
			fields: [_Files_To_Tracks__Audio.trackId],
			references: [Tracks.id],
		}),
	}),
);

export const _Files_To_Tracks__Artwork = pgTable(
	'_Files_To_Tracks__Artwork',
	{
		fileId: dbId('fileId')
			.notNull()
			.references(() => Files.id, { onDelete: 'cascade' }),
		trackId: dbId('trackId')
			.notNull()
			.references(() => Tracks.id, { onDelete: 'cascade' }),
		current: boolean('current'),
	},
	table => ({
		pk: primaryKey({ columns: [table.fileId, table.trackId] }),
		currentUnique: unique('uniqueCurrent').on(table.trackId, table.current),
	}),
);

export const _Files_To_Tracks__Artwork_Relations = relations(
	_Files_To_Tracks__Artwork,
	({ one }) => ({
		file: one(Files, {
			fields: [_Files_To_Tracks__Artwork.fileId],
			references: [Files.id],
		}),
		track: one(Tracks, {
			fields: [_Files_To_Tracks__Artwork.trackId],
			references: [Tracks.id],
		}),
	}),
);

// press kits
export const _Files_To_PressKits_PressPhotos = pgTable(
	'_Files_To_PressKits__PressPhotos',
	{
		fileId: dbId('fileId')
			.notNull()
			.references(() => Files.id, { onDelete: 'cascade' }),
		pressKitId: dbId('pressKitId')
			.notNull()
			.references(() => PressKits.id, { onDelete: 'cascade' }),
		...lexorank,
	},
	table => ({
		pk: primaryKey({ columns: [table.fileId, table.pressKitId] }),
	}),
);

export const _Files_To_PressKits_PressPhotos_Relations = relations(
	_Files_To_PressKits_PressPhotos,
	({ one }) => ({
		file: one(Files, {
			fields: [_Files_To_PressKits_PressPhotos.fileId],
			references: [Files.id],
			relationName: '_pressKit_pressPhoto',
		}),
		pressKit: one(PressKits, {
			fields: [_Files_To_PressKits_PressPhotos.pressKitId],
			references: [PressKits.id],
			relationName: '_pressPhoto_pressKit',
		}),
	}),
);

// products
export const _Files_To_Products__Images = pgTable(
	'_Files_To_Products__Images',
	{
		fileId: dbId('fileId')
			.notNull()
			.references(() => Files.id, { onDelete: 'cascade' }),
		productId: dbId('productId')
			.notNull()
			.references(() => Products.id, { onDelete: 'cascade' }),
		...lexorank,
	},
	table => ({
		pk: primaryKey({ columns: [table.fileId, table.productId] }),
	}),
);

export const _Files_To_Products__Images_Relations = relations(
	_Files_To_Products__Images,
	({ one }) => ({
		file: one(Files, {
			fields: [_Files_To_Products__Images.fileId],
			references: [Files.id],
			relationName: '_image_product',
		}),
		product: one(Products, {
			fields: [_Files_To_Products__Images.productId],
			references: [Products.id],
			relationName: '_product_image',
		}),
	}),
);
