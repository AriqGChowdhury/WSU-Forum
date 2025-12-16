import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import LoadingIndicator from "@/components/LoadingIndicator";

function ProtectedRoute({ children }) {
  const { user, refresh, loading: authLoading } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(null);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (!user) {
        try {
          await refresh();        // Try refreshing token
          setIsAuthorized(true);
        } catch {
          setIsAuthorized(false); // Not authorized
        }
      } else {
        setIsAuthorized(true);
      }
    };

    checkAuth();
  }, [user, refresh]);

  // Show loading while auth is being verified
  if (isAuthorized === null || authLoading) {
    return <LoadingIndicator />;
  }

  // Render protected content or redirect to login
  return isAuthorized ? children : <Navigate to="/login" />;
}

export default ProtectedRoute;
