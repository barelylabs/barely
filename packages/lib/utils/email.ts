import { z } from "zod";

import type { Db } from "../server/db";
import { zGet } from "./zod-fetch";

export function isRealEmail(email: string) {
  const isRealEmail = z.string().email().safeParse(email);

  if (!isRealEmail.success) {
    return false;
  }

  return true;
}

export async function checkEmailExists(email: string, db?: Db) {
  if (window === undefined && !!db) {
    console.log("checking for email on server...");
    const { checkEmailExistsOnServer } = await import("../server/user.fns");
    return checkEmailExistsOnServer(email, db);
  }

  console.log("checking for email on client...");
  const res = await zGet(
    `/api/rest/user/email-exists?email=${encodeURIComponent(email)}`,
    z.boolean(),
  );

  console.log("checkEmailExists res => ", res);
  if (!res.success || !res.parsed) {
    throw new Error("Something went wrong checking if that email exists.");
  }

  return res.data;
}
