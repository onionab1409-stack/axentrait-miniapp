export interface ServiceCategory {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon: string;
  order: number;
}

export interface Package {
  id: string;
  serviceId: string;
  name: string;
  priceRange: string;
  includes: string[];
  excludes: string[];
  idealFor: string;
  slaTerms?: string;
}

export interface CaseStudy {
  id: string;
  slug: string;
  title: string;
  clientIndustry: string;
  problem: string;
  approach: string;
  solution: string;
  stack: string[];
  timeline: string;
  teamSize: number;
  metrics: {
    roi?: string;
    costReduction?: string;
    revenueIncrease?: string;
    slaImprovement?: string;
    headline?: string;
    items?: Array<{ label: string; value: string; description: string }>;
  };
  assets: {
    images: string[];
    video?: string;
    quotes: string[];
    beforeAfter?: { before: string; after: string };
  };
  testimonial?: { quote: string; author: string };
  tags: string[];
  relatedServiceSlugs: string[];
}

export interface Service {
  id: string;
  slug: string;
  categoryId: string;
  title: string;
  shortPitch: string;
  longDescription: string;
  deliverables: string[];
  prerequisites: string[];
  typicalTimeline: string;
  startingPrice?: string;
  tags: string[];
  relatedCases: string[];
  packages?: Package[];
  relatedCaseStudies?: CaseStudy[];
}
