// import { authOptions } from '@barely/auth';
// import { unstable_getServerSession } from 'next-auth';
import Logout from './Logout';

async function LogoutPage() {
	// const session = await unstable_getServerSession(authOptions);

	return (
		<div>
			{/* Logout user: {session?.user?.id}
			<Logout session={session} /> */}
		</div>
	);
}

export default LogoutPage;
