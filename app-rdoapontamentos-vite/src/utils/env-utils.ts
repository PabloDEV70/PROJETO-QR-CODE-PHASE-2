/** Production hostnames where PROD database writes are allowed */
const PROD_HOSTNAMES = ['hhman.gigantao.net'];

/** True when running on production domain (hhman.gigantao.net) */
export function isProductionDeploy(): boolean {
  return PROD_HOSTNAMES.includes(window.location.hostname);
}

/** True when running in local dev (Vite dev server) */
export function isDevMode(): boolean {
  return import.meta.env.DEV;
}
