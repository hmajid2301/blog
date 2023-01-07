<script lang="ts">
	import type { ActionData } from './$types';

	export let form: ActionData;
</script>

<div class="mx-auto flex w-full flex-col items-center justify-center px-6 py-8 md:h-screen lg:py-0">
	<div
		class="flex flex-col rounded-2xl border-slate-100 bg-white dark:bg-slate-900/70 md:w-2/3 lg:w-1/3 w-full"
	>
		<div class="space-y-4 p-6 sm:p-8 md:space-y-6">
			<div class="space-y-4 p-6 sm:p-8 md:space-y-6">
				<h1
					class="text-xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white md:text-2xl"
				>
					Create an account
				</h1>
				<form class="space-y-4 md:space-y-6" action="?/register" method="post">
					<div class="mb-6 last:mb-0">
						<label for="email" class="mb-2 block font-bold ">Email</label>

						<input
							id="email"
							autocomplete="username"
							name="email"
							required={true}
							type="email"
							placeholder="your@email.com"
							value={form?.data?.email}
							class="h-12 w-full max-w-full rounded border bg-white px-3 py-2 pl-10 focus:ring dark:border-gray-700 dark:bg-slate-800 dark:placeholder-gray-400 border-gray-300"
						/>

						<div class="mt-1 py-1 text-xs font-semibold text-gray-500 dark:text-slate-400">
							Required. Your email
						</div>
					</div>
					<div class="relative mb-6 w-full last:mb-0">
						<div class="mb-6 last:mb-0">
							<label for="password" class="mb-2 block font-bold ">Password</label>

							<input
								id="password"
								autocomplete="new-password"
								name="password"
								required={true}
								type="password"
								placeholder="Your password"
								value={form?.data?.password}
								class="h-12 w-full max-w-full rounded border bg-white px-3 py-2 pl-10 focus:ring dark:border-gray-700 dark:bg-slate-800 dark:placeholder-gray-400 border-gray-300"
							/>

							<div class="mt-1 py-1 text-xs font-semibold text-gray-500 dark:text-slate-400">
								Required. Your password
							</div>
						</div>
					</div>
					<button
						class="inline-flex cursor-pointer items-center justify-center whitespace-nowrap rounded border border-blue-600 bg-blue-600 px-1 py-1 font-semibold text-white ring-blue-300 transition-colors duration-150 last:mr-0 hover:border-blue-700 hover:bg-blue-700 focus:outline-none focus:ring dark:border-blue-500 dark:bg-blue-500 dark:ring-blue-700 hover:dark:border-blue-600 hover:dark:bg-blue-600 lg:px-2 lg:py-2 my-2 w-full"
						type="submit">Create Account</button
					>
				</form>
				{#each form?.errors?.email || [] as error}
					<p>{error}</p>
				{/each}
				{#each form?.errors?.password || [] as error}
					<p>{error}</p>
				{/each}
			</div>
		</div>
	</div>
</div>
