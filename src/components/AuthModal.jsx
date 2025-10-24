import { useEffect, useState } from "react";
import { useFirebase } from "../providers/FirebaseProvider.jsx";

const MODES = {
  LOGIN: "login",
  REGISTER: "register"
};

function AuthModal({ isOpen, onClose }) {
  const { actions = {}, error: globalError, loading, user } = useFirebase();
  const {
    signInWithEmail,
    registerWithEmail,
    signInWithGoogle
  } = actions;
  const [mode, setMode] = useState(MODES.LOGIN);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      setMode(MODES.LOGIN);
      setEmail("");
      setPassword("");
      setDisplayName("");
      setFormError(null);
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const isAnonymous = user?.isAnonymous;
  const disableInputs = submitting || loading;
  const renderError = formError ?? globalError?.message ?? null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (disableInputs) return;
    if (!email || !password) {
      setFormError("Please provide an email and password.");
      return;
    }

    try {
      setSubmitting(true);
      if (mode === MODES.LOGIN) {
        await signInWithEmail?.(email, password);
      } else {
        await registerWithEmail?.(email, password, displayName || undefined);
      }
      onClose();
    } catch (err) {
      setFormError(err.message ?? "Authentication failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    if (disableInputs) return;
    try {
      setSubmitting(true);
      await signInWithGoogle?.();
      onClose();
    } catch (err) {
      setFormError(err.message ?? "Unable to sign in with Google.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-modal" role="dialog" aria-modal="true">
      <div className="auth-backdrop" onClick={onClose} />
      <div className="auth-card">
        <header className="auth-header">
          <h3>{mode === MODES.LOGIN ? "Welcome Back" : "Create Your Profile"}</h3>
          <button type="button" className="auth-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>

        {isAnonymous && (
          <p className="auth-note">
            You&apos;re currently browsing as <strong>Guest Glimmer</strong>. Sign in to save your
            glow across devices.
          </p>
        )}

        <button
          type="button"
          className="auth-google"
          onClick={handleGoogle}
          disabled={disableInputs}
        >
          <span>✨ Continue with Google</span>
        </button>

        <div className="auth-divider">
          <span>or</span>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === MODES.REGISTER && (
            <label>
              <span>Display Name</span>
              <input
                type="text"
                placeholder="Your name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={disableInputs}
              />
            </label>
          )}
          <label>
            <span>Email</span>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={disableInputs}
              required
            />
          </label>
          <label>
            <span>Password</span>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={disableInputs}
              required
            />
          </label>

          {renderError && (
            <p className="auth-error" role="alert">
              {renderError}
            </p>
          )}

          <button type="submit" className="auth-submit" disabled={disableInputs}>
            {submitting ? "Just a sec…" : mode === MODES.LOGIN ? "Sign In" : "Create Account"}
          </button>
        </form>

        <footer className="auth-footer">
          {mode === MODES.LOGIN ? (
            <p>
              New to Dida?{" "}
              <button type="button" onClick={() => setMode(MODES.REGISTER)}>
                Create an account
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <button type="button" onClick={() => setMode(MODES.LOGIN)}>
                Sign in
              </button>
            </p>
          )}
        </footer>
      </div>
    </div>
  );
}

export default AuthModal;
