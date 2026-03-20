export async function uninstallPwa(): Promise<void> {
  // 1. Clear all local storage
  localStorage.clear();
  sessionStorage.clear();

  // 2. Clear all Cache API caches (workbox, fonts, images, api-data)
  if ('caches' in window) {
    const names = await caches.keys();
    await Promise.all(names.map((n) => caches.delete(n)));
  }

  // 3. Unregister all service workers
  if ('serviceWorker' in navigator) {
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(regs.map((r) => r.unregister()));
  }

  // 4. Delete IndexedDB databases (offline queue)
  try {
    indexedDB.deleteDatabase('rdo-offline');
  } catch {
    // silent
  }

  // 5. Redirect to login (fresh start)
  window.location.href = '/login';
}
