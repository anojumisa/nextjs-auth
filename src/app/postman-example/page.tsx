"use client";

import { useEffect, useState } from "react";

const MOCK_URL = process.env.NEXT_PUBLIC_API_URL;

type User = {
	id: number;
	name: string;
	email: string;
};

export default function UsersPage() {
	const [users, setUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!MOCK_URL) {
			setError('API_URL is not configured');
			setLoading(false)
			return;
		}
		fetch(MOCK_URL)
			.then((res) => {
				if (!res.ok) throw new Error(`HTTP ${res.status}`);
				return res.json();
			})
			.then((data: User[]) => {
				setUsers(data);
				setError(null);
			})
			.catch((err) => setError(err.message))
			.finally(() => setLoading(false));
	}, []);

	if (loading) return <p>Loading users...</p>;
	if (error) return <p>Error: {error}</p>;

	return (
		<main className="p-6">
			<h1 className="text-2xl font-bold mb-4">Users</h1>
			<ul className="space-y-2">
				{users.map((user) => (
					<li key={user.id} className="border p-3 rounded">
						<strong>{user.name}</strong> — {user.email}
					</li>
				))}
			</ul>
		</main>
	);
}
