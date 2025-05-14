# Webcraft Backend Integration Guide

## Overview

This guide documents how the Webcraft frontend application communicates with the Java Spring Boot backend API. All data persistence, authentication, business logic operations, and website publishing are handled by the backend.

## Business Model

Webcraft offers two paid subscription plans:

- **Premium Plan**: Standard templates with essential customization features
- **Premium Pro Plan**: Advanced templates with enhanced customization options, additional sections, and more media options

Both plans include:

1. One-time template purchase fee
2. Monthly subscription for hosting and related services

The user journey follows this flow:

1. Template selection (Premium or Premium Pro)
2. Customization in the builder interface
3. Template saving
4. Combined checkout (one-time fee + subscription)
5. Website publishing

## API Communication Pattern

The frontend uses Angular's HttpClient to interact with the backend REST API. All API calls follow this pattern:

1. Frontend sends authenticated requests to backend endpoints
2. Backend performs validation and business logic
3. Backend returns data or error responses
4. Frontend processes responses and updates UI accordingly

## Base URL Configuration

API URLs are configured in the environment files:

```typescript
// environment.ts (development)
export const environment = {
  production: false,
  apiUrl: "http://localhost:8080",
  apiPrefix: "/api",
};

// environment.prod.ts (production)
export const environment = {
  production: true,
  apiUrl: "https://api.webcraft.com",
  apiPrefix: "/api",
};
```

## Authentication

Authentication is handled by the `AuthService` using JWT tokens:

- **Login**: `POST /api/security/user/login`
- **Register**: `POST /api/security/user/creator`
- **Verify Email**: `POST /api/security/user/confirm-email`
- **Reset Password**: `POST /api/security/user/reset-password`

### Authentication Flow

1. User submits credentials via login form
2. Frontend sends credentials to backend
3. Backend validates credentials and returns JWT token
4. Frontend stores token in localStorage
5. Subsequent requests include token in Authorization header

### JWT Token Handling

```typescript
// Adding token to HTTP requests
const token = localStorage.getItem("jwt_token");
const headers = new HttpHeaders().set("Authorization", `Bearer ${token}`);
```

## Core API Services

### Template Services

Templates represent the website templates that users can customize:

#### TemplateService

- **Get Template Types**: `GET /api/template/type/all`
- **Get Template Plans**: `GET /api/template/template-plan/all`
- **Search Templates**: `GET /api/template/search`
- **Get Template by ID**: `GET /api/template/{id}`

#### UserTemplateService

- **Create User Template**: `POST /api/template/user-template`
- **Update User Template**: `PUT /api/template/user-template/{id}`
- **Get User Template**: `GET /api/template/user-template/{id}`
- **Search User Templates**: `GET /api/template/user-template/search`
- **Delete User Template**: `DELETE /api/template/user-template/{id}`

### Build Services

Builds represent the process of generating a website from a template:

#### UserBuildService

- **Create Build**: `POST /api/user-build`
- **Get Build**: `GET /api/user-build/{id}`
- **Publish Build**: `POST /api/user-build/{id}/publish`
- **Search Builds**: `GET /api/user-build/search`

### Subscription Services

Subscriptions manage the user's plan type and billing information:

#### SubscriptionService

- **Get Subscriptions**: `GET /api/subscription/all`
- **Get Default Subscription**: `GET /api/subscription/default/{type}`
- **Create Subscription**: `POST /api/subscription`

### Checkout Services

Handles the purchase and subscription process:

#### CheckoutService

- **Initiate Checkout**: `POST /api/checkout/session`
- **Verify Payment**: `GET /api/checkout/verify/{sessionId}`
- **Get Payment History**: `GET /api/checkout/history`

### Attachment Services

Handles file uploads for media content:

#### AttachmentService

- **Upload Attachment**: `POST /api/template/user-template/attachment`
- **Get Attachment**: `GET /api/template/user-template/attachment/{objectId}`
- **Delete Attachment**: `DELETE /api/template/user-template/attachment/{objectId}`

## Data Models

### Template Data Models

```typescript
// Template Type (business type)
export interface TemplateType {
  id: string;
  name: string;
  key: string; // e.g., 'restaurant', 'salon'
}

// Template Plan (premium/premium-pro)
export interface TemplatePlan {
  id: string;
  type: "PREMIUM" | "PREMIUM_PRO";
  description: string;
  priceCents: number;
}

// Template (base template)
export interface Template {
  id: string;
  name: string;
  description: string;
  config: string; // JSON string
  templateType: TemplateType;
  templatePlan: TemplatePlan;
}

// User Template (saved templates)
export interface UserTemplate {
  id: string;
  template: {
    id: string;
    name: string;
    description: string;
    templateType: TemplateType;
    templatePlan: TemplatePlan;
  };
  config: string; // JSON string
  name: string;
}
```

### Customizations Data Model

The `config` field in templates is a JSON string that should be parsed to a `Customizations` object. The structure varies between Premium and Premium Pro plans, with Premium Pro offering more customization options.

