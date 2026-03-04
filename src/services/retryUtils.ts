// Exponential Backoff Retry Utility
export async function retry<T>(fn: () => Promise<T>, retries = 3, delay = 500): Promise<T> {
  let lastError;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (e) {
      lastError = e;
      await new Promise(res => setTimeout(res, delay * Math.pow(2, i)));
    }
  }
  throw lastError;
}
