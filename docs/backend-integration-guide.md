# Backend Integration Guide

This document provides details on how Webcraft's Angular frontend integrates with the Java Spring Boot backend API. It serves as a guide for developers working on connecting UI components to the appropriate backend services.

## API Base URL

The API is configured in `environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: "http://localhost:4200", // Proxy to backend at http://localhost:8080
  apiPrefix: "/api",
  // ...other config
};
```

## Authentication Flow

### Core Authentication Services

- `AuthService`: Main service for authentication operations
- `TokenService`: Handles JWT token storage and validation

### Endpoints

| Endpoint                                       | Method | Purpose                    | Service Method                       |
| ---------------------------------------------- | ------ | -------------------------- | ------------------------------------ |
| `/api/security/user/creator`                   | POST   | Register new user          | `AuthService.register()`             |
| `/api/security/user/login`                     | POST   | Login user                 | `AuthService.login()`                |
| `/api/security/user`                           | GET    | Fetch current user details | `AuthService.fetchCurrentUser()`     |
| `/api/security/user/activate/{activationCode}` | POST   | Activate user account      | `AuthService.activateUser()`         |
| `/api/security/user/changePassword`            | POST   | Change user password       | `AuthService.changePassword()`       |
| `/api/security/user/request-reset-password`    | POST   | Request password reset     | `AuthService.requestPasswordReset()` |
| `/api/security/user/reset-password`            | POST   | Reset password with code   | `AuthService.resetPassword()`        |
| `/api/security/user/search`                    | GET    | Search users (admin only)  | N/A                                  |

### Authentication Flow

1. User registers via `register()`, which returns a success message with activation instructions
2. User activates account via email link or by entering activation code
3. User logs in via `login()`, which returns a JWT token
4. Token is stored in local storage via `TokenService`
5. HTTP interceptor attaches token to all subsequent API requests
6. App initializer checks token validity on app start
7. User is automatically logged out if token is invalid or expired

## Template Management

### Core Template Services

- `TemplateService`: Fetches template types, plans, and master templates
- `UserTemplateService`: Manages user-specific template customizations

### Endpoints

| Endpoint                                            | Method | Purpose                         | Service Method                              |
| --------------------------------------------------- | ------ | ------------------------------- | ------------------------------------------- |
| `/api/template/type/all`                            | GET    | Fetch all template types        | `TemplateService.getAllTemplateTypes()`     |
| `/api/template/type/{id}`                           | GET    | Fetch specific template type    | `TemplateService.getTemplateTypeById()`     |
| `/api/template/template-plan/all`                   | GET    | Fetch all template plans        | `TemplateService.getAllTemplatePlans()`     |
| `/api/template/search`                              | GET    | Search for templates            | `TemplateService.searchTemplates()`         |
| `/api/template/user-template`                       | POST   | Create new user template        | `UserTemplateService.createUserTemplate()`  |
| `/api/template/user-template/{id}`                  | GET    | Get user template by ID         | `UserTemplateService.getUserTemplateById()` |
| `/api/template/user-template/{id}`                  | PUT    | Update user template            | `UserTemplateService.updateUserTemplate()`  |
| `/api/template/user-template/search`                | GET    | Search user templates           | `UserTemplateService.searchUserTemplates()` |
| `/api/template/user-template/attachment`            | POST   | Upload user template attachment | `UserTemplateService.uploadAttachment()`    |
| `/api/template/user-template/attachment/{objectId}` | GET    | Get user template attachment    | `UserTemplateService.getAttachmentUrl()`    |

### Template Selection Flow

1. Fetch template types via `TemplateService.getAllTemplateTypes()`
2. User selects business type, which is stored in state
3. Fetch template plans via `TemplateService.getAllTemplatePlans()`
4. User selects plan (standard or premium), which is stored in state
5. Search templates based on selected type and plan via `TemplateService.searchTemplates()`
6. User selects a template, which loads the default configuration

### Template Saving Flow

1. User customizes template in editor
2. Customizations are tracked via Angular Signals
3. When user saves, configuration is serialized to JSON via `JSON.stringify()`
4. If saving for the first time, call `UserTemplateService.createUserTemplate()`
5. If updating existing template, call `UserTemplateService.updateUserTemplate()`
6. Template ID is stored for future updates

## Website Publishing

### Core Build Services

- `UserBuildService`: Manages build creation and publishing
- `SubscriptionService`: Manages subscriptions for builds

### Endpoints

| Endpoint                       | Method | Purpose                 | Service Method                              |
| ------------------------------ | ------ | ----------------------- | ------------------------------------------- |
| `/api/subscription/all`        | GET    | Fetch all subscriptions | `SubscriptionService.getAllSubscriptions()` |
| `/api/subscription`            | POST   | Create new subscription | `SubscriptionService.createSubscription()`  |
| `/api/user-build`              | POST   | Create new build        | `UserBuildService.createUserBuild()`        |
| `/api/user-build/{id}/publish` | POST   | Publish build           | `UserBuildService.publishUserBuild()`       |
| `/api/user-build/search`       | GET    | Search/monitor builds   | `UserBuildService.searchUserBuilds()`       |

### Publishing Flow

1. User saves their template customizations
2. User initiates publishing process via "Publish" button
3. System fetches appropriate subscription via `SubscriptionService.getDefaultSubscription()`
4. System creates build via `UserBuildService.createUserBuild()`
5. System publishes build via `UserBuildService.publishUserBuild()`
6. System polls build status via `UserBuildService.searchUserBuilds()`
7. When build completes, user is presented with the published URL

## File Attachment Handling

Webcraft handles file uploads through dedicated attachment endpoints:

### Endpoints

| Endpoint                                            | Method | Purpose                  | Service Method                           |
| --------------------------------------------------- | ------ | ------------------------ | ---------------------------------------- |
| `/api/template/user-template/attachment`            | POST   | Upload file attachment   | `UserTemplateService.uploadAttachment()` |
| `/api/template/user-template/attachment/{objectId}` | GET    | Retrieve file attachment | `UserTemplateService.getAttachmentUrl()` |

### Attachment Types

- `USER_TEMPLATE_IMAGE`: Images used in user templates
- `USER_TEMPLATE_VIDEO`: Videos used in user templates

### Attachment Flow

1. User uploads file via file input
2. File is converted to FormData
3. File is uploaded via `UserTemplateService.uploadAttachment()`
4. Server returns a file ID
5. File ID is stored in the template configuration
6. When displaying the template, file is retrieved via `getAttachmentUrl()`

## Error Handling

All service methods use RxJS's `catchError` operator to handle errors. The error handling flow typically involves:

1. Logging error to console
2. Returning appropriate error message to UI
3. Using `throwError` to propagate error through RxJS chain

Example error handling pattern:

```typescript
return this.http.post<UserTemplate>(this.USER_TEMPLATE_BASE, createDto).pipe(
  catchError((error) => {
    console.error("Error creating user template:", error);
    return throwError(() => error);
  })
);
```

## Plan Type Mapping

The frontend and backend use different terminology for plans:

| Frontend | Backend          |
| -------- | ---------------- |
| standard | BASIC            |
| premium  | ADVANCED/PREMIUM |

This mapping is handled in the appropriate services to ensure consistency.

## Authentication Guards

Protected routes are guarded using:

- `AuthGuard`: Ensures user is authenticated
- `RoleGuard`: Ensures user has appropriate role
- `PublicGuard`: Ensures user is not authenticated (for login/register pages)

## Next Steps for Backend Integration

- Implement file upload progress tracking
- Add offline support with synchronization
- Implement WebSocket for real-time build status updates
- Add domain management for published websites
- Implement analytics integration
