import { requireRole } from "@/app/lib/dal";

export default async function AdminPage() {
	// This will redirect non-admin users to dashboard
	const session = await requireRole(["admin"]);

	return (
		<div className="min-h-screen p-8">
			<div className="max-w-4xl mx-auto">
				<h1 className="text-3xl font-bold mb-8">Admin Panel</h1>

				<div className="bg-yellow-100 dark:bg-yellow-900 p-4 rounded-lg mb-6">
					<p className="font-semibold">⚠️ Admin Only Area</p>
					<p className="text-sm mt-1">
						Only users with the "admin" role can access this page.
					</p>
				</div>

				<div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
					<h2 className="text-xl font-semibold mb-4">Admin Actions</h2>
					<ul className="space-y-2">
						<li>✅ Manage users</li>
						<li>✅ View analytics</li>
						<li>✅ System settings</li>
						<li>✅ Content moderation</li>
					</ul>

					<div className="mt-6">
						<p>
							<strong>Current User:</strong> {session.email}
						</p>
						<p>
							<strong>Role:</strong> {session.role}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
