export interface FieldConfig {
  key: string;
  label: string;
  type:
    | 'text'
    | 'textarea'
    | 'select'
    | 'color'
    | 'toggle'
    | 'file'
    | 'type-switch';
  defaultValue?: any;
  required?: boolean;
  category?: string;
  options?: { label: string; value: any }[];
  placeholder?: string;
  validation?: {
    required?: boolean;
    pattern?: string;
    minLength?: number;
    maxLength?: number;
  };
  dependencies?: {
    field: string;
    value: any;
  }[];
  // Properties for file fields
  accept?: string; // File type filter, e.g. 'image/*', 'video/*', etc.
  hint?: string; // Hint text to display below the field
  description?: string; // Explanatory text for the field
  acceptedFileTypes?: string; // Specify file types (e.g., 'image/*')
  fileUploadNote?: string; // Note about recommended file size/format
}
