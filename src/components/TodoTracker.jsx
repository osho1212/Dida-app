import { useState } from "react";

function TodoTracker({ todoData, onToggleTodo, onDeleteTodo }) {
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'completed'
  const [priorityFilter, setPriorityFilter] = useState('all'); // 'all', 'high', 'medium', 'low'

  const priorities = [
    { id: 'high', label: 'High Priority', emoji: '🔴', color: '#f87171' },
    { id: 'medium', label: 'Medium Priority', emoji: '🟡', color: '#fbbf24' },
    { id: 'low', label: 'Low Priority', emoji: '🟢', color: '#4ade80' }
  ];

  const categories = [
    { id: 'work', label: 'Work', emoji: '💼', color: '#c084fc' },
    { id: 'personal', label: 'Personal', emoji: '✨', color: '#ff6b9d' },
    { id: 'fitness', label: 'Fitness', emoji: '💪', color: '#34d399' },
    { id: 'learning', label: 'Learning', emoji: '📚', color: '#60a5fa' },
    { id: 'shopping', label: 'Shopping', emoji: '🛒', color: '#fbbf24' },
    { id: 'other', label: 'Other', emoji: '📌', color: '#a78bfa' }
  ];

  const getFilteredTodos = () => {
    let filtered = [...todoData];

    // Status filter
    if (filter === 'active') {
      filtered = filtered.filter(todo => !todo.completed);
    } else if (filter === 'completed') {
      filtered = filtered.filter(todo => todo.completed);
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(todo => todo.priority === priorityFilter);
    }

    return filtered.sort((a, b) => {
      // Sort by completion status first
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      // Then by priority
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  };

  const filteredTodos = getFilteredTodos();
  const totalTodos = todoData.length;
  const completedCount = todoData.filter(todo => todo.completed).length;
  const activeCount = totalTodos - completedCount;
  const completionPercentage = totalTodos > 0 ? Math.round((completedCount / totalTodos) * 100) : 0;

  const getCategoryInfo = (categoryId) => {
    return categories.find(cat => cat.id === categoryId);
  };

  const getPriorityInfo = (priorityId) => {
    return priorities.find(p => p.id === priorityId);
  };

  const groupedByCategory = categories.map(cat => ({
    ...cat,
    todos: filteredTodos.filter(todo => todo.category === cat.id)
  })).filter(cat => cat.todos.length > 0);

  return (
    <div className="todo-tracker">
      <div className="todo-header">
        <h2 className="section-title">To-Do Tracker</h2>
        <div className="todo-stats-mini">
          <span className="stat-badge active">{activeCount} Active</span>
          <span className="stat-badge completed">{completedCount} Done</span>
        </div>
      </div>

      <div className="todo-summary-card">
        <div className="todo-progress-info">
          <div className="progress-label-row">
            <span className="progress-label">Task Completion</span>
            <span className="progress-percentage">{completionPercentage}%</span>
          </div>
          <div className="todo-progress-bar">
            <div
              className="todo-progress-fill"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          <div className="progress-stats">
            <span>{completedCount} of {totalTodos} tasks completed</span>
          </div>
        </div>
      </div>

      <div className="todo-filters">
        <div className="filter-group">
          <span className="filter-label">Status:</span>
          <div className="filter-buttons">
            <button
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button
              className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
              onClick={() => setFilter('active')}
            >
              Active
            </button>
            <button
              className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
              onClick={() => setFilter('completed')}
            >
              Completed
            </button>
          </div>
        </div>

        <div className="filter-group">
          <span className="filter-label">Priority:</span>
          <div className="filter-buttons">
            <button
              className={`filter-btn ${priorityFilter === 'all' ? 'active' : ''}`}
              onClick={() => setPriorityFilter('all')}
            >
              All
            </button>
            {priorities.map(p => (
              <button
                key={p.id}
                className={`filter-btn ${priorityFilter === p.id ? 'active' : ''}`}
                onClick={() => setPriorityFilter(p.id)}
              >
                {p.emoji} {p.label.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filteredTodos.length > 0 ? (
        <div className="todo-list-grouped">
          {groupedByCategory.map(catGroup => (
            <div key={catGroup.id} className="todo-category-group">
              <div className="category-group-header">
                <span className="category-emoji">{catGroup.emoji}</span>
                <h3 className="category-name">{catGroup.label}</h3>
                <span className="category-count">{catGroup.todos.length}</span>
              </div>

              <div className="todo-list">
                {catGroup.todos.map(todo => {
                  const priority = getPriorityInfo(todo.priority);
                  return (
                    <div key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
                      <label className="todo-checkbox-label">
                        <input
                          type="checkbox"
                          checked={todo.completed}
                          onChange={() => onToggleTodo(todo.id)}
                          className="todo-checkbox"
                        />
                        <div className="todo-content">
                          <div className="todo-main-row">
                            <span className="todo-title">{todo.title}</span>
                            <div className="todo-badges">
                              <span
                                className="priority-badge"
                                style={{ backgroundColor: `${priority.color}20`, color: priority.color }}
                              >
                                {priority.emoji}
                              </span>
                            </div>
                          </div>
                          {todo.description && (
                            <p className="todo-description">{todo.description}</p>
                          )}
                          {todo.dueDate && (
                            <span className="todo-due-date">
                              📅 Due: {new Date(todo.dueDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                          )}
                        </div>
                      </label>
                      <button
                        type="button"
                        className="delete-entry"
                        onClick={() => onDeleteTodo(todo.id)}
                        aria-label="Delete todo"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p>No tasks found with current filters.</p>
          <p>Use Quick Add → To-Dos to create tasks!</p>
        </div>
      )}
    </div>
  );
}

export default TodoTracker;
