"use client";

import { useActionState } from "react";
import { login } from "@/app/actions/auth";

export default function LoginForm() {
	const [state, action, pending] = useActionState(login, undefined);

	return (
		<form action={action} className="space-y-4 max-w-md mx-auto mt-8">
			<div>
				<label htmlFor="email" className="block text-sm font-medium mb-1">
					Email
				</label>
				<input
					id="email"
					name="email"
					type="email"
					placeholder="john@mail.com"
					required
					className="w-full px-4 py-2 border rounded-md"
				/>
				{state?.errors?.email && (
					<p className="text-red-500 text-sm mt-1">{state.errors.email}</p>
				)}
			</div>

			<div>
				<label htmlFor="password" className="block text-sm font-medium mb-1">
					Password
				</label>
				<input
					id="password"
					name="password"
					type="password"
					placeholder="changeme"
					required
					className="w-full px-4 py-2 border rounded-md"
				/>
				{state?.errors?.password && (
					<p className="text-red-500 text-sm mt-1">{state.errors.password}</p>
				)}
			</div>

			{state?.message && (
				<p className="text-red-500 text-sm">{state.message}</p>
			)}

			<button
				type="submit"
				disabled={pending}
				className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
			>
				{pending ? "Logging in..." : "Login"}
			</button>

			<div className="text-sm text-gray-600 mt-4">
				<p>
					<strong>Test Credentials:</strong>
				</p>
				<p>Email: john@mail.com</p>
				<p>Password: changeme</p>
			</div>
		</form>
	);
}
