import { isSameISODate, todayISO } from "./date.js";
import { DEFAULT_TARGETS, mergeTargets } from "../constants/defaultTargets.js";

function safeNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function getTarget(targets, key) {
  return safeNumber(
    targets[key] ?? DEFAULT_TARGETS[key],
    DEFAULT_TARGETS[key]
  );
}

function extractTodayCollections(data, isoToday) {
  const todayFitness = data.fitnessLogs.filter((log) =>
    isSameISODate(log.date ?? log.timestamp ?? log.prettyDate, isoToday)
  );

  const todayCalories = data.calorieData.filter((entry) =>
    isSameISODate(entry.date ?? entry.timestamp, isoToday)
  );

  const todayExpenses = data.expenseData.filter((entry) =>
    isSameISODate(entry.date ?? entry.timestamp, isoToday)
  );

  const todayTodos = data.todoData.filter((todo) =>
    isSameISODate(todo.dueDate ?? todo.createdAt, isoToday)
  );

  const attendanceToday = data.attendanceData.dates.includes(isoToday);

  return {
    todayFitness,
    todayCalories,
    todayExpenses,
    todayTodos,
    attendanceToday
  };
}

function calculateFitnessMetrics(todayFitness, targets) {
  const goal = getTarget(targets, "fitnessDailyExercises");
  const completedExercises = todayFitness.reduce((sum, log) => {
    if (!Array.isArray(log.exercises)) return sum;
    return sum + log.exercises.filter((ex) => ex.completed).length;
  }, 0);
  const notes = todayFitness
    .map((log) => log.notes)
    .filter(Boolean)
    .slice(0, 2);

  const intensityScore = goal > 0 ? Math.min(completedExercises / goal, 1) : 0;

  return {
    completedExercises,
    notes,
    intensityScore,
    subtitle:
      completedExercises > 0
        ? `${completedExercises} exercise${completedExercises !== 1 ? "s" : ""} logged`
        : "No workouts logged yet",
    metricLabel: "Goal",
    metricValue: `${completedExercises}/${goal}`,
    goal
  };
}

function calculateCalorieMetrics(todayCalories, targets) {
  const calorieGoal = getTarget(targets, "calorieDailyGoal");
  const totalCalories = todayCalories.reduce(
    (sum, entry) => sum + safeNumber(entry.calories, 0),
    0
  );
  const remaining = calorieGoal - totalCalories;
  const ratio = calorieGoal > 0 ? Math.min(totalCalories / calorieGoal, 1) : 0;

  return {
    totalCalories,
    remaining,
    ratio,
    subtitle:
      totalCalories > 0
        ? `${Math.round(totalCalories)} kcal logged`
        : "No meals tracked yet",
    metricLabel: remaining >= 0 ? "Remaining" : "Over by",
    metricValue:
      remaining >= 0
        ? `${Math.max(0, Math.round(remaining))} kcal`
        : `${Math.round(Math.abs(remaining))} kcal`,
    goal: calorieGoal
  };
}

function calculateExpenseMetrics(todayExpenses, targets) {
  const dailyBudget = getTarget(targets, "expenseDailyBudget");
  const totalSpent = todayExpenses.reduce(
    (sum, entry) => sum + safeNumber(entry.amount, 0),
    0
  );
  const remaining = dailyBudget - totalSpent;
  const categoryTotals = todayExpenses.reduce((acc, entry) => {
    const cat = entry.category ?? "other";
    acc[cat] = (acc[cat] ?? 0) + safeNumber(entry.amount, 0);
    return acc;
  }, {});
  const topCategory =
    Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  const ratio = dailyBudget > 0 ? Math.min(totalSpent / dailyBudget, 1) : 0;

  return {
    totalSpent,
    remaining,
    ratio,
    subtitle:
      totalSpent > 0
        ? `₹${Math.round(totalSpent).toLocaleString()} spent${
            topCategory ? ` • Top: ${topCategory}` : ""
          }`
        : "No expenses tracked yet",
    metricLabel: remaining >= 0 ? "Budget left" : "Over spend",
    metricValue:
      remaining >= 0
        ? `₹${Math.round(remaining).toLocaleString()}`
        : `₹${Math.round(Math.abs(remaining)).toLocaleString()}`,
    topCategory,
    dailyBudget
  };
}

function calculateTodoMetrics(todayTodos, targets) {
  const todoTarget = getTarget(targets, "todoDailyTarget");
  const total = todayTodos.length;
  const completed = todayTodos.filter((todo) => todo.completed).length;
  const ratio = todoTarget > 0 ? Math.min(completed / todoTarget, 1) : 0;

  return {
    total,
    completed,
    ratio,
    subtitle:
      total > 0
        ? `${completed} of ${total} complete`
        : "No tasks scheduled today",
    metricLabel: "Daily target",
    metricValue: `${completed}/${todoTarget}`,
    todoTarget
  };
}

function calculateAttendanceMetrics(attendanceToday, attendanceData) {
  const streak = attendanceData.dates
    .slice()
    .sort()
    .reverse()
    .reduce((count, date) => {
      const diffDays =
        (new Date(todayISO()) - new Date(date)) / (1000 * 60 * 60 * 24);
      if (diffDays === count) {
        return count + 1;
      }
      return count;
    }, 0);

  return {
    attendanceToday,
    streak,
    ratio: attendanceToday ? 1 : 0,
    subtitle: attendanceToday ? "Checked in" : "Not logged yet",
    metricLabel: "Streak",
    metricValue: `${streak} day${streak === 1 ? "" : "s"}`
  };
}

