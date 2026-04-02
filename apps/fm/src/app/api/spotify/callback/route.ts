import { NextResponse } from 'next/server';

/**
 * Spotify OAuth callback handler for pre-saves.
 * Spotify redirects here after the fan authorizes.
 * We extract the code and state, then redirect back to the FM page
 * with the code as a query parameter so the client can complete the pre-save.
 */
export function GET(request: Request) {
	const url = new URL(request.url);
	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');
	const error = url.searchParams.get('error');

	if (error) {
		// User denied authorization - redirect back to the FM page
		if (state) {
			try {
				const stateData = JSON.parse(Buffer.from(state, 'base64url').toString()) as {
					fmPageId: string;
					returnPath: string;
				};
				return NextResponse.redirect(
					new URL(`/${stateData.returnPath}?presave_error=denied`, url.origin),
				);
			} catch {
				return NextResponse.redirect(new URL('/?presave_error=denied', url.origin));
			}
		}
		return NextResponse.redirect(new URL('/?presave_error=denied', url.origin));
	}

	if (!code || !state) {
		return NextResponse.redirect(new URL('/?presave_error=missing_params', url.origin));
	}

	// Decode state to get the return path
	try {
		const stateData = JSON.parse(Buffer.from(state, 'base64url').toString()) as {
			fmPageId: string;
			returnPath: string;
		};

		// Redirect back to the FM page with the authorization code
		const returnUrl = new URL(`/${stateData.returnPath}`, url.origin);
		returnUrl.searchParams.set('spotify_code', code);
		returnUrl.searchParams.set('spotify_state', state);

		return NextResponse.redirect(returnUrl);
	} catch {
		return NextResponse.redirect(new URL('/?presave_error=invalid_state', url.origin));
	}
}
