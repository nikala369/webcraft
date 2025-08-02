/**
 * Test environment configuration
 * Used for local testing with backend connections
 */
// export const environment = {
//   production: false,
//   apiUrl: 'http://localhost:4200',
//   appName: 'Webcraft Test',
//   apiPrefix: '/api',
//   appDomain: 'localhost',
//   swaggerUrl: 'http://localhost:8080/swagger-ui/index.html',
// };

// src/environments/environment.test.ts
/**
 * Test environment configuration
 * Used for testing against the live backend
 */

export const environment = {
  production: false,
  // Pointing to the live backend for integration testing
  apiUrl: 'https://webcraft-test.up.railway.app',
  appName: 'Webcraft75 (Testing Live API)',
  apiPrefix: '/api',
  appDomain: 'localhost',
};
