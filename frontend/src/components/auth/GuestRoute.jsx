import { Navigate } from "react-router-dom";
import useAuthStore from "../../store/useAuthStore";

export default function GuestRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (isAuthenticated) return <Navigate to="/" replace />;
  return children;
}
