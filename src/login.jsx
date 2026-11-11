
import { useState } from "react";
import {
  Scale,
  LockKeyhole,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import "./login.css";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [statusMessage, setStatusMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleEmailChange(event) {
    setEmail(event.target.value);
    setErrors((previous) => ({ ...previous, email: "" }));
    setStatusMessage("");
  }

  function handlePasswordChange(event) {
    setPassword(event.target.value);
    setErrors((previous) => ({ ...previous, password: "" }));
    setStatusMessage("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const newErrors = {};
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      newErrors.email = "Please enter your email address.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      newErrors.email = "Enter a valid email address.";
    }

    if (!password) {
      newErrors.password = "Please enter your password.";
    }

    setErrors(newErrors);
    setStatusMessage("");

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onLogin({ email: trimmedEmail, password });
    } catch (error) {
      setStatusMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-brand-panel">
        <div className="auth-brand-top">
          <div className="auth-emblem" aria-hidden="true">
            <Scale size={29} strokeWidth={1.35} />
          </div>

          <div className="auth-brand-name">
            <span>LMK</span>
            <span className="auth-brand-amp">ADVOCATES</span>
            <small>ATTORNEYS AT LAW</small>
          </div>
        </div>

        <div className="auth-brand-message">
          <span className="auth-overline">
            THE STANDARD OF EXCELLENCE
          </span>

          <h1>
            Clarity in
            <br />
            every case.
          </h1>

          <div className="auth-gold-rule" />

          <p>
            Your work. Your clients. Every important detail,
            brought together in one secure workspace.
          </p>

          <div className="auth-principles">
            <div className="auth-principle">
              <span className="auth-principle-number">01</span>
              <span>Precision in practice</span>
            </div>
            <div className="auth-principle">
              <span className="auth-principle-number">02</span>
              <span>Confidentiality by design</span>
            </div>
            <div className="auth-principle">
              <span className="auth-principle-number">03</span>
              <span>Every matter in focus</span>
            </div>
          </div>
        </div>

        <div className="auth-brand-footer">
          <span>BUILT ON TRUST. DRIVEN BY DETAIL.</span>
          <span className="auth-footer-mark">H&amp;C</span>
        </div>
      </section>

      <section className="auth-form-panel">
        <div className="auth-form-wrap">
          <div className="auth-mobile-brand">
            <div className="auth-emblem" aria-hidden="true">
              <Scale size={25} strokeWidth={1.35} />
            </div>
            <span>LMK Advocates</span>
          </div>

          <div className="auth-form-heading">
            <span className="auth-overline">SECURE PORTAL</span>
            <h2>Welcome back.</h2>
            <p>
              Sign in with your firm credentials to continue
              to your workspace.
            </p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="auth-field">
              <label htmlFor="login-email">Work email</label>

              <div
                className={`auth-input-wrap ${
                  errors.email ? "has-error" : ""
                }`}
              >
                <Mail size={18} aria-hidden="true" />
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  placeholder="you@firm.com"
                  value={email}
                  onChange={handleEmailChange}
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck={false}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={
                    errors.email ? "login-email-error" : undefined
                  }
                />
              </div>

              {errors.email && (
                <p className="auth-field-error" id="login-email-error">
                  <AlertCircle size={14} />
                  {errors.email}
                </p>
              )}
            </div>

            <div className="auth-field">
              <div className="auth-label-row">
                <label htmlFor="login-password">Password</label>
                <span className="auth-field-hint">Keep it confidential</span>
              </div>

              <div
                className={`auth-input-wrap ${
                  errors.password ? "has-error" : ""
                }`}
              >
                <LockKeyhole size={18} aria-hidden="true" />
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={handlePasswordChange}
                  autoComplete="current-password"
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={
                    errors.password ? "login-password-error" : undefined
                  }
                />

                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>

              {errors.password && (
                <p className="auth-field-error" id="login-password-error">
                  <AlertCircle size={14} />
                  {errors.password}
                </p>
              )}
            </div>

            {statusMessage && (
              <div className="auth-status-message" role="status">
                <AlertCircle size={19} />
                <p>{statusMessage}</p>
              </div>
            )}

            <button className="auth-submit" type="submit" disabled={isSubmitting}>
              <span>Sign in to your workspace</span>
              <ArrowRight size={18} />
            </button>
          </form>

          <div className="auth-security-note">
            <ShieldCheck size={19} strokeWidth={1.7} />
            <div>
              <strong>Private professional workspace</strong>
              <p>Access is intended for authorised firm personnel.</p>
            </div>
          </div>

          <div className="auth-bottom">
            <span>© 2026 LMK Advocates</span>
            <span className="auth-bottom-separator" />
            <span>Law Firm Management System</span>
          </div>
        </div>
      </section>
    </main>
  );
}
