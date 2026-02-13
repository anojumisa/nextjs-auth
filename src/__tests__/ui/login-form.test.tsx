import { render, screen, waitFor, act, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginForm from "@/app/ui/login-form";

// Mock the login action
const mockLogin = jest.fn();
jest.mock("@/app/actions/auth", () => ({
	login: (...args: any[]) => mockLogin(...args),
}));

describe("LoginForm", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockLogin.mockClear();
	});

	it("should render all form elements", () => {
		render(<LoginForm />);

		// Check for email input
		expect(screen.getByLabelText(/email/i)).toBeInTheDocument();

		// Check for password input
		expect(screen.getByLabelText(/password/i)).toBeInTheDocument();

		// Check for submit button
		expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();

		// Check for test credentials display
		expect(screen.getByText(/test credentials/i)).toBeInTheDocument();
	});

	it("should allow user to type in email and password fields", async () => {
		const user = userEvent.setup();
		render(<LoginForm />);

		const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
		const passwordInput = screen.getByLabelText(
			/password/i,
		) as HTMLInputElement;

		await user.type(emailInput, "test@example.com");
		await user.type(passwordInput, "password123");

		expect(emailInput.value).toBe("test@example.com");
		expect(passwordInput.value).toBe("password123");
	});

	it("should show validation errors when form is submitted with invalid data", async () => {
		const user = userEvent.setup();

		// Mock login to return validation errors
		mockLogin.mockResolvedValueOnce({
			errors: {
				email: "Please enter a valid email address.",
				password: "Password is required.",
			},
		});

		const { container } = render(<LoginForm />);

		const emailInput = screen.getByLabelText(/email/i);
		const passwordInput = screen.getByLabelText(/password/i);
		const form = container.querySelector("form");

		// Submit form with invalid data
		await user.type(emailInput, "invalid-email");
		await user.clear(passwordInput);
		
		// Submit the form using fireEvent to properly trigger the action
		await act(async () => {
			fireEvent.submit(form!);
		});

		// Wait for validation errors to appear (server actions are async)
		await waitFor(
			() => {
				expect(
					screen.getByText(/please enter a valid email address/i),
				).toBeInTheDocument();
				expect(screen.getByText(/password is required/i)).toBeInTheDocument();
			},
			{ timeout: 3000 },
		);
		
		// Verify the login function was called
		expect(mockLogin).toHaveBeenCalled();
	});

	it("should show error message when login fails", async () => {
		const user = userEvent.setup();

		// Mock login to return error message (not validation errors)
		mockLogin.mockResolvedValueOnce({
			message: "Invalid email or password. Please try again.",
		});

		const { container } = render(<LoginForm />);

		const emailInput = screen.getByLabelText(/email/i);
		const passwordInput = screen.getByLabelText(/password/i);
		const form = container.querySelector("form");

		await user.type(emailInput, "wrong@example.com");
		await user.type(passwordInput, "wrongpassword");
		
		// Submit the form using fireEvent to properly trigger the action
		await act(async () => {
			fireEvent.submit(form!);
		});

		await waitFor(
			() => {
				expect(
					screen.getByText(/invalid email or password/i),
				).toBeInTheDocument();
			},
			{ timeout: 3000 },
		);
		
		// Verify the login function was called
		expect(mockLogin).toHaveBeenCalled();
	});

	it("should disable submit button and show loading state when form is submitting", async () => {
		const user = userEvent.setup();

		// Mock login to delay response
		mockLogin.mockImplementationOnce(
			() => new Promise((resolve) => setTimeout(() => resolve(undefined), 100)),
		);

		render(<LoginForm />);

		const emailInput = screen.getByLabelText(/email/i);
		const passwordInput = screen.getByLabelText(/password/i);
		const submitButton = screen.getByRole("button", { name: /login/i });

		await user.type(emailInput, "test@example.com");
		await user.type(passwordInput, "password123");
		
		// Click submit and immediately check for loading state
		const clickPromise = user.click(submitButton);
		
		// Check loading state immediately after clicking
		await waitFor(
			() => {
				expect(screen.getByText(/logging in/i)).toBeInTheDocument();
				expect(submitButton).toBeDisabled();
			},
			{ timeout: 1000 },
		);
		
		await act(async () => {
			await clickPromise;
		});

		// Wait for submission to complete
		await waitFor(
			() => {
				expect(submitButton).not.toBeDisabled();
			},
			{ timeout: 200 },
		);
	});
});
