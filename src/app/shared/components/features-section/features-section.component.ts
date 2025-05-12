import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import {
  trigger,
  style,
  animate,
  transition,
  stagger,
  query,
  state,
} from '@angular/animations';

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
    <section class="features-section">
      <div class="container">
        <div class="section-header" [@fadeIn]>
          <h2>Why Choose Our Website Builder</h2>
          <div class="underline"></div>
          <p class="section-subtitle">
            Powerful features to help you build and grow your online presence
          </p>
        </div>

        <div class="features-grid" [@staggerFadeIn]="sanitizedFeatures.length">
          <div
            class="feature-card"
            *ngFor="let feature of sanitizedFeatures; let i = index"
            [@cardAnimation]
          >
            <div class="feature-icon-container">
              <div
                class="feature-icon"
                [innerHTML]="feature.safeIconHtml"
              ></div>
            </div>
            <div class="feature-content">
              <h3>{{ feature.title }}</h3>
              <p>{{ feature.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate(
          '600ms ease-out',
          style({ opacity: 1, transform: 'translateY(0)' })
        ),
      ]),
    ]),
    trigger('cardAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate(
          '600ms ease-out',
          style({ opacity: 1, transform: 'translateY(0)' })
        ),
      ]),
    ]),
    trigger('staggerFadeIn', [
      transition('* => *', [
        query(
          ':enter',
          [
            style({ opacity: 0, transform: 'translateY(30px)' }),
            stagger('150ms', [
              animate(
                '600ms ease-out',
                style({ opacity: 1, transform: 'translateY(0)' })
              ),
            ]),
          ],
          { optional: true }
        ),
      ]),
    ]),
  ],
  styles: [
    `
      .features-section {
        padding: 7rem 2rem;
        position: relative;
        z-index: 4;
        overflow: hidden;
        background: linear-gradient(
          180deg,
          rgba(15, 23, 42, 0.9) 0%,
          rgba(15, 23, 42, 0.95) 100%
        );
      }

      .container {
        max-width: 1200px;
        margin: 0 auto;
      }

      .section-header {
        text-align: center;
        max-width: 800px;
        margin: 0 auto 5rem;
        position: relative;
      }

      h2 {
        font-size: 2.75rem;
        font-weight: 700;
        margin-bottom: 1rem;
        color: #fff;
        display: inline-block;
        position: relative;
      }

      .underline {
        height: 3px;
        width: 80px;
        background: linear-gradient(90deg, #a78bfa, transparent);
        margin: 0.5rem auto 2rem;
        border-radius: 0px;
      }

      .section-subtitle {
        font-size: 1.25rem;
        color: rgba(255, 255, 255, 0.8);
        margin-top: 1.5rem;
        line-height: 1.6;
      }

      .features-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 2.5rem;

        @media (max-width: 1200px) {
          grid-template-columns: repeat(2, 1fr);
          gap: 2rem;
        }

        @media (max-width: 767px) {
          grid-template-columns: 1fr;
          gap: 1.75rem;
        }
      }

      .feature-card {
        background: rgba(28, 41, 71, 0.25);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 18px;
        padding: 2.5rem 2rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        transition: box-shadow 0.25s cubic-bezier(0.4, 0, 0.2, 1),
          transform 0.25s cubic-bezier(0.4, 0, 0.2, 1),
          background 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
        backdrop-filter: blur(12px);
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        overflow: hidden;

        &:before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #3e80ff, #a78bfa);
        }

        &:hover {
          transform: translateY(-10px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
          background: rgba(28, 41, 71, 0.5);

          .feature-icon-container {
            transform: scale(1.05);
            box-shadow: 0 0 0 8px rgba(62, 128, 255, 0.15);

            .feature-icon {
              transform: scale(1.15);
              svg {
                filter: drop-shadow(0 0 8px rgba(62, 128, 255, 0.5));
              }
            }
          }
        }
      }

      .feature-icon-container {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 90px;
        height: 90px;
        border-radius: 50%;
        margin-bottom: 2rem;
        background: rgba(23, 34, 59, 0.5);
        box-shadow: 0 0 0 6px rgba(62, 128, 255, 0.1);
        transition: box-shadow 0.25s cubic-bezier(0.4, 0, 0.2, 1),
          transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .feature-icon {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 70px;
        height: 70px;
        border-radius: 50%;
        background: rgba(23, 34, 59, 0.8);
        transition: box-shadow 0.25s cubic-bezier(0.4, 0, 0.2, 1),
          transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);

        svg {
          width: 40px;
          height: 40px;
          transition: all 0.4s ease;
        }
      }

      .feature-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        cursor: default;
      }

      h3 {
        font-size: 1.5rem;
        font-weight: 600;
        margin-bottom: 1.25rem;
        color: #fff;
      }

      p {
        color: rgba(255, 255, 255, 0.85);
        font-size: 1.05rem;
        line-height: 1.6;
        margin-bottom: 0;
        flex: 1;
      }

      @media (max-width: 1200px) {
        .features-section {
          padding: 6rem 2rem;
        }

        h2 {
          font-size: 2.5rem;
        }

        .section-subtitle {
          font-size: 1.2rem;
        }
      }

      @media (max-width: 991px) {
        .features-section {
          padding: 5rem 1.5rem;
        }

        h2 {
          font-size: 2.25rem;
        }

        .section-subtitle {
          font-size: 1.1rem;
        }

        .feature-card {
          padding: 2rem;
        }

        .feature-icon-container {
          width: 80px;
          height: 80px;
          margin-bottom: 1.5rem;
        }

        .feature-icon {
          width: 60px;
          height: 60px;
        }

        h3 {
          font-size: 1.35rem;
          margin-bottom: 1rem;
        }

        p {
          font-size: 1rem;
        }
      }

      @media (max-width: 767px) {
        .features-section {
          padding: 4.5rem 1.25rem;
        }

        h2 {
          font-size: 2rem;
        }

        .section-subtitle {
          font-size: 1rem;
          margin-top: 1.25rem;
        }

        .feature-card {
          padding: 1.75rem;
        }
      }

      @media (max-width: 480px) {
        .features-section {
          padding: 4rem 1rem;
        }

        .section-header {
          margin-bottom: 3.5rem;
        }

        h2 {
          font-size: 1.85rem;
        }
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
                  <path d="M11.99 2C6.47 2 2 6.48 2 12C2 17.52 6.47 22 11.99 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 11.99 2ZM16.23 18L12 15.45L7.77 18L8.89 13.19L5.16 9.96L10.08 9.54L12 5L13.92 9.53L18.84 9.95L15.11 13.18L16.23 18Z" fill="#3e80ff"/>
                </svg>`,
    },
    {
      title: 'Mobile Responsive',
      description:
        'All websites are fully responsive and optimized for all devices and screen sizes.',
      iconSvg: `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 4H6C4.9 4 4 4.9 4 6V18C4 19.1 4.9 20 6 20H18C19.1 20 20 19.1 20 18V6C20 4.9 19.1 4 18 4ZM17 12H13V16H11V12H7V10H11V6H13V10H17V12Z" fill="#a78bfa"/>
                </svg>`,
    },
    {
      title: 'Fast & Easy',
      description:
        'Launch your website in minutes with our intuitive builder and no coding required.',
      iconSvg: `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="#3e80ff"/>
                </svg>`,
    },
    {
      title: 'Secure & Reliable',
      description:
        'Your website is hosted on secure servers with 99.9% uptime and fast loading times.',
      iconSvg: `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1ZM17.13 17.13L10 14V7H12V12.56L17.84 15.16L17.13 17.13Z" fill="#a78bfa"/>
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
