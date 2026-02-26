import { lazy } from 'react';
import { createHashRouter, Navigate } from 'react-router-dom';

const SplashPage = lazy(() => import('../features/onboarding/SplashPage'));
const WelcomePage = lazy(() => import('../features/onboarding/WelcomePage'));
const SurveyPage = lazy(() => import('../features/onboarding/SurveyPage'));
const OnboardingResultPage = lazy(() => import('../features/onboarding/OnboardingResultPage'));

const ServicesCatalogPage = lazy(() => import('../features/services/ServicesCatalogPage'));
const ServiceDetailPage = lazy(() => import('../features/services/ServiceDetailPage'));
const PackagesComparePage = lazy(() => import('../features/services/PackagesComparePage'));
const RoiCalculatorPage = lazy(() => import('../features/services/RoiCalculatorPage'));

const CasesGalleryPage = lazy(() => import('../features/cases/CasesGalleryPage'));
const CaseDetailPage = lazy(() => import('../features/cases/CaseDetailPage'));
const CaseBeforeAfterPage = lazy(() => import('../features/cases/CaseBeforeAfterPage'));
const CaseMediaPage = lazy(() => import('../features/cases/CaseMediaPage'));

// AiHubPage removed — /ai now goes directly to AiChatPage
const AiChatPage = lazy(() => import('../features/ai/AiChatPage'));
const AiResultPage = lazy(() => import('../features/ai/AiResultPage'));

const LeadFormPage = lazy(() => import('../features/leads/LeadFormPage'));
const BookingPage = lazy(() => import('../features/leads/BookingPage'));
const LeadSuccessPage = lazy(() => import('../features/leads/LeadSuccessPage'));

const AccountPage = lazy(() => import('../features/account/AccountPage'));
const ReferralPage = lazy(() => import('../features/account/ReferralPage'));

export const router = createHashRouter([
  { path: '/', element: <SplashPage /> },
  { path: '/welcome', element: <WelcomePage /> },
  { path: '/onboarding', element: <SurveyPage /> },
  { path: '/onboarding/result', element: <OnboardingResultPage /> },

  { path: '/services', element: <ServicesCatalogPage /> },
  { path: '/services/:id', element: <ServiceDetailPage /> },
  { path: '/services/:id/packages', element: <PackagesComparePage /> },
  { path: '/services/:id/calculator', element: <RoiCalculatorPage /> },

  { path: '/cases', element: <CasesGalleryPage /> },
  { path: '/cases/:id', element: <CaseDetailPage /> },
  { path: '/cases/:id/before-after', element: <CaseBeforeAfterPage /> },
  { path: '/cases/:id/media', element: <CaseMediaPage /> },

  { path: '/ai', element: <AiChatPage /> },
  { path: '/ai/chat/:sessionId', element: <AiChatPage /> },
  { path: '/ai/result/:sessionId', element: <AiResultPage /> },

  { path: '/lead', element: <LeadFormPage /> },
  { path: '/lead/booking', element: <BookingPage /> },
  { path: '/lead/success', element: <LeadSuccessPage /> },

  { path: '/account', element: <AccountPage /> },
  { path: '/referral', element: <ReferralPage /> },

  { path: '*', element: <Navigate to="/" replace /> },
]);
