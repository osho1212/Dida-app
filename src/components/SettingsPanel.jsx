import { useEffect, useMemo, useState } from "react";
import { DEFAULT_TARGETS } from "../constants/defaultTargets.js";

function SettingsPanel({
  currentTheme,
  onThemeChange,
  user,
  profile,
  onSignOut,
  onOpenAuth,
  targets,
  onUpdateTargets
}) {
  const [targetDraft, setTargetDraft] = useState(targets ?? DEFAULT_TARGETS);

  const selectedTheme = currentTheme || "girly";
  const isAnonymous = user?.isAnonymous ?? true;
  const accountName = profile?.displayName ?? user?.displayName ?? "Guest Glimmer";
  const accountEmail = user?.email ?? profile?.email ?? null;

  const handleTargetChange = (field, value) => {
    setTargetDraft((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const hasTargetChanges = useMemo(() => {
    if (!targets) return false;
    return Object.keys(DEFAULT_TARGETS).some((key) => {
      const currentVal = Number(targets?.[key] ?? DEFAULT_TARGETS[key]);
      const draftVal = Number(targetDraft?.[key] ?? DEFAULT_TARGETS[key]);
      return currentVal !== draftVal;
    });
  }, [targetDraft, targets]);

  const themes = [
    {
      id: "girly",
      name: "Girly Glow",
      class: "swatch-inner--girly"
    },
    { id: "sunrise", name: "Sunrise Burst", class: "swatch-inner--sunrise" },
    { id: "ocean", name: "Ocean Calm", class: "swatch-inner--ocean" },
    { id: "royal", name: "Sapphire Dream", class: "swatch-inner--royal" }
  ];

  const saveTargets = async () => {
    if (!onUpdateTargets) return;
    await onUpdateTargets({
      fitnessDailyExercises: Number(targetDraft.fitnessDailyExercises),
      calorieDailyGoal: Number(targetDraft.calorieDailyGoal),
      expenseDailyBudget: Number(targetDraft.expenseDailyBudget),
      expenseMonthlyBudget: Number(targetDraft.expenseMonthlyBudget),
      todoDailyTarget: Number(targetDraft.todoDailyTarget)
    });
  };

  useEffect(() => {
    if (targets) {
      setTargetDraft(targets);
    }
  }, [targets]);

  return (
    <section className="settings-panel">
      <div className="account-card">
        <h3>Account</h3>
        <p>
          {isAnonymous
            ? "Create a profile to sync data across devices and unlock weekly digests."
            : "Manage your personal details and sign out from your glow hub."}
        </p>
        <div className="account-details">
          <div className="account-pill">
            <span className="account-name">{accountName}</span>
            {accountEmail && <span className="account-email">{accountEmail}</span>}
            {!accountEmail && isAnonymous && (
              <span className="account-email muted">No email connected</span>
            )}
          </div>
          <div className="account-actions">
            {isAnonymous ? (
              <button
                type="button"
                className="pill-button"
                onClick={() => onOpenAuth && onOpenAuth()}
              >
                Sign in or create account
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="pill-button pill-button--outline"
                  onClick={() => onOpenAuth && onOpenAuth()}
                >
                  Edit profile
                </button>
                <button type="button" className="pill-button" onClick={() => onSignOut && onSignOut()}>
                  Sign out
                </button>
              </>
            )}
          </div>
      </div>
    </div>

      <div className="targets-card">
        <h4>Daily Targets</h4>
        <p>Fine-tune goals for each tracker to match your personal rhythm.</p>
        <div className="targets-grid">
          <label>
            <span>Fitness moves / day</span>
            <input
              type="number"
              min={1}
              value={targetDraft.fitnessDailyExercises ?? DEFAULT_TARGETS.fitnessDailyExercises}
              onChange={(e) => handleTargetChange("fitnessDailyExercises", e.target.value)}
            />
          </label>
          <label>
            <span>Calorie goal</span>
            <input
              type="number"
              min={500}
              step={10}
              value={targetDraft.calorieDailyGoal ?? DEFAULT_TARGETS.calorieDailyGoal}
              onChange={(e) => handleTargetChange("calorieDailyGoal", e.target.value)}
            />
          </label>
          <label>
            <span>Daily spend budget</span>
            <input
              type="number"
              min={100}
              step={50}
              value={targetDraft.expenseDailyBudget ?? DEFAULT_TARGETS.expenseDailyBudget}
              onChange={(e) => handleTargetChange("expenseDailyBudget", e.target.value)}
            />
          </label>
          <label>
            <span>Monthly spend cap</span>
            <input
              type="number"
              min={500}
              step={100}
              value={targetDraft.expenseMonthlyBudget ?? DEFAULT_TARGETS.expenseMonthlyBudget}
              onChange={(e) => handleTargetChange("expenseMonthlyBudget", e.target.value)}
            />
          </label>
          <label>
            <span>To-dos per day</span>
            <input
              type="number"
              min={1}
              value={targetDraft.todoDailyTarget ?? DEFAULT_TARGETS.todoDailyTarget}
              onChange={(e) => handleTargetChange("todoDailyTarget", e.target.value)}
            />
          </label>
        </div>
        <button
          type="button"
          className="pill-button"
          disabled={!hasTargetChanges || !onUpdateTargets}
          onClick={saveTargets}
        >
          Save targets
        </button>
      </div>

      <div className="profile-card">
        <h3>Profile Aura</h3>
        <p>Customize your palette and tracking preferences.</p>
        <div className="theme-swatches">
          {themes.map((theme) => (
            <button
              key={theme.id}
              type="button"
              className={`swatch ${
                selectedTheme === theme.id ? "is-active" : ""
              }`}
              onClick={() => onThemeChange && onThemeChange(theme.id)}
            >
              <span className={`swatch-inner ${theme.class}`} />
              {theme.name}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

export default SettingsPanel;
