import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import useAuthStore from "../store/useAuthStore";

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return;
    }
    setLoading(true);
    try {
      await resetPassword(token, password);
      navigate("/login");
    } catch {
      // handled in store
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex flex-col items-center gap-2 mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">Reset Password</h1>
            <p className="text-base-content/60 text-sm">Enter your new password</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <label className="input input-bordered flex items-center gap-2">
              <Lock className="w-4 h-4 opacity-50" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="New password"
                className="grow"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="btn btn-ghost btn-xs btn-circle">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </label>

            <label className="input input-bordered flex items-center gap-2">
              <Lock className="w-4 h-4 opacity-50" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Confirm password"
                className="grow"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </label>

            {password && confirmPassword && password !== confirmPassword && (
              <p className="text-error text-sm">Passwords don&apos;t match</p>
            )}

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={loading || (password && confirmPassword && password !== confirmPassword)}
            >
              {loading ? <span className="loading loading-spinner loading-sm" /> : "Reset Password"}
            </button>
          </form>

          <div className="text-center mt-4">
            <Link to="/login" className="link link-primary text-sm inline-flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" /> Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
