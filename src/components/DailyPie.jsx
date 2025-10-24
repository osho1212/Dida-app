function DailyPie({ slices = [] }) {
  const safeSlices = Array.isArray(slices) ? slices : [];

  if (safeSlices.length === 0) {
    return (
      <section className="daily-pie-grid empty">
        <div className="pie-card">
          <div className="pie-chart">
            <div className="pie-chart-outer" style={{ background: "rgba(255,255,255,0.06)" }}>
              <div className="pie-chart-inner">
                <span className="pie-percentage">0%</span>
                <span className="pie-label">Track today</span>
              </div>
            </div>
          </div>
          <div className="pie-info">
            <h3>Start logging</h3>
            <p className="pie-stats">Add entries to see your balance</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="daily-pie-grid">
      {safeSlices.map((slice) => {
        const percentage = Math.min(Math.max(Math.round(slice.percentage), 0), 100);
        const rotation = (percentage / 100) * 360;

        return (
          <div key={slice.id} className="pie-card">
            <div className="pie-chart">
              <div
                className="pie-chart-outer"
                style={{
                  "--pie-color": slice.color,
                  background: `conic-gradient(
                    var(--pie-color) 0deg ${rotation}deg,
                    rgba(255, 255, 255, 0.1) ${rotation}deg 360deg
                  )`,
                  borderColor: `${slice.color}55`
                }}
              >
                <div className="pie-chart-inner">
                  <span className="pie-percentage">{percentage}%</span>
                  <span className="pie-label">{slice.label}</span>
                </div>
              </div>
            </div>
            <div className="pie-info">
              <h3>{slice.label}</h3>
              <p className="pie-stats">{slice.valueLabel}</p>
            </div>
          </div>
        );
      })}
    </section>
  );
}

export default DailyPie;
