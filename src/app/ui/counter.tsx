"use client";

import { useState } from "react";

export default function Counter() {
	const [count, setCount] = useState(0);
	const [history, setHistory] = useState<number[]>([]);

	const increment = () => {
		const newCount = count + 1;
		setCount(newCount);
		setHistory([...history, newCount]);
	};

	const decrement = () => {
		const newCount = count - 1;
		setCount(newCount);
		setHistory([...history, newCount]);
	};

	const reset = () => {
		setCount(0);
		setHistory([]);
	};

	return (
		<div className="space-y-4">
			<div className="text-2xl font-bold">Count: {count}</div>
			<div className="flex gap-2">
				<button
					onClick={increment}
					className="bg-blue-600 text-white px-4 py-2 rounded"
				>
					Increment
				</button>
				<button
					onClick={decrement}
					className="bg-red-600 text-white px-4 py-2 rounded"
				>
					Decrement
				</button>
				<button
					onClick={reset}
					className="bg-gray-600 text-white px-4 py-2 rounded"
				>
					Reset
				</button>
			</div>
			{history.length > 0 && (
				<div>
					<h3 className="font-semibold">History:</h3>
					<ul className="list-disc list-inside">
						{history.map((value, index) => (
							<li key={index}>{value}</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);
}
