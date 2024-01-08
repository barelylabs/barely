// import { renderEmail } from '@barely/email';
// import { PlaylistPitchApprovedEmailTemplate } from '@barely/email/src/templates/playlist-pitch-approved';
// import { SignInEmailTemplate } from '@barely/email/src/templates/sign-in';

// export default async function PreviewEmail(props: { params: { slug: string } }) {
// 	let templateToRender: JSX.Element | null = null;
// 	switch (props.params.slug) {
// 		case 'sign-in':
// 			templateToRender = SignInEmailTemplate({ loginLink: 'https://barely.io/login' });
// 			break;

// 		case 'playlist-pitch-approved':
// 			templateToRender = PlaylistPitchApprovedEmailTemplate({
// 				firstName: 'Xander',
// 				trackName: 'Local Gravity',
// 				loginLink: 'https://barely.io/login',
// 				screeningMessage: "Love this. You're gonna be a star 🌟",
// 			});
// 	}

// 	// const markup = templateToRender ? await renderEmail(templateToRender) : null;

// 	// return (
// 	// 	<>
// 	// 		<p>Template: {props.params.slug}</p>
// 	// 		<div className='flex flex-col align-text-top rounded-lg overflow-clip'>
// 	// 			{markup ? (
// 	// 				<iframe srcDoc={markup} className='w-full h-[calc(100vh_-_100px)]' />
// 	// 			) : (
// 	// 				<>{`No email template found for ${props.params.slug}.`}</>
// 	// 			)}
// 	// 		</div>
// 	// 	</>
// 	// );
// }

export default function PreviewEmail() {
	return <></>;
}
