const accentMap = {
  fitness: "module-chip--fitness",
  calories: "module-chip--calories",
  expenses: "module-chip--expenses",
  attendance: "module-chip--attendance",
  todos: "module-chip--todos"
};

function ModuleCarousel({ modules = [], onQuickAdd }) {
  return (
    <section className="module-carousel" aria-label="Daily modules">
      {modules.map((module) => {
        const accent = accentMap[module.id] ?? "module-chip--fitness";
        return (
          <article key={module.id} className="module-card">
            <div className={`module-chip ${accent}`}>{module.title}</div>
            <h3>{module.subtitle}</h3>
            <div className="module-metric">
              <span>{module.metricLabel}</span>
              <strong>{module.metricValue}</strong>
            </div>
            {module.primaryText && (
              <p className="module-primary-text">{module.primaryText}</p>
            )}
            <button
              type="button"
              className="module-quick"
              onClick={() => onQuickAdd(module.id)}
            >
              Log {module.title}
            </button>
          </article>
        );
      })}
    </section>
  );
}

export default ModuleCarousel;
