import type { InferSelectModel } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { isRealEmail } from "../utils/email";
import {
  formatInternational,
  isPossiblePhoneNumber,
} from "../utils/phone-number";
import {
  checkEmailExistsServerAction,
  checkPhoneNumberExistsServerAction,
} from "./user.actions";
import { _Users_To_Workspaces, Users } from "./user.sql";

export const insertUserSchema = createInsertSchema(Users, {
  email: (schema) => schema.email.email(),
});
export const createUserSchema = insertUserSchema
  .omit({
    id: true,
    personalWorkspaceId: true,
  })
  .extend({
    image: z.string().url().nullish(),
  });
export const upsertUserSchema = insertUserSchema.partial({ id: true });
export const updateUserSchema = insertUserSchema
  .partial()
  .required({ id: true });
export const selectUserSchema = createSelectSchema(Users);

export type User = InferSelectModel<typeof Users>;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type CreateUser = z.infer<typeof createUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
export type SelectUser = z.infer<typeof selectUserSchema>;

// joins
export const insert_User_To_Workspace_Schema =
  createInsertSchema(_Users_To_Workspaces);
export type User_To_Workspace = InferSelectModel<typeof _Users_To_Workspaces>;

// forms
export const phoneNumberInUseMessage =
  "That phone number is already in use. Please login or use a different phone number.";
export const emailInUseMessage = "That email is already in use. Please login.";

export const newUserContactInfoSchema = z.object({
  fullName: createUserSchema.shape.fullName
    .unwrap()
    .unwrap()
    .min(2, "Name must be at least 2 characters"),
  email: z
    .string()
    .email("Please use a valid email address")
    .refine(async (email) => {
      console.log("checking for email => ", email);
      console.log("client side? => ", typeof window !== "undefined");

      if (!isRealEmail(email)) return false;

      const emailExists = await checkEmailExistsServerAction(email);

      return !emailExists;
    }, emailInUseMessage),
  phone: createUserSchema.shape.phone
    .unwrap()
    .unwrap()
    .refine((phone) => {
      if (!phone.length) return true;
      const isPossible = isPossiblePhoneNumber(phone);
      return isPossible;
    }, "That phone number is invalid. Please enter a valid one.")
    .refine(async (phone) => {
      if (!phone.length) return true;
      if (!isPossiblePhoneNumber(phone)) return false;

      const phoneNumberExists = await checkPhoneNumberExistsServerAction(phone);
      return !phoneNumberExists;
    }, phoneNumberInUseMessage)
    .transform((phone) => (!phone.length ? null : formatInternational(phone)))
    .nullish(),
});

export const newUserContactInfoSchemaWithRole = newUserContactInfoSchema.extend(
  {
    role: insert_User_To_Workspace_Schema.shape.role.unwrap(),
  },
);