export function buildDailyDashboardData(data, userTargets = DEFAULT_TARGETS) {
  const targets = mergeTargets(userTargets);
  const isoToday = todayISO();
  const {
    todayFitness,
    todayCalories,
    todayExpenses,
    todayTodos,
    attendanceToday
  } = extractTodayCollections(data, isoToday);

  const fitness = calculateFitnessMetrics(todayFitness, targets);
  const calories = calculateCalorieMetrics(todayCalories, targets);
  const expenses = calculateExpenseMetrics(todayExpenses, targets);
  const todos = calculateTodoMetrics(todayTodos, targets);
  const attendance = calculateAttendanceMetrics(attendanceToday, data.attendanceData);

  const slicesBase = [
    {
      id: "fitness",
      label: "Fitness Energy",
      score: fitness.intensityScore,
      detail: `${fitness.completedExercises}/${fitness.goal} moves`,
      color: "#ff4fa3"
    },
    {
      id: "calories",
      label: "Calorie Balance",
      score: Math.max(1 - calories.ratio, 0), // remaining proportion
      detail: `${Math.max(0, Math.round(calories.remaining))} kcal left`,
      color: "#d6c8ff"
    },
    {
      id: "expenses",
      label: "Spend Bliss",
      score: Math.max(1 - expenses.ratio, 0),
      detail: expenses.remaining >= 0
        ? `₹${Math.round(expenses.remaining).toLocaleString()} left`
        : `₹${Math.round(Math.abs(expenses.remaining)).toLocaleString()} over`,
      color: "#ffa5d3"
    },
    {
      id: "attendance",
      label: "Office Glow",
      score: attendance.ratio,
      detail: attendance.attendanceToday ? "Present" : "Mark attendance",
      color: "#ff7dc2"
    },
    {
      id: "todos",
      label: "Task Magic",
      score: todos.ratio,
      detail: `${todos.completed}/${todos.todoTarget} done`,
      color: "#c7b8ff"
    }
  ];

  const totalScore = slicesBase.reduce((sum, slice) => sum + slice.score, 0);
  const fallback = slicesBase.length;

  const contributions = slicesBase.map((slice) =>
    totalScore > 0 ? slice.score / totalScore : 1 / fallback
  );

  let accumulated = 0;
  const slices = slicesBase.map((slice, index) => {
    const contribution = contributions[index];
    let percentage = Math.round(contribution * 100);
    if (index === slicesBase.length - 1) {
      percentage = Math.max(0, 100 - accumulated);
    } else {
      accumulated += percentage;
    }

    return {
      ...slice,
      contribution,
      percentage,
      valueLabel: slice.detail
    };
  });

  const modules = [
    {
      id: "fitness",
      title: "Fitness",
      subtitle: fitness.subtitle,
      metricLabel: fitness.metricLabel,
      metricValue: fitness.metricValue,
      primaryText: `${fitness.completedExercises}/${fitness.goal} moves`
    },
    {
      id: "calories",
      title: "Calories",
      subtitle: calories.subtitle,
      metricLabel: calories.metricLabel,
      metricValue: calories.metricValue,
      primaryText: `${Math.round(calories.totalCalories)}/${Math.round(calories.goal)} kcal`
    },
    {
      id: "expenses",
      title: "Expenses",
      subtitle: expenses.subtitle,
      metricLabel: expenses.metricLabel,
      metricValue: expenses.metricValue,
      primaryText: `₹${Math.round(expenses.totalSpent).toLocaleString()} / ₹${Math.round(
        expenses.dailyBudget
      ).toLocaleString()}`
    },
    {
      id: "attendance",
      title: "Attendance",
      subtitle: attendance.subtitle,
      metricLabel: attendance.metricLabel,
      metricValue: attendance.metricValue,
      primaryText: attendance.attendanceToday ? "You're checked in" : "Yet to log"
    },
    {
      id: "todos",
      title: "To-Dos",
      subtitle: todos.subtitle,
      metricLabel: todos.metricLabel,
      metricValue: todos.metricValue,
      primaryText: `${todos.completed}/${todos.todoTarget} complete`
    }
  ];

  const headerStats = [
    {
      label: "Workout",
      value: `${fitness.completedExercises}/${fitness.goal} moves`
    },
    {
      label: "Calories",
      value: `${Math.round(Math.max(calories.totalCalories, 0))}/${Math.round(calories.goal)} kcal`
    },
    {
      label: "Spend",
      value: `₹${Math.round(Math.max(expenses.totalSpent, 0)).toLocaleString()} / ₹${Math.round(
        expenses.dailyBudget
      ).toLocaleString()}`
    }
  ];

  return {
    isoToday,
      modules,
      slices,
      headerStats,
      overview: {
        completedExercises: fitness.completedExercises,
        caloriesRemaining: calories.remaining,
        totalSpent: expenses.totalSpent,
        todosCompleted: todos.completed,
        todosTotal: todos.total
      }
  };
}
