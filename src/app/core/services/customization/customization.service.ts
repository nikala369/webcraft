import { Injectable } from '@angular/core';
import { Customizations } from '../../models/website-customizations';
import { BusinessConfigService } from '../business-config/business-config.service';
import { ToastService } from '../toast/toast.service';

/**
 * Service for managing customizations including saving, loading, and transforming data
 */
@Injectable({
  providedIn: 'root',
})
export class CustomizationService {
  // Data structure for storing video placeholder metadata
  private videoPlaceholders: Record<
    string,
    { fileName: string; timestamp: string }
  > = {};

  constructor(
    private businessConfigService: BusinessConfigService,
    private toastService: ToastService
  ) {
    // Load video placeholders from session storage if they exist
    this.loadVideoPlaceholders();
  }

  /**
   * Load video placeholders from session storage
   */
  private loadVideoPlaceholders(): void {
    const savedPlaceholders = sessionStorage.getItem('videoPlaceholders');
    if (savedPlaceholders) {
      try {
        this.videoPlaceholders = JSON.parse(savedPlaceholders);
        console.log('Loaded video placeholders:', this.videoPlaceholders);
      } catch (error) {
        console.error('Error parsing video placeholders:', error);
      }
    }
  }

  /**
   * Save customizations to session storage
   * In the future, this will connect to a backend API
   */
  saveCustomizations(
    customizations: Customizations,
    businessType: string,
    themeId: number
  ): boolean {
    try {
      // Create a deep copy of customizations to modify before saving
      const customizationsToSave = structuredClone(customizations);

      // Handle video data which might exceed localStorage quota
      this.processVideosForStorage(customizationsToSave);

      // Prepare data for saving with proper structure
      const savedData = {
        customizations: customizationsToSave,
        themeId: themeId,
        businessType: businessType,
      };

      // Save to session storage
      sessionStorage.setItem('savedCustomizations', JSON.stringify(savedData));
      sessionStorage.setItem(
        'currentCustomizations',
        JSON.stringify(savedData)
      );
      sessionStorage.setItem('hasStartedBuilding', 'true');

      return true;
    } catch (error: any) {
      console.error('Error saving customizations:', error);

      // If it's a quota error, try a more aggressive approach by removing all video data
      if (error.name === 'QuotaExceededError') {
        return this.saveWithReducedData(customizations, businessType, themeId);
      } else {
        this.toastService.error('Failed to save changes: ' + error.message);
        return false;
      }
    }
  }

  /**
   * Save with reduced data (removing videos) when quota is exceeded
   */
  private saveWithReducedData(
    customizations: Customizations,
    businessType: string,
    themeId: number
  ): boolean {
    try {
      console.log('Storage quota exceeded. Removing video data completely.');

      // Create a new deep copy
      const reducedCustomizations = structuredClone(customizations);

      // Remove all video data completely
      this.removeAllVideoData(reducedCustomizations);

      // Try again with reduced data
      const reducedSavedData = {
        customizations: reducedCustomizations,
        themeId: themeId,
        businessType: businessType,
      };

      sessionStorage.setItem(
        'savedCustomizations',
        JSON.stringify(reducedSavedData)
      );
      sessionStorage.setItem(
        'currentCustomizations',
        JSON.stringify(reducedSavedData)
      );
      sessionStorage.setItem('hasStartedBuilding', 'true');

      this.toastService.warning(
        'Changes saved, but video data was removed due to size limitations'
      );
      return true;
    } catch (secondError) {
      console.error('Failed to save even with reduced data:', secondError);
      this.toastService.error('Failed to save changes: storage quota exceeded');
      return false;
    }
  }

  /**
   * Process videos for storage by replacing large data URLs with placeholders
   */
  private processVideosForStorage(customizations: Customizations): void {
    // Check for hero videos
    if (customizations.pages?.home?.hero1?.backgroundVideo) {
      const videoSrc = customizations.pages.home.hero1.backgroundVideo;
      // If it's a data URL (usually very large), replace with a placeholder
      if (typeof videoSrc === 'string' && videoSrc.startsWith('data:video')) {
        console.log('Replacing video data URL with placeholder for storage');
        // Store a reference to this being a placeholder
        (customizations.pages.home.hero1 as any)._videoPlaceholder =
          'VIDEO_DATA_PLACEHOLDER';
        delete customizations.pages.home.hero1.backgroundVideo;
      }
    }

    // Process other sections with videos similarly as they are added
  }

  /**
   * Remove all video data from customizations to reduce storage size
   */
  private removeAllVideoData(customizations: Customizations): void {
    // Hero section
    if (customizations.pages?.home?.hero1) {
      delete customizations.pages.home.hero1.backgroundVideo;
      // Set a flag indicating video was removed
      (customizations.pages.home.hero1 as any)._videoRemoved = true;
    }

    // Remove from other sections as they are added
  }

