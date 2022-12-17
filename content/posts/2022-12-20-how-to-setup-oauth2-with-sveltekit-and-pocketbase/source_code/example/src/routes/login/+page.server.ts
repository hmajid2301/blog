import type { PageServerLoad } from './$types';

export type OutputType = { authProviderRedirect: string; authProviderState: string };

export const load: PageServerLoad<OutputType> = async ({ locals, url }) => {
	const authMethods = await locals.pb?.collection('users').listAuthMethods();
	if (!authMethods) {
		return {
			authProviderRedirect: '',
			authProviderState: ''
		};
	}

	const redirectURL = `${url.origin}/account/callback`;
	const gitlabAuthProvider = authMethods.authProviders[0];
	const authProviderRedirect = `${gitlabAuthProvider.authUrl}${redirectURL}`;
	const state = gitlabAuthProvider.state;

	return {
		authProviderRedirect: authProviderRedirect,
		authProviderState: state
	};
};
