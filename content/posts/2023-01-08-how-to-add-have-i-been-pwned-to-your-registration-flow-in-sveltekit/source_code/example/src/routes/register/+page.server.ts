import { fail, redirect, type Actions } from '@sveltejs/kit';
import { pwnedPassword } from 'hibp';
import { z } from 'zod';

export interface Register {
	email: string;
	password: string;
}

const isSafePassword = async (password: string) => {
	try {
		const pwned = await pwnedPassword(password);
		return pwned <= 3;
	} catch (err) {
		console.log(err);
		return true;
	}
};

const registerSchema: z.ZodType<Register> = z.object({
	email: z
		.string({ required_error: 'Email is required' })
		.email({ message: 'Email must be a valid email.' }),
	password: z
		.string({ required_error: 'Password is required' })
		.min(8, 'Password must be a minimum of 8 characters.')
		.refine(isSafePassword, () => ({
			message: `Password has been compromised, please try again`
		}))
});

export const actions: Actions = {
	register: async ({ request }) => {
		const data: Register = Object.fromEntries((await request.formData()) as Iterable<[Register]>);
		const result = await registerSchema.safeParseAsync(data);

		if (!result.success) {
			return fail(400, {
				data: data,
				errors: result.error.flatten().fieldErrors
			});
		}

		console.log('CREATE USER');
		throw redirect(303, '/');
	}
};
