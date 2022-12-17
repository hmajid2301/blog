<script lang="ts">
	import { browser } from '$app/environment';
	import type { PageData } from './$types';

	export let data: PageData;
	function gotoAuthProvider() {
		if (browser) {
			document.cookie = `state=${data?.authProviderState}`;
		}

		window.location.href = data.authProviderRedirect || '';
	}

</script>

<button on:click={gotoAuthProvider}>Login with GitLab</button>