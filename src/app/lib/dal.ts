import { cache } from "react";
import { getSession } from "./session";
import { redirect } from "next/navigation"
import { User } from "./definitions";

const PLATZI_API_URL = "https://api.escuelajs.co/api/v1";

export const verifySession = cache(async () => {
	const session = await getSession();

	if (!session?.userId) {
		redirect("/login");
	}

	return {
		isAuth: true,
		userId: session.userId,
		email: session.email,
		role: session.role,
	};
});

export const getUser = cache(async (): Promise<User | null> => {
	const session = await verifySession();

	try {
		const response = await fetch(`${PLATZI_API_URL}/users/${session.userId}`);

		if (!response.ok) {
			return null;
		}

		const user: User = await response.json();
		return user;
	} catch (error) {
		console.error("Failed to fetch user:", error);
		return null;
	}
});

export const requireRole = cache(async (allowedRoles: string[]) => {
	const session = await verifySession();

	if (!allowedRoles.includes(session.role)) {
		redirect("/dashboard");
	}

	return session;
});
