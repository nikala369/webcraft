# Auto Website Builder

An Angular-based visual website builder that allows users to create and customize professional websites without coding skills.

## Latest Updates & Implementation Status

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

- Fixed issue with services section not properly applying style customizations
- Added proper logging to diagnose rendering issues
- Fixed business type change not correctly updating displayed sections
- Improved computed property usage for available sections
- Resolved conflicts in component naming and methods
- Enhanced color application for descriptions and subtitles

### Next Steps

- Complete Projects Section for architecture/portfolio business types
- Finalize standard structure completely for backend integration
- Implement premium layout variations and animations

## Features

- **Drag-and-drop editing**: Build pages by dragging and dropping components
- **Business-specific templates**: Tailored templates for restaurants, salons, portfolios, and more
- **Responsive design**: Websites look great on all devices
- **Theme customization**: Easily change colors, fonts, and layouts
- **Media management**: Upload and manage images and videos
- **Standard and Premium plans**: Different feature sets for different user needs

## Recent Updates

### Services Section Improvements (Current)

- Added comprehensive color customization options:
  - Section background color
  - Text color
  - Card background color
  - Accent color
- Adjusted feature distinctions between plans:
  - Standard plan: 4 services with icons, basic information
  - Premium plan: 10 services with images, advanced options
- Made duration display premium-only for salon businesses
- Optimized layout to show 4 cards horizontally on standard plan
- Added proper featured service handling
- Enhanced styling for different business types

### Menu Section Enhancements (Previous)

- Fixed issue with the main sidebar closing when saving menu items
- Added color customization options (background, text, and card colors)
- Updated category and item limits:
  - Standard plan: 2 categories, 8 items per category
  - Premium plan: 5 categories, 15 items per category
- Enhanced menu layout to accommodate the increased number of items
- Improved the UI with better card styling and responsiveness
- Added clear visual distinction for premium features

### General Improvements

- Fixed edge cases in modal handling
- Enhanced error handling and logging
- Improved the component customizer to properly handle specialized editors
- Added new styling for plan limit indicators

## Planned Features

- Projects section editor for portfolio business type
- Team member section for business websites
- Custom color scheme generator
- Additional section templates
- Import/export functionality for templates

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

The frontend is designed to work with a Java Spring Boot backend (in development).
User authentication and template storage will be handled by the backend service.

Standard config flow:

1. Users select a website type (restaurant, salon, etc.)
2. Choose a plan tier (standard or premium)
3. The system provides appropriate templates and restrictions
4. Users customize and save their template
5. Changes are stored in their profile via backend API calls

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
