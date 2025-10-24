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

function getTimestampMillis(entry) {
  if (!entry) return 0;
  const ts = entry.timestamp;
  if (ts?.toDate) return ts.toDate().getTime();
  if (typeof ts === "number") return ts;
  if (typeof ts === "string") {
    const parsed = Date.parse(ts);
    if (!Number.isNaN(parsed)) return parsed;
  }
  if (entry.date) {
    const parsed = Date.parse(entry.date);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return 0;
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

  const latestLog = todayFitness[0];
  const latestExercises = Array.isArray(latestLog?.exercises)
    ? latestLog.exercises
        .filter((exercise) => exercise.completed)
        .map((exercise) => exercise.name)
    : [];

  const summary = latestExercises.length
    ? `Logged: ${latestExercises.slice(0, 3).join(", ")}${
        latestExercises.length > 3 ? "…" : ""
      }`
    : completedExercises > 0
      ? `${completedExercises} move${completedExercises !== 1 ? "s" : ""} logged`
      : "No workouts logged yet";

  const progress = goal > 0 ? Math.min(completedExercises / goal, 1) : 0;

  return {
    completedExercises,
    notes,
    latestExercises,
    summary,
    progress,
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
  const progress = calorieGoal > 0 ? Math.min(totalCalories / calorieGoal, 1) : 0;

  const latestEntry = todayCalories[0];
  const summary = latestEntry
    ? `Last: ${latestEntry.foodName ?? "Meal"} (${Math.round(
        safeNumber(latestEntry.calories, 0)
      )} kcal)`
    : totalCalories > 0
      ? `${todayCalories.length} meal${todayCalories.length !== 1 ? "s" : ""} logged`
      : "No meals logged yet";

  return {
    totalCalories,
    remaining,
    progress,
    summary,
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
  const progress = dailyBudget > 0 ? Math.min(totalSpent / dailyBudget, 1) : 0;

  const latestExpense = todayExpenses[0];
  const summary = latestExpense
    ? `Last: ${latestExpense.description ?? "Expense"} (₹${Math.round(
        safeNumber(latestExpense.amount, 0)
      ).toLocaleString()})`
    : totalSpent > 0
      ? `₹${Math.round(totalSpent).toLocaleString()} spent`
      : "No expenses logged yet";

  return {
    totalSpent,
    remaining,
    progress,
    summary,
    metricLabel: remaining >= 0 ? "Budget left" : "Over spend",
    metricValue:
      remaining >= 0
        ? `₹${Math.round(remaining).toLocaleString()}`
        : `₹${Math.round(Math.abs(remaining)).toLocaleString()}`,
    topCategory,
    dailyBudget,
    subtitle:
      totalSpent > 0
        ? `₹${Math.round(totalSpent).toLocaleString()} spent${
            topCategory ? ` • Top: ${topCategory}` : ""
          }`
        : "No expenses logged yet"
  };
}

function calculateTodoMetrics(todayTodos, targets) {
  const todoTarget = getTarget(targets, "todoDailyTarget");
  const total = todayTodos.length;
  const completed = todayTodos.filter((todo) => todo.completed).length;
  const progress = todoTarget > 0 ? Math.min(completed / todoTarget, 1) : 0;

  const latestTodo = todayTodos[0];
  const summary = latestTodo
    ? `Latest: ${latestTodo.title ?? "Task"}`
    : total > 0
      ? `${completed} of ${total} complete`
      : "No tasks scheduled today";

  return {
    total,
    completed,
    progress,
    summary,
    metricLabel: "Daily target",
    metricValue: `${completed}/${todoTarget}`,
    todoTarget,
    subtitle:
      total > 0
        ? `${completed} of ${total} complete`
        : "No tasks scheduled today"
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

  const fitnessRecords = todayFitness
    .slice()
    .sort((a, b) => getTimestampMillis(b) - getTimestampMillis(a));

  const uniqueFitness = [];
  const seenFitnessDates = new Set();
  fitnessRecords.forEach((log) => {
    const key = log.date ?? log.id;
    if (!key || seenFitnessDates.has(key)) return;
    seenFitnessDates.add(key);
    uniqueFitness.push(log);
  });

  const fitness = calculateFitnessMetrics(uniqueFitness, targets);
  const calories = calculateCalorieMetrics(
    todayCalories.slice().sort((a, b) => getTimestampMillis(b) - getTimestampMillis(a)),
    targets
  );
  const expenses = calculateExpenseMetrics(
    todayExpenses.slice().sort((a, b) => getTimestampMillis(b) - getTimestampMillis(a)),
    targets
  );
  const todos = calculateTodoMetrics(
    todayTodos.slice().sort((a, b) => getTimestampMillis(b) - getTimestampMillis(a)),
    targets
  );
  const attendance = calculateAttendanceMetrics(attendanceToday, data.attendanceData);

  const sliceColors = {
    fitness: "var(--primary-color)",
    calories: "var(--secondary-color)",
    expenses: "var(--accent-1)",
    attendance: "var(--accent-2)",
    todos: "var(--secondary-dark)"
  };

  const slicesBase = [
    {
      id: "fitness",
      label: "Fitness Energy",
      score: fitness.progress,
      detail: fitness.summary,
      color: sliceColors.fitness
    },
    {
      id: "calories",
      label: "Calorie Balance",
      score: calories.progress,
      detail: calories.summary,
      color: sliceColors.calories
    },
    {
      id: "expenses",
      label: "Spend Bliss",
      score: expenses.progress,
      detail: expenses.summary,
      color: sliceColors.expenses
    },
    {
      id: "attendance",
      label: "Office Glow",
      score: attendance.ratio,
      detail: attendance.attendanceToday ? "Present" : "Mark attendance",
      color: sliceColors.attendance
    },
    {
      id: "todos",
      label: "Task Magic",
      score: todos.progress,
      detail: todos.summary,
      color: sliceColors.todos
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
      subtitle: fitness.summary,
      metricLabel: fitness.metricLabel,
      metricValue: fitness.metricValue,
      primaryText: fitness.latestExercises.length
        ? `Completed: ${fitness.latestExercises.slice(0, 3).join(", ")}${
            fitness.latestExercises.length > 3 ? "…" : ""
          }`
        : `${fitness.completedExercises}/${fitness.goal} moves`
    },
    {
      id: "calories",
      title: "Calories",
      subtitle: calories.summary,
      metricLabel: calories.metricLabel,
      metricValue: calories.metricValue,
      primaryText: `${Math.round(calories.totalCalories)}/${Math.round(calories.goal)} kcal`
    },
    {
      id: "expenses",
      title: "Expenses",
      subtitle: expenses.summary,
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
      subtitle: todos.summary,
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
