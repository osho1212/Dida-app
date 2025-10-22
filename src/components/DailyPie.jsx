const categories = [
  { id: "fitness", label: "Fitness Energy", value: 75, max: 100, tone: "slice-fitness" },
  { id: "calories", label: "Calorie Balance", value: 1850, max: 2200, tone: "slice-calories" },
  { id: "expenses", label: "Spend Bliss", value: 245, max: 500, tone: "slice-expenses" },
  { id: "attendance", label: "Office Glow", value: 6.5, max: 8, tone: "slice-attendance" },
  { id: "todos", label: "Task Magic", value: 8, max: 12, tone: "slice-todos" }
];

function DailyPie() {
  return (
    <section className="daily-pie-grid">
      {categories.map((category) => {
        const percentage = Math.round((category.value / category.max) * 100);
        const rotation = (percentage / 100) * 360;

        return (
          <div key={category.id} className="pie-card">
            <div className="pie-chart">
              <div
                className={`pie-chart-outer ${category.tone}`}
                style={{
                  background: `conic-gradient(
                    var(--pie-color) 0deg ${rotation}deg,
                    rgba(255, 255, 255, 0.1) ${rotation}deg 360deg
                  )`
                }}
              >
                <div className="pie-chart-inner">
                  <span className="pie-percentage">{percentage}%</span>
                </div>
              </div>
            </div>
            <div className="pie-info">
              <h3>{category.label}</h3>
              <p className="pie-stats">{category.value} / {category.max}</p>
            </div>
          </div>
        );
      })}
    </section>
  );
}

export default DailyPie;
