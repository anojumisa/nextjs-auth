'use server'
import { redirect } from "next/navigation";
import { AuthResponse, LoginFormState, User } from "../lib/definitions";
import { createSession, deleteSession } from "../lib/session";

const PLATZI_API_URL = "https://api.escuelajs.co/api/v1";

function isValidEmail(email: string): boolean {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// butuh client component
export async function login(state: LoginFormState, formData: FormData) {
	const email = formData.get("email") as string;
	const password = formData.get("password") as string;
	const errors: { email?: string; password?: string } = {};

	if (!email || !isValidEmail(email)) {
		errors.email = "Please enter a valid email address.";
	}

	if (!password || password.trim().length === 0) {
		errors.password = "Password is required.";
	}

	if (Object.keys(errors).length > 0) {
		return { errors };
	}

	try {
		// Call Platzi API to authenticate
		const loginResponse = await fetch(`${PLATZI_API_URL}/auth/login`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ email, password }),
		});

		if (!loginResponse.ok) {
			return {
				message: "Invalid email or password. Please try again.",
			};
		}

		const authData: AuthResponse = await loginResponse.json();

		const profileResponse = await fetch(`${PLATZI_API_URL}/auth/profile`, {
			headers: {
				Authorization: `Bearer ${authData.access_token}`,
			},
		});

		if (!profileResponse.ok) {
			return {
				message: "Failed to fetch user profile.",
			};
		}

		const user: User = await profileResponse.json();

		await createSession(user.id, user.email, user.role);
		redirect("/dashboard");
	} catch (error) {
		console.error("Login error:", error);
		return {
			message: "An error occurred during login. Please try again.",
		};
	}
}

// butuh server components 'use server'
export async function logout() {
    await deleteSession();
    redirect("/login");
}
