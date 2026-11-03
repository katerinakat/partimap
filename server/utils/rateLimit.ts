// Minimal in-memory sliding-window rate limiter, per IP + bucket name.
// Good enough for a single-instance deployment; if PARTIMAP ever runs
// multi-instance, this should move to a shared store (e.g. Redis).

const hits = new Map<string, number[]>();

export function isRateLimited(bucket: string, ip: string, max: number, windowMs: number) {
	const key = `${bucket}:${ip}`;
	const now = Date.now();
	const timestamps = (hits.get(key) || []).filter((t) => now - t < windowMs);
	timestamps.push(now);
	hits.set(key, timestamps);
	return timestamps.length > max;
}
