import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, of, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface TemplateType {
  id: string;
  name: string;
  key: string;
}

export interface TemplatePlan {
  id: string;
  type: 'BASIC' | 'PREMIUM';
  description: string;
  priceCents: number;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  config: string;
  templateType: TemplateType;
  templatePlan: TemplatePlan;
}

export interface TemplateSearch {
  id: string;
  name: string;
  description: string;
  templateType: TemplateType;
  templatePlan: TemplatePlan;
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

/**
 * Cache keys for storing IDs in localStorage
 */
const CACHE_KEYS = {
  BASIC_PLAN_ID: 'webcraft_basic_plan_id',
  PREMIUM_PLAN_ID: 'webcraft_premium_plan_id',
};

/**
 * Service for fetching templates, template types, and template plans from the backend
 */
@Injectable({
  providedIn: 'root',
})
export class TemplateService {
  private http = inject(HttpClient);

  private readonly apiUrl = environment.apiUrl;
  private readonly apiPrefix = environment.apiPrefix;

  // Template type endpoints
  private readonly TEMPLATE_TYPE_ALL = `${this.apiUrl}${this.apiPrefix}/template/type/all`;
  private readonly TEMPLATE_TYPE_BY_ID = `${this.apiUrl}${this.apiPrefix}/template/type`;

  // Template plan endpoints
  private readonly TEMPLATE_PLAN_ALL = `${this.apiUrl}${this.apiPrefix}/template/template-plan/all`;

  // Template endpoints
  private readonly TEMPLATE_SEARCH = `${this.apiUrl}${this.apiPrefix}/template/search`;
  private readonly TEMPLATE_ATTACHMENT = `${this.apiUrl}${this.apiPrefix}/template/attachment`;
  private readonly TEMPLATE_BY_ID = `${this.apiUrl}${this.apiPrefix}/template`;

  /**
   * Fetches all available template types
   */
  getAllTemplateTypes(): Observable<TemplateType[]> {
    return this.http.get<TemplateType[]>(this.TEMPLATE_TYPE_ALL).pipe(
      catchError((error) => {
        console.error('Error fetching template types:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Fetches a specific template type by ID
   */
  getTemplateTypeById(id: string): Observable<TemplateType> {
    return this.http
      .get<TemplateType>(`${this.TEMPLATE_TYPE_BY_ID}/${id}`)
      .pipe(
        catchError((error) => {
          console.error(`Error fetching template type with ID ${id}:`, error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Fetches all available template plans
   */
  getAllTemplatePlans(): Observable<TemplatePlan[]> {
    return this.http.get<TemplatePlan[]>(this.TEMPLATE_PLAN_ALL).pipe(
      catchError((error) => {
        console.error('Error fetching template plans:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Search for templates with optional filters
   * @param templateTypeId Optional template type ID to filter by
   * @param templatePlanId Optional template plan ID to filter by
   * @param page Page number (0-based)
   * @param size Page size
   */
  // todo size number = 5
  searchTemplates(
    templateTypeId?: string | null,
    templatePlanId?: string | null,
    page: number = 0,
    size: number = 20
  ): Observable<PageResponse<TemplateSearch>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (templateTypeId) {
      params = params.set('templateTypeId', templateTypeId);
    }

    if (templatePlanId) {
      params = params.set('templatePlanId', templatePlanId);
    }

    return this.http
      .get<PageResponse<TemplateSearch>>(this.TEMPLATE_SEARCH, { params })
      .pipe(
        catchError((error) => {
          console.error('Error searching templates:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Get attachment URL for a template
   * @param objectId The attachment object ID
   */
  getTemplateAttachmentUrl(objectId: string): string {
    return `${this.TEMPLATE_ATTACHMENT}/${objectId}`;
  }

  /**
   * Get the template plan ID for the specified plan type
   * First tries localStorage, then fetches from API if needed
   */
  getTemplatePlanId(planType: 'BASIC' | 'PREMIUM'): Observable<string> {
    // First check if we have it in localStorage
    const cachedId =
      planType === 'BASIC'
        ? localStorage.getItem(CACHE_KEYS.BASIC_PLAN_ID)
        : localStorage.getItem(CACHE_KEYS.PREMIUM_PLAN_ID);

    if (cachedId) {
      return of(cachedId);
    }

    // If not cached, fetch from API and cache it
    return this.getAllTemplatePlans().pipe(
      map((plans) => {
        const plan = plans.find((p) => p.type === planType);
        if (!plan) {
          throw new Error(`No ${planType} plan found`);
        }

        // Cache the plan ID
        if (planType === 'BASIC') {
          localStorage.setItem(CACHE_KEYS.BASIC_PLAN_ID, plan.id);
        } else {
          localStorage.setItem(CACHE_KEYS.PREMIUM_PLAN_ID, plan.id);
        }

        return plan.id;
      })
    );
  }

  /**
   * Convert frontend plan name to backend plan type
   */
  convertPlanType(plan: 'standard' | 'premium'): 'BASIC' | 'PREMIUM' {
    return plan === 'standard' ? 'BASIC' : 'PREMIUM';
  }

  /**
   * Upload an attachment for a template
   * @param templateId The template ID
   * @param file The file to upload
   * @param attachmentType The type of attachment
   * @returns Observable with the attachment ID
   */
  uploadTemplateAttachment(
    templateId: string,
    file: File,
    attachmentType:
      | 'TEMPLATE_BUILD'
      | 'TEMPLATE_IMAGE'
      | 'TEMPLATE_VIDEO'
      | 'USER_TEMPLATE_IMAGE'
      | 'USER_TEMPLATE_VIDEO' = 'TEMPLATE_IMAGE'
  ): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);

    const url = `${this.TEMPLATE_ATTACHMENT}?templateId=${templateId}&attachmentType=${attachmentType}`;

    return this.http.post(url, formData, { responseType: 'text' }).pipe(
      catchError((error) => {
        console.error(`Error uploading ${attachmentType}:`, error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get the download URL for a template attachment
   * @param objectId The attachment object ID
   * @param attachmentType The type of attachment
   * @returns The full URL for downloading the attachment
   */
  getAttachmentUrl(
    objectId: string,
    attachmentType:
      | 'TEMPLATE_BUILD'
      | 'TEMPLATE_IMAGE'
      | 'TEMPLATE_VIDEO'
      | 'USER_TEMPLATE_IMAGE'
      | 'USER_TEMPLATE_VIDEO' = 'TEMPLATE_IMAGE'
  ): string {
    return `${this.TEMPLATE_ATTACHMENT}/${objectId}?attachmentType=${attachmentType}`;
  }

  /**
   * Get a template by ID
   * @param templateId The template ID to fetch
   * @returns Observable with the full template data including config
   */
  getTemplateById(templateId: string): Observable<Template> {
    return this.http.get<Template>(`${this.TEMPLATE_BY_ID}/${templateId}`).pipe(
      catchError((error) => {
        console.error(`Error fetching template with ID ${templateId}:`, error);
        return throwError(() => error);
      })
    );
  }
}
