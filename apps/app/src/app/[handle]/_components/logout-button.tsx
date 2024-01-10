"use server";

import { signOut } from "@barely/server/auth";
import { APP_BASE_URL } from "@barely/utils/constants";
import { wait } from "@barely/utils/wait";

// import { SignOutButton } from '~/app/(dash)/[handle]/components/user-menu';

export async function signOutAction() {
  await wait(5000);
  await signOut({
    redirectTo: `${APP_BASE_URL}/login`,
  });
}

// export function SignOutButtonForm() {
// 	return (
// 		<form
// 			action={async () => {
// 				await wait(5000);
// 				// await signOutAction();
// 			}}
// 		>
// 			<SignOutButton />
// 		</form>
// 	);
// }
