/**
 * Hero Section Enhanced Data Model
 * Follows the Militant Engineering Doctrine with strong typing and clear contracts
 */

import { HeroData } from '../../../../../../core/models/website-customizations';

/**
 * Button action types for CTA
 */
export type ButtonActionType = 'scroll' | 'link' | 'modal' | 'navigate';

/**
 * Business status states (simplified - no "busy" state)
 */
export type BusinessStatusType = 'open' | 'closed';

/**
 * Text Animation Types
 * Standard: none, fade, slide, typewriter, word-by-word
 * Premium: All animations (same as standard for now)
 */
export type TextAnimationType =
  | 'none'
  | 'fade'
  | 'slide'
  | 'typewriter'
  | 'word-by-word';

/**
 * Background Animation Types
 * Standard: none, parallax, zoom, gradient-shift
 * Premium: All animations including ken-burns
 */
export type BackgroundAnimationType =
  | 'none'
  | 'fade'
  | 'parallax'
  | 'zoom'
  | 'ken-burns'
  | 'gradient-shift';

/**
 * Scroll Indicator Styles
 */
export type ScrollIndicatorStyle = 'arrow' | 'dots' | 'pulse';

/**
 * Enhanced Hero Data interface extending base HeroData
 * This provides strongly typed extensions for V2 features
 */
export interface EnhancedHeroData extends HeroData {
  // Animation settings
  textAnimation?: TextAnimationType;
  backgroundAnimation?: BackgroundAnimationType;

  // Business hours widget
  businessHours?: {
    enabled: boolean;
    status: BusinessStatusType;
    nextChange?: string;
    customMessage?: string;
  };

  // Scroll indicator
  scrollIndicator?: {
    enabled: boolean;
    style: ScrollIndicatorStyle;
    color?: string;
    position?: 'bottom-center' | 'bottom-right' | 'bottom-left';
  };

  // Parallax settings (Premium only - configurable intensity)
  parallaxIntensity?: number; // 0-1 scale, Standard gets fixed 0.3

  // Animation timing
  animationDuration?: number; // milliseconds
}

/**
 * Business hours/status display data
 */
export interface BusinessStatus {
  isOpen: boolean;
  message: string;
  nextChange?: string;
}

/**
 * Primary CTA button configuration
 */
export interface PrimaryCTAConfig {
  text: string;
  action: ButtonActionType;
  scrollTarget?: string;
  link?: string;
  backgroundColor?: string;
  textColor?: string;
}

/**
 * Scroll indicator configuration
 */
export interface ScrollIndicatorConfig {
  enabled: boolean;
  style: ScrollIndicatorStyle;
  color: string;
  position: 'bottom-center' | 'bottom-right' | 'bottom-left';
}

/**
 * Parallax configuration
 */
export interface ParallaxConfig {
  enabled: boolean;
  intensity: number; // Standard: fixed 0.3, Premium: user-configurable 0-1
}

/**
 * Animation state for computed properties
 */
export interface AnimationState {
  textAnimationClass: string;
  backgroundAnimationClass: string;
  businessHoursClass: string;
  scrollIndicatorClass: string;
}

/**
 * CTA button click event
 */
export interface CTAClickEvent {
  action: ButtonActionType;
  target?: string; // Deprecated - use specific properties below
  scrollTarget?: string; // For scroll actions
  link?: string; // For link actions
  navigateTarget?: string; // For navigate actions
  source: 'primary'; // Only primary CTA now
}

/**
 * All computed properties for the hero section
 */
export interface HeroComputedProperties {
  // Business status
  businessStatus: BusinessStatus | null;

  // Primary CTA (Smart CTA for standard plan)
  primaryCTA: PrimaryCTAConfig | null;

  // Animations
  animationState: AnimationState;

  // Scroll indicator
  scrollIndicator: ScrollIndicatorConfig | null;

  // Parallax
  parallax: ParallaxConfig;

  // Layout classes
  layoutClass: string;
  overlayClass: string;
}

/**
 * Hero section events
 */
export interface HeroSectionEvents {
  ctaClick: CTAClickEvent;
  businessHoursClick: void;
  scrollIndicatorClick: void;
  sectionEdit: string;
}
