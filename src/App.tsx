import { lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { ScrollToTop } from './components/ScrollToTop';
import { NotFoundPage } from './pages/NotFoundPage';
import { ACTIVE_TRACK_STORAGE_KEY, DEFAULT_TRACK_SLUG, trackBySlug } from './modules/registry';

// Code-split pages so the landing page doesn't pull in the markdown renderer
// (react-markdown + highlight.js) until a content page is actually visited.
const HomePage = lazy(() => import('./pages/HomePage').then((m) => ({ default: m.HomePage })));
const RoadmapPage = lazy(() => import('./pages/RoadmapPage').then((m) => ({ default: m.RoadmapPage })));
const TopicPage = lazy(() => import('./pages/TopicPage').then((m) => ({ default: m.TopicPage })));
const InterviewPage = lazy(() => import('./pages/InterviewPage').then((m) => ({ default: m.InterviewPage })));
const SearchPage = lazy(() => import('./pages/SearchPage').then((m) => ({ default: m.SearchPage })));

/** Redirect the bare "/" to the last-used (or default) track. */
function RootRedirect() {
  let slug = DEFAULT_TRACK_SLUG;
  try {
    const stored = localStorage.getItem(ACTIVE_TRACK_STORAGE_KEY);
    if (stored && trackBySlug.has(stored)) slug = stored;
  } catch {
    /* localStorage unavailable — fall back to default */
  }
  return <Navigate to={`/${slug}`} replace />;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/:trackSlug" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="roadmap" element={<RoadmapPage />} />
          <Route path="interview" element={<InterviewPage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="topic/*" element={<TopicPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}
