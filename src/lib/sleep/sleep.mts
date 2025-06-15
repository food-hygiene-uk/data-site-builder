/**
 * Delays execution for a given number of milliseconds.
 *
 * @param ms - Milliseconds to sleep.
 * @returns A promise that resolves after the specified delay.
 */
export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
