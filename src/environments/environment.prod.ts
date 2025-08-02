/**
 * Production environment configuration
 * Used for production deployment
 */
// export const environment = {
//   production: true,
//   apiUrl: 'https://api.webcraft75.com',
//   appName: 'Webcraft75',
//   apiPrefix: '/api',
//   appDomain: 'webcraft75.com',
// };


// src/environments/environment.prod.ts
/**
 * Production environment configuration
 * GOAL: Connect the deployed frontend to the LIVE backend.
 */
export const environment = {
  production: true,
  // This is the correct live backend URL
  apiUrl: 'https://webcraft-test.up.railway.app',
  appName: 'Webcraft75',
  apiPrefix: '/api',
  appDomain: 'webcraft75.com',
};
