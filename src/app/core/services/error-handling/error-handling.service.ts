import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ErrorHandlingService {
  /**
   * Processes an HTTP error response and returns a formatted error message string.
   * @param error - The HTTP error response.
   * @returns A string with the formatted error messages.
   */
  public processError(error: HttpErrorResponse): string {
    let finalErrorMsg = 'An error occurred. Please try again.';

    // Check for an "errors" object (commonly a map of field errors)
    if (error.error && error.error.errors) {
      const fieldErrors = error.error.errors;
      const messagesArray = [];
      for (const field in fieldErrors) {
        if (fieldErrors.hasOwnProperty(field)) {
          messagesArray.push(fieldErrors[field]);
        }
      }
      if (messagesArray.length) {
        finalErrorMsg = messagesArray.join(', ');
      }
    }
    // Fallback: a messages array
    else if (error.error && error.error.messages) {
      if (Array.isArray(error.error.messages)) {
        finalErrorMsg = error.error.messages.join(' ');
      } else if (typeof error.error.messages === 'string') {
        finalErrorMsg = error.error.messages;
      }
    }
    // Check if there is a single message string provided
    else if (error.error && error.error.message) {
      finalErrorMsg = error.error.message;
    }

    return finalErrorMsg;
  }
}


