import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError, map, of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Customizations } from '../../models/website-customizations';
import {
  PageResponse,
  Template,
  TemplateType,
  TemplatePlan,
} from './template.service';

/**
 * Interface for user template response from API
 */
export interface UserTemplate {
  id: string;
  template: {
    id: string;
    name: string;
    description: string;
    templateType: TemplateType;
    templatePlan: TemplatePlan;
  };
  config: string;
  name: string;
}

/**
 * Interface for user template creation request
 */
export interface UserTemplateCreateDto {
  templateId: string;
  name: string;
  config: string;
}

/**
 * Interface for user template update request
 */
export interface UserTemplateUpdateDto {
  name: string;
  config: string;
}

/**
 * Service for managing user templates
 */
@Injectable({
  providedIn: 'root',
})
export class UserTemplateService {
  private http = inject(HttpClient);

  private readonly apiUrl = environment.apiUrl;
  private readonly apiPrefix = environment.apiPrefix;

  // User template endpoints
  private readonly USER_TEMPLATE_BASE = `${this.apiUrl}${this.apiPrefix}/template/user-template`;
  private readonly USER_TEMPLATE_SEARCH = `${this.apiUrl}${this.apiPrefix}/template/user-template/search`;
  private readonly USER_TEMPLATE_ATTACHMENT = `${this.apiUrl}${this.apiPrefix}/template/user-template/attachment`;