  /**
   * Store a placeholder for video files to avoid storage quota issues
   */
  storeVideoPlaceholder(fieldKey: string, fileName: string): void {
    // Update stored data with placeholder
    this.videoPlaceholders = {
      ...this.videoPlaceholders,
      [fieldKey]: {
        fileName: fileName,
        timestamp: new Date().toISOString(),
      },
    };

    // Update session storage for persistence
    sessionStorage.setItem(
      'videoPlaceholders',
      JSON.stringify(this.videoPlaceholders)
    );
    console.log('Stored video placeholder:', this.videoPlaceholders);
  }

  /**
   * Load saved customizations from storage
   */
  loadSavedCustomizations(): {
    customizations: Customizations;
    businessType?: string;
    themeId?: number;
  } | null {
    console.log('Loading saved customizations');
    const savedCustomizations = sessionStorage.getItem('savedCustomizations');

    if (!savedCustomizations) {
      console.warn('No saved customizations found');
      return null;
    }

    try {
      const parsedData = JSON.parse(savedCustomizations);
      console.log('Parsed saved data:', parsedData);

      let customizationsData: Customizations;
      let businessType: string | undefined = undefined;
      let themeId: number | undefined = undefined;

      // Check if data is in the new format with nested customizations
      if (parsedData.customizations) {
        console.log('Setting customizations from nested structure');
        customizationsData = parsedData.customizations;

        // Get other metadata
        businessType = parsedData.businessType;
        themeId = parsedData.themeId;

        // Process video placeholders
        this.processVideoPlaceholders(customizationsData);
      } else {
        // Handle legacy format (direct customizations object)
        console.log('Setting customizations from legacy structure');
        customizationsData = parsedData;

        // Process video placeholders in legacy format
        this.processVideoPlaceholders(customizationsData);
      }

      return {
        customizations: customizationsData,
        businessType,
        themeId,
      };
    } catch (e) {
      console.error('Error parsing saved customizations:', e);
      this.toastService.error('Error loading saved customizations');
      return null;
    }
  }

  /**
   * Process and restore video placeholders if possible
   */
  private processVideoPlaceholders(customizationsData: Customizations): void {
    // Check hero section
    if (customizationsData.pages?.home?.hero1) {
      const heroData = customizationsData.pages.home.hero1;

      // If there's a video placeholder, try to restore real data
      if ((heroData as any)._videoPlaceholder === 'VIDEO_DATA_PLACEHOLDER') {
        // Look for video in memory (would need to be passed from component)
        console.log(
          'Found video placeholder - may need to retrieve from memory'
        );

        // Remove the placeholder property
        delete (heroData as any)._videoPlaceholder;
      }

      // Handle _videoRemoved flag
      if ((heroData as any)._videoRemoved) {
        delete (heroData as any)._videoRemoved;
      }
    }

    // Process other sections as needed
  }

  /**
   * Get temporary customizations for current editing session
   */
  loadCurrentCustomizations(): {
    customizations: Customizations;
    businessType?: string;
    themeId?: number;
  } | null {
    const storedCustomizations = sessionStorage.getItem(
      'currentCustomizations'
    );
    if (!storedCustomizations) {
      return null;
    }

    try {
      const parsedData = JSON.parse(storedCustomizations);

      let customizationsData: Customizations;
      let businessType: string | undefined = undefined;
      let themeId: number | undefined = undefined;

      if (parsedData.customizations) {
        customizationsData = parsedData.customizations;
        businessType = parsedData.businessType;
        themeId = parsedData.themeId;

        // Process any placeholders
        this.processVideoPlaceholders(customizationsData);
      } else {
        customizationsData = parsedData;
        this.processVideoPlaceholders(customizationsData);
      }

      return {
        customizations: customizationsData,
        businessType,
        themeId,
      };
    } catch (e) {
      console.error('Error parsing current customizations:', e);
      return null;
    }
  }

  /**
   * Ensure the customization structure has all required nested objects
   */
  ensureCompleteStructure(
    customizations: Customizations,
    businessType: string,
    plan: 'standard' | 'premium'
  ): Customizations {
    return this.businessConfigService.ensureCompleteCustomizationStructure(
      customizations,
      businessType,
      plan
    );
  }

  /**
   * Generate default customizations for a business type and plan
   */
  generateDefault(
    businessType: string,
    plan: 'standard' | 'premium'
  ): Customizations {
    return this.businessConfigService.generateDefaultCustomizations(
      businessType,
      plan
    );
  }
}
