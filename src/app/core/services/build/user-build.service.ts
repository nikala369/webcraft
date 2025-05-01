// src/app/core/services/build/user-build.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

export interface UserBuild {
  id: string;
  status: 'PENDING' | 'ACTIVE' | 'FAILED';
  createdAt?: string;
  userTemplateId: string;
  subscriptionId: string;
  siteUrl?: string;
  template?: any;
  subscription?: any;
}

export interface UserBuildRequest {
  userTemplateId: string;
  subscriptionId: string;
}

export interface PublishResponse {
  status: 'PENDING' | 'ACTIVE' | 'FAILED';
  message?: string;
  siteUrl?: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserBuildService {
  private baseUrl = `${environment.apiUrl}${environment.apiPrefix}/user-build`;

  constructor(private http: HttpClient) {}

  /**
   * Create a new user build record.
   * Backend returns a raw UUID string (201 Created).
   * We ask for text and then wrap it as a UserBuild.
   */
  createUserBuild(data: UserBuildRequest): Observable<UserBuild> {
    return this.http.post(this.baseUrl, data, { responseType: 'text' }).pipe(
      map(
        (rawId: string) =>
          ({
            id: rawId.trim(),
            status: 'PENDING',
            userTemplateId: data.userTemplateId,
            subscriptionId: data.subscriptionId,
          } as UserBuild)
      ),
      catchError((error) => {
        console.error('Error creating user build:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Initiate Stripe checkout for a user build.
   * Returns the Stripe Checkout URL as text.
   */
  initiateCheckout(userBuildId: string): Observable<string> {
    const url = `${this.baseUrl}/${userBuildId}/subscription/checkout`;
    return this.http.post(url, null, { responseType: 'text' }).pipe(
      map((checkoutUrl) => checkoutUrl.trim()),
      catchError((error) => {
        console.error('Error initiating checkout:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Attempt to publish a build.
   * Poll this until payment is confirmed.
   */
  publishBuild(userBuildId: string): Observable<PublishResponse> {
    const url = `${this.baseUrl}/${userBuildId}/publish`;
    return this.http.post<PublishResponse>(url, {}).pipe(
      catchError((error) => {
        console.error('Error publishing build:', error);
        // Return a failed status instead of throwing
        return of({
          status: 'FAILED',
          message: error.message || 'Failed to publish build',
        } as PublishResponse);
      })
    );
  }

  /**
   * List all builds for the current user.
   */
  getUserBuilds(query: any = {}): Observable<UserBuild[]> {
    const url = `${this.baseUrl}/search`;
    return this.http.get<UserBuild[]>(url, { params: query }).pipe(
      catchError((error) => {
        console.error('Error fetching user builds:', error);
        return of([]);
      })
    );
  }

  /**
   * Fetch a single build by ID.
   */
  getUserBuildById(buildId: string): Observable<UserBuild> {
    const url = `${this.baseUrl}/${buildId}`;
    return this.http.get<UserBuild>(url).pipe(
      catchError((error) => {
        console.error(`Error fetching build ${buildId}:`, error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Delete a build by ID.
   */
  deleteBuild(buildId: string): Observable<any> {
    const url = `${this.baseUrl}/${buildId}`;
    return this.http.delete(url).pipe(
      catchError((error) => {
        console.error(`Error deleting build ${buildId}:`, error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Build & publish a template in one call (for users with active subscription).
   */
  buildAndPublishTemplate(
    templateId: string,
    subscriptionId: string
  ): Observable<UserBuild> {
    return this.createUserBuild({
      userTemplateId: templateId,
      subscriptionId,
    }).pipe(
      map((build) => {
        // fire-and-forget publish
        this.publishBuild(build.id).subscribe();
        return build;
      })
    );
  }
}
