import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import axiosInstance from "../api/axiosInstance";

export default function VerifyEmailPage() {
  const { token } = useParams();
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await axiosInstance.get(`/api/auth/verify-email/${token}`);
        setStatus("success");
        setMessage(res.data.message || "Email verified successfully!");
      } catch (err) {
        setStatus("error");
        setMessage(err.response?.data?.message || "Verification failed");
      }
    };
    verify();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body items-center text-center">
          {status === "loading" && (
            <>
              <Loader2 className="w-16 h-16 animate-spin text-primary" />
              <p className="text-lg mt-4">Verifying your email...</p>
            </>
          )}
          {status === "success" && (
            <>
              <CheckCircle className="w-16 h-16 text-success" />
              <h2 className="text-2xl font-bold mt-4">Verified!</h2>
              <p className="text-base-content/60">{message}</p>
              <Link to="/login" className="btn btn-primary mt-4">
                Go to Login
              </Link>
            </>
          )}
          {status === "error" && (
            <>
              <XCircle className="w-16 h-16 text-error" />
              <h2 className="text-2xl font-bold mt-4">Verification Failed</h2>
              <p className="text-base-content/60">{message}</p>
              <Link to="/login" className="btn btn-primary mt-4">
                Go to Login
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
