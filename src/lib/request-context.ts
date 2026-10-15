import { AsyncLocalStorage } from "node:async_hooks";

export type RequestContext = {
  userId: string;
  ipAddress: string;
};

// Simpan di globalThis agar tidak ter-reset oleh HMR dan tetap satu instance
// walaupun modul ini di-bundle lebih dari sekali.
const globalForCtx = globalThis as unknown as {
  __requestContext?: AsyncLocalStorage<RequestContext>;
};

export const requestContext =
  globalForCtx.__requestContext ??
  (globalForCtx.__requestContext = new AsyncLocalStorage<RequestContext>());