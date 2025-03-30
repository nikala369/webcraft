# Backend Integration Guide

This document outlines how to integrate the backend with the frontend for the Website Builder application. It covers the data structure, API endpoints, and key considerations for implementation.

## Data Structure

The website builder uses a structured customization object that contains all website settings. The structure is defined in `standard-customization-schema.json` and follows this general pattern:

```
Customizations
├── fontConfig
├── header
├── pages
│   └── home
│       ├── hero1
│       ├── about
│       ├── services (for salon/architecture)
│       ├── menu (for restaurant)
│       ├── projects (for architecture/portfolio)
│       └── contact
└── footer
```

Each section (like hero1, about, etc.) has its own data structure with fields for content, styling, and configuration.

## Standard vs Premium Plans

The application supports two plan types:

1. **Standard Plan**: All sections are under the 'home' page with a single-page structure

   - Structure: `pages.home.{section}`
   - Example: `pages.home.hero1`, `pages.home.about`, etc.

2. **Premium Plan**: Features multiple pages with sections on each page
   - Structure: `pages.{pageName}.{section}`
   - Example: `pages.home.hero1`, `pages.about.content`, etc.

## Media Handling

Media files (images and videos) need special handling:

### Images

- Stored as URL paths to files on the server
- Temporary files use base64 data URLs during editing
- For production, convert to server file paths

### Videos

- Limited support in standard plan
- Premium plan features full video support
- Temporary video upload uses base64 encoding in frontend
- Backend should store video files on server and return URL paths

## Required API Endpoints

The backend needs to implement these key endpoints:

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user info

### Customizations

- `GET /api/customizations/{userId}` - Get user's saved customizations
- `POST /api/customizations/{userId}` - Save user's customizations
- `PUT /api/customizations/{userId}` - Update user's customizations

### Media Management

- `POST /api/media/upload` - Upload image/video files
- `DELETE /api/media/{mediaId}` - Delete media file

### Theme Management

- `GET /api/themes` - Get all available themes
- `GET /api/themes/filter?businessType={type}&plan={plan}` - Get themes by business type and plan
- `GET /api/themes/{themeId}` - Get a specific theme

## Data Model for Business Types

The application supports different business types, each with specific sections:

- **Restaurant**: hero1, about, menu, contact
- **Salon**: hero1, about, services, contact
- **Architecture**: hero1, about, projects, contact
- **Portfolio**: hero1, about, projects, contact

Each business type has default content tailored to its needs. The `BusinessConfigService` in the frontend handles this, but the backend should provide appropriate customization templates based on business type.

## API Response Format

All API responses should follow this general structure:

```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Success message"
}
```

For errors:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message"
  }
}
```

## Implementation Considerations

1. **Storage**: Handle large media files efficiently using cloud storage
2. **Caching**: Implement caching for theme data and common customizations
3. **Validation**: Validate customization data against the schema before saving
4. **Versioning**: Include version information in customization data for future compatibility
5. **User Preferences**: Store user preferences separately from customization data
6. **Rate Limiting**: Implement rate limiting for media uploads and saves
7. **Content Security**: Sanitize user input to prevent XSS attacks

## Example Implementation (JSON Server for Development)

For initial development, you can create a simple API with JSON Server:

```json
// db.json
{
  "users": [
    {
      "id": 1,
      "email": "user@example.com",
      "name": "Test User",
      "plan": "standard"
    }
  ],
  "customizations": [
    {
      "id": 1,
      "userId": 1,
      "businessType": "restaurant",
      "themeId": 1,
      "data": {
        "fontConfig": { "fontId": 1, "family": "Roboto", "fallback": "sans-serif" },
        "header": { "backgroundColor": "#161b33", "textColor": "#ffffff" },
        "pages": {
          "home": {
            "hero1": {
              "backgroundImage": "/assets/images/restaurant-hero.jpg",
              "title": "Fine Dining Experience",
              "subtitle": "Exceptional cuisine in an unforgettable atmosphere"
            }
          }
        },
        "footer": {
          "backgroundColor": "#161b33",
          "textColor": "#ffffff",
          "copyrightText": "© 2023 Restaurant Name"
        }
      }
    }
  ],
  "themes": [
    {
      "id": 1,
      "name": "Restaurant Modern",
      "businessType": "restaurant",
      "plan": "standard",
      "cssContent": "/* CSS content */"
    }
  ]
}
```

Start with JSON Server for rapid prototyping before implementing the full backend.
