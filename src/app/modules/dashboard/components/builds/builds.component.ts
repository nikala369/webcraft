import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-builds',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <header class="dashboard-header">
        <h1 class="dashboard-title">Build History</h1>
        <button class="build-button">New Build</button>
      </header>

      <div class="builds-empty" *ngIf="!hasBuilds">
        <div class="empty-illustration">
          <svg
            width="120"
            height="120"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2 20V4C2 3.44772 2.44772 3 3 3H21C21.5523 3 22 3.44772 22 4V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20Z"
              stroke="currentColor"
              stroke-width="2"
            />
            <path
              d="M12 7V17"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
            <path
              d="M7 12H17"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </div>
        <h2 class="empty-title">No Builds Yet</h2>
        <p class="empty-description">
          Once you create templates, you can build them into live websites.
        </p>
        <button class="empty-button">Go to Templates</button>
      </div>

      <!-- This section will be shown when user has build history -->
      <!-- <div class="builds-list">
        Build history items will be here
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

      .build-button {
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

      .build-button:hover {
        background-color: var(--primary-color-hover, #2563eb);
      }

      .build-button:active {
        transform: translateY(1px);
      }

      /* Empty state styling */
      .builds-empty {
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

        .builds-empty {
          padding: 3rem 1rem;
        }
      }
    `,
  ],
})
export class BuildsComponent {
  // Placeholder for builds data - will be replaced with actual data later
  hasBuilds = false;
}
