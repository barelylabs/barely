// import type { OAuthConfig, OAuthUserConfig } from '@auth/core/providers';

// import { env } from '../../env';
// import { getAbsoluteUrl } from '../../utils/url';

// export function Mailchimp(
// 	config: OAuthUserConfig<Record<string, any>>,
// ): OAuthConfig<Record<string, any>> {
// 	const mailchimpAuthorization = new URL('https://login.mailchimp.com/oauth2/authorize');
// 	mailchimpAuthorization.searchParams.set('response_type', 'code');
// 	mailchimpAuthorization.searchParams.set('client_id', env.MAILCHIMP_CLIENT_ID);
// 	mailchimpAuthorization.searchParams.set(
// 		'redirect_uri',
// 		getAbsoluteUrl('app', 'api/auth/callback/mailchimp'),
// 	);
// 	mailchimpAuthorization.searchParams.set('scope', '');

// 	return {
// 		id: 'mailchimp',
// 		name: 'Mailchimp',
// 		type: 'oauth',
// 		authorization: mailchimpAuthorization.toString(),
// 		token: {
// 			url: 'https://login.mailchimp.com/oauth2/token',
// 			async request(ctx) {
// 				console.log('ctx', ctx);
// 				return 'ctx';
// 			},
// 		},
// 		userinfo: 'https://login.mailchimp.com/oauth2/metadata',
// 		profile(profile) {
// 			return {
// 				id: profile.login.login_id,
// 				name: profile.accountname,
// 				email: profile.login.email,
// 				image: null,
// 			};
// 		},
// 		style: {
// 			logo: '/mailchimp.svg',
// 			bg: '#000',
// 			text: '#fff',
// 		},
// 		options: config,
// 	};
// }

/**
 * <div style={{backgroundColor: "#000", display: "flex", justifyContent: "space-between", color: "#fff", padding: 16}}>
 * <span>Built-in <b>Mailchimp</b> integration.</span>
 * <a href="https://mailchimp.com">
 *   <img style={{display: "block"}} src="https://authjs.dev/img/providers/mailchimp.svg" height="48" width="48"/>
 * </a>
 * </div>
 *
 * @module providers/mailchimp
 */
import type {
	OAuthConfig,
	OAuthUserConfig,
	TokenEndpointHandler,
} from 'next-auth/providers';

import { env } from '../../env';
import { getAbsoluteUrl } from '../../utils/url';

/**
 * Add Mailchimp login to your page.
 *
 * ### Setup
 *
 * #### Callback URL
 * ```
 * https://example.com/api/auth/callback/mailchimp
 * ```
 *
 * #### Configuration
 *```js
 * import Auth from "@auth/core"
 * import Mailchimp from "@auth/core/providers/mailchimp"
 *
 * const request = new Request(origin)
 * const response = await Auth(request, {
 *   providers: [Mailchimp({ clientId: MAILCHIMP_CLIENT_ID, clientSecret: MAILCHIMP_CLIENT_SECRET })],
 * })
 * ```
 *
 * ### Resources
 *
 *  - [Mailchimp OAuth documentation](https://admin.mailchimp.com/account/oauth2/client/)
 *  - [Mailchimp documentation: Access user data](https://mailchimp.com/developer/marketing/guides/access-user-data-oauth-2/)
 *
 * ### Notes
 *
 * By default, Auth.js assumes that the Mailchimp provider is
 * based on the [OAuth 2](https://www.rfc-editor.org/rfc/rfc6749.html) specification.
 *
 * :::tip
 *
 * The Mailchimp provider comes with a [default configuration](https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/providers/mailchimp.ts).
 * To override the defaults for your use case, check out [customizing a built-in OAuth provider](https://authjs.dev/guides/providers/custom-provider#override-default-options).
 *
 * :::
 *
 * :::info **Disclaimer**
 *
 * If you think you found a bug in the default configuration, you can [open an issue](https://authjs.dev/new/provider-issue).
 *
 * Auth.js strictly adheres to the specification and it cannot take responsibility for any deviation from
 * the spec by the provider. You can open an issue, but if the problem is non-compliance with the spec,
 * we might not pursue a resolution. You can ask for more help in [Discussions](https://authjs.dev/new/github-discussions).
 *
 * :::
 */

