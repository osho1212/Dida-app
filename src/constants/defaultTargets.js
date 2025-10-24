export const DEFAULT_TARGETS = {
  fitnessDailyExercises: 4,
  calorieDailyGoal: 1900,
  expenseDailyBudget: 2000,
  expenseMonthlyBudget: 30000,
  todoDailyTarget: 5
};

export function mergeTargets(partial = {}) {
  return {
    ...DEFAULT_TARGETS,
    ...Object.fromEntries(
      Object.entries(partial).filter(
        ([, value]) => value !== undefined && value !== null && value !== ""
      )
    )
  };
}
