function WeeklyInsights({
  fitnessLogs,
  calorieData,
  expenseData,
  todoData,
  attendanceData
}) {
  // Get last 7 days
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date.toISOString().split('T')[0]);
    }
    return days;
  };

  const last7Days = getLast7Days();

  // Fitness insights
  const weeklyWorkouts = fitnessLogs.length;
  const fitnessGoal = 5;
  const fitnessPercentage = Math.min((weeklyWorkouts / fitnessGoal) * 100, 100);

  // Calorie insights
  const weeklyCalories = calorieData.filter(entry =>
    last7Days.includes(entry.date)
  );
  const totalCalories = weeklyCalories.reduce((sum, entry) => sum + entry.calories, 0);
  const avgDailyCalories = weeklyCalories.length > 0 ? Math.round(totalCalories / 7) : 0;
  const calorieGoal = 2200;

  // Expense insights
  const weeklyExpenses = expenseData.filter(entry =>
    last7Days.includes(entry.date)
  );
  const totalSpent = weeklyExpenses.reduce((sum, entry) => sum + entry.amount, 0);
  const weeklyBudget = 7000;
  const budgetPercentage = Math.min((totalSpent / weeklyBudget) * 100, 100);

  // Todo insights
  const completedTodos = todoData.filter(todo => todo.completed).length;
  const totalTodos = todoData.length;
  const todoCompletionRate = totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0;

  // Attendance insights
  const weeklyAttendance = attendanceData.dates.filter(date =>
    last7Days.includes(date)
  ).length;

  // Overall score calculation
  const overallScore = Math.round(
    (fitnessPercentage * 0.25) +
    (Math.min((avgDailyCalories / calorieGoal) * 100, 100) * 0.2) +
    ((100 - budgetPercentage) * 0.2) +
    (todoCompletionRate * 0.2) +
    ((weeklyAttendance / 5) * 100 * 0.15)
  );

  const insights = [
    {
      title: "💪 Fitness Activity",
      detail: `${weeklyWorkouts} workouts logged`,
      trend: `${fitnessPercentage.toFixed(0)}% of weekly goal`,
      color: '#ff6b9d'
    },
    {
      title: "🍽️ Calorie Balance",
      detail: `Avg ${avgDailyCalories} cal/day`,
      trend: avgDailyCalories < calorieGoal ? 'Below daily goal' : 'Meeting daily goal',
      color: '#c084fc'
    },
    {
      title: "💰 Spending Tracker",
      detail: `₹${totalSpent.toLocaleString()} spent`,
      trend: totalSpent < weeklyBudget ? `₹${(weeklyBudget - totalSpent).toLocaleString()} left` : 'Over budget',
      color: '#fbbf24'
    },
    {
      title: "✅ Task Completion",
      detail: `${completedTodos} of ${totalTodos} tasks done`,
      trend: `${todoCompletionRate}% completion rate`,
      color: '#a78bfa'
    },
    {
      title: "🦋 Office Attendance",
      detail: `${weeklyAttendance} days attended`,
      trend: `${((weeklyAttendance / 5) * 100).toFixed(0)}% attendance`,
      color: '#34d399'
    }
  ];

  return (
    <section className="weekly-insights-page">
      <h2 className="section-title">Weekly Insights</h2>

      <div className="weekly-overview-card">
        <div className="overview-score">
          <div className="score-circle">
            <svg viewBox="0 0 120 120" className="score-svg">
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="rgba(255, 79, 163, 0.2)"
                strokeWidth="12"
              />
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="12"
                strokeDasharray={`${(overallScore / 100) * 314} 314`}
                strokeLinecap="round"
                transform="rotate(-90 60 60)"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ff6b9d" />
                  <stop offset="100%" stopColor="#c084fc" />
                </linearGradient>
              </defs>
            </svg>
            <div className="score-text">
              <span className="score-number">{overallScore}</span>
              <span className="score-label">Overall</span>
            </div>
          </div>
        </div>
        <div className="overview-info">
          <h3>Your Week at a Glance</h3>
          <p>Based on your activity across all trackers, here's how your week looks!</p>
          <div className="quick-stats">
            <div className="quick-stat">
              <span className="stat-icon">💪</span>
              <span className="stat-text">{weeklyWorkouts} Workouts</span>
            </div>
            <div className="quick-stat">
              <span className="stat-icon">💰</span>
              <span className="stat-text">₹{totalSpent.toLocaleString()} Spent</span>
            </div>
            <div className="quick-stat">
              <span className="stat-icon">✅</span>
              <span className="stat-text">{completedTodos} Tasks Done</span>
            </div>
          </div>
        </div>
      </div>

      <div className="insights-grid">
        {insights.map((insight) => (
          <article key={insight.title} className="insight-card-modern">
            <div className="insight-icon" style={{ backgroundColor: `${insight.color}20` }}>
              <span style={{ fontSize: '2rem' }}>{insight.title.split(' ')[0]}</span>
            </div>
            <div className="insight-content">
              <h4>{insight.title.substring(insight.title.indexOf(' ') + 1)}</h4>
              <p className="insight-detail">{insight.detail}</p>
              <span className="insight-trend">{insight.trend}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default WeeklyInsights;
