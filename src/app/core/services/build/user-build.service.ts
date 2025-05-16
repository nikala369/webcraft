// src/app/core/services/build/user-build.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import {
  UserBuild,
  ExtendedUserBuild,
  ApiResponse,
} from '../../../core/models/user-build.model';

export interface UserBuildRequest {
  userTemplateId: string;
  subscriptionId: string;
}

export interface PublishResponse {
  status:
    | 'PENDING'
    | 'ACTIVE'
    | 'FAILED'
    | 'PUBLISHED'
    | 'UNPUBLISHED'
    | 'STOPPED';
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
   * List all builds for the current user.
   */
  getUserBuilds(
    query: any = {}
  ): Observable<ApiResponse<ExtendedUserBuild> | ExtendedUserBuild[]> {
    const url = `${this.baseUrl}/search`;
    return this.http
      .get<ApiResponse<ExtendedUserBuild> | ExtendedUserBuild[]>(url, {
        params: query,
      })
      .pipe(
        catchError((error) => {
          console.error('Error fetching user builds:', error);
          return of([] as ExtendedUserBuild[]);
        })
      );
  }

  /**
   * Fetch a single build by ID.
   */
  getUserBuildById(buildId: string): Observable<ExtendedUserBuild> {
    if (!buildId) {
      console.error('getUserBuildById called with null/undefined buildId');
      return throwError(() => new Error('Invalid build ID'));
    }

    const url = `${this.baseUrl}/${buildId}`;

    return this.http.get<ExtendedUserBuild>(url).pipe(
      map((response) => response),
      catchError((error) => {
        console.error(`Error fetching build ${buildId}:`, error);
        if (error.status === 404) {
          return throwError(() => new Error(`Build ${buildId} not found`));
        }
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

  /**
   * Publish a build
   */
  publishBuild(buildId: string): Observable<PublishResponse> {
    const url = `${this.baseUrl}/${buildId}/publish`;
    return this.http.post<PublishResponse>(url, {}).pipe(
      catchError((error) => {
        console.error(`Error publishing build ${buildId}:`, error);
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
   * Initiate combined template purchase + subscription checkout.
   * Returns the Stripe Checkout URL as text.
   */
  initiateCombinedCheckout(
    userTemplateId: string,
    subscriptionId: string
  ): Observable<string> {
    const url = `${environment.apiUrl}${environment.apiPrefix}/template/user-template/checkout`;
    return this.http
      .post(url, { userTemplateId, subscriptionId }, { responseType: 'text' })
      .pipe(
        map((checkoutUrl) => checkoutUrl.trim()),
        catchError((error) => {
          console.error('Error initiating combined checkout:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Fetch a build by userTemplateId (newer API for success page polling)
   * Returns null if the build isn't found or isn't ready yet
   */
  getUserBuildByTemplateId(
    userTemplateId: string
  ): Observable<ExtendedUserBuild | null> {
    if (!userTemplateId) {
      console.error(
        'getUserBuildByTemplateId called with null/undefined userTemplateId'
      );
      return throwError(() => new Error('Invalid userTemplateId'));
    }
    const url = `${this.baseUrl}/user-template/${userTemplateId}`;
    return this.http.get<ExtendedUserBuild>(url).pipe(
      map((response) => {
        // Return null for empty responses or incomplete data
        if (!response || !response.id) {
          return null;
        }
        return response;
      }),
      catchError((error) => {
        console.error(
          `Error fetching build for userTemplateId ${userTemplateId}:`,
          error
        );
        if (error.status === 404) {
          // Return null for 404s rather than erroring - build might not be created yet
          return of(null);
        }
        return throwError(() => error);
      })
    );
  }
}
