import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError, map } from 'rxjs';
import { environment } from '../../../../environments/environment';

/**
 * Interface for subscription entity
 */
export interface Subscription {
  id: string;
  type: 'BASIC' | 'ADVANCED';
  description: string;
  priceCents: number;
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
  private http = inject(HttpClient);

  private readonly apiUrl = environment.apiUrl;
  private readonly apiPrefix = environment.apiPrefix;

  // Subscription endpoints
  private readonly SUBSCRIPTION_BASE = `${this.apiUrl}${this.apiPrefix}/subscription`;
  private readonly SUBSCRIPTION_ALL = `${this.apiUrl}${this.apiPrefix}/subscription/all`;

  /**
   * Create a new subscription
   * @param subscription Subscription data to create
   */
  createSubscription(
    subscription: CreateSubscriptionDto
  ): Observable<Subscription> {
    return this.http
      .post<Subscription>(this.SUBSCRIPTION_BASE, subscription)
      .pipe(
        catchError((error) => {
          console.error('Error creating subscription:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Get all available subscriptions
   */
  getAllSubscriptions(): Observable<Subscription[]> {
    return this.http.get<Subscription[]>(this.SUBSCRIPTION_ALL).pipe(
      catchError((error) => {
        console.error('Error fetching subscriptions:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get a default subscription based on plan type
   * @param planType The type of plan (BASIC or ADVANCED)
   */
  getDefaultSubscription(
    planType: 'BASIC' | 'ADVANCED'
  ): Observable<Subscription> {
    return this.getAllSubscriptions().pipe(
      catchError((error) => {
        console.error('Error getting default subscription:', error);
        return throwError(() => error);
      }),
      // Get the first subscription that matches the plan type
      map((subscriptions) => {
        const subscription = subscriptions.find((sub) => sub.type === planType);
        if (subscription) {
          return subscription;
        }
        throw new Error(`No subscription found for plan type: ${planType}`);
      })
    );
  }
}
