import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  Observable,
  catchError,
  interval,
  map,
  switchMap,
  takeWhile,
  throwError,
} from 'rxjs';
import { environment } from '../../../../environments/environment';
import { TemplateType, TemplatePlan } from '../template/template.service';

/**
 * Build status enum
 */
export enum BuildStatus {
  UNPUBLISHED = 'UNPUBLISHED',
  PUBLISHED = 'PUBLISHED',
  STOPPED = 'STOPPED',
  PENDING = 'PENDING',
  BUILDING = 'BUILDING',
  DEPLOYING = 'DEPLOYING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

/**
 * Interface for user build response
 */
export interface UserBuild {
  id: string;
  userTemplate: {
    id: string;
  };
  template: {
    id: string;
    name: string;
    description: string;
    templateType: TemplateType;
    templatePlan: TemplatePlan;
  };
  subscription: {
    id: string;
    type: string;
    description: string;
    priceCents: number;
  };
  address?: {
    address: string;
    loadBalancerAddress: string;
  };
  status: BuildStatus;
  name: string;
}

/**
 * Interface for create user build request
 */
export interface CreateUserBuildDto {
  userTemplateId: string;
  subscriptionId: string;
}

/**
 * Service for managing user builds (publishing websites)
 */
@Injectable({
  providedIn: 'root',
})
export class UserBuildService {
  private http = inject(HttpClient);

  private readonly apiUrl = environment.apiUrl;
  private readonly apiPrefix = environment.apiPrefix;

  // User build endpoints
  private readonly USER_BUILD_BASE = `${this.apiUrl}${this.apiPrefix}/user-build`;
  private readonly USER_BUILD_PUBLISH = `${this.apiUrl}${this.apiPrefix}/user-build`;
  private readonly USER_BUILD_SEARCH = `${this.apiUrl}${this.apiPrefix}/user-build/search`;

  /**
   * Create a new user build
   * @param userTemplateId User template ID
   * @param subscriptionId Subscription ID
   */
  createUserBuild(
    userTemplateId: string,
    subscriptionId: string
  ): Observable<UserBuild> {
    const createDto: CreateUserBuildDto = {
      userTemplateId,
      subscriptionId,
    };

    return this.http.post<UserBuild>(this.USER_BUILD_BASE, createDto).pipe(
      catchError((error) => {
        console.error('Error creating user build:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Publish a user build
   * @param buildId Build ID to publish
   */
  publishUserBuild(buildId: string): Observable<UserBuild> {
    return this.http
      .post<UserBuild>(`${this.USER_BUILD_PUBLISH}/${buildId}/publish`, {})
      .pipe(
        catchError((error) => {
          console.error(
            `Error publishing user build with ID ${buildId}:`,
            error
          );
          return throwError(() => error);
        })
      );
  }

  /**
   * Search for user builds
   * @param page Page number (0-based)
   * @param size Page size
   */
  searchUserBuilds(page: number = 0, size: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<any>(this.USER_BUILD_SEARCH, { params }).pipe(
      catchError((error) => {
        console.error('Error searching user builds:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get the latest build for a user template
   * @param userTemplateId User template ID
   */
  getLatestBuildForTemplate(
    userTemplateId: string
  ): Observable<UserBuild | null> {
    return this.searchUserBuilds(0, 10).pipe(
      map((response) => {
        if (response.content && response.content.length > 0) {
          // Filter builds for this template
          const templateBuilds = response.content.filter(
            (build: UserBuild) => build.userTemplate?.id === userTemplateId
          );

          if (templateBuilds.length > 0) {
            // Sort by most recent first (assuming id contains timestamp or is sequential)
            return templateBuilds.sort((a: UserBuild, b: UserBuild) =>
              b.id.localeCompare(a.id)
            )[0];
          }
        }
        return null;
      }),
      catchError((error) => {
        console.error('Error getting latest build:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Complete flow to build and publish a user template
   * @param userTemplateId User template ID
   * @param subscriptionId Subscription ID
   * @param pollingIntervalMs Interval for polling status in milliseconds
   * @param timeoutMs Timeout for the overall build process in milliseconds
   */
  buildAndPublishTemplate(
    userTemplateId: string,
    subscriptionId: string,
    pollingIntervalMs = 5000,
    timeoutMs = 300000 // 5 minutes
  ): Observable<UserBuild> {
    // First create the build
    return this.createUserBuild(userTemplateId, subscriptionId).pipe(
      // Then publish it
      switchMap((build) => this.publishUserBuild(build.id)),
      // Then poll for status updates
      switchMap((build) => {
        const startTime = Date.now();

        return interval(pollingIntervalMs).pipe(
          // Check the build status
          switchMap(() =>
            this.searchUserBuilds(0, 10).pipe(
              map((response) => {
                if (response.content && response.content.length > 0) {
                  // Find our build in the results
                  const currentBuild = response.content.find(
                    (b: UserBuild) => b.id === build.id
                  );

                  if (currentBuild) {
                    return currentBuild;
                  }
                }
                throw new Error('Build not found in search results');
              })
            )
          ),
          // Continue polling until we reach a terminal state or timeout
          takeWhile((currentBuild) => {
            const isInProgress = [
              BuildStatus.PENDING,
              BuildStatus.BUILDING,
              BuildStatus.DEPLOYING,
            ].includes(currentBuild.status as BuildStatus);

            const isTimedOut = Date.now() - startTime > timeoutMs;

            // Continue if still in progress and not timed out
            return isInProgress && !isTimedOut;
          }, true) // true to include the last value
        );
      }),
      catchError((error) => {
        console.error('Error in build and publish process:', error);
        return throwError(() => error);
      })
    );
  }
}
