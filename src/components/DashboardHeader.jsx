import AvatarGlow from "./AvatarGlow.jsx";

const vibeQuotes = [
  "Glow getter mode: ON ✨",
  "Pink plans, bold moves 💖",
  "Balance that budget, babe 💼",
  "Sweat, sparkle, repeat 💪"
];

function DashboardHeader({ onQuickAdd }) {
  const quote = vibeQuotes[new Date().getDay() % vibeQuotes.length];

  return (
    <header className="dashboard-header">
      <div className="header-left">
        <AvatarGlow />
        <div>
          <p className="greeting-eyebrow">Hello DIDA ❤️</p>
          <h2 className="greeting-title">Let&apos;s make today radiant</h2>
          <p className="greeting-quote">{quote}</p>
        </div>
      </div>

      <div className="header-right">
        <div className="glow-goals">
          <div>
            <span className="goal-label">Workout</span>
            <span className="goal-value">45 / 60 mins</span>
          </div>
          <div>
            <span className="goal-label">Calories</span>
            <span className="goal-value">1,650 / 1,900 kcal</span>
          </div>
          <div>
            <span className="goal-label">Spend</span>
            <span className="goal-value">₹1,200 / ₹2,000</span>
          </div>
        </div>
        <button className="quick-add" type="button" onClick={onQuickAdd}>
          <span aria-hidden="true">+</span>
          Quick Add
        </button>
      </div>
    </header>
  );
}

export default DashboardHeader;
