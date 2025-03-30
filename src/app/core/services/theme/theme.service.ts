import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ThemeStyleDto, ThemeData, ThemeListItem } from './theme';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Customizations } from '../../models/website-customizations';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private apiUrl: string = environment.apiUrl;
  private baseUrl: string = this.apiUrl + '/theme';
  private httpClient = inject(HttpClient);

  /**
   * Get theme by ID from the API
   * Includes both CSS content and customizations
   */
  getById(id: number): Observable<ThemeData> {
    return this.httpClient.get<ThemeStyleDto>(`${this.baseUrl}/${id}`).pipe(
      map((response) => ({
        id: response.id,
        name: response.themeName,
        cssContent: response.cssContent || '',
        businessType: response.businessType || 'restaurant',
        customizations:
          response.customizations || this.getDefaultCustomizations(id),
      })),
      catchError((error) => {
        console.warn('API call failed, using mock theme data:', error);
        return of(this.getMockTheme(id));
      })
    );
  }

  /**
   * Get all themes from the API
   */
  getAll(): Observable<ThemeListItem[]> {
    return this.httpClient.get<ThemeStyleDto[]>(`${this.baseUrl}/all`).pipe(
      map((themes) =>
        themes.map((theme) => ({
          id: theme.id,
          name: theme.themeName,
          // Use type assertion to ensure planType is the correct union type
          planType: (theme.planType || 'standard') as 'standard' | 'premium',
          businessType: theme.businessType || 'restaurant',
        }))
      ),
      catchError((error) => {
        console.warn('API call failed, using mock theme list:', error);
        return of(this.getMockThemesList());
      })
    );
  }

  /**
   * Get themes filtered by business type
   * @param businessType The business type to filter by
   * @param plan The pricing plan (standard or premium)
   * @returns Observable of filtered themes
   */
  getThemesByBusinessType(
    businessType: string,
    plan: string
  ): Observable<ThemeListItem[]> {
    console.log(
      `ThemeService: Getting themes for ${businessType} and plan ${plan}`
    );

    // Skip cache and force a new request
    return this.httpClient
      .get<ThemeStyleDto[]>(`${this.baseUrl}/all`, {
        headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
      })
      .pipe(
        map((themes) =>
          themes
            .filter((theme) => {
              // Check if theme has business types array
              if (theme.businessTypes && Array.isArray(theme.businessTypes)) {
                return (
                  theme.businessTypes.includes(businessType) &&
                  // For standard plan, only return non-premium-exclusive themes
                  (plan === 'standard' ? !theme.isPremiumOnly : true)
                );
              }

              // Fall back to old behavior if businessTypes array not present
              return (
                (theme.businessType === businessType || !theme.businessType) &&
                // Only return premium themes for premium plan or all themes for standard that aren't premium-only
                (plan === 'standard' ? theme.planType !== 'premium-only' : true)
              );
            })
            .map((theme) => ({
              id: theme.id,
              name: theme.themeName,
              planType: (theme.planType || 'standard') as
                | 'standard'
                | 'premium',
              businessType: theme.businessType || 'restaurant',
              businessTypes: theme.businessTypes,
              isPremiumOnly: theme.isPremiumOnly,
            }))
        ),
        catchError((error) => {
          console.warn(
            'API call failed, using mock filtered theme list:',
            error
          );

          // Generate different mock themes for each business type to demonstrate different options
          const mockThemesByBusinessType: Record<string, ThemeListItem[]> = {
            restaurant: [
              {
                id: 101,
                name: 'Restaurant Light',
                planType: 'standard',
                businessType: 'restaurant',
              },
              {
                id: 102,
                name: 'Restaurant Dark',
                planType: 'standard',
                businessType: 'restaurant',
              },
              {
                id: 103,
                name: 'Restaurant Premium',
                planType: 'premium',
                businessType: 'restaurant',
              },
            ],
            salon: [
              {
                id: 201,
                name: 'Salon Elegant',
                planType: 'standard',
                businessType: 'salon',
              },
              {
                id: 202,
                name: 'Salon Modern',
                planType: 'standard',
                businessType: 'salon',
              },
              {
                id: 203,
                name: 'Salon Premium',
                planType: 'premium',
                businessType: 'salon',
              },
            ],
            portfolio: [
              {
                id: 301,
                name: 'Portfolio Light',
                planType: 'standard',
                businessType: 'portfolio',
              },
              {
                id: 302,
                name: 'Portfolio Dark',
                planType: 'standard',
                businessType: 'portfolio',
              },
              {
                id: 303,
                name: 'Portfolio Premium',
                planType: 'premium',
                businessType: 'portfolio',
              },
            ],
            retail: [
              {
                id: 401,
                name: 'Retail Clean',
                planType: 'standard',
                businessType: 'retail',
              },
              {
                id: 402,
                name: 'Retail Modern',
                planType: 'standard',
                businessType: 'retail',
              },
              {
                id: 403,
                name: 'Retail Premium',
                planType: 'premium',
                businessType: 'retail',
              },
            ],
            architecture: [
              {
                id: 501,
                name: 'Architecture Minimal',
                planType: 'standard',
                businessType: 'architecture',
              },
              {
                id: 502,
                name: 'Architecture Bold',
                planType: 'standard',
                businessType: 'architecture',
              },
              {
                id: 503,
                name: 'Architecture Premium',
                planType: 'premium',
                businessType: 'architecture',
              },
            ],
          };

          // Default themes if no specific business type themes are found
          const defaultThemes = [
            {
              id: 1,
              name: 'Default Light',
              planType: 'standard',
              businessType: 'all',
            },
            {
              id: 2,
              name: 'Default Dark',
              planType: 'standard',
              businessType: 'all',
            },
            {
              id: 3,
              name: 'Default Premium',
              planType: 'premium',
              businessType: 'all',
            },
          ];

          // Get themes for the requested business type
          const businessTypeThemes =
            mockThemesByBusinessType[businessType] || defaultThemes;

          // Filter by plan
          return of(
            businessTypeThemes.filter(
              (theme) => plan === 'premium' || theme.planType === 'standard'
            )
          );
        })
      );
  }

  /**
   * Get available themes for a specific plan
   */
  getAvailableThemes(
    plan: 'standard' | 'premium'
  ): Observable<ThemeListItem[]> {
    return this.httpClient
      .get<ThemeListItem[]>(`${this.baseUrl}/by-plan/${plan}`)
      .pipe(
        catchError((error) => {
          console.warn('API call failed, using mock themes by plan:', error);
          // When backend isn't ready, filter mock themes by plan type
          return this.getAll().pipe(
            map((themes) => themes.filter((theme) => theme.planType === plan))
          );
        })
      );
  }

  /**
   * Mock data for development and fallback
   */
  private getMockTheme(id: number): ThemeData {
    const mockThemes = [
      {
        id: 1,
        name: 'Business Blue',
        cssContent: `:root {
          --primary-color: #0984e3;
          --secondary-color: #74b9ff;
          --header-bg: #0984e3;
          --header-text: #ffffff;
          --footer-bg: #2d3436;
          --footer-text: #ffffff;
        }`,
        businessType: 'restaurant',
        customizations: {
          fontConfig: {
            fontId: 1,
            family: 'Roboto',
            fallback: 'sans-serif',
          },
          header: {
            backgroundColor: '#161b33',
            textColor: '#f5f5f5',
            logoUrl: '',
            menuItems: [
              { id: 1, label: 'Home', link: '/' },
              { id: 2, label: 'About', link: '/about' },
              { id: 3, label: 'Contact', link: '/contact' },
            ],
          },
          pages: {
            home: {
              hero1: {
                backgroundImage: 'assets/standard-hero1/background-image2.jpg',
                title: 'Grow Your Business With Us',
                subtitle:
                  'Professional solutions tailored to your business needs',
                layout: 'center' as 'center' | 'left' | 'right',
                showLogo: true,
                titleColor: '#ffffff',
                subtitleColor: '#f0f0f0',
                textShadow: 'medium' as 'none' | 'light' | 'medium' | 'heavy',
                showPrimaryButton: true,
                primaryButtonText: 'GET STARTED',
                primaryButtonColor: '#fff',
                primaryButtonTextColor: '#000',
                primaryButtonLink: '/contact',
              },
              hero2: {
                backgroundImage: 'assets/themes/theme1/services-bg.jpg',
                title: 'Our Services',
                subtitle: 'Discover what we can do for you',
              },
            },
            about: {},
            contact: {},
          },
          footer: {
            backgroundColor: '#1a1a1a',
            textColor: '#ffffff',
            copyrightText: '© 2025 YourBusiness',
          },
        },
      },
      {
        id: 2,
        name: 'Modern Green',
        cssContent: `:root {
          --primary-color: #2c8c4d;
          --secondary-color: #ffc107;
          --header-bg: #2c8c4d;
          --header-text: #ffffff;
          --footer-bg: #1e5e33;
          --footer-text: #ffffff;
        }`,
        businessType: 'salon',
        customizations: {
          fontConfig: {
            fontId: 1,
            family: 'Roboto',
            fallback: 'sans-serif',
          },
          header: {
            backgroundColor: '#2c8c4d',
            textColor: '#ffffff',
            logoUrl: '',
            menuItems: [
              { id: 1, label: 'Home', link: '/' },
              { id: 2, label: 'Services', link: '/services' },
              { id: 3, label: 'About', link: '/about' },
              { id: 4, label: 'Contact', link: '/contact' },
            ],
          },
          pages: {
            home: {
              hero1: {
                backgroundImage: 'assets/standard-hero1/background-image1.jpg',
                title: 'Eco-Friendly Solutions',
                subtitle: 'Sustainable approaches for a better tomorrow',
                layout: 'left' as 'center' | 'left' | 'right',
                showLogo: false,
                titleColor: '#ffffff',
                subtitleColor: '#f0f0f0',
                textShadow: 'medium' as 'none' | 'light' | 'medium' | 'heavy',
                showPrimaryButton: true,
                primaryButtonText: 'LEARN MORE',
                primaryButtonColor: '#ffffff',
                primaryButtonTextColor: '#2c8c4d',
                primaryButtonLink: '/services',
              },
              hero2: {
                backgroundImage: 'assets/themes/theme2/services-bg.jpg',
                title: 'What We Offer',
                subtitle: 'Comprehensive solutions for your needs',
              },
            },
            about: {},
            contact: {},
          },
          footer: {
            backgroundColor: '#1e5e33',
            textColor: '#ffffff',
            copyrightText: '© 2025 GreenFuture',
          },
        },
      },
      {
        id: 7,
        name: 'Creative Purple',
        cssContent: `:root {
          --primary-color: #5e2c8c;
          --secondary-color: #ff9800;
          --header-bg: #5e2c8c;
          --header-text: #ffffff;
          --footer-bg: #3a1c57;
          --footer-text: #ffffff;
        }`,
        businessType: 'portfolio',
        customizations: {
          fontConfig: {
            fontId: 1,
            family: 'Roboto',
            fallback: 'sans-serif',
          },
          header: {
            backgroundColor: '#5e2c8c',
            textColor: '#ffffff',
            logoUrl: '',
            menuItems: [
              { id: 1, label: 'Home', link: '/' },
              { id: 2, label: 'Portfolio', link: '/portfolio' },
              { id: 3, label: 'About', link: '/about' },
              { id: 4, label: 'Contact', link: '/contact' },
            ],
          },
          pages: {
            home: {
              hero1: {
                backgroundImage: 'assets/standard-hero1/background-image3.jpg',
                title: 'Creative Design Studio',
                subtitle: 'Bringing your ideas to life with innovative design',
                layout: 'right' as 'center' | 'left' | 'right',
                showLogo: true,
                titleColor: '#ffffff',
                subtitleColor: '#f0f0f0',
                textShadow: 'heavy' as 'none' | 'light' | 'medium' | 'heavy',
                showPrimaryButton: true,
                primaryButtonText: 'VIEW PORTFOLIO',
                primaryButtonColor: '#ff9800',
                primaryButtonTextColor: '#ffffff',
                primaryButtonLink: '/portfolio',
              },
              hero2: {
                backgroundImage: 'assets/themes.jpg',
                title: 'Our Design Process',
                subtitle: 'From concept to completion',
              },
            },
            about: {},
            contact: {},
          },
          footer: {
            backgroundColor: '#3a1c57',
            textColor: '#ffffff',
            copyrightText: '© 2025 CreativeVision',
          },
        },
      },
      // Premium themes
      {
        id: 4,
        name: 'Premium Corporate',
        cssContent: `:root {
          --primary-color: #1a2942;
          --secondary-color: #00bcd4;
          --header-bg: #1a2942;
          --header-text: #ffffff;
          --footer-bg: #0d1520;
          --footer-text: #ffffff;
        }`,
        businessType: 'architecture',
        customizations: {
          fontConfig: {
            fontId: 1,
            family: 'Roboto',
            fallback: 'sans-serif',
          },
          header: {
            backgroundColor: '#1a2942',
            textColor: '#ffffff',
            logoUrl: '',
            menuItems: [
              { id: 1, label: 'Home', link: '/' },
              { id: 2, label: 'Services', link: '/services' },
              { id: 3, label: 'About', link: '/about' },
              { id: 4, label: 'Team', link: '/team' },
              { id: 5, label: 'Contact', link: '/contact' },
            ],
          },
          pages: {
            home: {
              hero1: {
                backgroundImage: 'assets/themes/theme4/hero-bg.jpg',
                title: 'Enterprise Solutions',
                subtitle:
                  'Transforming businesses with cutting-edge technology',
                layout: 'center' as 'center' | 'left' | 'right',
                showLogo: true,
                titleColor: '#ffffff',
                subtitleColor: '#e0e0e0',
                textShadow: 'medium' as 'none' | 'light' | 'medium' | 'heavy',
                showPrimaryButton: true,
                primaryButtonText: 'SCHEDULE CONSULTATION',
                primaryButtonColor: '#00bcd4',
                primaryButtonTextColor: '#ffffff',
                primaryButtonLink: '/contact',
              },
              hero2: {
                backgroundImage: 'assets/themes/theme4/services-bg.jpg',
                title: 'Premium Services',
                subtitle: 'Tailored solutions for enterprise clients',
              },
            },
            about: {},
            contact: {},
          },
          footer: {
            backgroundColor: '#0d1520',
            textColor: '#ffffff',
            copyrightText: '© 2025 EnterpriseEdge',
          },
        },
      },
      // Additional premium themes (5-6) would go here
    ];

    return mockThemes.find((theme) => theme.id === id) || mockThemes[0];
  }

  private getMockThemesList(): ThemeListItem[] {
    return [
      {
        id: 1,
        name: 'Business Blue',
        planType: 'standard',
        businessType: 'restaurant',
      },
      {
        id: 2,
        name: 'Modern Green',
        planType: 'standard',
        businessType: 'salon',
      },
      {
        id: 3,
        name: 'Creative Purple',
        planType: 'standard',
        businessType: 'portfolio',
      },
      {
        id: 4,
        name: 'Premium Corporate',
        planType: 'premium',
        businessType: 'architecture',
      },
      {
        id: 5,
        name: 'Premium Luxury',
        planType: 'premium',
        businessType: 'retail',
      },
      {
        id: 6,
        name: 'Premium Tech',
        planType: 'premium',
        businessType: 'portfolio',
      },
    ];
  }

  /**
   * Fallback customizations if API doesn't provide them
   */
  private getDefaultCustomizations(themeId: number): Customizations {
    return this.getMockTheme(themeId).customizations;
  }
}
