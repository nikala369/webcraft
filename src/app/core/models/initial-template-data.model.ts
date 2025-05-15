import { Customizations } from './website-customizations';
import { Template } from '../services/template/template.service';

/**
 * Interface defining the complete set of initialization data needed by PreviewComponent.
 * This creates a clear contract between TemplateInitializationService and PreviewComponent.
 */
export interface InitialTemplateData {
  /** ID of the current user template (if editing existing) */
  currentUserTemplateId: string | null;

  /** Name of the current template */
  currentTemplateName: string | null;

  /** Latest customizations being edited */
  customizations: Customizations | null;

  /** Selected business type key */
  businessType: string;

  /** Display name for the selected business type */
  businessTypeName: string;

  /** Current plan (standard or premium) */
  plan: 'standard' | 'premium';

  /** Progress step in the website building flow */
  currentStep: number;

  /** Whether the business type selector should be shown */
  showBusinessTypeSelector: boolean;

  /** Selected font for the template */
  selectedFont: {
    id: number;
    family: string;
    fallback?: string;
  } | null;

  /** ID of the selected base template */
  selectedBaseTemplateId: string | null;

  /** Available themes for the current business type */
  availableThemes: Template[];

  /** Whether the user has started building their website */
  hasStartedBuilding: boolean;

  /** Whether the user has saved changes */
  hasSavedChangesFlag: boolean;

  /** Initial mode for preview (edit or view) */
  initialMode?: 'edit' | 'view';

  /** Whether the user is creating a new template */
  isCreatingNew?: boolean;
}

/**
 * Interface for template state management
 * This provides a structure for the consolidated state signal
 */
export interface TemplateState {
  /** ID of the user template (null for new templates) */
  id: string | null;

  /** Display name of the template */
  name: string;

  /** ID of the base template used (for new templates) */
  baseId: string | null;

  /** Business type key */
  businessType: string;

  /** Display name of the business type */
  businessTypeName: string;

  /** Plan level (standard or premium) */
  plan: 'standard' | 'premium';
}
