# Website Builder Backend Integration

This document outlines the JSON schema for the website builder application, focusing on the standard structure components and global elements.

## Overview

The website builder uses a comprehensive JSON structure to configure the website's appearance and content. This includes:

1. Global settings (theme, fonts, etc.)
2. Header and footer configuration
3. Page-specific content organized by section
4. Different features based on plan type (standard or premium)

## JSON Schema

```json
{
  "id": 1, // Unique identifier for the website
  "fontConfig": {
    // Font configuration
    "fontId": 1, // Font ID from the available fonts list
    "family": "Roboto", // Font family name
    "fallback": "sans-serif" // Fallback font category
  },
  "header": {
    // Header configuration
    "backgroundColor": "#161b33", // Background color
    "textColor": "#f5f5f5", // Text color
    "logoUrl": "path/to/logo.png", // Logo URL (optional)
    "menuItems": [
      // Navigation menu items
      { "id": 1, "label": "Home", "link": "/" },
      { "id": 2, "label": "About", "link": "/about" },
      { "id": 3, "label": "Contact", "link": "/contact" }
    ]
  },
  "pages": {
    "home": {
      // Home page configuration
      "hero1": {
        // Hero section
        "backgroundImage": "assets/standard-hero1/background-image2.jpg",
        "title": "Grow Your Business With Us",
        "subtitle": "Professional solutions tailored to your business needs",
        "layout": "center", // Options: "center", "left", "right"
        "showLogo": true, // Whether to show the logo in hero
        "titleColor": "#ffffff", // Title text color
        "subtitleColor": "#f0f0f0", // Subtitle text color
        "textShadow": "medium" // Options: "none", "light", "medium", "heavy"
      },
      "about": {
        // About section
        "title": "About Us",
        "subtitle": "Our Story",
        "storyTitle": "Our Story",
        "storyText": "We are dedicated to providing exceptional service and quality...",
        "missionTitle": "Our Mission",
        "missionText": "Our mission is to provide high-quality services...",
        "imageUrl": "assets/standard-hero1/background-image2.jpg",
        "backgroundColor": "#ffffff",
        "textColor": "#333333"
      },
      "contact": {
        // Contact section
        "title": "Contact Us",
        "subtitle": "Get in touch with us",
        "address": "123 Business Street\nAnytown, ST 12345",
        "email": "info@yourbusiness.com",
        "formTitle": "Send a Message",
        "formButtonText": "Send Message",
        "backgroundColor": "#f8f8f8",
        "textColor": "#333333"
      }
    }
  },
  "footer": {
    // Footer configuration
    "backgroundColor": "#1a1a1a", // Background color
    "textColor": "#ffffff", // Text color
    "copyrightText": "© 2025 Your Company", // Copyright text
    "logoUrl": "", // Footer logo URL (optional)
    "tagline": "Your business tagline", // Company tagline
    "showSocialLinks": true, // Whether to show social links
    "socialUrls": {
      // Social media URLs
      "facebook": "https://facebook.com/yourbusiness",
      "instagram": "https://instagram.com/yourbusiness",
      "twitter": "https://twitter.com/yourbusiness",
      "linkedin": "https://linkedin.com/company/yourbusiness",
      "tiktok": "https://tiktok.com/@yourbusiness"
    }
  }
}
```

## Plan-Specific Features

### Standard Plan

The standard plan includes these main sections:

- Hero section (with background image, title, subtitle)
- About section (with company story, mission, and image)
- Contact section (with address, email, contact form)
- Basic header and footer

### Premium Plan

The premium plan includes all standard features plus:

- Multi-page support
- Additional header menu items
- Enhanced footer with social links and legal links
- Address and business hours in contact section
- Additional content sections (services, testimonials, etc.)

## Business Type Customization

The application supports different business types with specific defaults:

- `restaurant`: Food service business (includes hours, menus)
- `salon`: Beauty service business (includes service offerings, booking)
- `architecture`: Design/building business (includes project portfolio)
- `portfolio`: Personal/professional portfolio (minimizes address display)

Each business type has different default content and layout preferences.

## Backend API Integration Points

### 1. Website Configuration Endpoints

```
GET /api/websites/{id}          - Get website configuration
POST /api/websites              - Create new website
PUT /api/websites/{id}          - Update website configuration
DELETE /api/websites/{id}       - Delete website
```

### 2. Email Form Handling

The contact form requires a backend endpoint for email handling:

```
POST /api/contact               - Process contact form submissions
```

Payload structure:

```json
{
  "name": "User Name",
  "email": "user@example.com",
  "message": "Form message content",
  "recipient": "business@example.com"
}
```

### 3. Image Upload

```
POST /api/upload                - Upload images for the website
```

## Validation Rules

1. Colors should be valid hex codes
2. URLs should be valid and properly formatted
3. Required fields include:
   - Header menu items (min 3 for standard, unlimited for premium)
   - Hero section title and subtitle
   - Contact email for form processing

## Default Values Generation

When creating a new website, the backend should generate defaults based on:

1. Selected theme
2. Business type
3. Plan type (standard/premium)

Use the mock themes in the `ThemeService` as reference for appropriate defaults.

## Notes for Backend Implementation

1. Store complete JSON configuration for each website
2. Optimize image paths for CDN delivery
3. Implement proper validation for all fields
4. Provide appropriate error messages for validation failures
5. Support incremental updates (partial configuration changes)
6. Implement security measures to prevent malicious content

## Version Compatibility

This schema is compatible with website builder version 1.0 and above. Future versions may include additional fields or capabilities, but will maintain backward compatibility with this schema.
