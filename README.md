# Auto Website Builder

An Angular-based visual website builder that allows users to create and customize professional websites without coding skills.

## Latest Updates & Implementation Status

### Backend API Integration: Complete

**The application now fully integrates with the backend API, providing:**

- **Complete authentication flow:**

  - User registration with email verification
  - Login with JWT token management
  - Account activation and password reset functionality

- **Template management integration:**

  - Fetching template types, plans, and templates from API
  - Storing user customizations in the backend
  - Maintaining user template history

- **Website publishing flow:**

  - Creating builds from user templates
  - Publishing builds to live websites
  - Monitoring build status (pending, building, deploying, success)
  - Providing the published URL to the user

- **Subscription handling:**
  - Integration with the subscription API
  - Proper plan mapping (standard → BASIC, premium → ADVANCED)
  - Error handling for subscription-related failures

### Menu & Services Sections: Complete Implementation Summary

**Both sections now support:**

- Full content customization with specialized editors
- Comprehensive color customization
  - Background color
  - Text color
  - Card background color
  - Accent color for highlights
- Plan-appropriate limits and features
- Proper rendering based on business type
- Optimized responsive layouts

#### Menu Section

- **Content Editor:**
  - Standard Plan: 2 categories, 8 items per category
  - Premium Plan: 5 categories, 15 items per category
  - Item editor with name, description, price, tags, and image (premium)
  - Featured item highlighting (premium)
- **Styling:**
  - All text elements properly respect text color settings
  - Cards properly apply background color
  - Price displays in accent color
  - Responsive grid layout optimized for different screen sizes

#### Services Section

- **Content Editor:**
  - Standard Plan: 4 services with icon selection
  - Premium Plan: 10 services with image uploads
  - Business-type specific fields:
    - Salon: Price, duration (premium), booking URL (premium)
    - Architecture: Description-focused with images
    - Portfolio: Generalized service representation
  - Premium-only features clearly marked in UI
- **Styling:**
  - 4-card horizontal layout for standard plan
  - Featured service highlighting for premium plan
  - Proper accent color application
  - Premium upgrade CTA with consistent styling

### Recent Fixes

- Implemented full backend API integration
- Fixed storage of large files by using the attachment API
- Enhanced template saving and loading with proper error handling
- Added authenticated vs. unauthenticated user flows
- Improved user experience with better feedback during publishing
- Fixed issue with services section not properly applying style customizations
- Enhanced color application for descriptions and subtitles

### Next Steps

- Implement attachment handling for large image/video files
- Add user template management UI (load, delete saved templates)
- Complete Projects Section for architecture/portfolio business types
- Finalize premium layout variations and animations

## Features

- **Template-based editing**: Build pages by selecting and customizing templates
- **Business-specific templates**: Tailored templates for restaurants, salons, portfolios, and more
- **Responsive design**: Websites look great on all devices
- **Theme customization**: Easily change colors, fonts, and layouts
- **Media management**: Upload and manage images and videos
- **Standard and Premium plans**: Different feature sets for different user needs
- **Backend integration**: Save and publish your websites with a full backend integration

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Angular CLI 17+
- Java 17+ and Maven (for backend)

### Installation

1. Clone the repository

```bash
git clone https://github.com/yourusername/auto-website-builder.git
cd auto-website-builder
```

2. Install dependencies

```bash
npm install
```

3. Run the development server

```bash
npm run dev
```

4. Start the backend server (separate repository)

```bash
# Follow instructions in the backend repository
```

5. Open your browser and navigate to `http://localhost:4200`

## Project Structure

```
auto-website-builder/
├── src/
│   ├── app/
│   │   ├── core/                   # Core services, models, and utilities
│   │   │   ├── models/             # Data models and interfaces
│   │   │   └── services/           # Core services
│   │   │       ├── auth/           # Authentication services
│   │   │       ├── template/       # Template management services
│   │   │       ├── build/          # Website build services
│   │   │       └── subscription/   # Subscription services
│   │   ├── pages/                  # Application pages
│   │   │   ├── preview/            # Website preview page
│   │   │   │   ├── components/     # Preview-specific components
│   │   │   │   └── standard-structure/  # Standard website structure
│   │   │   │       ├── home-standard/   # Standard home page
│   │   │   │       │   └── components/  # Home page sections
│   │   │   └── ...
│   │   └── shared/                 # Shared components and utilities
│   ├── assets/                     # Static assets
│   └── environments/               # Environment configurations
├── docs/                           # Documentation
└── ...
```

## Architecture

The application is built with a modular architecture to enable easy extension and maintenance:

### Core Components

- **Preview Component**: Manages the overall preview experience
- **Component Customizer**: Allows editing of component properties
- **Section Components**: Individual sections like Hero, About, Services, etc.
- **Section Hover Wrapper**: Wraps sections to provide editing capabilities

### Key Services

- **AuthService**: Handles user authentication and session management
- **TemplateService**: Fetches templates, template types, and plans
- **UserTemplateService**: Manages user template saving and loading
- **UserBuildService**: Handles the build and publish process
- **SubscriptionService**: Manages user subscriptions
- **BusinessConfigService**: Provides business-specific configurations
- **ThemeService**: Manages themes and styling
- **ToastService**: Provides user feedback through notifications

### Data Flow

1. User authenticates via AuthService
2. User selects a business type and theme via TemplateService
3. Standard template is loaded with default sections
4. User customizes sections through the Component Customizer
5. Changes are saved to the backend via UserTemplateService
6. User publishes their website via UserBuildService
7. Build status is monitored and user is provided with the published URL

## Backend Integration

The frontend integrates with a Java Spring Boot backend API. The integration points include:

### Authentication Flow

- User registration (`POST /api/security/user/creator`)
- User login (`POST /api/security/user/login`)
- Session management with JWT tokens
- Password reset and email verification

### Template Management

- Fetching template types (`GET /api/template/type/all`)
- Fetching template plans (`GET /api/template/template-plan/all`)
- Searching for templates (`GET /api/template/search`)
- Saving user templates (`POST /api/template/user-template`)
- Updating user templates (`PUT /api/template/user-template/{id}`)

### Build & Publish

- Creating builds (`POST /api/user-build`)
- Publishing websites (`POST /api/user-build/{id}/publish`)
- Monitoring build status (`GET /api/user-build/search`)

### Subscription Management

- Fetching subscriptions (`GET /api/subscription/all`)
- Creating subscriptions (`POST /api/subscription`)

## Standard vs Premium Features

### Standard Plan

- Single-page website
- Limited section customization
- Basic theme options
- Image uploads
- Two menu categories with eight items each

### Premium Plan

- Multi-page website
- Advanced customization options
- Premium themes
- Image and video uploads
- Five menu categories with fifteen items each
- Custom domain support

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Angular team for the powerful framework
- Open source community for various libraries and tools
