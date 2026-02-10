'use server'
import { cookies } from "next/headers";

export interface SessionPayLoad {
	userId: number;
	email: string;
	role: string;
	expiresAt: string;
}
export async function createSession(
	userId: number,
	email: string,
	role: string,
) {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);;
    const session: SessionPayLoad = {
        userId,
		email,
		role,
		expiresAt: expiresAt.toISOString(),
	};
    const cookieStore = await cookies();
    cookieStore.set("session", JSON.stringify(session), {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		expires: expiresAt,
		sameSite: "lax",
		path: "/",
	});
}

export async function deleteSession() {
    const cookieStore = await cookies();
	cookieStore.delete("session");
}

export async function getSession(): Promise<SessionPayLoad | null> {
	const cookie = (await cookies()).get("session")?.value;
	if (!cookie) return null;

	try {
		const session: SessionPayLoad = JSON.parse(cookie);
		// Check if session expired
		if (new Date(session.expiresAt) < new Date()) {
			return null;
		}
		return session;
	} catch (error) {
		return null;
	}
}
