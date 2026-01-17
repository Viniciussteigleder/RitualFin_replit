/**
 * Simple in-memory rate limiter for server actions.
 */
type RateLimitOptions = {
    limit: number;    // Number of permitted requests
    windowMs: number; // Time window in milliseconds
};

const trackers = new Map<string, { count: number; expiresAt: number }>();

/**
 * Checks if a request should be rate limited.
 * 
 * @param identifier - Unique identifier for the client (e.g., user ID or IP)
 * @param key - Unique key for the action (e.g., 'upload-file')
 * @param options - Limit and window configuration
 * @returns { success: boolean, remaining: number, reset: number }
 */
export async function rateLimit(
    identifier: string,
    key: string,
    options: RateLimitOptions
) {
    const fullKey = `${key}:${identifier}`;
    const now = Date.now();
    const tracker = trackers.get(fullKey);

    if (!tracker || now > tracker.expiresAt) {
        // First request or window expired
        const newTracker = {
            count: 1,
            expiresAt: now + options.windowMs
        };
        trackers.set(fullKey, newTracker);
        return {
            success: true,
            remaining: options.limit - 1,
            reset: newTracker.expiresAt
        };
    }

    if (tracker.count >= options.limit) {
        // Limit reached
        return {
            success: false,
            remaining: 0,
            reset: tracker.expiresAt
        };
    }

    // Increment count
    tracker.count += 1;
    return {
        success: true,
        remaining: options.limit - tracker.count,
        reset: tracker.expiresAt
    };
}

/**
 * Periodically cleanup expired trackers to prevent memory leaks
 */
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of trackers.entries()) {
        if (now > value.expiresAt) {
            trackers.delete(key);
        }
    }
}, 5 * 60 * 1000); // Every 5 minutes
