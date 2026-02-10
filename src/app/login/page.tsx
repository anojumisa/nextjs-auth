import LoginForm from "@/app/ui/login-form";

export default function LoginPage() {
	return (
		<div className="min-h-screen flex items-center justify-center">
			<div className="w-full max-w-md p-8">
				<h1 className="text-3xl font-bold text-center mb-6">Login</h1>
				<LoginForm />
			</div>
		</div>
	);
}
