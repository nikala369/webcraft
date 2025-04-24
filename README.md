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

## Technology Stack

- **Frontend**: Angular (v19+), TypeScript, SCSS, Angular Signals
- **Backend**: Java Spring Boot API (consumed by the frontend)
- **State Management**: Angular Signals for reactive state management
- **Authentication**: JWT-based authentication

## Architecture

### Frontend Architecture

The Webcraft frontend is built on Angular and follows a component-based architecture with state management through Angular Signals:

- **Core Module**: Services, models, and utilities used throughout the application
- **Pages**: Top-level page components (Dashboard, Preview, Auth)
- **Components**: Reusable UI components
- **Services**: Backend API communication and data management

### Key Components

- **Preview Component**: The main website builder interface where users customize their templates
- **Theme Switcher**: Allows users to select different themes for their website
- **Business Type Selector**: Helps users choose their business category
- **Component Customizer**: Modal interface for editing specific website sections
- **Templates Component**: Displays saved templates in the dashboard

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

## Development Guide

### Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the development server: `npm start`

### Key Development Notes

- **Template-Based Approach**: Webcraft is specifically designed as a template-based builder, not a drag-and-drop editor
- **API Integration**: The frontend consumes a Java backend API - see `src/app/core/services` for implementation details
- **State Management**: Use Angular Signals for state management to ensure reactivity and performance
- **Component Guidelines**: Follow the component structure in `docs/component-development-guide.md`
- **Backend Integration**: Refer to `docs/backend-integration-guide.md` for details on API communication

### Building & Deployment

1. Build the project: `npm run build`
2. Deploy the static files to your hosting platform

## User Flow

1. **Plan Selection**: Choose between Standard or Premium plan
2. **Business Type Selection**: Select your business category
3. **Customization**: Customize your website template with your content and styling preferences
4. **Publishing**: Save and publish your website

## Contributing

Please review the development guides before contributing to the project:

- Component Development: `docs/component-development-guide.md`
- Backend Integration: `docs/backend-integration-guide.md`
- Customization Schema: `standard-customization-schema.json`

## License

[Proprietary]
