import { Link } from "react-router-dom";
import { Ghost } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-base-200 gap-4 p-4">
      <Ghost className="w-20 h-20 text-base-content/30" />
      <h1 className="text-5xl font-bold">404</h1>
      <p className="text-base-content/60 text-lg">Page not found</p>
      <Link to="/" className="btn btn-primary">
        Go Home
      </Link>
    </div>
  );
}
