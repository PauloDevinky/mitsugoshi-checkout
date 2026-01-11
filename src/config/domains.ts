
// Configuration for Multi-Domain Architecture
// Developed by Mitsugoshi Corporation

// Get environment variables with fallbacks for local development
const APP_DOMAIN = import.meta.env.VITE_APP_DOMAIN || 'localhost';
const CHECKOUT_DOMAIN = import.meta.env.VITE_CHECKOUT_DOMAIN || 'localhost';

// Development domains that should always be allowed to access everything
const DEV_DOMAINS = [
  'localhost',
  '127.0.0.1',
  'webcontainer.io'
];

/**
 * Checks if the current domain matches the configured App Domain
 */
export function currentDomainIsApp(): boolean {
  const hostname = window.location.hostname;
  
  // Always allow dev domains to act as App
  if (DEV_DOMAINS.some(domain => hostname.includes(domain))) {
    return true;
  }
  
  return hostname === APP_DOMAIN || hostname.endsWith(`.${APP_DOMAIN}`);
}

/**
 * Checks if the current domain matches the configured Checkout Domain
 */
export function currentDomainIsCheckout(): boolean {
  const hostname = window.location.hostname;
  
  // In development (localhost), we might want to test checkout behavior too
  // But usually localhost acts as "App" (Admin) which has access to everything.
  // To test "Checkout Mode" in localhost, we would rely on the storeMode logic
  // or specific paths. However, for strict domain separation:
  
  if (DEV_DOMAINS.some(domain => hostname.includes(domain))) {
    // In dev, we can be both, but usually we return false here to let App handle routing
    // unless we specifically want to simulate checkout mode.
    // For now, let's say localhost is NOT checkout-only domain, it's the App.
    return false;
  }

  return hostname === CHECKOUT_DOMAIN || hostname.endsWith(`.${CHECKOUT_DOMAIN}`);
}

/**
 * Generates the full Checkout URL for a product
 * @param slug The product slug or path
 */
export function getCheckoutUrl(slug: string): string {
  const protocol = window.location.protocol;
  
  // Clean slug
  const cleanSlug = slug.replace(/^\//, '');
  
  // If we are in development, keep using current origin
  if (DEV_DOMAINS.some(domain => window.location.hostname.includes(domain))) {
    return `${window.location.origin}/pay/${cleanSlug}`;
  }

  // In production, use the configured checkout domain
  return `${protocol}//${CHECKOUT_DOMAIN}/${cleanSlug}`;
}
