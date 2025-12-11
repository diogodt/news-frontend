import type { ReactElement } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { OnboardingPage } from "./pages/OnboardingPage";
import { SearchPage } from "./pages/SearchPage";
import { CollectionsPage } from "./pages/CollectionsPage";
import { ProfilePage } from "./pages/ProfilePage";
import { ArticleDetailPage } from "./pages/ArticleDetailPage";
import { useAuth } from "./context/AuthContext";
import { AppLayout } from "./components/AppLayout";
import { FullScreenLoader } from "./components/Loader";

const ProtectedRoute = ({ children }: { children: ReactElement }) => {
  const { user, initializing } = useAuth();
  const location = useLocation();
  if (initializing) return <FullScreenLoader label="Preparing your workspace..." />;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  return children;
};

const PublicOnly = ({ children }: { children: ReactElement }) => {
  const { user, initializing } = useAuth();
  if (initializing) return <FullScreenLoader />;
  if (user) return <Navigate to="/app/search" replace />;
  return children;
};

const App = () => {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicOnly>
            <LoginPage />
          </PublicOnly>
        }
      />
      <Route
        path="/register"
        element={
          <PublicOnly>
            <RegisterPage />
          </PublicOnly>
        }
      />
      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <OnboardingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="search" replace />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="collections" element={<CollectionsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="article" element={<ArticleDetailPage />} />
      </Route>
      <Route path="/" element={<Navigate to="/app/search" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
