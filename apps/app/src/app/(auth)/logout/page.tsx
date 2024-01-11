import { redirect } from "next/navigation";
import { auth } from "@barely/server/auth";

import { Logout } from "./logout_";

async function LogoutPage() {
  const session = await auth();

  if (!session) return redirect("/login");

  return <Logout />;
  return null;
}

export default LogoutPage;
