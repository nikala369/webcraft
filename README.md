# Webcraft: Auto Website Builder

## Overview

Webcraft is a powerful template-based website builder that allows users to create professional websites quickly and efficiently. Unlike traditional drag-and-drop builders, Webcraft uses a template-centric approach where users configure predefined sections and components to create customized websites tailored to their business needs.

## Key Features

- **Template-Based Design**: Choose from curated templates optimized for different business types
- **Business-Specific Content**: Templates and content suggestions tailored to specific industries
- **Customization Options**: Easily customize colors, fonts, images, and content
- **Mobile Preview**: See how your website looks on different devices
- **Save & Edit**: Save your work and return to edit it later
- **Publish & Deploy**: Publish your website with a single click

## Subscription Plans

Webcraft offers two paid subscription plans:

- **Premium Plan**: Essential features for small businesses and individuals
- **Premium Pro Plan**: Advanced features for growing businesses with enhanced customization needs

Both plans include:

- One-time template purchase fee
- Monthly subscription for hosting and services

See `docs/plan-comparison.md` for a detailed comparison.

## Technology Stack

- **Frontend**: Angular (v19+), TypeScript, SCSS, Angular Signals
- **Backend**: Java Spring Boot API (consumed by the frontend)
- **State Management**: Angular Signals for reactive state management
- **Authentication**: JWT-based authentication

## Application Architecture

### Frontend Architecture

The Webcraft frontend is built on Angular and follows a component-based architecture with state management through Angular Signals:

- **Core Module**: Services, models, and utilities used throughout the application
- **Pages**: Top-level page components (Dashboard, Preview, Auth)
- **Components**: Reusable UI components
- **Services**: Backend API communication and data management

### Key Components

- **PreviewComponent**: The main website builder interface where users customize their templates
- **PremiumStructureComponent**: Structure component for Premium plan templates
- **PremiumProStructureComponent**: Structure component for Premium Pro plan templates (in development)
- **Theme Switcher**: Allows users to select different themes for their website
- **Business Type Selector**: Helps users choose their business category
- **Component Customizer**: Modal interface for editing specific website sections
- **Templates Component**: Displays saved templates in the dashboard
- **Checkout Component**: Handles the template purchase and subscription process

### State Management

Webcraft uses Angular Signals for state management, providing a reactive approach to handling application state. Key state signals include:

- Template configuration state
- User authentication state
- UI state (mobile/desktop view, fullscreen mode)
- Step tracking for the building process

### Backend Communication

The frontend communicates with a Java Spring Boot backend API for:

- Authentication and user management
- Template storage and retrieval
- Business type and template type management
- Website publishing and deployment
- Media attachment uploads
- Checkout and subscription management

## Application Features

### Authentication Flow

- Strict authentication checks in PreviewComponent
- Redirection to login for unauthenticated users
- API-based persistence instead of sessionStorage

### Mobile Experience

- Mobile view preview of websites
- Editing restrictions in mobile view
- Responsive design for all screen sizes

### State Management

- Signal-based reactive state
- Computed properties for derived state
- Effects for side-effect management

### Media Management

- Image upload for both plans
- Video support for Premium Pro plans
- Backend-based storage with secure retrieval

### Checkout Process

- Combined one-time purchase + subscription model
- Secure payment processing
- Plan upgrade options

### Security Considerations

- JWT authentication with the backend
- Client-side validation for UX with server-side validation for security
- No secrets stored in frontend code

## Development Guidelines

### Component Structure

- Standalone Angular components
- Clear separation between presentational and container components
- Signal-based state management within components

### API Integration

- Strong typing for API requests and responses
- Comprehensive error handling
- Retry mechanisms for transient failures

### Code Organization

- Components limited to 300 lines of code where possible
- Logical grouping of related functionality
- Comprehensive documentation of complex logic

### Testing Strategy

- Component testing with Angular TestBed
- Manual validation of UI flows
- API integration testing

## Setup and Development

### Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the development server: `npm start`

### Development Workflow

1. **Authentication**: Ensure you're logged in to test restricted features
2. **Template Selection**: Start by selecting a business type and template
3. **Customization**: Use the component customizer to modify sections
4. **Preview**: Test in both desktop and mobile views
5. **Checkout**: Test the purchase and subscription flow
6. **Publish**: Test the publishing flow

## Documentation

Please review these guides before contributing to the project:

- [Component Development Guide](./docs/component-development-guide.md): Guidelines for creating components
- [Backend Integration Guide](./docs/backend-integration-guide.md): API integration details
- [Component Data Flow](./docs/component-data-flow.md): How data flows between components
- [Plan Comparison](./docs/plan-comparison.md): Differences between Premium and Premium Pro plans
- [Phase Summary](./docs/phase-summary.md): Current project status and next steps
- [Customization Schema](./docs/standard-customization-schema.json): JSON schema for template customization

## License

[Proprietary]
