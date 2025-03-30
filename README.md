# Auto Website Builder

A modern, customizable website builder that allows users to create professional websites without coding. Built with Angular 17+, TypeScript, and a modular architecture.

## Features

- **Drag-and-drop editing**: Build pages by dragging and dropping components
- **Business-specific templates**: Tailored templates for restaurants, salons, portfolios, and more
- **Responsive design**: Websites look great on all devices
- **Theme customization**: Easily change colors, fonts, and layouts
- **Media management**: Upload and manage images and videos
- **Standard and Premium plans**: Different feature sets for different user needs

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Angular CLI 17+

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

4. Open your browser and navigate to `http://localhost:4200`

## Project Structure

```
auto-website-builder/
├── src/
│   ├── app/
│   │   ├── core/                   # Core services, models, and utilities
│   │   │   ├── models/             # Data models and interfaces
│   │   │   └── services/           # Core services
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

- **CustomizationService**: Manages saving and loading of customizations
- **BusinessConfigService**: Provides business-specific configurations
- **ThemeService**: Manages themes and styling
- **ToastService**: Provides user feedback through notifications

### Data Flow

1. User selects a business type and theme
2. Standard template is loaded with default sections
3. User customizes sections through the Component Customizer
4. Changes are saved to storage (SessionStorage, soon to be backend)
5. Preview component reflects changes in real-time

## Creating New Components

See [Component Development Guide](docs/component-development-guide.md) for detailed instructions.

## Backend Integration

See [Backend Integration Guide](docs/backend-integration-guide.md) for information about the API.

## Standard vs Premium Features

### Standard Plan

- Single-page website
- Limited section customization
- Basic theme options
- Image uploads

### Premium Plan

- Multi-page website
- Advanced customization options
- Premium themes
- Image and video uploads
- Custom domain support

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Angular team for the powerful framework
- Open source community for various libraries and tools
