import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

/**
 * Pipe to sanitize URLs for safe use in iframe src attributes
 * Usage: <iframe [src]="url | safeResourceUrl"></iframe>
 */
@Pipe({
  name: 'safeResourceUrl',
  standalone: true,
})
export class SafeResourceUrlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(url: string): SafeResourceUrl {
    if (!url) {
      return '';
    }
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
