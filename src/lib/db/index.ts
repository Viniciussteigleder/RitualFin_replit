// Only apply server-only guard when running in Next.js runtime.
// Standalone scripts (tsx/node) will bypass this to allow diagnostics and maintenance.
if (process.env.NEXT_RUNTIME) {
  await import('server-only').catch(() => {});
}
export * from './db';