  /**
   * Create a new user template
   * @param templateId Master template ID
   * @param name User template name
   * @param config Template configuration (customizations)
   */
  createUserTemplate(
    templateId: string,
    name: string,
    config: Customizations
  ): Observable<UserTemplate> {
    console.log(`Creating user template with base template ID: ${templateId}`);
    console.log(`Template name: ${name}`);
    console.log(`Config size: ${JSON.stringify(config).length} characters`);

    const createDto: UserTemplateCreateDto = {
      templateId,
      name,
      config: JSON.stringify(config),
    };

    console.log('CreateUserTemplate request payload:', createDto);
    console.log('API endpoint:', this.USER_TEMPLATE_BASE);

    return this.http
      .post<UserTemplate>(this.USER_TEMPLATE_BASE, createDto)
      .pipe(
        catchError((error) => {
          console.error('Error creating user template:', error);
          console.error(
            'Error details:',
            error.error?.message || error.message
          );
          console.error('Error status:', error.status);
          console.error('Error response:', error.error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Update an existing user template
   * @param templateId User template ID
   * @param name Template name
   * @param config Template configuration
   */
  updateUserTemplate(
    templateId: string,
    name: string,
    config: Customizations
  ): Observable<UserTemplate> {
    const updateDto: UserTemplateUpdateDto = {
      name,
      config: JSON.stringify(config),
    };

    return this.http
      .put<UserTemplate>(`${this.USER_TEMPLATE_BASE}/${templateId}`, updateDto)
      .pipe(
        catchError((error) => {
          console.error(
            `Error updating user template with ID ${templateId}:`,
            error
          );
          return throwError(() => error);
        })
      );
  }

  /**
   * Get a user template by ID
   * @param templateId User template ID
   */
  getUserTemplateById(templateId: string): Observable<UserTemplate> {
    return this.http
      .get<UserTemplate>(`${this.USER_TEMPLATE_BASE}/${templateId}`)
      .pipe(
        catchError((error) => {
          console.error(
            `Error fetching user template with ID ${templateId}:`,
            error
          );
          return throwError(() => error);
        })
      );
  }

  /**
   * Search for user templates with pagination
   * @param page Page number (0-based)
   * @param size Number of items per page
   * @returns User templates search response
   */
  searchUserTemplates(
    page: number = 0,
    size: number = 10
  ): Observable<PageResponse<UserTemplate>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http
      .get<PageResponse<UserTemplate>>(this.USER_TEMPLATE_SEARCH, { params })
      .pipe(
        map((response) => {
          console.log('Raw search user templates response:', response);
          // Ensure content is always an array
          if (!response.content) {
            console.warn(
              'Response missing content array, initializing empty array'
            );
            response.content = [];
          }
          return response;
        }),
        catchError((error) => {
          console.error('Error searching user templates:', error);
          // Return empty page result instead of throwing error
          return of({
            content: [],
            totalElements: 0,
            totalPages: 0,
            size,
            number: page,
            first: true,
            last: true,
            empty: true,
          } as PageResponse<UserTemplate>);
        })
      );
  }

  /**
   * Upload an attachment for a user template
   * @param file File to upload
   * @param type Type of attachment (USER_TEMPLATE_IMAGE or USER_TEMPLATE_VIDEO)
   */
  uploadAttachment(
    file: File,
    type: 'USER_TEMPLATE_IMAGE' | 'USER_TEMPLATE_VIDEO'
  ): Observable<{ fileId: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    return this.http
      .post<{ fileId: string }>(this.USER_TEMPLATE_ATTACHMENT, formData)
      .pipe(
        catchError((error) => {
          console.error('Error uploading attachment:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Get attachment URL for a user template
   * @param objectId The attachment object ID
   */
  getAttachmentUrl(objectId: string): string {
    return `${this.USER_TEMPLATE_ATTACHMENT}/${objectId}`;
  }

  /**
   * Save or update a user template based on whether an ID exists
   * @param templateId Master template ID (for creation)
   * @param name Template name
   * @param config Template configuration
   * @param currentUserTemplateId Optional existing user template ID
   */
  saveUserTemplate(
    templateId: string,
    name: string,
    config: Customizations,
    currentUserTemplateId?: string
  ): Observable<UserTemplate> {
    console.log('saveUserTemplate called with:');
    console.log('- Base template ID:', templateId);
    console.log('- Template name:', name);
    console.log(
      '- Current user template ID:',
      currentUserTemplateId || 'N/A (creating new)'
    );

    // If we have a current template ID, we're updating
    if (currentUserTemplateId) {
      console.log(
        `Updating existing template with ID: ${currentUserTemplateId}`
      );
      return this.updateUserTemplate(currentUserTemplateId, name, config);
    }

    // Otherwise, we're creating a new template
    console.log(`Creating new template based on template ID: ${templateId}`);
    return this.createUserTemplate(templateId, name, config);
  }

  /**
   * Upload an image for a user template
   * @param userTemplateId The user template ID
   * @param file The image file to upload
   * @returns Observable with the attachment ID
   */
  uploadUserTemplateImage(
    userTemplateId: string,
    file: File
  ): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);

    const url = `${this.apiUrl}${this.apiPrefix}/template/user-template/attachment?userTemplateId=${userTemplateId}&attachmentType=USER_TEMPLATE_IMAGE`;

    return this.http.post(url, formData, { responseType: 'text' }).pipe(
      catchError((error) => {
        console.error('Error uploading user template image:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get the URL for a user template attachment
   * @param objectId The attachment object ID
   * @returns The full URL for the attachment
   */
  getUserTemplateAttachmentUrl(objectId: string): string {
    return `${this.apiUrl}${this.apiPrefix}/template/user-template/attachment/${objectId}`;
  }

  /**
   * Retrieves all templates created by the authenticated user
   * @returns An Observable with an array of UserTemplate objects
   */
  getUserTemplates(): Observable<UserTemplate[]> {
    const url = `${this.apiUrl}${this.apiPrefix}/template/user-template/all`;
    console.log(`Fetching user templates from: ${url}`);

    return this.http.get<any>(url).pipe(
      map((response) => {
        // Handle both array and paginated response formats
        if (Array.isArray(response)) {
          return response;
        } else if (
          response &&
          response.content &&
          Array.isArray(response.content)
        ) {
          return response.content;
        } else {
          console.error('Unexpected response format:', response);
          return [];
        }
      }),
      catchError((error) => {
        console.error('Error fetching user templates:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Delete a user template by ID
   * @param templateId User template ID
   * @returns Observable with no content
   */
  deleteTemplate(templateId: string): Observable<void> {
    return this.http
      .delete<void>(`${this.USER_TEMPLATE_BASE}/${templateId}`)
      .pipe(
        catchError((error) => {
          console.error(
            `Error deleting user template with ID ${templateId}:`,
            error
          );
          return throwError(() => error);
        })
      );
  }

  /**
   * Publish a user template by ID
   * @param templateId User template ID
   * @returns Observable with updated UserTemplate
   */
  publishTemplate(templateId: string): Observable<UserTemplate> {
    return this.http
      .post<UserTemplate>(
        `${this.USER_TEMPLATE_BASE}/${templateId}/publish`,
        {}
      )
      .pipe(
        catchError((error) => {
          console.error(
            `Error publishing user template with ID ${templateId}:`,
            error
          );
          return throwError(() => error);
        })
      );
  }

  /**
   * Unpublish a user template by ID
   * @param templateId User template ID
   * @returns Observable with updated UserTemplate
   */
  unpublishTemplate(templateId: string): Observable<UserTemplate> {
    return this.http
      .post<UserTemplate>(
        `${this.USER_TEMPLATE_BASE}/${templateId}/unpublish`,
        {}
      )
      .pipe(
        catchError((error) => {
          console.error(
            `Error unpublishing user template with ID ${templateId}:`,
            error
          );
          return throwError(() => error);
        })
      );
  }
}
