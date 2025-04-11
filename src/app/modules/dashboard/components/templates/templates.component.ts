import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-templates',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <header class="dashboard-header">
        <h1 class="dashboard-title">My Templates</h1>
        <button class="create-button">Create New Template</button>
      </header>

      <div class="templates-empty" *ngIf="!hasTemplates">
        <div class="empty-illustration">
          <svg
            width="120"
            height="120"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4 4H20V16H4V4Z"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M4 8H20"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
            <path
              d="M8 8V16"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
            <path
              d="M9 20H15"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
            <path
              d="M12 16V20"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </div>
        <h2 class="empty-title">No Templates Yet</h2>
        <p class="empty-description">
          Get started by creating your first website template.
        </p>
        <button class="empty-button">Create Template</button>
      </div>

      <!-- This section will be shown when user has templates -->
      <!-- <div class="templates-grid">
        Template items will be here
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

      .create-button {
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

      .create-button:hover {
        background-color: var(--primary-color-hover, #2563eb);
      }

      .create-button:active {
        transform: translateY(1px);
      }

      /* Empty state styling */
      .templates-empty {
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

        .templates-empty {
          padding: 3rem 1rem;
        }
      }
    `,
  ],
})
export class TemplatesComponent {
  // Placeholder for templates data - will be replaced with actual data later
  hasTemplates = false;
}