// const tokenEndpointHandler: TokenEndpointHandler = async ctx => {
// 	console.log('ctx', ctx.params);

// 	const tokens = {
// 		access_token: '',
// 		id_token: '',
// 		refresh_token: '',
// 		expires_at: 0,
// 		scope: '',
// 		token_type: '',
// 		session_state: '',
// 	};

// 	return tokens;
// };

const mailchimpAuthorization = new URL('https://login.mailchimp.com/oauth2/authorize');
mailchimpAuthorization.searchParams.set('response_type', 'code');
mailchimpAuthorization.searchParams.set('client_id', env.MAILCHIMP_CLIENT_ID);
mailchimpAuthorization.searchParams.set(
	'redirect_uri',
	getAbsoluteUrl('app', 'api/auth/callback/mailchimp'),
);
mailchimpAuthorization.searchParams.set('scope', '');

export function Mailchimp(): OAuthConfig<Record<string, any>> {
	const tokenEndpointUrl = 'https://login.mailchimp.com/oauth2/token';

	return {
		id: 'mailchimp',
		name: 'Mailchimp',
		type: 'oauth',

		authorization: {
			url: 'https://login.mailchimp.com/oauth2/authorize',
			params: {
				response_type: 'code',
				client_id: env.MAILCHIMP_CLIENT_ID,
				redirect_uri: getAbsoluteUrl('app', 'api/auth/callback/mailchimp'),
				scope: '',
			},
		},
		client: {
			client_id: env.MAILCHIMP_CLIENT_ID,
			client_secret: env.MAILCHIMP_CLIENT_SECRET,
			redirect_uri: 'https://example.com/api/auth/callback/mailchimp',
			token_endpoint_auth_method: 'client_secret_basic',
		},
		// token: tokenEndpointUrl,
		// token: {
		// 	url: tokenEndpointUrl,
		// 	// url: 'https://public-api.wordpress.com/oauth2/token',
		// 	async request(context) {
		// 		const { provider, params: parameters, client } = context;
		// 		const { callbackUrl } = provider;

		// 		const tokenset = await client.grant({
		// 			client_id: env.MAILCHIMP_CLIENT_ID,
		// 			client_secret: env.MAILCHIMP_CLIENT_SECRET,
		// 			redirect_uri: callbackUrl,
		// 			grant_type: 'authorization_code',
		// 			code: parameters.code,
		// 		});
		// 		return { tokens: tokenset };
		// 		// async request({ params, provider }) {
		// 		// 	console.log('params', params);
		// 		// 	const response = await fetch('https://login.mailchimp.com/oauth2/token', {
		// 		// 		method: 'POST',
		// 		// 		headers: {
		// 		// 			'Content-Type': 'application/x-www-form-urlencoded',
		// 		// 		},
		// 		// 		body: new URLSearchParams({
		// 		// 			grant_type: 'authorization_code',
		// 		// 			client_id: env.MAILCHIMP_CLIENT_ID,
		// 		// 			client_secret: env.MAILCHIMP_CLIENT_SECRET,
		// 		// 			redirect_uri: getAbsoluteUrl('app', 'api/auth/callback/mailchimp'),
		// 		// 			code: context.params.code as string,
		// 		// 		}),
		// 		// 	});

		// 		// 	const json = (await response.json()) as TokenSet;
		// 		// 	console.log('json', json);
		// 		// 	return { tokens: json };
		// 		// },
		// 	},
		// },

		userinfo: {
			url: 'https://login.mailchimp.com/oauth2/metadata',
		},

		profile(profile) {
			return {
				id: profile.login.login_id,
				name: profile.accountname,
				email: profile.login.email,
				image: null,
			};
		},

		// style: {
		// 	logo: '/mailchimp.svg',
		// 	bg: '#000',
		// 	text: '#fff',
		// },

		clientId: env.MAILCHIMP_CLIENT_ID,
		clientSecret: env.MAILCHIMP_CLIENT_SECRET,
		checks: ['none'],
	};
}
