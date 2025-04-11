import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-domains',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <header class="dashboard-header">
        <h1 class="dashboard-title">Domain Management</h1>
        <button class="add-button">Add Domain</button>
      </header>

      <div class="domains-empty" *ngIf="!hasDomains">
        <div class="empty-illustration">
          <svg
            width="120"
            height="120"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
              stroke="currentColor"
              stroke-width="2"
            />
            <path
              d="M12 2V22"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
            <path
              d="M2 12H22"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
            <path
              d="M4 7H20"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
            <path
              d="M4 17H20"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </div>
        <h2 class="empty-title">No Domains Connected</h2>
        <p class="empty-description">
          Connect a custom domain to make your website accessible at your own
          URL.
        </p>
        <button class="empty-button">Add Your First Domain</button>
      </div>

      <!-- This section will be shown when user has domains -->
      <!-- <div class="domains-list">
        Domain items will be here
      </div> -->
    </div>
  `,
  styles: [
    `
      .dashboard-container {
        padding: 2rem;
        max-width: 1200px;
        margin: 0 auto;
      }

      .dashboard-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
      }

      .dashboard-title {
        font-size: 1.75rem;
        font-weight: 600;
        color: var(--text-color, #1e293b);
        margin: 0;
      }

      .add-button {
        background-color: var(--primary-color, #3b82f6);
        color: white;
        border: none;
        border-radius: 8px;
        padding: 0.625rem 1.25rem;
        font-weight: 500;
        font-size: 0.9375rem;
        cursor: pointer;
        transition: background-color 0.2s, transform 0.1s;
      }

      .add-button:hover {
        background-color: var(--primary-color-hover, #2563eb);
      }

      .add-button:active {
        transform: translateY(1px);
      }

      /* Empty state styling */
      .domains-empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        padding: 4rem 1rem;
        background-color: var(--card-bg-color, #ffffff);
        border-radius: 12px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
      }

      .empty-illustration {
        margin-bottom: 1.5rem;
        color: var(--text-muted-color, #94a3b8);
      }

      .empty-title {
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--text-color, #1e293b);
        margin: 0 0 0.75rem;
      }

      .empty-description {
        color: var(--text-muted-color, #64748b);
        margin: 0 0 2rem;
        max-width: 400px;
      }

      .empty-button {
        background-color: var(--primary-color, #3b82f6);
        color: white;
        border: none;
        border-radius: 8px;
        padding: 0.75rem 1.5rem;
        font-weight: 500;
        font-size: 0.9375rem;
        cursor: pointer;
        transition: background-color 0.2s, transform 0.1s;
      }

      .empty-button:hover {
        background-color: var(--primary-color-hover, #2563eb);
      }

      .empty-button:active {
        transform: translateY(1px);
      }

      /* Responsive adjustments */
      @media (max-width: 768px) {
        .dashboard-header {
          flex-direction: column;
          align-items: flex-start;
          gap: 1rem;
        }

        .domains-empty {
          padding: 3rem 1rem;
        }
      }
    `,
  ],
})
export class DomainsComponent {
  // Placeholder for domains data - will be replaced with actual data later
  hasDomains = false;
}
