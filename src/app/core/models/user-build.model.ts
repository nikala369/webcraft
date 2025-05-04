/**
 * Possible states for a website build
 */
export type BuildStatus =
  | 'PENDING'
  | 'ACTIVE'
  | 'FAILED'
  | 'PUBLISHED'
  | 'UNPUBLISHED'
  | 'STOPPED';

/**
 * Basic UserBuild interface
 */
export interface UserBuild {
  id: string;
  status: BuildStatus;
  createdAt?: string;
  userTemplateId: string;
  subscriptionId: string;
  siteUrl?: string;
  template?: any;
  subscription?: any;
}

/**
 * Extended interface to match actual API response format
 */
export interface ExtendedUserBuild {
  id: string;
  status: BuildStatus;
  createdAt?: string;
  siteUrl?: string;
  address?: {
    address: string | null;
    loadBalancerAddress?: string;
  };
  userTemplate?: {
    id: string;
    name: string;
    template?: {
      id: string;
      name: string;
      description?: string;
      templateType?: {
        id: string;
        name: string;
        key: string;
      };
      templatePlan?: {
        id: string;
        type: string;
        description?: string;
        priceCents?: number;
      };
    };
  };
  userBuildSubscription?: {
    status: string;
    createdAt: string;
  } | null;
}

/**
 * API response interface for paginated data
 */
export interface ApiResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    offset: number;
    unpaged: boolean;
    paged: boolean;
  };
  last: boolean;
  totalElements: number;
  totalPages: number;
  first: boolean;
  size: number;
  number: number;
  numberOfElements: number;
  empty: boolean;
}
