import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

interface Feature {
  title: string;
  description: string;
  iconSvg: string;
  safeIconHtml?: SafeHtml;
}

@Component({
  selector: 'app-features-section',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="features-section">
      <h2>Why Choose Our Website Builder</h2>
      <div class="features-grid">
        <div class="feature-card" *ngFor="let feature of sanitizedFeatures">
          <div class="feature-icon" [innerHTML]="feature.safeIconHtml"></div>
          <h3>{{ feature.title }}</h3>
          <p>{{ feature.description }}</p>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .features-section {
        width: 100%;
        max-width: 1200px;
        margin: 60px auto;
        padding: 0 1rem;
      }

      h2 {
        text-align: center;
        font-size: 2rem;
        font-weight: 700;
        margin-bottom: 2rem;
        color: #ffffff;
        position: relative;
      }

      h2:after {
        content: '';
        position: absolute;
        bottom: -10px;
        left: 50%;
        transform: translateX(-50%);
        width: 60px;
        height: 3px;
        background: #2876ff;
        border-radius: 3px;
      }

      .features-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 1.5rem;
      }

      @media (max-width: 1024px) {
        .features-grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }

      @media (max-width: 768px) {
        .features-grid {
          grid-template-columns: 1fr;
        }
      }

      .feature-card {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 10px;
        padding: 1.5rem;
        transition: all 0.3s ease;
        text-align: center;
      }

      .feature-card:hover {
        transform: translateY(-5px);
        background: rgba(255, 255, 255, 0.07);
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
      }

      .feature-icon {
        margin-bottom: 1rem;
        display: flex;
        justify-content: center;
      }

      .feature-icon svg {
        width: 40px;
        height: 40px;
      }

      h3 {
        font-size: 1.2rem;
        font-weight: 600;
        margin-bottom: 0.75rem;
        color: #ffffff;
      }

      p {
        color: rgba(255, 255, 255, 0.7);
        font-size: 0.9rem;
        line-height: 1.5;
        margin-bottom: 0;
      }
    `,
  ],
})
export class FeaturesSectionComponent implements OnInit {
  features: Feature[] = [
    {
      title: 'Professional Design',
      description:
        'Create stunning professional websites with our easy-to-use builder and premium templates.',
      iconSvg: `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11.99 2C6.47 2 2 6.48 2 12C2 17.52 6.47 22 11.99 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 11.99 2ZM16.23 18L12 15.45L7.77 18L8.89 13.19L5.16 9.96L10.08 9.54L12 5L13.92 9.53L18.84 9.95L15.11 13.18L16.23 18Z" fill="#4285F4"/>
                </svg>`,
    },
    {
      title: 'Mobile Responsive',
      description:
        'All websites are fully responsive and optimized for all devices and screen sizes.',
      iconSvg: `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 4H6C4.9 4 4 4.9 4 6V18C4 19.1 4.9 20 6 20H18C19.1 20 20 19.1 20 18V6C20 4.9 19.1 4 18 4ZM17 12H13V16H11V12H7V10H11V6H13V10H17V12Z" fill="#34A853"/>
                </svg>`,
    },
    {
      title: 'Fast & Easy',
      description:
        'Launch your website in minutes with our intuitive builder and no coding required.',
      iconSvg: `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="#FBBC05"/>
                </svg>`,
    },
    {
      title: 'Secure & Reliable',
      description:
        'Your website is hosted on secure servers with 99.9% uptime and fast loading times.',
      iconSvg: `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1ZM17.13 17.13L10 14V7H12V12.56L17.84 15.16L17.13 17.13Z" fill="#EA4335"/>
                </svg>`,
    },
  ];

  sanitizedFeatures: Feature[] = [];

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    // Sanitize the SVG content to safely use with innerHTML
    this.sanitizedFeatures = this.features.map((feature) => ({
      ...feature,
      safeIconHtml: this.sanitizer.bypassSecurityTrustHtml(feature.iconSvg),
    }));
  }
}
