// Multi-tenant routing utility
// Determines if we should render Admin Dashboard or Public Checkout
// Developed by Mitsugoshi Corporation

// Define the main app domains (admin dashboard)
const MAIN_DOMAINS = [
  'localhost',
  '127.0.0.1',
  'mitsugoshi.com',
  'mitsugoshi.dev',
  'webcontainer.io',
  'mitsugoshi.app',
];

export type StoreMode = 'admin' | 'checkout';

export function getStoreMode(): StoreMode {
  const hostname = window.location.hostname;
  
  // Check if it's a main app domain (admin mode)
  const isMainDomain = MAIN_DOMAINS.some(domain => 
    hostname === domain || 
    hostname.endsWith(`.${domain}`) ||
    hostname.includes(domain)
  );
  
  if (isMainDomain) {
    return 'admin';
  }
  
  // If it's a custom domain (CNAME), render checkout
  return 'checkout';
}

export function getCheckoutSlugFromPath(): string | null {
  const pathname = window.location.pathname;
  
  // If in checkout mode, the path IS the slug (e.g., /meu-produto)
  // Remove leading slash and return
  const slug = pathname.replace(/^\//, '').split('/')[0];
  
  return slug || null;
}

export function buildCheckoutUrl(slug: string, customDomain?: string | null): string {
  if (customDomain) {
    // Use custom domain without /pay/ prefix
    return `https://${customDomain}/${slug}`;
  }
  
  // Use current domain with /pay/ prefix
  const baseUrl = window.location.origin;
  return `${baseUrl}/pay/${slug}`;
}
