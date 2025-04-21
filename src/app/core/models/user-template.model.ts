import { Customizations } from './website-customizations';
import {
  TemplateType,
  TemplatePlan,
} from '../services/template/template.service';

/**
 * Enhanced UserTemplate interface for use in the application
 * Extends the base UserTemplate from the service with parsed customizations
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
  config: string; // Config is stored as a stringified JSON in the API
  name: string;
  published?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  // Extended properties for convenience in components
  customizations?: Customizations; // Parsed customizations object
  type?: string; // Shorthand for template.templateType.key
  thumbnailUrl?: string;
}
