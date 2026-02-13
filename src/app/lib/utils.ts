export function isValidEmail(email: string): boolean {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function formatUserName(name: string): string {
	return name.trim().toLowerCase().replace(/\s+/g, "-");
}
