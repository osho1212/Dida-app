const modules = [
  {
    id: "fitness",
    title: "Fitness",
    subtitle: "Barre Burn · 35 mins",
    metricLabel: "Intensity",
    metricValue: "7 / 10",
    accent: "module-chip--fitness"
  },
  {
    id: "calories",
    title: "Calories",
    subtitle: "1,650 kcal • 85g protein",
    metricLabel: "Remaining",
    metricValue: "250 kcal left",
    accent: "module-chip--calories"
  },
  {
    id: "expenses",
    title: "Expenses",
    subtitle: "Brunch + Metro Ride",
    metricLabel: "Today",
    metricValue: "₹1,200",
    accent: "module-chip--expenses"
  },
  {
    id: "attendance",
    title: "Attendance",
    subtitle: "In office · 9:45 AM",
    metricLabel: "Streak",
    metricValue: "12 days",
    accent: "module-chip--attendance"
  },
  {
    id: "todos",
    title: "To-Dos",
    subtitle: "5 of 8 completed",
    metricLabel: "Focus mode",
    metricValue: "Glow hour @ 8 PM",
    accent: "module-chip--todos"
  }
];

function ModuleCarousel({ onQuickAdd }) {
  return (
    <section className="module-carousel" aria-label="Daily modules">
      {modules.map((module) => (
        <article key={module.id} className="module-card">
          <div className={`module-chip ${module.accent}`}>{module.title}</div>
          <h3>{module.subtitle}</h3>
          <div className="module-metric">
            <span>{module.metricLabel}</span>
            <strong>{module.metricValue}</strong>
          </div>
          <button
            type="button"
            className="module-quick"
            onClick={() => onQuickAdd(module.id)}
          >
            Log {module.title}
          </button>
        </article>
      ))}
    </section>
  );
}

export default ModuleCarousel;
