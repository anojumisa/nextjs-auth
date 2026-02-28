import { login, logout } from "@/app/actions/auth";
import { createSession, deleteSession } from "@/app/lib/session";
import { server } from "../mocks/server";
import { http, HttpResponse } from "msw";

// Mock session functions
jest.mock("@/app/lib/session", () => ({
	createSession: jest.fn(),
	deleteSession: jest.fn(),
	getSession: jest.fn(),
}));

// Mock next/navigation
jest.mock("next/navigation", () => ({
	redirect: jest.fn(),
}));

const PLATZI_API_URL = "https://api.escuelajs.co/api/v1";

describe("login", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("should return validation errors for invalid email", async () => {
		const formData = new FormData();
		formData.append("email", "invalid-email");
		formData.append("password", "password123");

		const result = await login(undefined, formData);

		expect(result).toEqual({
			errors: {
				email: "Please enter a valid email address.",
			},
		});
		expect(createSession).not.toHaveBeenCalled();
	});

	it("should return validation errors for empty password", async () => {
		const formData = new FormData();
		formData.append("email", "test@example.com");
		formData.append("password", "");

		const result = await login(undefined, formData);

		expect(result).toEqual({
			errors: {
				password: "Password is required.",
			},
		});
	});

	it("should return error message for invalid credentials", async () => {
		// Override handler for invalid credentials
		server.use(
			http.post(`${PLATZI_API_URL}/auth/login`, () => {
				return HttpResponse.json(
					{ message: "Invalid credentials" },
					{ status: 401 },
				);
			}),
		);

		const formData = new FormData();
		formData.append("email", "wrong@example.com");
		formData.append("password", "wrongpassword");

		const result = await login(undefined, formData);

		expect(result).toEqual({
			message: "Invalid email or password. Please try again.",
		});
		expect(createSession).not.toHaveBeenCalled();
	});

	it("should create session and redirect on successful login", async () => {
		const formData = new FormData();
		formData.append("email", "john@mail.com");
		formData.append("password", "changeme");

		// Mock createSession to resolve successfully
		(createSession as jest.Mock).mockResolvedValueOnce(undefined);

		await login(undefined, formData);

		// Verify session was created with correct data
		expect(createSession).toHaveBeenCalledWith(
			1, // userId from mock handler
			"john@mail.com",
			"customer",
		);

		// Verify redirect was called
		const { redirect } = require("next/navigation");
		expect(redirect).toHaveBeenCalledWith("/dashboard");
	});

	it("should handle API errors gracefully", async () => {
		// Override handler to simulate API error
		server.use(
			http.post(`${PLATZI_API_URL}/auth/login`, () => {
				return HttpResponse.error();
			}),
		);

		const formData = new FormData();
		formData.append("email", "test@example.com");
		formData.append("password", "password123");

		const result = await login(undefined, formData);

		expect(result).toEqual({
			message: "An error occurred during login. Please try again.",
		});
	});

	it("should handle profile fetch failure", async () => {
		// Override handler to make profile fetch fail
		server.use(
			http.get(`${PLATZI_API_URL}/auth/profile`, () => {
				return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
			}),
		);

		const formData = new FormData();
		formData.append("email", "john@mail.com");
		formData.append("password", "changeme");

		const result = await login(undefined, formData);

		expect(result).toEqual({
			message: "Failed to fetch user profile.",
		});
		expect(createSession).not.toHaveBeenCalled();
	});
});

describe("logout", () => {
	it("should delete session and redirect to login", async () => {
		(deleteSession as jest.Mock).mockResolvedValueOnce(undefined);

		await logout();

		expect(deleteSession).toHaveBeenCalled();
		const { redirect } = require("next/navigation");
		expect(redirect).toHaveBeenCalledWith("/login");
	});
});
