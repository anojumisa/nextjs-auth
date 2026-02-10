import Link from "next/link";
import { getSession } from "@/app/lib/session";
import { redirect } from "next/navigation";

export default async function HomePage() {
	const session = await getSession();

	// Redirect authenticated users to dashboard
	if (session?.userId) {
		redirect("/dashboard");
	}

	return (
		<div className="min-h-screen flex items-center justify-center">
			<div className="text-center">
				<h1 className="text-4xl font-bold mb-4">Welcome!</h1>
				<p className="text-lg mb-8">Please login to access your dashboard.</p>
				<Link
					href="/login"
					className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 inline-block"
				>
					Go to Login
				</Link>
			</div>
		</div>
	);
}
