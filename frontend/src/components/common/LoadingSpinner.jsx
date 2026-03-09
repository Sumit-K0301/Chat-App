import { Loader2 } from "lucide-react";

export default function LoadingSpinner({ size = "w-8 h-8" }) {
  return (
    <div className="flex items-center justify-center w-full h-full">
      <Loader2 className={`${size} animate-spin text-primary`} />
    </div>
  );
}
