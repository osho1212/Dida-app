import { useState } from "react";

function ExpenseTracker({ expenseData, onDeleteEntry }) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState('daily'); // 'daily' or 'monthly'

  const getFilteredExpenses = () => {
    if (viewMode === 'daily') {
      return expenseData.filter(entry => entry.date === selectedDate);
    } else {
      const [year, month] = selectedDate.split('-');
      return expenseData.filter(entry => entry.date.startsWith(`${year}-${month}`));
    }
  };

  const filteredExpenses = getFilteredExpenses();
  const totalSpent = filteredExpenses.reduce((sum, entry) => sum + entry.amount, 0);
  const monthlyBudget = 30000;
  const dailyBudget = 1000;
  const budget = viewMode === 'daily' ? dailyBudget : monthlyBudget;
  const remaining = budget - totalSpent;
  const percentage = Math.min((totalSpent / budget) * 100, 100);

  const categories = [
    { id: 'food', label: 'Food & Dining', emoji: '🍽️', color: '#ff6b9d' },
    { id: 'transport', label: 'Transport', emoji: '🚗', color: '#c084fc' },
    { id: 'shopping', label: 'Shopping', emoji: '🛍️', color: '#fbbf24' },
    { id: 'entertainment', label: 'Entertainment', emoji: '🎬', color: '#60a5fa' },
    { id: 'health', label: 'Health & Fitness', emoji: '💊', color: '#34d399' },
    { id: 'bills', label: 'Bills & Utilities', emoji: '📱', color: '#f87171' },
    { id: 'other', label: 'Other', emoji: '📦', color: '#a78bfa' }
  ];

  const getCategoryExpenses = (categoryId) => {
    return filteredExpenses.filter(entry => entry.category === categoryId);
  };

  const getCategoryTotal = (categoryId) => {
    return getCategoryExpenses(categoryId).reduce((sum, entry) => sum + entry.amount, 0);
  };

  const getCategoryColor = (categoryId) => {
    return categories.find(cat => cat.id === categoryId)?.color || '#a78bfa';
  };

  const categoryTotals = categories.map(cat => ({
    ...cat,
    total: getCategoryTotal(cat.id),
    entries: getCategoryExpenses(cat.id)
  })).filter(cat => cat.total > 0);

  return (
    <div className="expense-tracker">
      <div className="expense-header">
        <h2 className="section-title">Expense Tracker</h2>
        <div className="expense-controls">
          <div className="view-toggle">
            <button
              className={`toggle-btn ${viewMode === 'daily' ? 'active' : ''}`}
              onClick={() => setViewMode('daily')}
            >
              Daily
            </button>
            <button
              className={`toggle-btn ${viewMode === 'monthly' ? 'active' : ''}`}
              onClick={() => setViewMode('monthly')}
            >
              Monthly
            </button>
          </div>
          <input
            type={viewMode === 'daily' ? 'date' : 'month'}
            value={viewMode === 'daily' ? selectedDate : selectedDate.substring(0, 7)}
            onChange={(e) => setSelectedDate(viewMode === 'daily' ? e.target.value : `${e.target.value}-01`)}
            className="date-picker"
          />
        </div>
      </div>

      <div className="expense-summary-card">
        <div className="expense-stats">
          <div className="expense-stat">
            <span className="stat-label">{viewMode === 'daily' ? 'Daily' : 'Monthly'} Budget</span>
            <span className="stat-value goal">₹{budget.toLocaleString()}</span>
          </div>
          <div className="expense-stat">
            <span className="stat-label">Total Spent</span>
            <span className="stat-value spent">₹{totalSpent.toLocaleString()}</span>
          </div>
          <div className="expense-stat">
            <span className="stat-label">Remaining</span>
            <span className={`stat-value ${remaining >= 0 ? 'remaining' : 'exceeded'}`}>
              ₹{remaining >= 0 ? remaining.toLocaleString() : Math.abs(remaining).toLocaleString()}
            </span>
          </div>
        </div>

        <div className="expense-progress-bar">
          <div
            className="expense-progress-fill"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <p className="progress-text">{Math.round(percentage)}% of budget used</p>
      </div>

      {categoryTotals.length > 0 ? (
        <>
          <div className="category-breakdown">
            <h3 className="breakdown-title">Spending by Category</h3>
            <div className="category-chips">
              {categoryTotals.map((cat) => (
                <div key={cat.id} className="category-chip">
                  <span className="chip-emoji">{cat.emoji}</span>
                  <div className="chip-info">
                    <span className="chip-label">{cat.label}</span>
                    <span className="chip-amount">₹{cat.total.toLocaleString()}</span>
                  </div>
                  <div
                    className="chip-bar"
                    style={{
                      width: `${(cat.total / totalSpent) * 100}%`,
                      backgroundColor: cat.color
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="expense-list-section">
            <h3 className="breakdown-title">All Transactions</h3>
            <div className="expense-list">
              {filteredExpenses
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                .map((expense) => {
                  const category = categories.find(cat => cat.id === expense.category);
                  return (
                    <div key={expense.id} className="expense-item">
                      <div className="expense-icon" style={{ backgroundColor: `${category?.color}20` }}>
                        <span style={{ color: category?.color }}>{category?.emoji}</span>
                      </div>
                      <div className="expense-details">
                        <div className="expense-main">
                          <span className="expense-name">{expense.description}</span>
                          <span className="expense-amount">₹{expense.amount.toLocaleString()}</span>
                        </div>
                        <div className="expense-meta">
                          <span className="expense-category">{category?.label}</span>
                          {expense.notes && <span className="expense-notes">• {expense.notes}</span>}
                        </div>
                      </div>
                      <button
                        type="button"
                        className="delete-entry"
                        onClick={() => onDeleteEntry(expense.id)}
                        aria-label="Delete expense"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
            </div>
          </div>
        </>
      ) : (
        <div className="empty-state">
          <p>No expenses logged for this {viewMode === 'daily' ? 'day' : 'month'} yet.</p>
          <p>Use Quick Add → Expenses to start tracking!</p>
        </div>
      )}
    </div>
  );
}

export default ExpenseTracker;
