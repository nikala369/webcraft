// src/environments/environment.ts
/**
 * Development environment configuration
 * Used during local development (ng serve)
 */
// 1
// export const environment = {
//   production: false,
//   apiUrl: 'http://localhost:8080',
//   appName: 'Webcraft75',
//   apiPrefix: '/api',
//   appDomain: 'webcraft75.com',
// };

// export const environment = {
//   production: false,
//   apiUrl: '', // Use the proxy to talk to your local backend
//   appName: 'Webcraft75 (Local Dev)',
//   apiPrefix: '/api',
//   appDomain: 'localhost',
// };

export const environment = {
  production: false,
  // Pointing to the live backend for integration testing
  apiUrl: 'https://webcraft-test.up.railway.app',
  appName: 'Webcraft75 (Testing Live API)',
  apiPrefix: '/api',
  appDomain: 'localhost',
};
