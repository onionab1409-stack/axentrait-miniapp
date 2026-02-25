export type OnboardingAnswerKey = 'role' | 'industry' | 'companySize' | 'painArea' | 'goal';

export type OnboardingAnswers = Partial<Record<OnboardingAnswerKey, string>>;

export type OnboardingOption = {
  value: string;
  label: string;
  icon: string;
  description: string;
};

export type OnboardingQuestion = {
  key: OnboardingAnswerKey;
  step: number;
  title: string;
  subtitle: string;
  options: OnboardingOption[];
};

export type OnboardingRule = {
  name: string;
  match: {
    anyOf: {
      field: OnboardingAnswerKey;
      values: string[];
    };
  };
  recommend: {
    serviceSlugs: string[];
    caseSlugs: string[];
    aiScenario: string;
  };
};
