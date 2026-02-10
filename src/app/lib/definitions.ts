export type LoginFormState =
	| {
			errors?: {
				email?: string;
				password?: string;
			};
			message?: string;
	  }
	| undefined;

export interface User {
	id: number;
	email: string;
	password: string;
	name: string;
	role: "customer" | "admin";
	avatar: string;
}

export interface AuthResponse {
	access_token: string;
	refresh_token: string;
}
