import { render, screen, waitFor } from "@testing-library/react";
import { server } from "../mocks/server";
import { http, HttpResponse } from "msw";
import UserProfile from "@/app/ui/user-profile";

const PLATZI_API_URL = "https://api.escuelajs.co/api/v1";

describe("UserProfile", () => {
	it("should display loading state initially", () => {
		render(<UserProfile userId={1} />);
		expect(screen.getByText(/loading/i)).toBeInTheDocument();
	});

	it("should display user data after successful fetch", async () => {
		render(<UserProfile userId={1} />);

		await waitFor(() => {
			expect(screen.getByText(/john doe/i)).toBeInTheDocument();
		});

		expect(screen.getByText(/john@mail.com/i)).toBeInTheDocument();
		expect(screen.getByText(/role: customer/i)).toBeInTheDocument();
	});

	it("should display error message when API call fails", async () => {
		// Override the default handler for this test
		server.use(
			http.get(`${PLATZI_API_URL}/users/999`, () => {
				return HttpResponse.json(
					{ message: "User not found" },
					{ status: 404 },
				);
			}),
		);

		render(<UserProfile userId={999} />);

		await waitFor(() => {
			expect(screen.getByText(/error/i)).toBeInTheDocument();
		});
	});

	it("should refetch when userId changes", async () => {
		const { rerender } = render(<UserProfile userId={1} />);

		await waitFor(() => {
			expect(screen.getByText(/john doe/i)).toBeInTheDocument();
		});

		// Change userId
		rerender(<UserProfile userId={2} />);

		// Should show loading again
		expect(screen.getByText(/loading/i)).toBeInTheDocument();

		// Wait for new user data (you'll need to add handler for userId=2)
		await waitFor(() => {
			expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
		});
	});

	it("should handle network errors", async () => {
		// Override handler to simulate network error
		server.use(
			http.get(`${PLATZI_API_URL}/users/1`, () => {
				return HttpResponse.error();
			}),
		);

		render(<UserProfile userId={1} />);

		await waitFor(() => {
			expect(screen.getByText(/error/i)).toBeInTheDocument();
		});
	});
});