```typescript
// Simplified example of Customizations interface
export interface Customizations {
  fontConfig: {
    fontId: number;
    family: string;
    fallback: string;
  };
  header: {
    backgroundColor: string;
    textColor: string;
    logoUrl: string;
    menuItems: { id: number; label: string; link: string }[];
  };
  pages: {
    home: {
      hero1: {
        /* Hero section data */
      };
      about: {
        /* About section data */
      };
      // Other sections...
    };
    // Other pages...
  };
  footer: {
    backgroundColor: string;
    textColor: string;
    // Other footer properties...
  };
}
```

### Checkout Data Models

```typescript
// Checkout Session Request
export interface CheckoutSessionRequest {
  userTemplateId: string;
  planType: "PREMIUM" | "PREMIUM_PRO";
  returnUrl: string;
}

// Checkout Session Response
export interface CheckoutSessionResponse {
  sessionId: string;
  checkoutUrl: string;
  expiresAt: string;
}

// Payment Verification Response
export interface PaymentVerificationResponse {
  status: "COMPLETED" | "PENDING" | "FAILED";
  subscriptionId?: string;
  errorMessage?: string;
}
```

## Error Handling

All API calls should include proper error handling:

```typescript
this.http.get<UserTemplate>(`${this.USER_TEMPLATE_BASE}/${templateId}`).pipe(
  catchError((error) => {
    console.error(`Error fetching user template with ID ${templateId}:`, error);
    return throwError(() => error);
  })
);
```

## Attachment Handling

For file uploads (images, videos), use the attachment endpoints:

```typescript
uploadAttachment(
  file: File,
  type: 'USER_TEMPLATE_IMAGE' | 'USER_TEMPLATE_VIDEO'
): Observable<{ fileId: string }> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);

  return this.http
    .post<{ fileId: string }>(this.USER_TEMPLATE_ATTACHMENT, formData)
    .pipe(
      catchError((error) => {
        console.error('Error uploading attachment:', error);
        return throwError(() => error);
      })
    );
}

getAttachment(objectId: string): Observable<Blob> {
  return this.http
    .get(`${this.USER_TEMPLATE_ATTACHMENT}/${objectId}`, { responseType: 'blob' })
    .pipe(
      catchError((error) => {
        console.error(`Error fetching attachment with ID ${objectId}:`, error);
        return throwError(() => error);
      })
    );
}
```

## API Request Examples

### Creating a User Template

```typescript
createUserTemplate(
  templateId: string,
  name: string,
  config: Customizations
): Observable<UserTemplate> {
  const createDto = {
    templateId,
    name,
    config: JSON.stringify(config),
  };

  return this.http
    .post<UserTemplate>(this.USER_TEMPLATE_BASE, createDto)
    .pipe(
      catchError((error) => {
        console.error('Error creating user template:', error);
        return throwError(() => error);
      })
    );
}
```

### Loading Templates by Business Type and Plan

```typescript
searchTemplates(
  templateTypeId: string,
  templatePlanId: string,
  page: number = 0,
  size: number = 10
): Observable<PageResponse<TemplateSearch>> {
  let params = new HttpParams()
    .set('page', page.toString())
    .set('size', size.toString())
    .set('templateTypeId', templateTypeId)
    .set('templatePlanId', templatePlanId);

  return this.http
    .get<PageResponse<TemplateSearch>>(this.TEMPLATE_SEARCH, { params })
    .pipe(
      catchError((error) => {
        console.error('Error searching templates:', error);
        return throwError(() => error);
      })
    );
}
```

### Initiating Checkout

```typescript
initiateCheckout(
  userTemplateId: string,
  planType: "PREMIUM" | "PREMIUM_PRO",
  returnUrl: string
): Observable<CheckoutSessionResponse> {
  const request: CheckoutSessionRequest = {
    userTemplateId,
    planType,
    returnUrl
  };

  return this.http
    .post<CheckoutSessionResponse>(`${this.apiUrl}${this.apiPrefix}/checkout/session`, request)
    .pipe(
      catchError((error) => {
        console.error('Error initiating checkout:', error);
        return throwError(() => error);
      })
    );
}
```

## Plan-Specific Features

### Premium Plan Features

- Basic customization options
- Limited section types
- Standard header and footer options
- Basic media upload capabilities

### Premium Pro Plan Features

- Advanced customization options
- Additional section types
- Enhanced header and footer options
- Advanced media upload capabilities (more image/video options)
- Additional page support

## Best Practices

1. **Authentication**: Ensure all API calls include the JWT token
2. **Error Handling**: Properly handle and log all errors
3. **Loading States**: Show loading indicators during API calls
4. **Response Parsing**: Validate API responses before using them
5. **Cachability**: Cache responses where appropriate (e.g., template types)
6. **Retry Logic**: Implement retry logic for critical operations
7. **Logging**: Log all important API interactions
8. **Fallbacks**: Provide default values when API calls fail
9. **Signal Integration**: Properly integrate Angular Signals with API responses
10. **Security**: Follow security best practices (never store sensitive data client-side)
