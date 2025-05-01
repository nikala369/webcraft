import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

/**
 * Interface for subscription entity
 */
export interface SubscriptionPlan {
  id: string;
  type: 'BASIC' | 'ADVANCED';
  description: string;
  priceCents: number;
  stripePriceId: string | null;
}

/**
 * Interface for subscription creation
 */
export interface CreateSubscriptionDto {
  type: 'BASIC' | 'ADVANCED';
  description: string;
  priceCents: number;
}

/**
 * Service for managing subscriptions
 */
@Injectable({
  providedIn: 'root',
})
export class SubscriptionService {
  constructor(private http: HttpClient) {}

  /**
   * Fetch all available subscription plans from the backend.
   * Always fetches fresh data (no caching) to ensure up-to-date pricing.
   * GET /api/subscription/all
   */
  getAllPlans(): Observable<SubscriptionPlan[]> {
    const url = `${environment.apiUrl}${environment.apiPrefix}/subscription/all`;
    return this.http.get<SubscriptionPlan[]>(url).pipe(
      catchError((error) => {
        console.error('Error fetching subscription plans:', error);
        return of([]);
      })
    );
  }

  /**
   * Create a new subscription (admin/management use)
   */
  createSubscription(
    data: CreateSubscriptionDto
  ): Observable<SubscriptionPlan> {
    return this.http.post<SubscriptionPlan>('/api/subscription', data);
  }

  /**
   * Get all subscriptions for the current user
   * GET /api/subscription/user
   */
  getUserSubscriptions(): Observable<any[]> {
    return this.http.get<any[]>('/api/subscription/user');
  }

  // (Future) Add methods for upgrade, cancel, etc. as needed
}
