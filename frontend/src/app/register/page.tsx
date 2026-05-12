"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserPlus, Zap, AlertCircle, CheckCircle } from "lucide-react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"USER" | "ADMIN">("USER");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");
      localStorage.setItem("ptbi_token", data.token);
      localStorage.setItem("ptbi_user", JSON.stringify(data.user));
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <Zap size={22} color="white" />
          </div>
          <span className="auth-logo-text">PrimeTrade AI</span>
        </div>

        <h1 className="auth-title">Create account</h1>
        <p className="auth-subtitle">Join PrimeTrade AI — it&apos;s free</p>

        {error && (
          <div className="alert alert-error" role="alert">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-name">Full Name</label>
            <input
              id="reg-name"
              type="text"
              className="form-input"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">Email address</label>
            <input
              id="reg-email"
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-password">Password</label>
            <input
              id="reg-password"
              type="password"
              className="form-input"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-role">Account Role</label>
            <select
              id="reg-role"
              className="form-input"
              value={role}
              onChange={(e) => setRole(e.target.value as "USER" | "ADMIN")}
            >
              <option value="USER">User</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <div className="alert alert-info" style={{ marginBottom: "1.25rem" }}>
            <CheckCircle size={15} />
            <span>Admin can view and manage all users&apos; tasks</span>
          </div>

          <button
            id="register-submit"
            type="submit"
            className="btn btn-primary btn-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
                Creating account...
              </>
            ) : (
              <>
                <UserPlus size={17} />
                Create Account
              </>
            )}
          </button>
        </form>

        <p className="auth-link-text">
          Already have an account?{" "}
          <Link href="/login" className="auth-link">Sign in</Link>
        </p>
      </div>
    </main>
  );
}
