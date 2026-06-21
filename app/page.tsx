"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Component } from "react";
import type { Dispatch, ErrorInfo, ReactNode, SetStateAction } from "react";
import type { LucideIcon } from "lucide-react";
import {
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Download,
  Flame,
  BarChart3,
  History,
  LayoutDashboard,
  ListChecks,
  Moon,
  Pencil,
  Plus,
  RotateCcw,
  Save,
  Settings,
  Sparkles,
  Sun,
  Target,
  Trash2,
  Trophy,
  WifiOff,
  X
} from "lucide-react";

type Category = "Knowledge" | "Plan" | "Monitoring" | "Sunny";
type Priority = "S" | "A" | "B" | "C";
type GoalCategory = "Money" | "Skill" | "Health" | "Cleaning" | "Admin" | "Personal" | "Fun";
type Energy = "Low" | "Medium" | "High";
type TimeNeeded = "15 min" | "30 min" | "1 hour" | "2 hours" | "3 hours";
type DailyMode = "Full Day" | "Low Energy" | "Recovery" | "Money" | "Skill" | "CEO";
type MainLifeFocus = "Money" | "Health" | "Skill" | "Cleaning" | "Stability" | "Personal Growth";
type SectionId = "Dashboard" | "Plan" | "Progress" | "Profile" | "Today Task List" | "Plan Tomorrow" | "Evening Review" | "More" | "Command Center" | "History" | "Analytics" | "Template Editor" | "Settings";
type BuildDayType = "Normal Day" | "Late Wake Day" | "Night Shift Day" | "Recovery Day" | "Appointment / Busy Day" | "Custom Day";
type BuildEnergy = Energy | "Very Low";
type DayLengthType = "Normal" | "Compact" | "Short" | "Night Shift";

type Task = {
  id: string;
  time: string;
  title: string;
  category: Category;
  priority: Priority;
  points: number;
  completed: boolean;
  skipped: boolean;
  notes: string;
  block: string;
  displayLabel?: string;
  subtitle?: string;
  flexible?: boolean;
  timerPresetMinutes?: number;
  insertedGoal?: boolean;
  custom?: boolean;
};

type Plan = {
  title: string;
  why: string;
  goalCategory: GoalCategory;
  timeNeeded: TimeNeeded;
  priority: Priority;
  energy: Energy;
  isBigGoal: boolean;
  tomorrowMode: DailyMode;
  suggested: string;
  scheduledAt: string;
};

type ConflictAction = "replace" | "add-after" | "move-next" | "bonus" | "skip";

type MissionPlanPreviewItem = {
  id: string;
  title: string;
  time: string;
  originalTime: string;
  category: Category;
  goalCategory: GoalCategory;
  priority: Priority;
  points: number;
  notes: string;
  hasConflict: boolean;
  conflictTaskId?: string;
  conflictTaskTitle?: string;
  action: ConflictAction;
};

type Review = {
  wins: string;
  stuck: string;
  learned: string;
  improve: string;
  tomorrowMainMission: string;
  mainMissionCompleted?: boolean;
  appFeedback?: string;
  energy: number;
  mood: number;
  focus: number;
  sleepReadiness: number;
  savedAt?: string;
};

type SettingsState = {
  scheduleVersion: "5:30" | "5:00";
  onboardingComplete?: boolean;
  defaultDailyMode?: DailyMode;
  mainLifeFocus?: MainLifeFocus;
  sevenDayTestStartDate?: string;
};

type ProfileState = {
  name: string;
  dateOfBirth: string;
  sex: string;
  heightCm: number;
  currentWeightKg: number;
  goalWeightKg: number;
  activityLevel: string;
  normalWakeTime: string;
  sleepTargetHours: number;
  mainLifeFocus: string;
  foodRules: string[];
  activePlan: string;
};

type ActivePlanFoundation = {
  type: string;
  speed: string;
  startDate: string;
  targetDate: string;
  dailyTasks: string[];
  weeklyReviewDay: string;
};

type DailyLogFoundation = {
  date: string;
  weightKg: number | null;
  sleepHours: number | null;
  energy: string;
  steps: number | null;
  completedTasks: string[];
  notes: string;
};

type EssentialsSetup = {
  livingSituation: string;
  budgetLevel: string;
  skinHairNeeds: string;
  foodStyle: string;
  laundryAccess: string;
  emergencyLevel: string;
  restockReminder: string;
};

type EssentialsItem = {
  id: string;
  title: string;
  category: EssentialsCategory;
  completed: boolean;
  disabled: boolean;
  custom?: boolean;
};

type EssentialsCategory = "Hygiene" | "Clothing" | "Food & Water" | "Health" | "Room & Cleaning" | "Sleep" | "Tech" | "Emergency";
type PlanStatus = "active" | "paused" | "completed" | "archived";

type PlanWeeklyReview = {
  id: string;
  date: string;
  wentWell: string;
  hard: string;
  completionRating: number;
  decision: "continue" | "adjust" | "pause";
  nextWeekFocus: string;
  specifics: Record<string, string | number | boolean>;
};

type EverydayEssentialsPlan = {
  id: string;
  type: "everyday_essentials";
  name: "Everyday Essentials";
  status: PlanStatus;
  startDate: string;
  setup: EssentialsSetup;
  dailyTasks: EssentialsItem[];
  weeklyTasks: EssentialsItem[];
  monthlyTasks: EssentialsItem[];
  weeklyReviews?: PlanWeeklyReview[];
};

type GetLeanSetup = {
  currentWeightKg: number;
  goalWeightKg: number;
  heightCm: number;
  sex: string;
  dateOfBirth: string;
  activityLevel: string;
  exerciseAccess: string;
  dietStyle: string;
  speed: string;
};

type GetLeanCalculations = {
  age: number;
  bmr: number;
  maintenanceCalories: number;
  targetCalories: number;
  proteinTarget: number;
  carbTarget: number;
  fatTarget: number;
  stepTarget: number;
  workoutDaysPerWeek: string;
  waterTarget: string;
  sleepTarget: number;
};

type FitnessLog = {
  date: string;
  weightKg: number | null;
  sleepHours: number | null;
  energy: number;
  hunger: number;
  steps: number | null;
  workoutCompleted: boolean;
  notes: string;
};

type FoodMeasurementType = "per 100g" | "per 100ml" | "per piece" | "per serving" | "per egg";
type MealType = "Breakfast" | "Lunch" | "Dinner" | "Snack / Drinks";

type FoodItem = {
  id: string;
  name: string;
  unit: string;
  measurementType: FoodMeasurementType;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  custom?: boolean;
};

type FoodEntry = {
  id: string;
  foodId: string;
  foodName: string;
  meal: MealType;
  amount: number;
  unit: string;
  measurementType: FoodMeasurementType;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  note: string;
};

type DailyFoodLogs = Record<string, FoodEntry[]>;

type MacroTargets = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  water: string;
  steps: number;
  sleep: number;
};

type MacroTotals = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

type GetLeanPlan = {
  id: string;
  type: "get_lean_shred";
  name: "Get Lean / Shred";
  status: PlanStatus;
  speed: string;
  startDate: string;
  targetDate: string;
  setup: GetLeanSetup;
  calculations: GetLeanCalculations;
  dailyTasks: EssentialsItem[];
  weeklyReviewDay: "Sunday";
  logs: FitnessLog[];
  weeklyReviews?: PlanWeeklyReview[];
};

type StudyTask = {
  id: string;
  title: string;
  detail: string;
  completed: boolean;
  disabled: boolean;
};

type StudyLog = {
  date: string;
  studyCompleted: boolean;
  minutesStudied: number;
  focusLevel: number;
  difficulty: "Easy" | "Medium" | "Hard";
  topicStudied: string;
  notes: string;
};

type LearnMasterPlan = {
  id: string;
  type: "learn_master_subject";
  name: "Learn / Master Subject";
  status: PlanStatus;
  subjectName: string;
  currentLevel: string;
  goalType: string;
  dailyMinutes: number;
  speed: string;
  startDate: string;
  deadline: string;
  studyStyle: string;
  mainResource: string;
  studyLoop: string[];
  dailyTasks: StudyTask[];
  weeklyReviewDay: "Sunday";
  logs: StudyLog[];
  weeklyReviews?: PlanWeeklyReview[];
};

type SleepEnergySetup = {
  normalWakeTime: string;
  targetSleepTime: string;
  targetSleepDuration: string;
  customSleepDuration: number;
  currentSleepProblem: string;
  caffeineHabit: string;
  caffeineCutoffTime: string;
  napPreference: string;
  nightRoutinePreference: string;
  includeNannoSleepBoost: boolean;
};

type SleepEnergyLog = {
  date: string;
  sleepTime: string;
  wakeTime: string;
  sleepHours: number;
  wakeUpsCount: number;
  energy: number;
  caffeineAfterCutoff: boolean;
  napTaken: boolean;
  nightRoutineCompleted: boolean;
  targetSleepTimeSuccess: boolean;
  notes: string;
};

type SleepEnergyPlan = {
  id: string;
  type: "fix_sleep_energy";
  name: "Fix Sleep & Energy";
  status: PlanStatus;
  startDate: string;
  setup: SleepEnergySetup;
  dailyTasks: EssentialsItem[];
  weeklyTasks: EssentialsItem[];
  logs: SleepEnergyLog[];
  weeklyReviews?: PlanWeeklyReview[];
};

type ProjectTask = {
  id: string;
  title: string;
  detail: string;
  completed: boolean;
  disabled: boolean;
  timerPreset: FocusPresetId;
};

type ProjectSetup = {
  projectName: string;
  projectType: string;
  projectGoal: string;
  currentStage: string;
  dailyProjectTime: string;
  customDailyMinutes: number;
  projectSpeed: string;
  deadline: string;
  customDeadline: string;
  mainBottleneck: string;
  buildStyle: string;
};

type ProjectLog = {
  date: string;
  workedOn: string;
  minutesWorked: number;
  difficulty: number;
  focus: number;
  blocker: string;
  nextStep: string;
  weeklyReviewCompleted: boolean;
  note: string;
};

type BuildProjectPlan = {
  id: string;
  type: "build_project";
  name: "Build a Project";
  status: PlanStatus;
  startDate: string;
  setup: ProjectSetup;
  projectRoadmap: ProjectTask[];
  dailyTasks: ProjectTask[];
  weeklyTasks: ProjectTask[];
  logs: ProjectLog[];
  weeklyReviews?: PlanWeeklyReview[];
};

type MoneySetup = {
  mainMoneyGoal: string;
  targetAmount: number;
  customTargetAmount: number;
  targetDeadline: string;
  customDeadline: string;
  currentMonthlyIncome: number;
  currentMonthlyFixedExpenses: number;
  currentSavings: number;
  currency: string;
  incomePath: string;
  dailyMoneyTime: string;
  customDailyMinutes: number;
  currentBottleneck: string;
  savingStyle: string;
  spendingCategories: string[];
};

type MoneyCalculations = {
  monthlyLeftover: number;
  remainingSavingNeeded: number;
  daysUntilDeadline: number | null;
  neededSavingPerDay: number | null;
  neededSavingPerWeek: number | null;
  neededSavingPerMonth: number | null;
  progressPercent: number;
  targetDeadlineDate: string;
};

type MoneyTask = {
  id: string;
  title: string;
  detail: string;
  completed: boolean;
  disabled: boolean;
  kind: "income" | "saving";
};

type MoneySpendingLog = {
  id: string;
  date: string;
  category: string;
  amount: number;
  note: string;
  necessary: boolean;
};

type MoneyIncomeLog = {
  id: string;
  date: string;
  source: string;
  amount: number;
  note: string;
};

type MoneySavingLog = {
  id: string;
  date: string;
  amountSaved: number;
  note: string;
};

type MoneyOpportunityLog = {
  id: string;
  type: string;
  title: string;
  status: string;
  date: string;
  note: string;
};

type MoneyPlan = {
  id: string;
  type: "money_plan";
  name: "Money Plan";
  status: PlanStatus;
  startDate: string;
  setup: MoneySetup;
  calculations: MoneyCalculations;
  dailyTasks: MoneyTask[];
  weeklyTasks: MoneyTask[];
  logs: MoneyOpportunityLog[];
  weeklyReviews?: PlanWeeklyReview[];
};

type LifeResetSetup = {
  resetLength: string;
  resetIntensity: string;
  mainProblem: string;
  wakeTime: string;
  targetSleepTime: string;
  mainResetFocus: string;
  dailyResetTime: string;
  customDailyMinutes: number;
  includeNannoSleepBoost: boolean;
};

type LifeResetTask = {
  id: string;
  title: string;
  detail: string;
  category: "Body" | "Sleep" | "Money" | "Room" | "Mind" | "Direction";
  completed: boolean;
  disabled: boolean;
};

type LifeResetLog = {
  date: string;
  energy: number;
  roomCondition: number;
  mood: number;
  sleepReadiness: number;
  moneyStress: number;
  improvedToday: string;
  stillMessy: string;
  tomorrowResetFocus: string;
};

type LifeResetPlan = {
  id: string;
  type: "life_reset";
  name: "Life Reset";
  status: PlanStatus;
  startDate: string;
  setup: LifeResetSetup;
  resetChecklist: LifeResetTask[];
  dailyTasks: LifeResetTask[];
  weeklyTasks: LifeResetTask[];
  logs: LifeResetLog[];
  weeklyReviews?: PlanWeeklyReview[];
};

type LearnMasterSetup = {
  subjectName: string;
  currentLevel: string;
  goalType: string;
  dailyStudyTime: string;
  customDailyMinutes: number;
  speed: string;
  deadline: string;
  customDeadline: string;
  studyStyle: string;
  mainResource: string;
  customResource: string;
};

type ActivePlan = EverydayEssentialsPlan | GetLeanPlan | LearnMasterPlan | SleepEnergyPlan | BuildProjectPlan | MoneyPlan | LifeResetPlan;

type PlanTaskRow = {
  id: string;
  title: string;
  detail: string;
  badge: string;
  completed: boolean;
};

type PlanTaskFilter = "All" | "Main" | "Body" | "Skill" | "Essentials";

type PrioritizedPlanTaskRow = PlanTaskRow & {
  plan: ActivePlan;
  source: string;
  filterGroup: Exclude<PlanTaskFilter, "All">;
  rank: number;
  specificity: number;
};

type TodayFocusItem = {
  title: string;
  detail: string;
  source: string;
};

type DayMeta = {
  dayType: BuildDayType | "Default Day";
  wakeTime?: string;
  startTime?: string;
  targetSleepTime?: string;
  dayLengthMinutes?: number;
  dayLengthLabel?: string;
  dayLengthType?: DayLengthType;
  nightShutdownTime?: string;
  todayMode?: DailyMode;
  mainMission?: string;
};

type Stats = {
  points: number;
  completed: number;
  remaining: number;
};

type HistoryEntry = {
  date: string;
  mode?: DailyMode;
  totalScore: number;
  dayLevel: string;
  completedMissions: number;
  skippedMissions: number;
  totalMissions: number;
  mainMission: string;
  mainMissionCompleted: boolean;
  dailyNotes?: string;
  eveningReview: Review;
  taskSummary: Array<{
    id: string;
    time: string;
    title: string;
    category: Category;
    priority: Priority;
    points: number;
    completed: boolean;
    skipped: boolean;
    notes: string;
  }>;
};

type Streaks = {
  current: number;
  best: number;
  productive: number;
  mainMission: number;
};

type AnalyticsSummary = {
  last7TotalScore: number;
  averageDailyScore: number;
  bestDay?: HistoryEntry;
  productiveDays: number;
  mostCompletedCategory: string;
  mostSkippedCategory: string;
  recentDays: HistoryEntry[];
  categoryStats: Record<Category, CategoryStats>;
};

type StorageInfo = {
  usedBytes: number;
  limitBytes: number;
  percent: number;
};

type SevenDayTestDay = {
  dayNumber: number;
  date: string;
  entry?: HistoryEntry;
  score: number;
  dayLevel: string;
  mainMissionCompleted: boolean;
  reviewCompleted: boolean;
};

type SevenDayTestSummary = {
  startDate: string;
  currentDay: number;
  completedDays: number;
  bestDay?: SevenDayTestDay;
  averageScore: number;
  mainMissionCompletionRate: number;
  days: SevenDayTestDay[];
};

type RealUseTestLog = {
  date: string;
  openedApp: boolean;
  usedBuildToday: boolean;
  todayHelpfulness: number;
  usedStartMission: boolean;
  loggedFood: boolean;
  loggedMoney: boolean;
  loggedSleepEnergy: boolean;
  useful: string;
  annoying: string;
  tooManyClicks: string;
  ignored: string;
  broke: string;
  improveNext: string;
};

type LongTermCategory = "Body" | "Money" | "Skill" | "Project" | "Sleep/Energy" | "Life" | "Relationship" | "Other";
type LongTermStatus = "active" | "paused" | "completed" | "archived";
type WeeklyMissionStatus = "not started" | "in progress" | "completed" | "skipped";
type WeeklyMissionType = "Main Mission" | "Support Mission" | "Maintenance Mission";
type NextActionStatus = "open" | "sent to today" | "completed" | "archived";

type BigGoal = {
  id: string;
  title: string;
  category: LongTermCategory;
  why: string;
  targetResult: string;
  targetDate: string;
  priority: Priority;
  status: LongTermStatus;
  notes: string;
};

type NinetyDayMilestone = {
  id: string;
  title: string;
  targetDate: string;
  status: LongTermStatus;
  notes: string;
};

type NinetyDayPlan = {
  id: string;
  title: string;
  linkedBigGoalId: string;
  startDate: string;
  endDate: string;
  mainOutcome: string;
  successDefinition: string;
  milestones: NinetyDayMilestone[];
  risks: string;
  status: LongTermStatus;
};

type MonthlyFocus = {
  id: string;
  month: string;
  focusTitle: string;
  linkedNinetyDayPlanId: string;
  mainTarget: string;
  focusArea: Exclude<LongTermCategory, "Sleep/Energy" | "Relationship" | "Other"> | "Sleep";
  mustDo: string;
  avoid: string;
  status: LongTermStatus;
};

type WeeklyMission = {
  id: string;
  weekStartDate: string;
  weekEndDate: string;
  title: string;
  linkedMonthlyFocusId: string;
  category: LongTermCategory;
  priority: Priority;
  targetResult: string;
  status: WeeklyMissionStatus;
  notes: string;
  missionType: WeeklyMissionType;
};

type NextAction = {
  id: string;
  title: string;
  linkedWeeklyMissionId: string;
  estimatedTime: "5 min" | "15 min" | "30 min" | "60 min" | "90 min";
  category: LongTermCategory;
  priority: Priority;
  status: NextActionStatus;
};

type LongTermPlanningState = {
  bigGoals: BigGoal[];
  ninetyDayPlans: NinetyDayPlan[];
  monthlyFocuses: MonthlyFocus[];
  weeklyMissions: WeeklyMission[];
  nextActions: NextAction[];
};

type CategoryStats = {
  total: number;
  completed: number;
  skipped: number;
  percent: number;
};

type TaskDraft = {
  time: string;
  title: string;
  category: Category;
  priority: Priority;
  points: number;
  notes: string;
};

type TemplateTask = {
  id: string;
  time: string;
  title: string;
  category: Category;
  priority: Priority;
  points: number;
  block: string;
  enabled: boolean;
  notes: string;
  displayLabel?: string;
  subtitle?: string;
  flexible?: boolean;
  timerPresetMinutes?: number;
};

type TemplateDraft = {
  time: string;
  title: string;
  category: Category;
  priority: Priority;
  points: number;
  block: string;
  enabled: boolean;
  notes: string;
};

type NavItem = {
  id: SectionId;
  label: string;
  mobile: string;
  icon: LucideIcon;
};

type FocusPresetId = "quick-reset" | "routine" | "short-task" | "normal-focus" | "deep-work" | "ceo-block";
type FocusPhase = "work" | "rest";
type FocusPreset = {
  id: FocusPresetId;
  name: string;
  shortLabel: string;
  workMinutes: number;
  restMinutes: number;
  bestFor: string;
};

type BuildTodayDraft = {
  dayType: BuildDayType;
  wakeTime: string;
  startTime: string;
  energy: BuildEnergy;
  todayMode: DailyMode;
  mainMission: string;
  shiftStart: string;
  shiftEnd: string;
  fixedEvent: string;
  fixedEventTime: string;
  fixedEventDuration: string;
  sleepTime: string;
  wantsSmallMainMission: boolean;
};

type BuildTodayPreview = {
  dayType: BuildDayType;
  wakeTime: string;
  startTime: string;
  targetSleepTime: string;
  dayLengthMinutes: number;
  dayLengthLabel: string;
  dayLengthType: DayLengthType;
  nightShutdownTime: string;
  todayMode: DailyMode;
  mainMission: string;
  tasks: Task[];
};

type LongStudyPomodoroStyle = "Standard" | "Deep Work" | "CEO Block" | "Auto Recommended";
type LongStudyStrictness = "Strict schedule" | "Flexible schedule";
type LongStudyMealStyle = "Auto meal breaks" | "I will set meal times manually";

type LongStudyDraft = {
  eventName: string;
  subject: string;
  targetStudyHours: string;
  customStudyHours: number;
  startTime: string;
  energyLevel: Energy;
  pomodoroStyle: LongStudyPomodoroStyle;
  strictness: LongStudyStrictness;
  includeHygieneReset: boolean;
  includeShower: boolean;
  includeSleepFollowUp: boolean;
  includeNannoSleepBoost: boolean;
  mealPlanStyle: LongStudyMealStyle;
};

type LongStudySession = {
  id: string;
  date: string;
  eventName: string;
  subject: string;
  targetStudyHours: number;
  plannedStudyMinutes: number;
  startTime: string;
  estimatedFinishTime: string;
  totalEventDurationMinutes: number;
  studyMinutes: number;
  breakMinutes: number;
  mealHygieneMinutes: number;
  pomodoroStyle: string;
  warning: string;
  tasks: Task[];
  followUpTasks: Task[];
};

type LongStudyReview = {
  id: string;
  sessionId: string;
  date: string;
  totalStudyHoursCompleted: number;
  focus: number;
  difficulty: number;
  learned: string;
  practiced: string;
  confused: string;
  nextStep: string;
  keptClean: boolean;
  ateEnough: boolean;
  finishedFollowUp: boolean;
};

type LongStudyPreview = LongStudySession;
type PlanTabFilter = "All" | "Active" | "Presets" | "Events" | "Reviews Due" | "Archived";
type ProgressTabFilter = "All" | "Today" | "This Week" | "Plans" | "Logs" | "Reviews Needed";

type TodayBackupBeforeEvent = {
  date: string;
  tasks: Task[];
  dayMeta: DayMeta;
  todayMode: DailyMode;
};

type TodayEventMode = {
  active: boolean;
  date: string;
  eventId: string;
  eventName: string;
};

const TASKS_KEY_PREFIX = "kpm-sunny-tasks";
const TOMORROW_KEY_PREFIX = "kpm-sunny-tomorrow-tasks";
const SETTINGS_KEY = "kpm-sunny-settings";
const PROFILE_KEY = "kpm-sunny-profile";
const ACTIVE_PLAN_KEY = "kpm-sunny-active-plan";
const ACTIVE_PLANS_KEY = "kpm-sunny-active-plans";
const FOOD_LIBRARY_KEY = "kpm-sunny-food-library";
const DAILY_FOOD_LOGS_KEY = "kpm-sunny-daily-food-logs";
const MONEY_SPENDING_LOGS_KEY = "kpm-sunny-money-spending-logs";
const MONEY_INCOME_LOGS_KEY = "kpm-sunny-money-income-logs";
const MONEY_SAVING_LOGS_KEY = "kpm-sunny-money-saving-logs";
const MONEY_OPPORTUNITY_LOGS_KEY = "kpm-sunny-money-opportunity-logs";
const REAL_USE_TEST_LOGS_KEY = "kpm-sunny-real-use-test-logs";
const LONG_TERM_PLANNING_KEY = "kpm-sunny-long-term-planning";
const LONG_STUDY_SESSIONS_KEY = "kpm-sunny-long-study-events";
const LONG_STUDY_REVIEWS_KEY = "kpm-sunny-long-study-event-reviews";
const TODAY_BACKUP_BEFORE_EVENT_KEY = "kpm-sunny-today-backup-before-event";
const TODAY_EVENT_MODE_KEY = "kpm-sunny-today-event-mode";
const LEGACY_LONG_STUDY_SESSIONS_KEY = "kpm-sunny-long-study-sessions";
const LEGACY_LONG_STUDY_REVIEWS_KEY = "kpm-sunny-long-study-reviews";
const PLAN_KEY = "kpm-sunny-plan";
const REVIEW_KEY = "kpm-sunny-review";
const DAILY_NOTES_KEY_PREFIX = "kpm-sunny-daily-notes";
const DAY_META_KEY_PREFIX = "kpm-sunny-day-meta";
const HISTORY_KEY = "kpm-sunny-history";
const LAST_ACTIVE_DATE_KEY = "kpm-sunny-last-active-date";
const DATE_OVERRIDE_KEY = "kpm-sunny-date-override";
const TEMPLATE_KEY = "kpm-sunny-default-template";
const MODE_KEY_PREFIX = "kpm-sunny-mode";
const TOMORROW_MODE_KEY_PREFIX = "kpm-sunny-tomorrow-mode";
const LOCAL_STORAGE_LIMIT_BYTES = 5 * 1024 * 1024;
const APP_VERSION = "V3.7";
const APP_LAST_UPDATED = "June 21, 2026";

const priorities: Priority[] = ["S", "A", "B", "C"];
const categories: Category[] = ["Knowledge", "Plan", "Monitoring", "Sunny"];
const dailyModes: DailyMode[] = ["Full Day", "Low Energy", "Recovery", "Money", "Skill", "CEO"];
const mainLifeFocusOptions: MainLifeFocus[] = ["Money", "Health", "Skill", "Cleaning", "Stability", "Personal Growth"];
const focusPresets: FocusPreset[] = [
  { id: "quick-reset", name: "Quick Reset", shortLabel: "Quick Reset 5m", workMinutes: 5, restMinutes: 0, bestFor: "drink water, wake up, make bed, quick notes" },
  { id: "routine", name: "Routine", shortLabel: "Routine 10m", workMinutes: 10, restMinutes: 0, bestFor: "brush teeth, wash face, toilet, simple clean-up" },
  { id: "short-task", name: "Short Task", shortLabel: "Short Task 15/5", workMinutes: 15, restMinutes: 5, bestFor: "shower, messages, small admin, planning" },
  { id: "normal-focus", name: "Normal Focus", shortLabel: "Normal Focus 25/5", workMinutes: 25, restMinutes: 5, bestFor: "light learning, small project task, low energy work" },
  { id: "deep-work", name: "Deep Work", shortLabel: "Deep Work 50/10", workMinutes: 50, restMinutes: 10, bestFor: "main useful task, serious work, coding, job application, skill practice" },
  { id: "ceo-block", name: "CEO Block", shortLabel: "CEO Block 90/20", workMinutes: 90, restMinutes: 20, bestFor: "high energy mode, major project, long deep work" }
];
const defaultSettings: SettingsState = {
  scheduleVersion: "5:30",
  onboardingComplete: false,
  defaultDailyMode: "Full Day",
  mainLifeFocus: "Stability"
};

const defaultProfile: ProfileState = {
  name: "",
  dateOfBirth: "",
  sex: "",
  heightCm: 0,
  currentWeightKg: 0,
  goalWeightKg: 0,
  activityLevel: "",
  normalWakeTime: "",
  sleepTargetHours: 8,
  mainLifeFocus: "",
  foodRules: [],
  activePlan: ""
};

const activePlanFoundation: ActivePlanFoundation = {
  type: "",
  speed: "",
  startDate: "",
  targetDate: "",
  dailyTasks: [],
  weeklyReviewDay: ""
};

const dailyLogFoundation: DailyLogFoundation = {
  date: "",
  weightKg: null,
  sleepHours: null,
  energy: "",
  steps: null,
  completedTasks: [],
  notes: ""
};

const defaultEssentialsSetup: EssentialsSetup = {
  livingSituation: "Alone",
  budgetLevel: "Basic",
  skinHairNeeds: "Normal",
  foodStyle: "Simple",
  laundryAccess: "Home",
  emergencyLevel: "Simple",
  restockReminder: "Weekly"
};

const defaultLearnMasterSetup: LearnMasterSetup = {
  subjectName: "",
  currentLevel: "Beginner",
  goalType: "Become useful",
  dailyStudyTime: "60 minutes",
  customDailyMinutes: 60,
  speed: "Moderate",
  deadline: "No deadline",
  customDeadline: "",
  studyStyle: "Mixed",
  mainResource: "Course",
  customResource: ""
};

const defaultSleepEnergySetup: SleepEnergySetup = {
  normalWakeTime: "7:00 AM",
  targetSleepTime: "11:00 PM",
  targetSleepDuration: "8h",
  customSleepDuration: 8,
  currentSleepProblem: "Sleep too late",
  caffeineHabit: "coffee",
  caffeineCutoffTime: "2:00 PM",
  napPreference: "no nap",
  nightRoutinePreference: "normal",
  includeNannoSleepBoost: true
};

const sleepDurationOptions = ["6h", "7h", "7.5h", "8h", "custom"];
const sleepProblemOptions = ["Sleep too late", "Wake too late", "Wake up many times", "Low energy after waking", "Too much caffeine", "Night phone use", "Irregular schedule"];
const caffeineHabitOptions = ["none", "coffee", "energy drink", "tea", "multiple"];
const napPreferenceOptions = ["no nap", "10 min", "15 min", "20 min", "30 min"];
const nightRoutineOptions = ["simple", "normal", "strong sleep reset"];

const defaultProjectSetup: ProjectSetup = {
  projectName: "",
  projectType: "App / Website",
  projectGoal: "Finish MVP",
  currentStage: "Idea only",
  dailyProjectTime: "60 min",
  customDailyMinutes: 60,
  projectSpeed: "Moderate",
  deadline: "No deadline",
  customDeadline: "",
  mainBottleneck: "I do not know the next step",
  buildStyle: "Small daily progress"
};

const projectTypeOptions = ["App / Website", "Game", "Writing / Novel", "Study project", "Business project", "Design project", "Other"];
const projectGoalOptions = ["Personal use", "Portfolio", "Learn a skill", "Make money", "Finish MVP", "Other"];
const projectStageOptions = ["Idea only", "Planning", "First version started", "Working MVP", "Improving existing project", "Testing / polishing"];
const projectDailyTimeOptions = ["30 min", "60 min", "90 min", "120 min", "custom"];
const projectSpeedOptions = ["Slow", "Moderate", "Intensive"];
const projectDeadlineOptions = ["No deadline", "7 days", "14 days", "30 days", "90 days", "custom date"];
const projectBottleneckOptions = ["I do not know what to build", "I do not know the next step", "Too many ideas", "Coding difficulty", "Design difficulty", "Testing difficulty", "Low energy", "Consistency"];
const projectBuildStyleOptions = ["Small daily progress", "Deep work blocks", "Weekend sprint", "Fix one issue at a time"];

const defaultMoneySetup: MoneySetup = {
  mainMoneyGoal: "Save a target amount",
  targetAmount: 200,
  customTargetAmount: 200,
  targetDeadline: "30 days",
  customDeadline: "",
  currentMonthlyIncome: 0,
  currentMonthlyFixedExpenses: 0,
  currentSavings: 0,
  currency: "USD",
  incomePath: "Job",
  dailyMoneyTime: "30 min",
  customDailyMinutes: 30,
  currentBottleneck: "no job leads",
  savingStyle: "fixed daily saving",
  spendingCategories: ["Food", "Transport", "Phone / internet", "Health", "Tools / apps", "Game", "Family", "Emergency", "Other"]
};

const moneyGoalOptions = ["Get emergency money", "Save a target amount", "Increase monthly income", "Build skill to earn", "Build project to earn", "Control spending", "Other"];
const moneyTargetAmountOptions = ["100", "200", "500", "1000", "custom"];
const moneyDeadlineOptions = ["7 days", "14 days", "30 days", "90 days", "1 year", "custom date", "no deadline"];
const moneyIncomePathOptions = ["Job", "Freelance", "Online work", "Sell service", "Build app/project", "Content", "Small local business", "Not sure yet"];
const moneyDailyTimeOptions = ["15 min", "30 min", "60 min", "90 min", "120 min", "custom"];
const moneyBottleneckOptions = ["no skill", "no portfolio", "no clients", "no job leads", "no idea what to offer", "low confidence", "low energy", "too many ideas", "spending too much"];
const moneySavingStyleOptions = ["fixed daily saving", "fixed weekly saving", "fixed monthly saving", "percentage of income", "save whatever remains", "custom"];
const moneyOpportunityTypes = ["job application", "freelance message", "project task", "content", "local business", "other"];
const moneyOpportunityStatuses = ["planned", "sent", "replied", "rejected", "won", "follow-up"];

const defaultLifeResetSetup: LifeResetSetup = {
  resetLength: "7 days",
  resetIntensity: "Normal",
  mainProblem: "all of the above",
  wakeTime: "7:00 AM",
  targetSleepTime: "11:00 PM",
  mainResetFocus: "Full reset",
  dailyResetTime: "60 min",
  customDailyMinutes: 60,
  includeNannoSleepBoost: true
};

const lifeResetLengthOptions = ["1 day", "3 days", "7 days", "14 days", "30 days"];
const lifeResetIntensityOptions = ["Gentle", "Normal", "Strong"];
const lifeResetProblemOptions = ["sleep messed up", "low energy", "messy room", "money stress", "eating badly", "no direction", "too many tasks", "emotional reset", "all of the above"];
const lifeResetFocusOptions = ["Body", "Sleep", "Money", "Room", "Mind", "Project/Skill", "Full reset"];
const lifeResetTimeOptions = ["30 min", "60 min", "90 min", "120 min", "custom"];

const longStudyHourOptions = ["4 hours", "5 hours", "6 hours", "7 hours", "8 hours", "10 hours", "12 hours", "14 hours", "16 hours", "18 hours", "custom"];
const longStudyPomodoroOptions: LongStudyPomodoroStyle[] = ["Auto Recommended", "Standard", "Deep Work", "CEO Block"];
const longStudyStrictnessOptions: LongStudyStrictness[] = ["Strict schedule", "Flexible schedule"];
const longStudyMealOptions: LongStudyMealStyle[] = ["Auto meal breaks", "I will set meal times manually"];

const defaultLongStudyDraft: LongStudyDraft = {
  eventName: "Long study event",
  subject: "Coding",
  targetStudyHours: "4 hours",
  customStudyHours: 4,
  startTime: "8:00 AM",
  energyLevel: "Medium",
  pomodoroStyle: "Auto Recommended",
  strictness: "Flexible schedule",
  includeHygieneReset: true,
  includeShower: false,
  includeSleepFollowUp: true,
  includeNannoSleepBoost: true,
  mealPlanStyle: "Auto meal breaks"
};

const everydayEssentialsTemplates = {
  dailyTasks: [
    ["toothbrush", "Toothbrush", "Hygiene"],
    ["toothpaste", "Toothpaste", "Hygiene"],
    ["soap-body-wash", "Soap / body wash", "Hygiene"],
    ["shampoo", "Shampoo", "Hygiene"],
    ["towel", "Towel", "Hygiene"],
    ["clean-clothes", "Clean clothes", "Clothing"],
    ["deodorant", "Deodorant", "Hygiene"],
    ["water-bottle", "Water bottle", "Food & Water"],
    ["phone-charger", "Phone charger", "Tech"],
    ["basic-food", "Basic food", "Food & Water"],
    ["sleep-clothes", "Sleep clothes", "Sleep"]
  ],
  weeklyTasks: [
    ["toothpaste-low", "Toothpaste running low?", "Hygiene"],
    ["soap-shampoo-low", "Soap / shampoo running low?", "Hygiene"],
    ["laundry-done", "Laundry done?", "Clothing"],
    ["water-enough", "Drinking water enough?", "Food & Water"],
    ["food-enough", "Eggs / meat / rice / banana enough?", "Food & Water"],
    ["trash-bags", "Trash bags enough?", "Room & Cleaning"],
    ["tissue", "Toilet paper / tissue enough?", "Room & Cleaning"],
    ["medicine-first-aid", "Medicine / first aid okay?", "Health"]
  ],
  monthlyTasks: [
    ["replace-toothbrush", "Replace toothbrush if old", "Hygiene"],
    ["medicine-expiry", "Check medicine expiry", "Health"],
    ["emergency-money", "Check emergency money", "Emergency"],
    ["clothes-condition", "Check clothes condition", "Clothing"],
    ["shoes-slippers", "Check shoes / slippers", "Clothing"],
    ["cleaning-supplies", "Check cleaning supplies", "Room & Cleaning"],
    ["backup-charger", "Check backup charger / cable", "Tech"],
    ["important-documents", "Check important documents", "Emergency"]
  ]
} as const;

const getLeanActivityLevels = ["Mostly sitting", "Light active / walking", "Moderate active", "Very active"];
const getLeanExerciseAccess = ["Home", "Gym", "Walking only"];
const getLeanDietStyles = ["Normal", "Cheap food", "High protein", "Stomach-sensitive"];
const getLeanSpeeds = ["Lean Slow", "Lean Moderate", "Shred Fast"];

const getLeanDailyTaskTemplates = [
  ["protein", "Hit protein target", "Health"],
  ["steps", "Walk step target", "Health"],
  ["water", "Drink water", "Food & Water"],
  ["calories", "Follow calorie target", "Food & Water"],
  ["workout-recovery", "Workout or recovery", "Health"],
  ["sleep-routine", "Sleep routine", "Sleep"]
] as const;

const learnCurrentLevels = ["Beginner", "Basic", "Intermediate", "Advanced"];
const learnGoalTypes = ["Learn basics", "Become useful", "Pass exam", "Build project", "Master deeply"];
const learnDailyStudyTimes = ["30 minutes", "60 minutes", "120 minutes", "180 minutes", "Custom"];
const learnSpeeds = ["Slow", "Moderate", "Intensive"];
const learnDeadlines = ["No deadline", "30 days", "90 days", "1 year", "Custom date"];
const learnStudyStyles = ["Reading", "Watching videos", "Practice", "Flashcards", "Project-based", "Mixed"];
const learnMainResources = ["YouTube", "Course", "Book", "Notes", "App", "Custom"];
const learnStudyLoop = ["Learn", "Practice", "Recall", "Review", "Apply"];
const learnDailyTaskTemplates: Array<[string, string, string]> = [
  ["review-yesterday", "Review yesterday", "10 min - review the last lesson or notes"],
  ["learn-topic", "Learn one topic", "Learn one new topic from your selected resource"],
  ["practice", "Practice", "Apply what you learned with exercises, coding, writing, or examples"],
  ["recall", "Test yourself without looking", "Recall from memory before checking notes"],
  ["notes", "Write notes", "Write what you learned and what was difficult"]
];

const modeProfiles: Record<DailyMode, { description: string; bestFor: string; difficulty: string; note: string }> = {
  "Full Day": {
    description: "The normal complete KPM Sunny schedule.",
    bestFor: "balanced control, steady full-day rhythm",
    difficulty: "Medium",
    note: "Full Day Mode uses the complete template."
  },
  "Low Energy": {
    description: "A shorter survival and control list for low-capacity days.",
    bestFor: "basic hygiene, meals, one useful task",
    difficulty: "Low",
    note: "Low Energy Mode: survival success matters."
  },
  Recovery: {
    description: "Health, sleep, cleaning, and calm with lower work pressure.",
    bestFor: "recovery, consistency, nervous system reset",
    difficulty: "Low/Medium",
    note: "Recovery Mode: health consistency matters."
  },
  Money: {
    description: "Prioritizes job, income, business, and opportunity work.",
    bestFor: "income, job search, opportunity",
    difficulty: "Medium/High",
    note: "Money Mode expects serious money work early."
  },
  Skill: {
    description: "Prioritizes learning, practice, and capability building.",
    bestFor: "coding, language, writing, app building",
    difficulty: "Medium",
    note: "Skill Mode protects practice blocks."
  },
  CEO: {
    description: "A structured high-performance day with deep work and review blocks.",
    bestFor: "strategy, execution, strong control",
    difficulty: "High",
    note: "CEO Mode: higher score expected."
  }
};

const navItems: NavItem[] = [
  { id: "Dashboard", label: "Today", mobile: "Today", icon: LayoutDashboard },
  { id: "Plan", label: "Plan", mobile: "Plan", icon: Target },
  { id: "Progress", label: "Progress", mobile: "Progress", icon: BarChart3 },
  { id: "Profile", label: "Profile", mobile: "Profile", icon: Settings }
];
const mobileNavItems = navItems;

const baseSchedule: Array<[string, string, Category, Priority, number]> = [
  ["5:30 AM", "Wake up", "Sunny", "A", 10],
  ["5:35 AM", "Drink water", "Sunny", "A", 8],
  ["5:40 AM", "Use toilet", "Sunny", "B", 5],
  ["5:50 AM", "Brush teeth, wash face", "Sunny", "A", 10],
  ["6:05 AM", "Light stretch / fresh air / sunlight", "Sunny", "A", 15],
  ["6:20 AM", "Shower", "Sunny", "A", 12],
  ["6:40 AM", "Wear clean clothes, fix hair, deodorant", "Sunny", "A", 10],
  ["6:50 AM", "Make bed", "Sunny", "B", 8],
  ["7:00 AM", "Simple breakfast", "Sunny", "A", 12],
  ["7:30 AM", "Wash dishes / clean eating area", "Monitoring", "B", 8],
  ["7:45 AM", "Check today's plan", "Plan", "A", 12],
  ["8:00 AM", "Main useful task / work / learning", "Plan", "S", 35],
  ["10:00 AM", "Short break, drink water, stretch", "Sunny", "B", 8],
  ["10:15 AM", "Continue main task", "Knowledge", "S", 35],
  ["12:00 PM", "Lunch", "Sunny", "A", 12],
  ["12:30 PM", "Wash dishes / clean small mess", "Monitoring", "B", 8],
  ["12:45 PM", "Rest / light phone time", "Sunny", "C", 5],
  ["1:30 PM", "Skill learning / practice", "Knowledge", "A", 25],
  ["3:00 PM", "Walk, exercise, or get sunlight", "Sunny", "A", 25],
  ["3:45 PM", "Shower or wipe body if sweaty", "Sunny", "B", 10],
  ["4:15 PM", "Clean room for 10-15 minutes", "Monitoring", "B", 15],
  ["4:30 PM", "Reply important messages", "Monitoring", "B", 12],
  ["5:00 PM", "Free time / hobby / game", "Sunny", "C", 8],
  ["6:30 PM", "Dinner", "Sunny", "A", 12],
  ["7:00 PM", "Wash dishes", "Monitoring", "B", 8],
  ["7:15 PM", "Check spending / money / supplies", "Monitoring", "A", 18],
  ["7:30 PM", "Light learning / reading / planning", "Knowledge", "B", 18],
  ["8:30 PM", "Relax time", "Sunny", "C", 8],
  ["9:00 PM", "Prepare clothes/items for tomorrow", "Plan", "A", 15],
  ["9:30 PM", "Reduce screen brightness / calm down", "Sunny", "B", 10],
  ["10:00 PM", "Brush teeth, wash face", "Sunny", "A", 10],
  ["10:15 PM", "Write what you completed today", "Plan", "A", 15],
  ["10:30 PM", "Bedtime routine", "Sunny", "A", 12],
  ["11:00 PM", "Sleep", "Sunny", "S", 25]
];

const blocks = [
  { name: "Morning Reset", start: "5:30 AM", end: "8:00 AM", description: "Stabilize your body, room, and first decisions." },
  { name: "Main Mission Block", start: "8:00 AM", end: "12:00 PM", description: "Protect the most useful work of the day." },
  { name: "Afternoon Growth Block", start: "1:30 PM", end: "4:30 PM", description: "Build skill, health, and environment momentum." },
  { name: "Evening Control Block", start: "6:30 PM", end: "9:30 PM", description: "Close loops, check resources, and prepare tomorrow." },
  { name: "Night Shutdown", start: "10:00 PM", end: "11:00 PM", description: "Lower friction for sleep and recovery." }
] as const;
const blockNames: string[] = blocks.map((block) => block.name);
const artPaths = {
  sunnyMascot: "/art/sunny-mascot.png",
  avatar: "/art/avatar-manhwa.png",
  heroWorking: "/art/hero-working.png",
  block: {
    "Morning Reset": "/art/morning-reset.png",
    "Main Mission Block": "/art/main-mission.png",
    "Afternoon Growth Block": "/art/afternoon-growth.png",
    "Evening Control Block": "/art/evening-control.png",
    "Night Shutdown": "/art/night-shutdown.png"
  } as Record<string, string>
};

const defaultPlan: Plan = {
  title: "",
  why: "",
  goalCategory: "Money",
  timeNeeded: "1 hour",
  priority: "A",
  energy: "Medium",
  isBigGoal: false,
  tomorrowMode: "Full Day",
  suggested: "",
  scheduledAt: ""
};

const defaultReview: Review = {
  wins: "",
  stuck: "",
  learned: "",
  improve: "",
  tomorrowMainMission: "",
  mainMissionCompleted: false,
  appFeedback: "",
  energy: 5,
  mood: 5,
  focus: 5,
  sleepReadiness: 5
};

const defaultTaskDraft: TaskDraft = {
  time: "8:00 AM",
  title: "",
  category: "Plan",
  priority: "A",
  points: 15,
  notes: ""
};

const defaultTemplateDraft: TemplateDraft = {
  time: "8:00 AM",
  title: "",
  category: "Plan",
  priority: "A",
  points: 15,
  block: "Main Mission Block",
  enabled: true,
  notes: ""
};

const defaultBuildTodayDraft: BuildTodayDraft = {
  dayType: "Normal Day",
  wakeTime: "5:30 AM",
  startTime: "5:30 AM",
  energy: "Medium",
  todayMode: "Full Day",
  mainMission: "",
  shiftStart: "9:00 PM",
  shiftEnd: "5:00 AM",
  fixedEvent: "",
  fixedEventTime: "1:00 PM",
  fixedEventDuration: "1 hour",
  sleepTime: "11:00 PM",
  wantsSmallMainMission: true
};

const defaultDayMeta: DayMeta = {
  dayType: "Default Day",
  wakeTime: "5:30 AM",
  startTime: "5:30 AM",
  targetSleepTime: "11:00 PM",
  dayLengthMinutes: 1050,
  dayLengthLabel: "17h 30m",
  dayLengthType: "Normal",
  nightShutdownTime: "10:00 PM",
  todayMode: "Full Day",
  mainMission: ""
};

export default function Home() {
  return (
    <RecoveryErrorBoundary>
      <HomeApp />
    </RecoveryErrorBoundary>
  );
}

function HomeApp() {
  const [activeSection, setActiveSection] = useState<SectionId>("Dashboard");
  const [settings, setSettings] = useLocalStorage<SettingsState>(SETTINGS_KEY, defaultSettings);
  const [profile, setProfile] = useLocalStorage<ProfileState>(PROFILE_KEY, defaultProfile);
  const [activePlan, setActivePlan] = useLocalStorage<ActivePlan | null>(ACTIVE_PLAN_KEY, null);
  const [activePlans, setActivePlans] = useLocalStorage<ActivePlan[]>(ACTIVE_PLANS_KEY, []);
  const [foodLibrary, setFoodLibrary] = useLocalStorage<FoodItem[]>(FOOD_LIBRARY_KEY, createDefaultFoodLibrary());
  const [dailyFoodLogs, setDailyFoodLogs] = useLocalStorage<DailyFoodLogs>(DAILY_FOOD_LOGS_KEY, {});
  const [moneySpendingLogs, setMoneySpendingLogs] = useLocalStorage<MoneySpendingLog[]>(MONEY_SPENDING_LOGS_KEY, []);
  const [moneyIncomeLogs, setMoneyIncomeLogs] = useLocalStorage<MoneyIncomeLog[]>(MONEY_INCOME_LOGS_KEY, []);
  const [moneySavingLogs, setMoneySavingLogs] = useLocalStorage<MoneySavingLog[]>(MONEY_SAVING_LOGS_KEY, []);
  const [moneyOpportunityLogs, setMoneyOpportunityLogs] = useLocalStorage<MoneyOpportunityLog[]>(MONEY_OPPORTUNITY_LOGS_KEY, []);
  const [realUseTestLogs, setRealUseTestLogs] = useLocalStorage<RealUseTestLog[]>(REAL_USE_TEST_LOGS_KEY, []);
  const [longTermPlanning, setLongTermPlanning] = useLocalStorage<LongTermPlanningState>(LONG_TERM_PLANNING_KEY, createDefaultLongTermPlanning());
  const [longStudySessions, setLongStudySessions] = useLocalStorage<LongStudySession[]>(LONG_STUDY_SESSIONS_KEY, []);
  const [longStudyReviews, setLongStudyReviews] = useLocalStorage<LongStudyReview[]>(LONG_STUDY_REVIEWS_KEY, []);
  const [todayBackupBeforeEvent, setTodayBackupBeforeEvent] = useLocalStorage<TodayBackupBeforeEvent | null>(TODAY_BACKUP_BEFORE_EVENT_KEY, null);
  const [todayEventMode, setTodayEventMode] = useLocalStorage<TodayEventMode | null>(TODAY_EVENT_MODE_KEY, null);
  const [templateTasks, setTemplateTasks] = useLocalStorage<TemplateTask[]>(TEMPLATE_KEY, createOriginalTemplate());
  const [todayKey, setTodayKey] = useState(() => getDateKey(new Date()));
  const tomorrowKey = getNextDateKey(todayKey);
  const defaultTasks = useMemo(
    () => buildSchedule(templateTasks, settings.scheduleVersion === "5:00"),
    [settings.scheduleVersion, templateTasks]
  );
  const [tasks, setTasks] = useState<Task[]>(defaultTasks);
  const [tomorrowTasks, setTomorrowTasks] = useState<Task[]>(defaultTasks);
  const [plan, setPlan] = useState<Plan>(defaultPlan);
  const [missionPreview, setMissionPreview] = useState<MissionPlanPreviewItem[]>([]);
  const [buildTodayDraft, setBuildTodayDraft] = useState<BuildTodayDraft>(defaultBuildTodayDraft);
  const [buildTodayPreview, setBuildTodayPreview] = useState<BuildTodayPreview | null>(null);
  const [longStudyDraft, setLongStudyDraft] = useState<LongStudyDraft>(defaultLongStudyDraft);
  const [longStudyPreview, setLongStudyPreview] = useState<LongStudyPreview | null>(null);
  const [dailyNotes, setDailyNotes] = useState("");
  const [review, setReview] = useState<Review>(defaultReview);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [todayMode, setTodayMode] = useState<DailyMode>("Full Day");
  const [selectedTodayMode, setSelectedTodayMode] = useState<DailyMode>("Full Day");
  const [tomorrowMode, setTomorrowMode] = useState<DailyMode>("Full Day");
  const [dayMeta, setDayMeta] = useState<DayMeta>(defaultDayMeta);
  const [showBuildTodayFlow, setShowBuildTodayFlow] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [showLoadingRecovery, setShowLoadingRecovery] = useState(false);
  const [quickStartMessage, setQuickStartMessage] = useState("");
  const [activeFocusTaskId, setActiveFocusTaskId] = useState<string | null>(null);
  const previousScheduleVersion = useRef(settings.scheduleVersion);

  useEffect(() => {
    try {
      const currentDate = getCurrentDateKey();
      const loadedSettings = normalizeSettings(readStorage<Partial<SettingsState>>(SETTINGS_KEY, defaultSettings));
      const loadedTemplate = normalizeTemplate(readStorage<TemplateTask[]>(TEMPLATE_KEY, createOriginalTemplate()));
      const loadedDefaultTasks = buildSchedule(loadedTemplate, loadedSettings.scheduleVersion === "5:00");
      const preferredMode = loadedSettings.defaultDailyMode ?? "Full Day";
      const loadedTodayMode = readMode(`${MODE_KEY_PREFIX}:${currentDate}`, preferredMode);
      const loadedHistory = normalizeHistoryEntries(readStorage<unknown>(HISTORY_KEY, []));
      const lastActiveDate = safeGetLocalStorageItem(LAST_ACTIVE_DATE_KEY);
      let nextHistory = loadedHistory;

      if (lastActiveDate && lastActiveDate !== currentDate) {
        const previousTasks = normalizeTasks(readStorage<unknown>(`${TASKS_KEY_PREFIX}:${lastActiveDate}`, []));
        const previousReview = normalizeReview(readStorage<Partial<Review>>(`${REVIEW_KEY}:${lastActiveDate}`, defaultReview));
        const previousDailyNotes = readStorage<string>(`${DAILY_NOTES_KEY_PREFIX}:${lastActiveDate}`, "");
        const previousMode = readMode(`${MODE_KEY_PREFIX}:${lastActiveDate}`, "Full Day");
        if (previousTasks.length > 0) {
          nextHistory = upsertHistoryEntry(loadedHistory, createHistoryEntry(lastActiveDate, previousTasks, previousReview, previousMode, previousDailyNotes));
          writeStorage(HISTORY_KEY, nextHistory);
        }
      }

      const carriedTasks = normalizeTasks(readStorage<unknown>(`${TOMORROW_KEY_PREFIX}:${currentDate}`, []));
      const carriedMode = readMode(`${TOMORROW_MODE_KEY_PREFIX}:${currentDate}`, loadedTodayMode);
      const storedTodayTasks = normalizeTasks(readStorage<unknown>(`${TASKS_KEY_PREFIX}:${currentDate}`, []));
      const loadedDayMeta = normalizeDayMeta(readStorage<Partial<DayMeta>>(`${DAY_META_KEY_PREFIX}:${currentDate}`, { ...defaultDayMeta, todayMode: carriedMode }));
      const nextTodayTasks = storedTodayTasks.length > 0
        ? mergeSchedule(storedTodayTasks, loadedDefaultTasks)
        : carriedTasks.length > 0
          ? resetTaskStatuses(mergeSchedule(carriedTasks, loadedDefaultTasks))
          : [];

      const nextTomorrowKey = getNextDateKey(currentDate);
      const loadedPlan = normalizePlan(readStorage<Partial<Plan>>(`${PLAN_KEY}:${nextTomorrowKey}`, defaultPlan));
      const loadedTomorrowMode = readMode(`${TOMORROW_MODE_KEY_PREFIX}:${nextTomorrowKey}`, loadedPlan.tomorrowMode);
      const storedTomorrowTasks = normalizeTasks(readStorage<unknown>(`${TOMORROW_KEY_PREFIX}:${nextTomorrowKey}`, buildModeSchedule(loadedDefaultTasks, loadedTomorrowMode)));

      setSettings(loadedSettings);
      setTemplateTasks(loadedTemplate);
      setTodayKey(currentDate);
      setTasks(nextTodayTasks);
      setTomorrowTasks(storedTomorrowTasks);
      setPlan(loadedPlan);
      setReview(normalizeReview(readStorage<Partial<Review>>(`${REVIEW_KEY}:${currentDate}`, defaultReview)));
      setDailyNotes(readStorage<string>(`${DAILY_NOTES_KEY_PREFIX}:${currentDate}`, ""));
      setHistory(nextHistory);
      setTodayMode(carriedMode);
      setSelectedTodayMode(carriedMode);
      setTomorrowMode(loadedTomorrowMode);
      setDayMeta({ ...loadedDayMeta, todayMode: carriedMode });
      setBuildTodayDraft({
        ...defaultBuildTodayDraft,
        todayMode: carriedMode,
        wakeTime: loadedDayMeta.wakeTime ?? "5:30 AM",
        startTime: loadedDayMeta.startTime ?? "5:30 AM",
        sleepTime: loadedDayMeta.targetSleepTime ?? "11:00 PM"
      });
      setShowBuildTodayFlow(nextTodayTasks.length === 0);
      writeStorage(`${MODE_KEY_PREFIX}:${currentDate}`, carriedMode);
      safeSetLocalStorageItem(LAST_ACTIVE_DATE_KEY, currentDate);
      setIsReady(true);
    } catch (error) {
      console.warn("KPM Sunny failed to load local data. Recovery mode is available.", error);
      setShowLoadingRecovery(true);
    }
  }, []);

  useEffect(() => {
    if (isReady) return;
    const timeout = window.setTimeout(() => setShowLoadingRecovery(true), 3000);
    return () => window.clearTimeout(timeout);
  }, [isReady]);

  useEffect(() => {
    if (longStudySessions.length === 0) {
      const legacySessions = normalizeLongStudySessions(readStorage<LongStudySession[]>(LEGACY_LONG_STUDY_SESSIONS_KEY, []));
      if (legacySessions.length) setLongStudySessions(legacySessions);
    }
    if (longStudyReviews.length === 0) {
      const legacyReviews = normalizeLongStudyReviews(readStorage<LongStudyReview[]>(LEGACY_LONG_STUDY_REVIEWS_KEY, []));
      if (legacyReviews.length) setLongStudyReviews(legacyReviews);
    }
  }, [longStudySessions.length, longStudyReviews.length, setLongStudySessions, setLongStudyReviews]);

  useEffect(() => {
    setIsOnline(window.navigator.onLine);

    const showOnline = () => setIsOnline(true);
    const showOffline = () => setIsOnline(false);

    window.addEventListener("online", showOnline);
    window.addEventListener("offline", showOffline);

    return () => {
      window.removeEventListener("online", showOnline);
      window.removeEventListener("offline", showOffline);
    };
  }, []);

  useEffect(() => {
    if (!isReady) return;
    const interval = window.setInterval(() => {
      const currentDate = getCurrentDateKey();
      if (currentDate === todayKey) return;

      const archived = createHistoryEntry(todayKey, tasks, review, todayMode, dailyNotes);
      const nextHistory = upsertHistoryEntry(history, archived);
      const nextDefaultTasks = buildSchedule(templateTasks, settings.scheduleVersion === "5:00");
      const carriedTasks = normalizeTasks(readStorage<unknown>(`${TOMORROW_KEY_PREFIX}:${currentDate}`, []));
      const carriedMode = readMode(`${TOMORROW_MODE_KEY_PREFIX}:${currentDate}`, "Full Day");
      const nextTodayTasks = carriedTasks.length > 0
        ? resetTaskStatuses(mergeSchedule(carriedTasks, nextDefaultTasks))
        : [];
      const nextTomorrowKey = getNextDateKey(currentDate);
      const nextPlan = normalizePlan(readStorage<Partial<Plan>>(`${PLAN_KEY}:${nextTomorrowKey}`, defaultPlan));
      const nextTomorrowMode = readMode(`${TOMORROW_MODE_KEY_PREFIX}:${nextTomorrowKey}`, nextPlan.tomorrowMode);

      writeStorage(HISTORY_KEY, nextHistory);
      writeStorage(`${TASKS_KEY_PREFIX}:${currentDate}`, nextTodayTasks);
      writeStorage(`${MODE_KEY_PREFIX}:${currentDate}`, carriedMode);
      safeSetLocalStorageItem(LAST_ACTIVE_DATE_KEY, currentDate);
      setTodayKey(currentDate);
      setTasks(nextTodayTasks);
      setTomorrowTasks(normalizeTasks(readStorage<unknown>(`${TOMORROW_KEY_PREFIX}:${nextTomorrowKey}`, buildModeSchedule(nextDefaultTasks, nextTomorrowMode))));
      setPlan(nextPlan);
      setReview(normalizeReview(readStorage<Partial<Review>>(`${REVIEW_KEY}:${currentDate}`, defaultReview)));
      setDailyNotes(readStorage<string>(`${DAILY_NOTES_KEY_PREFIX}:${currentDate}`, ""));
      setHistory(nextHistory);
      setTodayMode(carriedMode);
      setSelectedTodayMode(carriedMode);
      setTomorrowMode(nextTomorrowMode);
      setDayMeta({ ...defaultDayMeta, todayMode: carriedMode });
      setBuildTodayPreview(null);
      setShowBuildTodayFlow(nextTodayTasks.length === 0);
    }, 60000);

    return () => window.clearInterval(interval);
  }, [dailyNotes, history, isReady, review, settings.scheduleVersion, tasks, templateTasks, todayKey, todayMode]);

  useEffect(() => {
    if (!isReady) return;
    if (previousScheduleVersion.current === settings.scheduleVersion) return;
    setTasks((current) => mergeSchedule(current, buildModeSchedule(defaultTasks, todayMode)));
    setTomorrowTasks((current) => mergeSchedule(current, buildModeSchedule(defaultTasks, tomorrowMode)));
    previousScheduleVersion.current = settings.scheduleVersion;
  }, [defaultTasks, isReady, settings.scheduleVersion, todayMode, tomorrowMode]);

  useEffect(() => {
    if (!isReady) return;
    writeStorage(`${TASKS_KEY_PREFIX}:${todayKey}`, tasks);
  }, [isReady, tasks, todayKey]);

  useEffect(() => {
    if (!isReady) return;
    writeStorage(`${TOMORROW_KEY_PREFIX}:${tomorrowKey}`, tomorrowTasks);
  }, [isReady, tomorrowKey, tomorrowTasks]);

  useEffect(() => {
    if (!isReady) return;
    writeStorage(`${PLAN_KEY}:${tomorrowKey}`, plan);
  }, [isReady, plan, tomorrowKey]);

  useEffect(() => {
    if (!isReady) return;
    writeStorage(`${MODE_KEY_PREFIX}:${todayKey}`, todayMode);
  }, [isReady, todayKey, todayMode]);

  useEffect(() => {
    if (!isReady) return;
    writeStorage(`${DAY_META_KEY_PREFIX}:${todayKey}`, dayMeta);
  }, [dayMeta, isReady, todayKey]);

  useEffect(() => {
    if (!isReady) return;
    writeStorage(`${TOMORROW_MODE_KEY_PREFIX}:${tomorrowKey}`, tomorrowMode);
  }, [isReady, tomorrowKey, tomorrowMode]);

  useEffect(() => {
    if (!isReady) return;
    writeStorage(`${REVIEW_KEY}:${todayKey}`, review);
  }, [isReady, review, todayKey]);

  useEffect(() => {
    if (!isReady) return;
    writeStorage(`${DAILY_NOTES_KEY_PREFIX}:${todayKey}`, dailyNotes);
  }, [dailyNotes, isReady, todayKey]);

  useEffect(() => {
    if (!isReady) return;
    writeStorage(HISTORY_KEY, history);
  }, [history, isReady]);

  useEffect(() => {
    const normalizedPlans = normalizeActivePlans(activePlans);
    const migratedActivePlan = normalizeMaybeActivePlan(activePlan);
    if (normalizedPlans.length === 0 && migratedActivePlan) {
      setActivePlans([migratedActivePlan]);
      return;
    }
    if (JSON.stringify(normalizedPlans) !== JSON.stringify(activePlans)) setActivePlans(normalizedPlans);
  }, [activePlan, activePlans, setActivePlans]);

  const stats = useMemo(() => getStats(tasks), [tasks]);
  const dayLevel = getDayLevel(stats.points);
  const nextTask = useMemo(() => getCurrentMission(tasks, dayMeta.startTime), [dayMeta.startTime, tasks]);
  const mainMission = useMemo(
    () => tasks.find((task) => task.priority === "S" && !task.completed && !task.skipped) || tasks.find((task) => task.priority === "S"),
    [tasks]
  );
  const activeFocusTask = useMemo(() => tasks.find((task) => task.id === activeFocusTaskId), [activeFocusTaskId, tasks]);
  const combinedDays = useMemo(() => [createHistoryEntry(todayKey, tasks, review, todayMode, dailyNotes), ...history.filter((day) => day.date !== todayKey)], [dailyNotes, history, review, tasks, todayKey, todayMode]);
  const streaks = useMemo(() => calculateStreaks(combinedDays, todayKey), [combinedDays, todayKey]);
  const analytics = useMemo(() => calculateAnalytics(history), [history]);
  const sevenDayTest = useMemo(
    () => createSevenDayTest(settings.sevenDayTestStartDate ?? todayKey, todayKey, combinedDays),
    [combinedDays, settings.sevenDayTestStartDate, todayKey]
  );
  const normalizedActivePlans = useMemo(() => normalizeActivePlans(activePlans), [activePlans]);
  const normalizedFoodLibrary = useMemo(() => normalizeFoodLibrary(foodLibrary), [foodLibrary]);
  const normalizedDailyFoodLogs = useMemo(() => normalizeDailyFoodLogs(dailyFoodLogs), [dailyFoodLogs]);
  const normalizedMoneySpendingLogs = useMemo(() => normalizeMoneySpendingLogs(moneySpendingLogs), [moneySpendingLogs]);
  const normalizedMoneyIncomeLogs = useMemo(() => normalizeMoneyIncomeLogs(moneyIncomeLogs), [moneyIncomeLogs]);
  const normalizedMoneySavingLogs = useMemo(() => normalizeMoneySavingLogs(moneySavingLogs), [moneySavingLogs]);
  const normalizedMoneyOpportunityLogs = useMemo(() => normalizeMoneyOpportunityLogs(moneyOpportunityLogs), [moneyOpportunityLogs]);
  const activeTodayPlans = useMemo(() => normalizedActivePlans.filter((plan) => plan.status === "active"), [normalizedActivePlans]);
  const todayPlanRows = useMemo(() => getPrioritizedPlanTaskRows(activeTodayPlans), [activeTodayPlans]);
  const todayFocusItems = useMemo(() => getTodayFocusItems(tasks, mainMission, todayPlanRows), [tasks, mainMission, todayPlanRows]);

  function addActivePlan(nextPlan: ActivePlan) {
    const normalizedPlan = normalizeActivePlan({ ...nextPlan, id: nextPlan.id || createPlanId(nextPlan.type) });
    setActivePlans((current) => [...normalizeActivePlans(current), normalizedPlan]);
    setActivePlan(normalizedPlan);
  }

  function updateActivePlan(planId: string, updater: SetStateAction<ActivePlan | null>) {
    setActivePlans((current) => {
      const normalizedPlans = normalizeActivePlans(current);
      const currentPlan = normalizedPlans.find((plan) => plan.id === planId) ?? null;
      const nextPlan = typeof updater === "function" ? updater(currentPlan) : updater;
      if (!nextPlan) return normalizedPlans.filter((plan) => plan.id !== planId);
      return normalizedPlans.map((plan) => (plan.id === planId ? normalizeActivePlan({ ...nextPlan, id: planId }) : plan));
    });
  }

  function updatePlanStatus(planId: string, status: PlanStatus) {
    const prompt = status === "paused"
      ? "Pause this plan? It will stop sending tasks to Today."
      : status === "active"
        ? "Resume this plan and show its tasks in Today?"
        : status === "archived"
          ? "Archive this plan? It will stop sending tasks to Today."
          : "Mark this plan completed? It will stop sending tasks to Today.";
    if (!window.confirm(prompt)) return;
    setActivePlans((current) => normalizeActivePlans(current).map((plan) => (plan.id === planId ? { ...plan, status } : plan)));
  }

  function completeOnboarding(nextSettings: Required<Pick<SettingsState, "scheduleVersion" | "defaultDailyMode" | "mainLifeFocus">>) {
    const nextTemplate = normalizeTemplate(templateTasks);
    const nextDefaultTasks = buildSchedule(nextTemplate, nextSettings.scheduleVersion === "5:00");
    const nextTasks = buildModeSchedule(nextDefaultTasks, nextSettings.defaultDailyMode);
    setSettings({
      ...settings,
      ...nextSettings,
      onboardingComplete: true,
      sevenDayTestStartDate: todayKey
    });
    setTodayMode(nextSettings.defaultDailyMode);
    setSelectedTodayMode(nextSettings.defaultDailyMode);
    setTomorrowMode(nextSettings.defaultDailyMode);
    setDayMeta({ ...defaultDayMeta, todayMode: nextSettings.defaultDailyMode, wakeTime: nextSettings.scheduleVersion === "5:00" ? "5:00 AM" : "5:30 AM", startTime: nextSettings.scheduleVersion === "5:00" ? "5:00 AM" : "5:30 AM" });
    setShowBuildTodayFlow(false);
    setTasks(nextTasks);
    setTomorrowTasks(buildModeSchedule(nextDefaultTasks, nextSettings.defaultDailyMode));
    setPlan({ ...defaultPlan, tomorrowMode: nextSettings.defaultDailyMode });
    setMissionPreview([]);
    setReview(defaultReview);
  }

  function updateTask(id: string, patch: Partial<Task>) {
    setTasks((current) => current.map((task) => (task.id === id ? { ...task, ...patch } : task)));
  }

  function snoozeTask(id: string) {
    setTasks((current) =>
      current
        .map((task) => {
          if (task.id !== id) return task;
          const nextTime = shiftTime(task.time, 15);
          const snoozeNote = "Snoozed 15 min";
          const notes = task.notes.includes(snoozeNote)
            ? task.notes
            : [task.notes.trim(), snoozeNote].filter(Boolean).join(" | ");
          return { ...task, time: nextTime, block: getTaskBlock(nextTime), notes };
        })
        .sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time))
    );
  }

  function resetToday() {
    if (!window.confirm("Reset today's mission list? This will replace today's current tasks, but history will stay safe.")) return;
    setTasks(buildModeSchedule(defaultTasks, todayMode));
    setReview(defaultReview);
    setBuildTodayPreview(null);
    setShowBuildTodayFlow(false);
  }

  function clearAllLocalData() {
    if (!window.confirm("This deletes all local data on this device. Clear all KPM Sunny Daily OS data?")) return;
    clearKpmLocalData();
    const currentDate = getCurrentDateKey();
    setSettings(defaultSettings);
    setProfile(defaultProfile);
    setActivePlan(null);
    setActivePlans([]);
    setFoodLibrary(createDefaultFoodLibrary());
    setDailyFoodLogs({});
    setMoneySpendingLogs([]);
    setMoneyIncomeLogs([]);
    setMoneySavingLogs([]);
    setMoneyOpportunityLogs([]);
    setRealUseTestLogs([]);
    setLongTermPlanning(createDefaultLongTermPlanning());
    setLongStudySessions([]);
    setLongStudyReviews([]);
    setTodayBackupBeforeEvent(null);
    setTodayEventMode(null);
    const originalTemplate = createOriginalTemplate();
    setTemplateTasks(originalTemplate);
    setTodayKey(currentDate);
    setTodayMode("Full Day");
    setSelectedTodayMode("Full Day");
    setTomorrowMode("Full Day");
    setDayMeta(defaultDayMeta);
    setShowBuildTodayFlow(false);
    setTasks(buildModeSchedule(buildSchedule(originalTemplate, false), "Full Day"));
    setTomorrowTasks(buildModeSchedule(buildSchedule(originalTemplate, false), "Full Day"));
    setPlan(defaultPlan);
    setMissionPreview([]);
    setReview(defaultReview);
    setDailyNotes("");
    setHistory([]);
    setActiveFocusTaskId(null);
    setQuickStartMessage("");
    safeSetLocalStorageItem(LAST_ACTIVE_DATE_KEY, currentDate);
  }

  function loadDefaultDashboard() {
    const currentDate = getCurrentDateKey();
    const originalTemplate = createOriginalTemplate();
    const nextSettings: SettingsState = {
      ...defaultSettings,
      onboardingComplete: true,
      sevenDayTestStartDate: currentDate
    };
    const nextDefaultTasks = buildSchedule(originalTemplate, false);
    const nextTasks = buildModeSchedule(nextDefaultTasks, nextSettings.defaultDailyMode ?? "Full Day");

    setSettings(nextSettings);
    setProfile(defaultProfile);
    setActivePlan(null);
    setActivePlans([]);
    setFoodLibrary(createDefaultFoodLibrary());
    setDailyFoodLogs({});
    setMoneySpendingLogs([]);
    setMoneyIncomeLogs([]);
    setMoneySavingLogs([]);
    setMoneyOpportunityLogs([]);
    setRealUseTestLogs([]);
    setLongTermPlanning(createDefaultLongTermPlanning());
    setLongStudySessions([]);
    setLongStudyReviews([]);
    setTodayBackupBeforeEvent(null);
    setTodayEventMode(null);
    setTemplateTasks(originalTemplate);
    setTodayKey(currentDate);
    setTasks(nextTasks);
    setTomorrowTasks(buildModeSchedule(nextDefaultTasks, nextSettings.defaultDailyMode ?? "Full Day"));
    setPlan({ ...defaultPlan, tomorrowMode: nextSettings.defaultDailyMode ?? "Full Day" });
    setMissionPreview([]);
    setDailyNotes("");
    setReview(defaultReview);
    setHistory([]);
    setTodayMode(nextSettings.defaultDailyMode ?? "Full Day");
    setSelectedTodayMode(nextSettings.defaultDailyMode ?? "Full Day");
    setTomorrowMode(nextSettings.defaultDailyMode ?? "Full Day");
    setDayMeta({ ...defaultDayMeta, todayMode: nextSettings.defaultDailyMode ?? "Full Day" });
    setShowBuildTodayFlow(false);
    setActiveFocusTaskId(null);
    safeSetLocalStorageItem(LAST_ACTIVE_DATE_KEY, currentDate);
    setShowLoadingRecovery(false);
    setIsReady(true);
  }

  function clearLocalDataFromRecovery() {
    if (!window.confirm("This deletes all KPM Sunny data on this device.")) return;
    clearKpmLocalData();
    loadDefaultDashboard();
  }

  function addTask(draft: TaskDraft) {
    const task = draftToTask(draft, true);
    setTasks((current) => [...current, task].sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time)));
  }

  function editTask(id: string, draft: TaskDraft) {
    setTasks((current) =>
      current
        .map((task) => (task.id === id ? { ...task, ...draft, block: getTaskBlock(draft.time), points: Number(draft.points) || 0 } : task))
        .sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time))
    );
  }

  function updateMainMissionTitle(title: string) {
    const cleanTitle = title.trim();
    if (!cleanTitle) return;
    setTasks((current) => {
      const existingMain = getMainMissionForDay(current);
      if (!existingMain) return current;
      return current.map((task) => (task.id === existingMain.id ? { ...task, title: cleanTitle } : task));
    });
  }

  function deleteTask(id: string) {
    const task = tasks.find((item) => item.id === id);
    if (!window.confirm(`Delete "${task?.title ?? "this task"}" from today's list?`)) return;
    setTasks((current) => current.filter((task) => task.id !== id));
  }

  function exportAllData() {
    const payload = {
      app: "KPM Sunny Daily OS",
      version: APP_VERSION,
      exportedAt: new Date().toISOString(),
      data: getRawKpmLocalData()
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `kpm-sunny-backup-${getDateKey(new Date())}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function importAllData(rawJson: string): string {
    let parsed: unknown;
    try {
      parsed = JSON.parse(rawJson);
    } catch {
      return "Import failed: JSON could not be parsed.";
    }

    if (!isKpmBackupPayload(parsed)) {
      return "Import failed: this does not look like KPM Sunny app data.";
    }

    const payload = parsed;
    const entries = Object.entries(payload.data).filter(([key]) => key.startsWith("kpm-sunny"));
    if (entries.length === 0) return "Import failed: no KPM Sunny data keys were found.";
    if (!window.confirm(`Import ${entries.length} saved data keys? This will replace current KPM Sunny data on this device.`)) return "Import cancelled.";

    clearKpmLocalData();

    entries.forEach(([key, value]) => {
      safeSetLocalStorageItem(key, typeof value === "string" ? value : JSON.stringify(value));
    });

    window.location.reload();
    return "Import complete. Reloading...";
  }

  function findBestTimeSlot() {
    const cleanTitle = plan.title.trim();
    if (!cleanTitle) {
      setPlan({ ...plan, suggested: "Add tomorrow's main mission first.", scheduledAt: "" });
      setMissionPreview([]);
      return;
    }

    const preview = buildMissionPlanPreview(cleanTitle, plan, tomorrowTasks);
    setMissionPreview(preview);
    setPlan({
      ...plan,
      scheduledAt: preview[0]?.time ?? "",
      suggested: preview.length > 1
        ? `Mission plan preview created with ${preview.length} smaller missions.`
        : `Mission preview ready for tomorrow at ${preview[0]?.time ?? "the best available slot"}.`
    });
  }

  function updateMissionPreviewAction(id: string, action: ConflictAction) {
    setMissionPreview((current) => current.map((item) => (item.id === id ? { ...item, action } : item)));
  }

  function applyMissionPreview() {
    if (missionPreview.length === 0) return;
    const nextTasks = applyMissionPlanPreview(tomorrowTasks, missionPreview);
    const applied = nextTasks.filter((task) => task.insertedGoal);
    setTomorrowTasks(nextTasks);
    setPlan({
      ...plan,
      scheduledAt: applied[0]?.time ?? "",
      suggested: applied.length
        ? `Applied ${applied.length} mission${applied.length === 1 ? "" : "s"} to tomorrow.`
        : "No generated missions were applied."
    });
    setMissionPreview([]);
  }

  function cancelMissionPreview() {
    setMissionPreview([]);
    setPlan((current) => ({ ...current, suggested: "", scheduledAt: "" }));
  }

  function generateTodayByMode(mode?: DailyMode, mainMissionTitle?: string) {
    const resolvedMode = resolveDailyMode(mode, settings.defaultDailyMode);
    if (!window.confirm(`Generate today's missions using ${resolvedMode} Mode? This will overwrite today's current list.`)) return false;
    const nextTasks = applyMainMissionTitle(buildModeSchedule(defaultTasks, resolvedMode), mainMissionTitle);
    setTodayMode(resolvedMode);
    setSelectedTodayMode(resolvedMode);
    setDayMeta({ ...defaultDayMeta, dayType: "Normal Day", wakeTime: settings.scheduleVersion === "5:00" ? "5:00 AM" : "5:30 AM", startTime: settings.scheduleVersion === "5:00" ? "5:00 AM" : "5:30 AM", todayMode: resolvedMode, mainMission: mainMissionTitle });
    setShowBuildTodayFlow(false);
    setTasks(nextTasks);
    setReview(defaultReview);
    return true;
  }

  function startDay(mode: DailyMode | undefined, mainMissionTitle: string) {
    if (generateTodayByMode(resolveDailyMode(mode, settings.defaultDailyMode), mainMissionTitle)) setActiveSection("Today Task List");
  }

  function quickStartToday() {
    if (tasks.length > 0) {
      setQuickStartMessage("Today already has missions.");
      return;
    }

    const mode = resolveDailyMode(undefined, settings.defaultDailyMode);
    setTodayMode(mode);
    setSelectedTodayMode(mode);
    setDayMeta({ ...defaultDayMeta, todayMode: mode });
    setShowBuildTodayFlow(false);
    setTasks(buildModeSchedule(defaultTasks, mode));
    setReview(defaultReview);
    setQuickStartMessage("Today's missions are ready.");
  }

  function createBuildTodayPreview(nextDraft: BuildTodayDraft) {
    const preview = addLifeResetTasksToBuildPreview(buildTodayPlan(nextDraft, defaultTasks), activeTodayPlans);
    setBuildTodayDraft(nextDraft);
    setBuildTodayPreview(preview);
  }

  function applyBuildTodayPreview() {
    if (!buildTodayPreview) return;
    if (tasks.length > 0 && !window.confirm("Today already has missions. Replace today's current mission list with this preview?")) return;

    setTasks(buildTodayPreview.tasks);
    setTodayMode(buildTodayPreview.todayMode);
    setSelectedTodayMode(buildTodayPreview.todayMode);
    setDayMeta({
      dayType: buildTodayPreview.dayType,
      wakeTime: buildTodayPreview.wakeTime,
      startTime: buildTodayPreview.startTime,
      targetSleepTime: buildTodayPreview.targetSleepTime,
      dayLengthMinutes: buildTodayPreview.dayLengthMinutes,
      dayLengthLabel: buildTodayPreview.dayLengthLabel,
      dayLengthType: buildTodayPreview.dayLengthType,
      nightShutdownTime: buildTodayPreview.nightShutdownTime,
      todayMode: buildTodayPreview.todayMode,
      mainMission: buildTodayPreview.mainMission
    });
    setReview(defaultReview);
    setBuildTodayPreview(null);
    setShowBuildTodayFlow(false);
    setQuickStartMessage("Today's missions are ready.");
  }

  function openBuildTodayFlow() {
    setBuildTodayPreview(null);
    setShowBuildTodayFlow(true);
  }

  function cancelBuildTodayFlow() {
    setBuildTodayPreview(null);
    if (tasks.length > 0) setShowBuildTodayFlow(false);
  }

  function createLongStudyPlanPreview(nextDraft: LongStudyDraft) {
    const preview = buildLongStudyPreview(nextDraft, todayKey);
    setLongStudyDraft(nextDraft);
    setLongStudyPreview(preview);
  }

  function applyLongStudyPreview() {
    if (!longStudyPreview) return;
    saveLongStudyEvent(longStudyPreview);
    setLongStudyPreview(null);
  }

  function saveLongStudyEvent(session: LongStudySession) {
    setLongStudySessions((current) => [session, ...normalizeLongStudySessions(current).filter((item) => item.id !== session.id)].slice(0, 50));
  }

  function addLongStudyPreviewKeyBlocksToToday() {
    if (!longStudyPreview) return;
    if (!window.confirm("This will add selected Long Study blocks to Today. Continue?")) return;
    saveLongStudyEvent(longStudyPreview);
    addLongStudyKeyBlocksToToday(longStudyPreview);
    setLongStudyPreview(null);
  }

  function copyLongStudyBlocksToToday(session: LongStudySession) {
    if (!window.confirm("This will add selected Long Study blocks to Today. Continue?")) return;
    addLongStudyKeyBlocksToToday(session);
  }

  function addLongStudyKeyBlocksToToday(session: LongStudySession) {
    const keyBlocks = getLongStudyKeyBlocks(session);
    setTasks((current) => mergeSchedule(current, keyBlocks.map((task) => ({ ...task, id: `copy-${task.id}-${Date.now()}`, completed: false, skipped: false }))));
  }

  function sendLongTermTaskToToday(source: "Weekly Mission" | "Next Action", item: WeeklyMission | NextAction) {
    if (!window.confirm(`Send "${item.title}" to Today as a Long-Term Planning task?`)) return;
    const category = mapLongTermCategoryToTaskCategory(item.category);
    const time = source === "Weekly Mission" ? "8:00 AM" : "10:15 AM";
    const task: Task = {
      id: `long-term-${source.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`,
      time,
      title: item.title,
      category,
      priority: item.priority,
      points: getMissionPoints(item.priority),
      completed: false,
      skipped: false,
      notes: `Source: Long-Term Planning. Type: ${source}.${"targetResult" in item && item.targetResult ? ` Target: ${item.targetResult}` : ""}`,
      block: getTaskBlock(time),
      custom: true,
      flexible: true
    };
    setTasks((current) => [...current, task].sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time)));
    if (source === "Next Action") {
      setLongTermPlanning((current) => ({
        ...normalizeLongTermPlanning(current),
        nextActions: normalizeLongTermPlanning(current).nextActions.map((action) => action.id === item.id ? { ...action, status: "sent to today" } : action)
      }));
    }
  }

  function useLongStudyPreviewAsTodayEvent() {
    if (!longStudyPreview) return;
    if (!window.confirm("Use this Long Study Event as today's main event? Your current Today plan will be backed up and can be restored.")) return;
    saveLongStudyEvent(longStudyPreview);
    setTodayBackupBeforeEvent({ date: todayKey, tasks, dayMeta, todayMode });
    setTasks(buildTodayEventModeTasks(tasks, longStudyPreview));
    setTodayMode("Skill");
    setSelectedTodayMode("Skill");
    setTodayEventMode({ active: true, date: todayKey, eventId: longStudyPreview.id, eventName: longStudyPreview.eventName });
    setLongStudyPreview(null);
  }

  function restoreNormalToday() {
    if (!todayBackupBeforeEvent || todayBackupBeforeEvent.date !== todayKey) {
      setTodayEventMode(null);
      return;
    }
    if (!window.confirm("Restore the normal Today plan from before Event Mode?")) return;
    setTasks(todayBackupBeforeEvent.tasks);
    setDayMeta(todayBackupBeforeEvent.dayMeta);
    setTodayMode(todayBackupBeforeEvent.todayMode);
    setSelectedTodayMode(todayBackupBeforeEvent.todayMode);
    setTodayEventMode(null);
    setTodayBackupBeforeEvent(null);
  }

  function saveLongStudyReview(review: LongStudyReview) {
    setLongStudyReviews((current) => [normalizeLongStudyReview(review), ...normalizeLongStudyReviews(current).filter((item) => item.id !== review.id)].slice(0, 100));
  }

  function selectTomorrowMode(mode: DailyMode) {
    setTomorrowMode(mode);
    setPlan((current) => ({ ...current, tomorrowMode: mode }));
    setTomorrowTasks(buildModeSchedule(defaultTasks, mode));
    setMissionPreview([]);
  }

  function addTemplateTask(draft: TemplateDraft) {
    const nextTask = draftToTemplateTask(draft);
    setTemplateTasks((current) => [...normalizeTemplate(current), nextTask].sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time)));
  }

  function editTemplateTask(id: string, draft: TemplateDraft) {
    setTemplateTasks((current) =>
      normalizeTemplate(current)
        .map((task) => (task.id === id ? { ...task, ...draft, title: draft.title.trim(), points: Number(draft.points) || 0 } : task))
        .sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time))
    );
  }

  function disableTemplateTask(id: string) {
    setTemplateTasks((current) => normalizeTemplate(current).map((task) => (task.id === id ? { ...task, enabled: false } : task)));
  }

  function enableTemplateTask(id: string) {
    setTemplateTasks((current) => normalizeTemplate(current).map((task) => (task.id === id ? { ...task, enabled: true } : task)));
  }

  function deleteTemplateTask(id: string) {
    setTemplateTasks((current) => normalizeTemplate(current).filter((task) => task.id !== id));
  }

  function resetDefaultTemplate() {
    if (!window.confirm("Reset the default schedule template to the original 5:30 AM version? Today and history will not be deleted.")) return;
    setTemplateTasks(createOriginalTemplate());
  }

  function applyTemplateToTomorrow() {
    setTomorrowTasks(buildModeSchedule(defaultTasks, tomorrowMode));
    setPlan((current) => ({ ...defaultPlan, tomorrowMode: current.tomorrowMode }));
    setMissionPreview([]);
  }

  function applyTemplateToToday() {
    if (!window.confirm("Apply the default template to today? This will overwrite today's current mission list.")) return;
    setTasks(buildModeSchedule(defaultTasks, todayMode));
    setReview(defaultReview);
  }

  if (!isReady) {
    return showLoadingRecovery ? (
      <RecoveryPanel
        retry={() => window.location.reload()}
        loadDefaultDashboard={loadDefaultDashboard}
        exportRawLocalData={exportRawLocalData}
        clearLocalData={clearLocalDataFromRecovery}
      />
    ) : (
      <LoadingShell />
    );
  }
  if (!settings.onboardingComplete) {
    return <OnboardingScreen completeOnboarding={completeOnboarding} />;
  }

  return (
    <div className="sunny-mobile-shell min-h-screen overflow-x-hidden bg-[#060A14] text-slate-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(89,195,255,0.14),transparent_30%),radial-gradient(circle_at_84%_14%,rgba(166,30,44,0.10),transparent_28%),radial-gradient(circle_at_58%_0%,rgba(216,194,122,0.055),transparent_26%),linear-gradient(135deg,#060A14_0%,#0A1020_48%,#030711_100%)]" />
      {!isOnline ? <OfflineBanner /> : null}
      <div className={`app-shell relative grid min-h-screen min-w-0 max-w-full lg:grid-cols-[188px_minmax(0,1fr)] ${activeSection === "Dashboard" ? "" : "with-right-panel 2xl:grid-cols-[188px_minmax(0,1fr)_300px]"}`}>
        <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />

        <main className="sunny-main min-w-0 max-w-full overflow-x-hidden px-3 pb-[calc(6.25rem+env(safe-area-inset-bottom))] pt-[calc(0.75rem+env(safe-area-inset-top))] sm:px-5 lg:px-4 lg:pb-6 lg:pt-4 xl:px-5">
          <CommandHeader stats={stats} dayLevel={dayLevel} activeSection={activeSection} todayKey={todayKey} todayMode={todayMode} dayMeta={dayMeta} />
          {activeSection !== "Dashboard" ? <MobilePriorityPanel stats={stats} dayLevel={dayLevel} mainMission={mainMission} nextTask={nextTask} /> : null}

          <div className="mx-auto mt-6 w-full max-w-[1180px]">
            {activeSection === "Dashboard" && (
              <div className="grid gap-5">
                {showBuildTodayFlow || tasks.length === 0 ? (
                  <BuildToday
                    draft={buildTodayDraft}
                    setDraft={setBuildTodayDraft}
                    preview={buildTodayPreview}
                    createPreview={createBuildTodayPreview}
                    applyPreview={applyBuildTodayPreview}
                    editPreview={() => setBuildTodayPreview(null)}
                    cancelFlow={cancelBuildTodayFlow}
                  />
                ) : (
                  <TodayCommand
                    stats={stats}
                    currentMission={nextTask}
                    mainMission={mainMission}
                    dayMeta={dayMeta}
                    tasks={tasks}
                    updateTask={updateTask}
                    snoozeTask={snoozeTask}
                    startMission={(id) => setActiveFocusTaskId(id)}
                    rebuildToday={openBuildTodayFlow}
                    setActiveSection={setActiveSection}
                    focusItems={todayFocusItems}
                    activePlans={activeTodayPlans}
                    updateActivePlan={updateActivePlan}
                    foodLogs={normalizedDailyFoodLogs}
                    todayKey={todayKey}
                    moneySpendingLogs={normalizedMoneySpendingLogs}
                    moneyIncomeLogs={normalizedMoneyIncomeLogs}
                    moneySavingLogs={normalizedMoneySavingLogs}
                    moneyOpportunityLogs={normalizedMoneyOpportunityLogs}
                    todayEventMode={todayEventMode?.active && todayEventMode.date === todayKey ? todayEventMode : null}
                    restoreNormalToday={restoreNormalToday}
                  />
                )}
              </div>
            )}
            {activeSection === "Command Center" && (
              <Dashboard
                stats={stats}
                dayLevel={dayLevel}
                nextTask={nextTask}
                mainMission={mainMission}
                tasks={tasks}
                streaks={streaks}
                todayMode={todayMode}
                selectedTodayMode={selectedTodayMode}
                defaultTodayMode={settings.defaultDailyMode}
                setSelectedTodayMode={setSelectedTodayMode}
                generateTodayByMode={generateTodayByMode}
                startDay={startDay}
                quickStartToday={quickStartToday}
                quickStartMessage={quickStartMessage}
                dailyNotes={dailyNotes}
                setDailyNotes={setDailyNotes}
                updateMainMissionTitle={updateMainMissionTitle}
                sevenDayTest={sevenDayTest}
                setActiveSection={setActiveSection}
              />
            )}
            {activeSection === "Plan" && (
              <PlanFoundation
                plan={plan}
                setPlan={setPlan}
                tomorrowMode={tomorrowMode}
                selectTomorrowMode={selectTomorrowMode}
                findBestTimeSlot={findBestTimeSlot}
                missionPreview={missionPreview}
                updateMissionPreviewAction={updateMissionPreviewAction}
                applyMissionPreview={applyMissionPreview}
                cancelMissionPreview={cancelMissionPreview}
                tomorrowTasks={tomorrowTasks}
                activePlans={normalizedActivePlans}
                addActivePlan={addActivePlan}
                updateActivePlan={updateActivePlan}
                updatePlanStatus={updatePlanStatus}
                profile={normalizeProfile(profile)}
                setProfile={setProfile}
                foodLibrary={normalizedFoodLibrary}
                setFoodLibrary={setFoodLibrary}
                dailyFoodLogs={normalizedDailyFoodLogs}
                setDailyFoodLogs={setDailyFoodLogs}
                moneySpendingLogs={normalizedMoneySpendingLogs}
                setMoneySpendingLogs={setMoneySpendingLogs}
                moneyIncomeLogs={normalizedMoneyIncomeLogs}
                setMoneyIncomeLogs={setMoneyIncomeLogs}
                moneySavingLogs={normalizedMoneySavingLogs}
                setMoneySavingLogs={setMoneySavingLogs}
                moneyOpportunityLogs={normalizedMoneyOpportunityLogs}
                setMoneyOpportunityLogs={setMoneyOpportunityLogs}
                todayKey={todayKey}
                longStudyDraft={longStudyDraft}
                setLongStudyDraft={setLongStudyDraft}
                longStudyPreview={longStudyPreview}
                createLongStudyPreview={createLongStudyPlanPreview}
                saveLongStudyPreview={applyLongStudyPreview}
                addLongStudyPreviewKeyBlocksToToday={addLongStudyPreviewKeyBlocksToToday}
                useLongStudyPreviewAsTodayEvent={useLongStudyPreviewAsTodayEvent}
                cancelLongStudyPreview={() => setLongStudyPreview(null)}
                longStudySessions={normalizeLongStudySessions(longStudySessions)}
                setLongStudySessions={setLongStudySessions}
                copyLongStudyBlocksToToday={copyLongStudyBlocksToToday}
                longTermPlanning={normalizeLongTermPlanning(longTermPlanning)}
                setLongTermPlanning={setLongTermPlanning}
                sendLongTermTaskToToday={sendLongTermTaskToToday}
              />
            )}
            {activeSection === "Progress" && (
              <ProgressFoundation
                review={review}
                setReview={setReview}
                stats={stats}
                dayLevel={dayLevel}
                tasks={tasks}
                todayKey={todayKey}
                history={history}
                sevenDayTest={sevenDayTest}
                analytics={analytics}
                streaks={streaks}
                activePlans={normalizedActivePlans}
                updateActivePlan={updateActivePlan}
                dailyFoodLogs={normalizedDailyFoodLogs}
                moneySpendingLogs={normalizedMoneySpendingLogs}
                moneyIncomeLogs={normalizedMoneyIncomeLogs}
                moneySavingLogs={normalizedMoneySavingLogs}
                moneyOpportunityLogs={normalizedMoneyOpportunityLogs}
                longStudySessions={normalizeLongStudySessions(longStudySessions)}
                longStudyReviews={normalizeLongStudyReviews(longStudyReviews)}
                saveLongStudyReview={saveLongStudyReview}
                realUseTestLogs={normalizeRealUseTestLogs(realUseTestLogs)}
                setRealUseTestLogs={setRealUseTestLogs}
                longTermPlanning={normalizeLongTermPlanning(longTermPlanning)}
              />
            )}
            {activeSection === "Profile" && (
              <ProfileScreen
                profile={normalizeProfile(profile)}
                activePlans={normalizedActivePlans}
                setProfile={setProfile}
                settings={settings}
                setSettings={setSettings}
                resetToday={resetToday}
                clearAllLocalData={clearAllLocalData}
                exportAllData={exportAllData}
                importAllData={importAllData}
                todayMode={todayMode}
                selectedTodayMode={selectedTodayMode}
                setSelectedTodayMode={setSelectedTodayMode}
                generateTodayByMode={generateTodayByMode}
                resetDefaultTemplate={resetDefaultTemplate}
              />
            )}
            {activeSection === "Today Task List" && (
              <TaskList tasks={tasks} todayMode={todayMode} updateTask={updateTask} resetToday={resetToday} addTask={addTask} editTask={editTask} deleteTask={deleteTask} />
            )}
            {activeSection === "Plan Tomorrow" && (
              <PlanTomorrow
                plan={plan}
                setPlan={setPlan}
                tomorrowMode={tomorrowMode}
                selectTomorrowMode={selectTomorrowMode}
                findBestTimeSlot={findBestTimeSlot}
                missionPreview={missionPreview}
                updateMissionPreviewAction={updateMissionPreviewAction}
                applyMissionPreview={applyMissionPreview}
                cancelMissionPreview={cancelMissionPreview}
                tomorrowTasks={tomorrowTasks}
              />
            )}
            {activeSection === "Evening Review" && (
              <EveningReview review={review} setReview={setReview} stats={stats} dayLevel={dayLevel} tasks={tasks} todayKey={todayKey} />
            )}
            {activeSection === "History" && (
              <HistoryPage history={history} sevenDayTest={sevenDayTest} />
            )}
            {activeSection === "Analytics" && (
              <AnalyticsPage analytics={analytics} streaks={streaks} />
            )}
            {activeSection === "Template Editor" && (
              <TemplateEditor
                templateTasks={normalizeTemplate(templateTasks)}
                shiftEarlier={settings.scheduleVersion === "5:00"}
                addTemplateTask={addTemplateTask}
                editTemplateTask={editTemplateTask}
                disableTemplateTask={disableTemplateTask}
                enableTemplateTask={enableTemplateTask}
                deleteTemplateTask={deleteTemplateTask}
                resetDefaultTemplate={resetDefaultTemplate}
                applyTemplateToTomorrow={applyTemplateToTomorrow}
                applyTemplateToToday={applyTemplateToToday}
              />
            )}
            {activeSection === "Settings" && (
              <SettingsPanel
                settings={settings}
                setSettings={setSettings}
                resetToday={resetToday}
                clearAllLocalData={clearAllLocalData}
                exportAllData={exportAllData}
                importAllData={importAllData}
                todayMode={todayMode}
                selectedTodayMode={selectedTodayMode}
                setSelectedTodayMode={setSelectedTodayMode}
                generateTodayByMode={generateTodayByMode}
              />
            )}
            {activeSection === "More" && (
              <MorePage setActiveSection={setActiveSection} />
            )}
          </div>
        </main>

        {activeSection !== "Dashboard" ? <RightPanel stats={stats} dayLevel={dayLevel} mainMission={mainMission} nextTask={nextTask} tasks={tasks} streaks={streaks} todayMode={todayMode} /> : null}
      </div>

      <BottomNav activeSection={activeSection} setActiveSection={setActiveSection} />
      {activeFocusTask ? (
        <StartMissionModal
          task={activeFocusTask}
          updateTask={updateTask}
          snoozeTask={snoozeTask}
          close={() => setActiveFocusTaskId(null)}
        />
      ) : null}
    </div>
  );
}

function LoadingShell() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#07111F] text-slate-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(111,214,209,0.15),transparent_30%),radial-gradient(circle_at_84%_14%,rgba(139,123,198,0.12),transparent_28%),linear-gradient(135deg,#07111F_0%,#0B1730_48%,#050B16_100%)]" />
      <main className="relative flex min-h-screen items-center justify-center px-5">
        <section className="w-full max-w-md rounded-[1.75rem] border border-cyan-200/15 bg-white/[0.06] p-6 text-center shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f0d77a] to-[#e8c86a] text-slate-950 shadow-[0_0_32px_rgba(232,200,106,0.18)]">
            <Sun size={30} />
          </div>
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.22em] text-amber-200">Daily OS</p>
          <h1 className="mt-2 text-3xl font-black text-white">KPM Sunny Daily OS</h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">Loading your local mission dashboard...</p>
        </section>
      </main>
    </div>
  );
}

function RecoveryPanel({
  retry,
  loadDefaultDashboard,
  exportRawLocalData,
  clearLocalData
}: {
  retry: () => void;
  loadDefaultDashboard: () => void;
  exportRawLocalData: () => void;
  clearLocalData: () => void;
}) {
  return (
    <div className="min-h-screen overflow-hidden bg-[#07111F] text-slate-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(111,214,209,0.15),transparent_30%),radial-gradient(circle_at_84%_14%,rgba(139,123,198,0.12),transparent_28%),linear-gradient(135deg,#07111F_0%,#0B1730_48%,#050B16_100%)]" />
      <main className="relative flex min-h-screen items-center justify-center px-5 py-8">
        <section className="w-full max-w-lg rounded-[1.75rem] border border-cyan-200/15 bg-white/[0.06] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f0d77a] to-[#e8c86a] text-slate-950 shadow-[0_0_32px_rgba(232,200,106,0.18)]">
            <Sun size={30} />
          </div>
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.22em] text-amber-200">Recovery Mode</p>
          <h1 className="mt-2 text-3xl font-black leading-tight text-white">Something went wrong loading your dashboard.</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">Your local app data may be missing or corrupted.</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button type="button" onClick={retry} className="secondary-button">Retry Loading</button>
            <button type="button" onClick={loadDefaultDashboard} className="primary-button">Load Default Dashboard</button>
            <button type="button" onClick={exportRawLocalData} className="secondary-button">Export Raw Local Data</button>
            <button type="button" onClick={clearLocalData} className="danger-button">Clear Local Data</button>
          </div>
        </section>
      </main>
    </div>
  );
}

class RecoveryErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn("KPM Sunny UI crashed. Recovery screen is shown.", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <RecoveryPanel
          retry={() => window.location.reload()}
          loadDefaultDashboard={() => {
            seedDefaultDashboard();
            window.location.reload();
          }}
          exportRawLocalData={exportRawLocalData}
          clearLocalData={() => {
            if (!window.confirm("This deletes all KPM Sunny data on this device.")) return;
            clearKpmLocalData();
            seedDefaultDashboard();
            window.location.reload();
          }}
        />
      );
    }

    return this.props.children;
  }
}

function OfflineBanner() {
  return (
    <div className="fixed inset-x-3 top-[calc(0.75rem+env(safe-area-inset-top))] z-40 mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-amber-300/30 bg-[#111827]/95 px-4 py-3 text-sm font-bold text-amber-100 shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl">
      <WifiOff size={18} />
      Offline mode is on. Saved missions still work on this device.
    </div>
  );
}

function Sidebar({
  activeSection,
  setActiveSection
}: {
  activeSection: SectionId;
  setActiveSection: Dispatch<SetStateAction<SectionId>>;
}) {
  return (
    <aside className="sticky top-0 hidden h-screen w-[188px] min-w-0 border-r border-cyan-200/10 bg-[#060A14]/80 p-3 backdrop-blur-xl lg:block">
      <div className="flex h-full flex-col">
        <div className="rounded-xl border border-cyan-200/14 bg-[#111827]/88 p-3 shadow-[0_0_24px_rgba(89,195,255,0.07)]">
          <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#E7D79B] to-[#D8C27A] text-slate-950">
            <Sun size={20} />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-200">Daily OS</p>
          <h1 className="mt-1 break-words text-base font-black leading-tight">KPM Sunny</h1>
        </div>

        <nav className="mt-5 grid gap-1.5">
          {navItems.map((item) => (
            <NavButton
              key={item.id}
              item={item}
              active={activeSection === item.id}
              onClick={() => setActiveSection(item.id)}
            />
          ))}
        </nav>

        <div className="mt-auto rounded-xl border border-cyan-200/10 bg-[#111827]/70 p-3">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-100">Discipline</p>
          <p className="mt-1 text-xs leading-5 text-slate-400">One mission, then next.</p>
        </div>
      </div>
    </aside>
  );
}

function NavButton({ item, active, onClick }: { item: NavItem; active: boolean; onClick: () => void }) {
  const Icon = item.icon;
  return (
    <button
      onClick={onClick}
      className={`flex min-h-10 items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm font-bold transition ${
        active
          ? "border border-cyan-200/24 bg-[#172033] text-[#F3F4F7] shadow-[0_12px_28px_rgba(89,195,255,0.14)]"
          : "bg-white/[0.04] text-slate-300 hover:bg-[#1B2438] hover:text-white"
      }`}
    >
      <Icon size={19} />
      {item.label}
    </button>
  );
}

function BottomNav({
  activeSection,
  setActiveSection
}: {
  activeSection: SectionId;
  setActiveSection: Dispatch<SetStateAction<SectionId>>;
}) {
  return (
    <nav className="sunny-bottom-nav fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-[#070b14]/95 px-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 shadow-[0_-18px_50px_rgba(0,0,0,0.28)] backdrop-blur-xl lg:hidden">
      <div className="grid grid-cols-4 gap-1">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const active = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`sunny-bottom-nav-button flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl text-[11px] font-bold ${
                active ? "bg-[#13213A] text-[#F5F3EE] shadow-[0_0_18px_rgba(111,214,209,0.16)]" : "text-slate-400"
              }`}
            >
              <Icon size={19} />
              {item.mobile}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function CommandHeader({
  stats,
  dayLevel,
  activeSection,
  todayKey,
  todayMode,
  dayMeta
}: {
  stats: Stats;
  dayLevel: string;
  activeSection: SectionId;
  todayKey: string;
  todayMode: DailyMode;
  dayMeta: DayMeta;
}) {
  const pageTitle = navItems.find((item) => item.id === activeSection)?.label || "Dashboard";
  const isToday = activeSection === "Dashboard";
  return (
    <header className="sunny-command-header min-w-0 rounded-xl border border-cyan-200/10 bg-[#111827]/80 p-3 shadow-[0_16px_46px_rgba(0,0,0,0.24)] backdrop-blur-xl sm:p-4">
      <div className="flex min-w-0 flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <ArtImage
            src={artPaths.sunnyMascot}
            alt="Sunny mascot"
            className="hidden h-11 w-11 shrink-0 rounded-lg object-cover ring-1 ring-cyan-200/35 shadow-[0_0_24px_rgba(89,195,255,0.15)] sm:block"
            fallback={<span className="sunny-face hidden shrink-0 sm:inline-flex" aria-hidden="true">☀</span>}
          />
          <div className="min-w-0">
          <div className="sunny-date-row flex flex-wrap items-center gap-2 text-xs font-bold text-amber-200 sm:text-sm">
            <ArtImage
              src={artPaths.sunnyMascot}
              alt="Sunny mascot"
              className="h-9 w-9 shrink-0 rounded-lg object-cover ring-1 ring-cyan-200/35 shadow-[0_0_22px_rgba(89,195,255,0.14)] sm:hidden"
              fallback={<span className="sunny-face shrink-0 sm:hidden" aria-hidden="true">☀</span>}
            />
            <CalendarDays size={15} />
            {formatLongDate(parseDateKey(todayKey))}
          </div>
          <h2 className="sunny-page-title mt-1 break-words text-xl font-black tracking-tight text-white sm:text-2xl xl:text-3xl">{isToday ? "Mission Directive" : pageTitle}</h2>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {isToday ? <Badge tone="dark">{todayMode} Mode</Badge> : null}
            {isToday ? <Badge tone="dark">{dayMeta.dayType}</Badge> : null}
            {isToday && dayMeta.dayLengthType ? <Badge tone="dark">{dayMeta.dayLengthType}</Badge> : null}
            {isToday && dayMeta.wakeTime ? <Badge tone="dark">Wake {dayMeta.wakeTime}</Badge> : null}
            {isToday && dayMeta.targetSleepTime ? <Badge tone="dark">Sleep {dayMeta.targetSleepTime}</Badge> : null}
            {isToday && dayMeta.dayLengthLabel ? <Badge tone="dark">{dayMeta.dayLengthLabel}</Badge> : null}
          </div>
          </div>
        </div>
        <div className="grid min-w-0 grid-cols-2 gap-2 sm:grid-cols-[auto_minmax(0,1fr)_minmax(0,1fr)] xl:w-auto xl:max-w-[320px]">
          <ArtImage
            src={artPaths.avatar}
            alt="User avatar"
            className="hidden h-12 w-12 rounded-lg border border-cyan-200/20 object-cover shadow-[0_0_22px_rgba(89,195,255,0.12)] sm:block"
            fallback={<div className="hidden h-12 w-12 items-center justify-center rounded-lg border border-cyan-200/20 bg-black/30 text-lg font-black text-cyan-100 sm:flex">K</div>}
          />
          <HeaderPill label="Day Level" value={dayLevel} icon={Sparkles} />
          <HeaderPill label="KPM Score" value={stats.points} icon={Trophy} />
        </div>
      </div>
    </header>
  );
}

function HeaderPill({ label, value, icon: Icon }: { label: string; value: string | number; icon: LucideIcon }) {
  return (
    <div className="min-w-0 rounded-lg border border-cyan-200/14 bg-[#172033]/76 p-2.5">
      <div className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-cyan-100">
        <Icon size={13} />
        {label}
      </div>
      <p className="break-words text-base font-black text-white xl:text-lg">{value}</p>
    </div>
  );
}

function MobilePriorityPanel({ stats, dayLevel, mainMission, nextTask }: { stats: Stats; dayLevel: string; mainMission?: Task; nextTask?: Task }) {
  return (
    <section className="mt-4 grid gap-3 lg:hidden">
      <div className="grid grid-cols-2 gap-3">
        <MiniMetric label="KPM Score" value={stats.points} />
        <MiniMetric label="Day Level" value={dayLevel} />
      </div>
      <MissionPreview label="Main Mission" task={mainMission} />
      <MissionPreview label="Next Mission" task={nextTask} />
    </section>
  );
}

function ModeSelector({ value, onChange }: { value: DailyMode; onChange: (mode: DailyMode) => void }) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {dailyModes.map((mode) => {
        const selected = value === mode;
        const profile = modeProfiles[mode];
        return (
          <button
            key={mode}
            type="button"
            onClick={() => onChange(mode)}
            className={`rounded-2xl border p-4 text-left transition ${
              selected
                ? "border-amber-300/70 bg-amber-300/[0.14] shadow-[0_0_34px_rgba(245,158,11,0.14)]"
                : "border-white/10 bg-white/[0.04] hover:border-amber-300/30 hover:bg-white/[0.07]"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-lg font-black text-white">{mode} Mode</p>
                <p className="mt-1 text-sm leading-6 text-slate-400">{profile.description}</p>
              </div>
              {selected ? <Badge tone="gold">Active</Badge> : null}
            </div>
            <div className="mt-4 grid gap-2">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-amber-200">Best for</p>
              <p className="text-sm font-semibold text-slate-300">{profile.bestFor}</p>
              <Badge tone="dark">Difficulty: {profile.difficulty}</Badge>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function OnboardingScreen({ completeOnboarding }: { completeOnboarding: (settings: Required<Pick<SettingsState, "scheduleVersion" | "defaultDailyMode" | "mainLifeFocus">>) => void }) {
  const [scheduleVersion, setScheduleVersion] = useState<"5:30" | "5:00">("5:30");
  const [defaultDailyMode, setDefaultDailyMode] = useState<DailyMode>("Full Day");
  const [mainLifeFocus, setMainLifeFocus] = useState<MainLifeFocus>("Stability");

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#07111F] px-4 py-6 text-slate-100 sm:px-6">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(111,214,209,0.15),transparent_30%),radial-gradient(circle_at_84%_14%,rgba(139,123,198,0.12),transparent_28%),linear-gradient(135deg,#07111F_0%,#0B1730_48%,#050B16_100%)]" />
      <main className="relative mx-auto grid min-h-[calc(100vh-3rem)] max-w-5xl place-items-center">
        <Panel>
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f0d77a] to-[#e8c86a] text-slate-950 shadow-[0_0_32px_rgba(232,200,106,0.18)]">
                <Sun size={30} />
              </div>
              <p className="mt-6 text-sm font-bold uppercase tracking-[0.22em] text-amber-200">Welcome</p>
              <h1 className="mt-2 text-4xl font-black text-white sm:text-5xl">Welcome to KPM Sunny Daily OS</h1>
              <p className="mt-4 text-base leading-7 text-slate-300">Your personal daily mission board for body, mind, money, skill, and life control.</p>
            </div>

            <div className="grid gap-5">
              <div>
                <h2 className="text-lg font-black text-white">Default start time</h2>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {(["5:30", "5:00"] as const).map((option) => (
                    <ChoiceCard key={option} active={scheduleVersion === option} title={`${option} AM`} body={option === "5:30" ? "Normal Sunny schedule." : "Move missions 30 minutes earlier."} onClick={() => setScheduleVersion(option)} />
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-lg font-black text-white">Default daily mode</h2>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {dailyModes.map((mode) => (
                    <ChoiceCard key={mode} active={defaultDailyMode === mode} title={`${mode} Mode`} body={modeProfiles[mode].bestFor} onClick={() => setDefaultDailyMode(mode)} />
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-lg font-black text-white">Main life focus</h2>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {mainLifeFocusOptions.map((focus) => (
                    <ChoiceCard key={focus} active={mainLifeFocus === focus} title={focus} body={focus === "Stability" ? "Build a clean baseline first." : `Keep ${focus.toLowerCase()} visible this week.`} onClick={() => setMainLifeFocus(focus)} />
                  ))}
                </div>
              </div>

              <button onClick={() => completeOnboarding({ scheduleVersion, defaultDailyMode, mainLifeFocus })} className="primary-button min-h-14 justify-center text-base">
                <Sparkles size={20} />
                Start 7-Day Test
              </button>
            </div>
          </div>
        </Panel>
      </main>
    </div>
  );
}

function ChoiceCard({ active, title, body, onClick }: { active: boolean; title: string; body: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border p-4 text-left transition ${
        active ? "border-amber-300/70 bg-amber-300/[0.14] shadow-[0_0_34px_rgba(245,158,11,0.14)]" : "border-white/10 bg-white/[0.04] hover:border-amber-300/30 hover:bg-white/[0.07]"
      }`}
    >
      <p className="font-black text-white">{title}</p>
      <p className="mt-1 text-sm leading-6 text-slate-400">{body}</p>
    </button>
  );
}

function ArtImage({ src, alt, className, fallback }: { src: string; alt: string; className?: string; fallback?: ReactNode }) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");

  if (status === "error") return fallback ? <>{fallback}</> : null;

  return (
    <>
      {status !== "loaded" && fallback ? fallback : null}
      <img
        src={src}
        alt={alt}
        className={className}
        loading="lazy"
        decoding="async"
        style={{ opacity: status === "loaded" ? undefined : 0 }}
        onLoad={() => setStatus("loaded")}
        onError={() => setStatus("error")}
      />
    </>
  );
}

function MissionArtPanel({
  imageSrc,
  title,
  eyebrow,
  children,
  className = "",
  minHeight = "min-h-[11rem]"
}: {
  imageSrc: string;
  title?: string;
  eyebrow?: string;
  children?: ReactNode;
  className?: string;
  minHeight?: string;
}) {
  return (
    <div className={`manhwa-art-panel relative isolate w-full max-w-full overflow-hidden rounded-[1.35rem] border border-amber-300/30 bg-[#06101f] ${minHeight} ${className}`}>
      <ArtImage src={imageSrc} alt={title ?? "KPM Sunny artwork"} className="mission-art-image absolute inset-0 h-full w-full object-cover opacity-85" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,6,14,0.97),rgba(2,6,14,0.72)_46%,rgba(2,6,14,0.30)),linear-gradient(0deg,rgba(2,6,14,0.88),transparent_58%),radial-gradient(circle_at_12%_18%,rgba(251,191,36,0.34),transparent_32%),radial-gradient(circle_at_90%_80%,rgba(45,212,191,0.22),transparent_34%)]" />
      <div className="absolute inset-0 opacity-70 [background-image:linear-gradient(135deg,rgba(255,255,255,0.06)_0_1px,transparent_1px_18px)]" />
      <div className="mission-art-content relative z-10 flex h-full min-h-full flex-col justify-end p-4 sm:p-5">
        {eyebrow ? <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-200">{eyebrow}</p> : null}
        {title ? <h3 className="mt-1 font-serif text-2xl font-black leading-tight text-amber-100 sm:text-3xl">{title}</h3> : null}
        {children ? <div className="mt-3">{children}</div> : null}
      </div>
    </div>
  );
}

function BuildToday({
  draft,
  setDraft,
  preview,
  createPreview,
  applyPreview,
  editPreview,
  cancelFlow
}: {
  draft: BuildTodayDraft;
  setDraft: Dispatch<SetStateAction<BuildTodayDraft>>;
  preview: BuildTodayPreview | null;
  createPreview: (draft: BuildTodayDraft) => void;
  applyPreview: () => void;
  editPreview: () => void;
  cancelFlow: () => void;
}) {
  const [flow, setFlow] = useState<"None" | "Normal" | "Special">("None");
  const fieldClass = "min-h-12 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-semibold text-slate-100 outline-none focus:border-amber-300/60";
  const activeFlow = flow === "None" ? null : flow;

  function updateDraft(patch: Partial<BuildTodayDraft>) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  return (
    <section className="grid gap-4">
      <Panel className="border-amber-300/25 bg-[linear-gradient(135deg,rgba(251,191,36,0.10),rgba(255,255,255,0.04))]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-amber-200">Build Today</p>
            <h2 className="mt-2 break-words text-3xl font-black leading-tight text-white sm:text-4xl">How should we build today?</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Choose the day shape first, preview the plan, then generate only when it feels right.</p>
          </div>
          <Badge tone="dark">Preview before overwrite</Badge>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <button
            type="button"
            onClick={() => {
              setFlow("Normal");
              updateDraft({ dayType: "Normal Day" });
            }}
            className={`rounded-[1.35rem] border p-4 text-left transition ${activeFlow === "Normal" ? "border-amber-300/70 bg-amber-300/[0.14]" : "border-white/10 bg-white/[0.04] hover:border-amber-300/30"}`}
          >
            <p className="text-xl font-black text-white">Normal Day</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">I woke up normally or just need to shift today&apos;s schedule.</p>
          </button>
          <button
            type="button"
            onClick={() => {
              setFlow("Special");
              updateDraft({ dayType: draft.dayType === "Normal Day" ? "Late Wake Day" : draft.dayType });
            }}
            className={`rounded-[1.35rem] border p-4 text-left transition ${activeFlow === "Special" ? "border-teal-300/60 bg-teal-300/[0.10]" : "border-white/10 bg-white/[0.04] hover:border-teal-300/30"}`}
          >
            <p className="text-xl font-black text-white">Special Day</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">Late wake, night shift, recovery, appointment, or custom day.</p>
          </button>
        </div>

        {activeFlow ? (
        <div className="mt-5 grid gap-4 rounded-[1.35rem] border border-white/10 bg-black/20 p-4">
          {activeFlow === "Normal" ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <label className="grid gap-2 text-sm font-bold text-slate-300">
                What time did you wake up / start today?
                <input type="time" value={timeToInputValue(draft.wakeTime)} onChange={(event) => updateDraft({ wakeTime: inputValueToTime(event.target.value), startTime: inputValueToTime(event.target.value), dayType: "Normal Day" })} className={fieldClass} />
              </label>
              <BuildTimeField label="What time do you want to sleep today?" value={draft.sleepTime} onChange={(sleepTime) => updateDraft({ sleepTime })} className={fieldClass} />
              <label className="grid gap-2 text-sm font-bold text-slate-300">
                Energy level
                <select value={draft.energy} onChange={(event) => updateDraft({ energy: event.target.value as BuildEnergy })} className={fieldClass}>
                  {(["Low", "Medium", "High"] as const).map((energy) => <option key={energy}>{energy}</option>)}
                </select>
              </label>
              <label className="grid gap-2 text-sm font-bold text-slate-300">
                Today mode
                <select value={draft.todayMode} onChange={(event) => updateDraft({ todayMode: event.target.value as DailyMode })} className={fieldClass}>
                  {dailyModes.map((mode) => <option key={mode}>{mode}</option>)}
                </select>
              </label>
            </div>
          ) : (
            <div className="grid gap-4">
              <label className="grid gap-2 text-sm font-bold text-slate-300">
                Special day type
                <select value={draft.dayType} onChange={(event) => updateDraft({ dayType: event.target.value as BuildDayType })} className={fieldClass}>
                  {(["Late Wake Day", "Night Shift Day", "Recovery Day", "Appointment / Busy Day", "Custom Day"] as BuildDayType[]).map((type) => <option key={type}>{type}</option>)}
                </select>
              </label>

              {draft.dayType !== "Custom Day" ? (
                <BuildTimeField label="What time do you want to sleep today?" value={draft.sleepTime} onChange={(sleepTime) => updateDraft({ sleepTime })} className={fieldClass} />
              ) : null}

              {draft.dayType === "Late Wake Day" ? (
                <div className="grid gap-4 md:grid-cols-3">
                  <BuildTimeField label="What time did you wake up?" value={draft.wakeTime} onChange={(wakeTime) => updateDraft({ wakeTime, startTime: wakeTime })} className={fieldClass} />
                  <BuildTextField label="What is the one thing that matters today?" value={draft.mainMission} onChange={(mainMission) => updateDraft({ mainMission })} className={fieldClass} />
                  <BuildEnergyField value={draft.energy} onChange={(energy) => updateDraft({ energy })} className={fieldClass} />
                </div>
              ) : null}

              {draft.dayType === "Night Shift Day" ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <BuildTimeField label="What time does your active day start?" value={draft.startTime} onChange={(startTime) => updateDraft({ startTime, wakeTime: startTime })} className={fieldClass} />
                  <BuildTimeField label="What time does your shift start?" value={draft.shiftStart} onChange={(shiftStart) => updateDraft({ shiftStart })} className={fieldClass} />
                  <BuildTimeField label="What time does your shift end?" value={draft.shiftEnd} onChange={(shiftEnd) => updateDraft({ shiftEnd })} className={fieldClass} />
                  <BuildTextField label="What is your main mission before shift?" value={draft.mainMission} onChange={(mainMission) => updateDraft({ mainMission })} className={fieldClass} />
                </div>
              ) : null}

              {draft.dayType === "Recovery Day" ? (
                <div className="grid gap-4 md:grid-cols-3">
                  <BuildTimeField label="What time did you wake up?" value={draft.wakeTime} onChange={(wakeTime) => updateDraft({ wakeTime, startTime: wakeTime })} className={fieldClass} />
                  <label className="grid gap-2 text-sm font-bold text-slate-300">
                    Energy
                    <select value={draft.energy} onChange={(event) => updateDraft({ energy: event.target.value as BuildEnergy })} className={fieldClass}>
                      {(["Low", "Very Low"] as const).map((energy) => <option key={energy}>{energy}</option>)}
                    </select>
                  </label>
                  <label className="grid gap-2 text-sm font-bold text-slate-300">
                    One small main mission?
                    <select value={draft.wantsSmallMainMission ? "Yes" : "No"} onChange={(event) => updateDraft({ wantsSmallMainMission: event.target.value === "Yes" })} className={fieldClass}>
                      <option>Yes</option>
                      <option>No</option>
                    </select>
                  </label>
                </div>
              ) : null}

              {draft.dayType === "Appointment / Busy Day" ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <BuildTimeField label="What time did you wake up?" value={draft.wakeTime} onChange={(wakeTime) => updateDraft({ wakeTime, startTime: wakeTime })} className={fieldClass} />
                  <BuildTextField label="What fixed event do you have?" value={draft.fixedEvent} onChange={(fixedEvent) => updateDraft({ fixedEvent })} className={fieldClass} />
                  <BuildTimeField label="What time is it?" value={draft.fixedEventTime} onChange={(fixedEventTime) => updateDraft({ fixedEventTime })} className={fieldClass} />
                  <label className="grid gap-2 text-sm font-bold text-slate-300">
                    How long does it last?
                    <select value={draft.fixedEventDuration} onChange={(event) => updateDraft({ fixedEventDuration: event.target.value })} className={fieldClass}>
                      {["30 min", "1 hour", "2 hours", "3 hours"].map((duration) => <option key={duration}>{duration}</option>)}
                    </select>
                  </label>
                </div>
              ) : null}

              {draft.dayType === "Custom Day" ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <BuildTimeField label="What time does your day start?" value={draft.startTime} onChange={(startTime) => updateDraft({ startTime, wakeTime: startTime })} className={fieldClass} />
                  <BuildTimeField label="What time do you want to sleep?" value={draft.sleepTime} onChange={(sleepTime) => updateDraft({ sleepTime })} className={fieldClass} />
                  <BuildTextField label="What is the main mission?" value={draft.mainMission} onChange={(mainMission) => updateDraft({ mainMission })} className={fieldClass} />
                  <BuildEnergyField value={draft.energy} onChange={(energy) => updateDraft({ energy })} className={fieldClass} />
                </div>
              ) : null}
            </div>
          )}

          <button type="button" onClick={() => createPreview({ ...draft, dayType: activeFlow === "Normal" ? "Normal Day" : draft.dayType })} className="primary-button justify-center">
            Build Today Preview
            <ChevronRight size={18} />
          </button>
        </div>
        ) : null}
      </Panel>

      {preview ? (
        <Panel className="border-teal-300/25 bg-teal-300/[0.06]">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-teal-200">Today Plan Preview</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge tone="gold">{preview.dayType}</Badge>
            <Badge tone="gold">{preview.dayLengthType}</Badge>
            <Badge tone="dark">Start: {preview.startTime}</Badge>
            <Badge tone="dark">Wake: {preview.wakeTime}</Badge>
            <Badge tone="dark">Sleep: {preview.targetSleepTime}</Badge>
            <Badge tone="dark">Day length: {preview.dayLengthLabel}</Badge>
            <Badge tone="dark">Shutdown: {preview.nightShutdownTime}</Badge>
            <Badge tone="dark">{preview.todayMode} Mode</Badge>
          </div>
          <h3 className="mt-4 break-words text-2xl font-black text-white">{preview.mainMission || "Today is built around steady control."}</h3>
          <div className="mt-4 grid gap-2">
            {preview.tasks.slice(0, 5).map((task) => (
              <div key={task.id} className="flex min-w-0 flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-black/20 p-3">
                <span className="text-sm font-black text-amber-200">{task.time}</span>
                <span className="min-w-0 flex-1 break-words text-sm font-bold text-white">{task.title}</span>
                <Badge tone={task.category}>{task.category}</Badge>
              </div>
            ))}
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <button type="button" onClick={applyPreview} className="primary-button justify-center">Generate Today</button>
            <button type="button" onClick={editPreview} className="secondary-button justify-center">Edit</button>
            <button type="button" onClick={cancelFlow} className="secondary-button justify-center">Cancel</button>
          </div>
        </Panel>
      ) : null}
    </section>
  );
}

function BuildTimeField({ label, value, onChange, className }: { label: string; value: string; onChange: (value: string) => void; className: string }) {
  return (
    <label className="grid gap-2 text-sm font-bold text-slate-300">
      {label}
      <input type="time" value={timeToInputValue(value)} onChange={(event) => onChange(inputValueToTime(event.target.value))} className={className} />
    </label>
  );
}

function BuildTextField({ label, value, onChange, className }: { label: string; value: string; onChange: (value: string) => void; className: string }) {
  return (
    <label className="grid gap-2 text-sm font-bold text-slate-300">
      {label}
      <input value={value} onChange={(event) => onChange(event.target.value)} className={className} placeholder="Main mission" />
    </label>
  );
}

function BuildEnergyField({ value, onChange, className }: { value: BuildEnergy; onChange: (value: BuildEnergy) => void; className: string }) {
  return (
    <label className="grid gap-2 text-sm font-bold text-slate-300">
      How much energy do you have?
      <select value={value} onChange={(event) => onChange(event.target.value as BuildEnergy)} className={className}>
        {(["Low", "Medium", "High"] as const).map((energy) => <option key={energy}>{energy}</option>)}
      </select>
    </label>
  );
}

function TodayCommand({
  stats,
  currentMission,
  mainMission,
  dayMeta,
  tasks,
  updateTask,
  snoozeTask,
  startMission,
  rebuildToday,
  setActiveSection,
  focusItems,
  activePlans,
  updateActivePlan,
  foodLogs,
  todayKey,
  moneySpendingLogs,
  moneyIncomeLogs,
  moneySavingLogs,
  moneyOpportunityLogs,
  todayEventMode,
  restoreNormalToday
}: {
  stats: Stats;
  currentMission?: Task;
  mainMission?: Task;
  dayMeta: DayMeta;
  tasks: Task[];
  updateTask: (id: string, patch: Partial<Task>) => void;
  snoozeTask: (id: string) => void;
  startMission: (id: string) => void;
  rebuildToday: () => void;
  setActiveSection: Dispatch<SetStateAction<SectionId>>;
  focusItems: TodayFocusItem[];
  activePlans: ActivePlan[];
  updateActivePlan: (planId: string, updater: SetStateAction<ActivePlan | null>) => void;
  foodLogs: DailyFoodLogs;
  todayKey: string;
  moneySpendingLogs: MoneySpendingLog[];
  moneyIncomeLogs: MoneyIncomeLog[];
  moneySavingLogs: MoneySavingLog[];
  moneyOpportunityLogs: MoneyOpportunityLog[];
  todayEventMode: TodayEventMode | null;
  restoreNormalToday: () => void;
}) {
  const nextMissions = tasks
    .filter((task) => !task.completed && !task.skipped && task.id !== currentMission?.id)
    .sort((a, b) => relativeTaskMinutes(a.time, dayMeta.startTime ?? "5:30 AM") - relativeTaskMinutes(b.time, dayMeta.startTime ?? "5:30 AM"))
    .slice(0, 3);

  const mainMissionStatus = getMainMissionStatus(mainMission);

  return (
    <section className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.75fr)] xl:items-start">
      <div className="grid min-w-0 gap-4">
      {todayEventMode ? (
        <Panel compact>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-100">Today Event Mode</p>
              <h3 className="mt-1 break-words text-lg font-black text-white">{todayEventMode.eventName}</h3>
              <p className="mt-1 text-sm text-slate-400">Normal Today is backed up. Restore it when the event is finished.</p>
            </div>
            <button type="button" onClick={restoreNormalToday} className="secondary-button justify-center">Restore Normal Today</button>
          </div>
        </Panel>
      ) : null}
      <Panel compact className="mission-directive-panel">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-100">Mission Directive</p>
            </div>
            {currentMission ? (
              <>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge tone="gold">{currentMission.time}</Badge>
                  <Badge tone={currentMission.category}>{currentMission.category}</Badge>
                  <Badge tone={currentMission.priority === "S" ? "gold" : "dark"}>{currentMission.priority}-Tier</Badge>
                  <Badge tone="dark">{currentMission.points} KPM</Badge>
                </div>
                <h2 className="mt-3 break-words text-2xl font-black leading-tight text-white sm:text-3xl xl:text-4xl">{currentMission.title}</h2>
                <p className="mt-2 line-clamp-2 max-w-2xl text-sm leading-6 text-slate-300">{getMissionReason(currentMission)}</p>
                <details className="mt-2 text-xs font-bold text-slate-400">
                  <summary className="cursor-pointer text-amber-100">Details</summary>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge tone="dark">{getTaskSourceLabel(currentMission)}</Badge>
                    <Badge tone="dark">{dayMeta.dayType}</Badge>
                    {dayMeta.startTime ? <Badge tone="dark">Start {dayMeta.startTime}</Badge> : null}
                    {dayMeta.wakeTime ? <Badge tone="dark">Wake {dayMeta.wakeTime}</Badge> : null}
                    {dayMeta.targetSleepTime ? <Badge tone="dark">Sleep {dayMeta.targetSleepTime}</Badge> : null}
                    {dayMeta.dayLengthLabel ? <Badge tone="dark">{dayMeta.dayLengthLabel}</Badge> : null}
                  </div>
                </details>
              </>
            ) : (
              <>
                <h2 className="mt-3 text-2xl font-black leading-tight text-white sm:text-3xl">All missions cleared.</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">Go to Evening Review and close the day cleanly.</p>
              </>
            )}
          </div>

          {currentMission ? (
            <div className="grid min-w-0 gap-2 sm:grid-cols-2 lg:w-[260px] lg:grid-cols-2">
              <button type="button" onClick={() => startMission(currentMission.id)} className="primary-button text-sm sm:col-span-2">
                <Target size={18} />
                Start Mission
              </button>
              <button type="button" onClick={() => updateTask(currentMission.id, { completed: true, skipped: false })} className="primary-button text-sm">
                <CheckCircle2 size={18} />
                Done
              </button>
              <button type="button" onClick={() => updateTask(currentMission.id, { skipped: true, completed: false })} className="secondary-button border-orange-300/25 text-sm text-orange-100">
                <X size={18} />
                Skip
              </button>
              <button type="button" onClick={() => snoozeTask(currentMission.id)} className="secondary-button text-sm">
                <Clock3 size={18} />
                Snooze
              </button>
              <button type="button" onClick={rebuildToday} className="secondary-button text-sm">
                <RotateCcw size={18} />
                Rebuild
              </button>
            </div>
          ) : (
            <div className="grid min-w-0 gap-2 sm:grid-cols-2 lg:w-[260px]">
              <button type="button" onClick={() => setActiveSection("Progress")} className="primary-button">
                Evening Review
                <ChevronRight size={18} />
              </button>
              <button type="button" onClick={rebuildToday} className="secondary-button">
                <RotateCcw size={18} />
                Rebuild Today
              </button>
            </div>
          )}
        </div>
      </Panel>

        <Panel compact>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-100">Primary Objective</p>
              <h3 className="mt-1 break-words text-xl font-black leading-tight text-white sm:text-2xl">{mainMission?.title ?? "No main mission set"}</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge tone={mainMissionStatus === "Done" ? "green" : "gold"}>{mainMissionStatus}</Badge>
                {mainMission ? <Badge tone="dark">{mainMission.time}</Badge> : null}
                {mainMission ? <Badge tone={mainMission.category}>{mainMission.category}</Badge> : null}
              </div>
            </div>
            {mainMission ? (
              <button type="button" onClick={() => updateTask(mainMission.id, { completed: true, skipped: false })} className="primary-button text-sm sm:min-w-44">
                <Check size={18} />
                Mark done
              </button>
            ) : null}
          </div>
        </Panel>

      {focusItems.length > 0 ? <TodayFocusCard focusItems={focusItems} /> : null}

      <Panel compact>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-amber-200">Next 3 Missions</p>
            <h3 className="mt-1 text-xl font-black text-white">Keep the next step visible</h3>
          </div>
          <Badge tone="dark">{nextMissions.length} upcoming</Badge>
        </div>
        <div className="mt-4 grid gap-3">
          {nextMissions.length > 0 ? (
            nextMissions.map((task) => (
              <div key={task.id} className="flex min-w-0 flex-col gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-black text-amber-100">{task.time}</p>
                  <p className="mt-1 break-words text-lg font-black leading-snug text-white">{task.title}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge tone={task.category}>{task.category}</Badge>
                    <Badge tone={task.priority === "S" ? "gold" : "dark"}>{task.priority}-Tier</Badge>
                    <Badge tone="dark">{task.points} KPM</Badge>
                    <Badge tone="dark">{getTaskSourceLabel(task)}</Badge>
                  </div>
                </div>
                <button type="button" onClick={() => updateTask(task.id, { completed: true, skipped: false })} className="secondary-button sm:min-w-28">
                  Done
                </button>
              </div>
            ))
          ) : (
            <p className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm font-semibold text-slate-300">No more upcoming missions. Evening Review is ready when you are.</p>
          )}
        </div>
      </Panel>
      </div>

      <aside className="grid min-w-0 gap-4 xl:sticky xl:top-4">
        <TodayQuickActions rebuildToday={rebuildToday} setActiveSection={setActiveSection} />
        <Panel compact>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-100">Progress Signal</p>
          <div className="mt-3 grid grid-cols-3 gap-2 xl:grid-cols-1">
            <MiniMetric label="Done" value={stats.completed} compact />
            <MiniMetric label="Left" value={stats.remaining} compact />
            <MiniMetric label="KPM" value={stats.points} compact />
          </div>
        </Panel>
        {activePlans.length > 0 ? <ActivePlanTasksSection activePlans={activePlans} updateActivePlan={updateActivePlan} foodLogs={foodLogs} todayKey={todayKey} moneySpendingLogs={moneySpendingLogs} moneyIncomeLogs={moneyIncomeLogs} moneySavingLogs={moneySavingLogs} moneyOpportunityLogs={moneyOpportunityLogs} /> : null}
      </aside>
    </section>
  );
}

function TodayQuickActions({
  rebuildToday,
  setActiveSection
}: {
  rebuildToday: () => void;
  setActiveSection: Dispatch<SetStateAction<SectionId>>;
}) {
  return (
    <Panel compact>
      <p className="text-sm font-black uppercase tracking-[0.2em] text-amber-200">Quick Actions</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
        <button type="button" onClick={rebuildToday} className="secondary-button">
          Build / Rebuild Today
        </button>
        <button type="button" onClick={() => setActiveSection("Today Task List")} className="secondary-button">
          View Full Mission List
        </button>
        <button type="button" onClick={() => setActiveSection("Plan")} className="secondary-button">
          Plan Tomorrow
        </button>
        <button type="button" onClick={() => setActiveSection("Progress")} className="secondary-button">
          Evening Review
        </button>
      </div>
    </Panel>
  );
}

function LongStudyModePanel({
  draft,
  setDraft,
  preview,
  createPreview,
  applyPreview,
  addKeyBlocksToToday,
  useAsTodayMainEvent,
  cancel,
  events = [],
  setEvents,
  copyKeyBlocksToToday
}: {
  draft: LongStudyDraft;
  setDraft: Dispatch<SetStateAction<LongStudyDraft>>;
  preview: LongStudyPreview | null;
  createPreview: (draft: LongStudyDraft) => void;
  applyPreview: () => void;
  addKeyBlocksToToday: () => void;
  useAsTodayMainEvent: () => void;
  cancel: () => void;
  events?: LongStudySession[];
  setEvents?: Dispatch<SetStateAction<LongStudySession[]>>;
  copyKeyBlocksToToday?: (session: LongStudySession) => void;
}) {
  function updateDraft(patch: Partial<LongStudyDraft>) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  function updateHours(targetStudyHours: string) {
    const nextHours = getLongStudyHours({ ...draft, targetStudyHours });
    updateDraft({ targetStudyHours, includeShower: nextHours >= 6 ? true : draft.includeShower });
  }

  function toggleEventTask(eventId: string, taskId: string) {
    setEvents?.((current) => normalizeLongStudySessions(current).map((event) => {
      if (event.id !== eventId) return event;
      const followUpTasks = ((event as LongStudyPreview).followUpTasks ?? []).map((task) => (task.id === taskId ? { ...task, completed: !task.completed } : task));
      return {
        ...event,
        tasks: event.tasks.map((task) => (task.id === taskId ? { ...task, completed: !task.completed } : task)),
        followUpTasks
      };
    }));
  }

  return (
    <Panel>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-cyan-100">Long Study Event</p>
          <h2 className="mt-2 text-2xl font-black text-white">Long Study Event Planner</h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-400">Create a separate study event schedule. It will not change Today unless you manually copy key blocks.</p>
        </div>
        <button type="button" onClick={cancel} className="secondary-button min-h-10 px-4 py-2 text-sm">Close</button>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Field label="Event name"><input value={draft.eventName} onChange={(event) => updateDraft({ eventName: event.target.value })} className="form-control" placeholder="12-hour coding study day" /></Field>
        <Field label="Study subject / topic"><input value={draft.subject} onChange={(event) => updateDraft({ subject: event.target.value })} className="form-control" placeholder="Coding, English, math..." /></Field>
        <SelectField label="Target study hours" value={draft.targetStudyHours} options={longStudyHourOptions} onChange={updateHours} />
        {draft.targetStudyHours === "custom" ? <Field label="Custom hours"><input type="number" min="4" max="18" value={draft.customStudyHours} onChange={(event) => updateDraft({ customStudyHours: clampNumber(Number(event.target.value) || 4, 4, 18) })} className="form-control" /></Field> : null}
        <Field label="Event start time"><input type="time" value={timeToInputValue(draft.startTime)} onChange={(event) => updateDraft({ startTime: inputValueToTime(event.target.value) })} className="form-control" /></Field>
        <SelectField label="Energy level" value={draft.energyLevel} options={["Low", "Medium", "High"]} onChange={(energyLevel) => updateDraft({ energyLevel: energyLevel as Energy })} />
        <SelectField label="Pomodoro style" value={draft.pomodoroStyle} options={longStudyPomodoroOptions} onChange={(pomodoroStyle) => updateDraft({ pomodoroStyle: pomodoroStyle as LongStudyPomodoroStyle })} />
        <SelectField label="Schedule strictness" value={draft.strictness} options={longStudyStrictnessOptions} onChange={(strictness) => updateDraft({ strictness: strictness as LongStudyStrictness })} />
        <SelectField label="Meal plan style" value={draft.mealPlanStyle} options={longStudyMealOptions} onChange={(mealPlanStyle) => updateDraft({ mealPlanStyle: mealPlanStyle as LongStudyMealStyle })} />
        <label className="flex min-h-[3.25rem] items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-black text-white"><input type="checkbox" checked={draft.includeHygieneReset} onChange={(event) => updateDraft({ includeHygieneReset: event.target.checked })} className="h-5 w-5 accent-cyan-300" />Include hygiene reset</label>
        <label className="flex min-h-[3.25rem] items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-black text-white"><input type="checkbox" checked={draft.includeShower} onChange={(event) => updateDraft({ includeShower: event.target.checked })} className="h-5 w-5 accent-cyan-300" />Include shower / body clean</label>
        <label className="flex min-h-[3.25rem] items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-black text-white"><input type="checkbox" checked={draft.includeSleepFollowUp} onChange={(event) => updateDraft({ includeSleepFollowUp: event.target.checked })} className="h-5 w-5 accent-cyan-300" />After Study Follow-up Routine</label>
        <label className="flex min-h-[3.25rem] items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-black text-white"><input type="checkbox" checked={draft.includeNannoSleepBoost} onChange={(event) => updateDraft({ includeNannoSleepBoost: event.target.checked })} className="h-5 w-5 accent-cyan-300" />Nanno&apos;s Sleep Boost in follow-up</label>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button type="button" onClick={() => createPreview(draft)} className="primary-button justify-center">Generate Long Study Schedule</button>
      </div>

      {preview ? (
        <section className="mt-5 rounded-2xl border border-cyan-200/15 bg-cyan-300/[0.055] p-4">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MiniMetric label="Event" value={preview.eventName || preview.subject} />
            <MiniMetric label="Study target" value={`${preview.targetStudyHours}h`} />
            <MiniMetric label="Pomodoro" value={preview.pomodoroStyle} />
            <MiniMetric label="Estimated finish" value={preview.estimatedFinishTime} />
            <MiniMetric label="Event duration" value={formatDayLength(preview.totalEventDurationMinutes)} />
            <MiniMetric label="Study time" value={formatDayLength(preview.studyMinutes)} />
            <MiniMetric label="Break time" value={formatDayLength(preview.breakMinutes)} />
            <MiniMetric label="Meals / hygiene" value={formatDayLength(preview.mealHygieneMinutes)} />
          </div>
          {preview.warning ? <p className="mt-4 rounded-2xl border border-red-300/25 bg-red-500/10 p-3 text-sm font-bold text-red-100">{preview.warning}</p> : null}
          {preview.targetStudyHours >= 15 ? <p className="mt-4 rounded-2xl border border-amber-200/25 bg-amber-300/10 p-3 text-sm font-bold text-amber-100">Extreme study days are for rare use. Protect sleep, food, hygiene, and recovery.</p> : null}
          <div className="mt-4 grid gap-2">
            {preview.tasks.slice(0, 10).map((task) => (
              <div key={task.id} className="rounded-2xl border border-white/10 bg-black/20 p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="dark">{task.time}</Badge>
                  <Badge tone={task.category === "Knowledge" ? "green" : "dark"}>{task.category}</Badge>
                  <Badge tone="dark">{task.points} KPM</Badge>
                </div>
                <p className="mt-2 font-black text-white">{task.title}</p>
                <p className="mt-1 text-sm leading-6 text-slate-400">{task.notes.replace("Source: Long Study Mode. ", "")}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-amber-200">What do you want to do with this event?</p>
            <div className="mt-4 grid gap-3 lg:grid-cols-3">
              <button type="button" onClick={applyPreview} className="primary-button justify-center">Keep Separate</button>
              <button type="button" onClick={addKeyBlocksToToday} className="secondary-button justify-center">Add Key Blocks to Today</button>
              <button type="button" onClick={useAsTodayMainEvent} className="secondary-button justify-center">Use as Today&apos;s Main Event</button>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-400">Keep Separate saves this event inside Plan only. The other choices ask confirmation before touching Today.</p>
          </div>
        </section>
      ) : null}

      {events.length ? (
        <section className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-amber-200">Saved Long Study Events</p>
          <div className="mt-4 grid gap-4">
            {events.map((event) => {
              const summary = getLongStudyProgressSummary(event);
              return (
                <article key={event.id} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <h3 className="text-xl font-black text-white">{event.eventName || event.subject}</h3>
                      <p className="mt-1 text-sm leading-6 text-slate-400">{event.subject} · {event.targetStudyHours}h target · {event.startTime} to {event.estimatedFinishTime}</p>
                    </div>
                    {copyKeyBlocksToToday ? <button type="button" onClick={() => copyKeyBlocksToToday(event)} className="secondary-button min-h-10 px-4 py-2 text-sm">Copy key blocks to Today</button> : null}
                  </div>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                    <MiniMetric label="Blocks" value={`${summary.blocksCompleted}/${summary.blocksTotal}`} compact />
                    <MiniMetric label="Breaks" value={`${summary.breaksCompleted}/${summary.breaksTotal}`} compact />
                    <MiniMetric label="Meals" value={`${summary.mealsCompleted}/${summary.mealsTotal}`} compact />
                    <MiniMetric label="Hygiene" value={`${summary.hygieneCompleted}/${summary.hygieneTotal}`} compact />
                  </div>
                  <div className="mt-4 grid gap-2">
                    {event.tasks.map((task) => <LongStudyEventTaskRow key={task.id} task={task} onToggle={() => toggleEventTask(event.id, task.id)} />)}
                  </div>
                  {((event as LongStudyPreview).followUpTasks ?? []).length ? (
                    <div className="mt-5 rounded-2xl border border-cyan-200/15 bg-cyan-300/[0.055] p-4">
                      <p className="font-black text-white">After Study Follow-up Routine</p>
                      <p className="mt-1 text-sm leading-6 text-slate-400">This happens after the calculated study event. It is not part of actual study hours.</p>
                      <div className="mt-3 grid gap-2">
                        {((event as LongStudyPreview).followUpTasks ?? []).map((task) => <LongStudyEventTaskRow key={task.id} task={task} onToggle={() => toggleEventTask(event.id, task.id)} />)}
                      </div>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        </section>
      ) : null}
    </Panel>
  );
}

function LongStudyEventTaskRow({ task, onToggle }: { task: Task; onToggle: () => void }) {
  return (
    <label className="flex items-start gap-3 rounded-2xl border border-white/10 bg-black/20 p-3">
      <input type="checkbox" checked={task.completed} onChange={onToggle} className="mt-1 h-5 w-5 accent-cyan-300" />
      <span className="min-w-0">
        <span className="flex flex-wrap gap-2">
          <Badge tone="dark">{task.time}</Badge>
          <Badge tone="dark">{task.subtitle ?? "Block"}</Badge>
          <Badge tone="dark">{getLongStudyTaskType(task)}</Badge>
        </span>
        <span className="mt-2 block break-words font-black text-white">{task.title}</span>
        <span className="mt-1 block text-sm leading-6 text-slate-400">{task.notes.replace("Source: Long Study Mode. ", "")}</span>
      </span>
    </label>
  );
}

function LongStudyProgressPanel({ sessions, reviews, todayKey, saveReview }: { sessions: LongStudySession[]; reviews: LongStudyReview[]; todayKey: string; saveReview: (review: LongStudyReview) => void }) {
  const latest = sessions[0];
  const todaySession = sessions.find((session) => session.date === todayKey) ?? latest;
  const summary = getLongStudyProgressSummary(todaySession);
  const existingReview = reviews.find((review) => review.sessionId === todaySession.id);
  const [draft, setDraft] = useState<LongStudyReview>(() => existingReview ?? createDefaultLongStudyReview(todaySession, todayKey));

  useEffect(() => {
    setDraft(existingReview ?? createDefaultLongStudyReview(todaySession, todayKey));
  }, [todaySession.id, existingReview?.id, todayKey]);

  function updateDraft(patch: Partial<LongStudyReview>) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  return (
    <Panel>
      <p className="text-sm font-black uppercase tracking-[0.2em] text-cyan-100">Long Study Summary</p>
      <h3 className="mt-2 text-2xl font-black text-white">{todaySession.subject}</h3>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MiniMetric label="Study planned" value={`${Math.round(todaySession.plannedStudyMinutes / 60)}h`} />
        <MiniMetric label="Study done" value={`${summary.studyHoursCompleted.toFixed(1)}h`} />
        <MiniMetric label="Blocks done" value={`${summary.blocksCompleted}/${summary.blocksTotal}`} />
        <MiniMetric label="Breaks done" value={`${summary.breaksCompleted}/${summary.breaksTotal}`} />
        <MiniMetric label="Meals done" value={`${summary.mealsCompleted}/${summary.mealsTotal}`} />
        <MiniMetric label="Hygiene done" value={`${summary.hygieneCompleted}/${summary.hygieneTotal}`} />
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <Field label="Total study hours completed"><input type="number" min="0" step="0.25" value={draft.totalStudyHoursCompleted} onChange={(event) => updateDraft({ totalStudyHoursCompleted: Number(event.target.value) || 0 })} className="form-control" /></Field>
        <Field label="Focus 1-10"><input type="number" min="1" max="10" value={draft.focus} onChange={(event) => updateDraft({ focus: clampNumber(Number(event.target.value) || 1, 1, 10) })} className="form-control" /></Field>
        <Field label="Difficulty 1-10"><input type="number" min="1" max="10" value={draft.difficulty} onChange={(event) => updateDraft({ difficulty: clampNumber(Number(event.target.value) || 1, 1, 10) })} className="form-control" /></Field>
        <Field label="What I learned"><input value={draft.learned} onChange={(event) => updateDraft({ learned: event.target.value })} className="form-control" /></Field>
        <Field label="What I practiced"><input value={draft.practiced} onChange={(event) => updateDraft({ practiced: event.target.value })} className="form-control" /></Field>
        <Field label="What confused me"><input value={draft.confused} onChange={(event) => updateDraft({ confused: event.target.value })} className="form-control" /></Field>
        <Field label="Next study step"><input value={draft.nextStep} onChange={(event) => updateDraft({ nextStep: event.target.value })} className="form-control" /></Field>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-black text-white"><input type="checkbox" checked={draft.keptClean} onChange={(event) => updateDraft({ keptClean: event.target.checked })} className="h-5 w-5 accent-cyan-300" />Kept clean?</label>
        <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-black text-white"><input type="checkbox" checked={draft.ateEnough} onChange={(event) => updateDraft({ ateEnough: event.target.checked })} className="h-5 w-5 accent-cyan-300" />Ate enough?</label>
        <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-black text-white"><input type="checkbox" checked={draft.finishedFollowUp} onChange={(event) => updateDraft({ finishedFollowUp: event.target.checked })} className="h-5 w-5 accent-cyan-300" />Finished follow-up routine?</label>
      </div>
      <button type="button" onClick={() => saveReview(draft)} className="primary-button mt-5 justify-center">Save Long Study Review</button>
    </Panel>
  );
}

function StartMissionModal({
  task,
  updateTask,
  snoozeTask,
  close
}: {
  task: Task;
  updateTask: (id: string, patch: Partial<Task>) => void;
  snoozeTask: (id: string) => void;
  close: () => void;
}) {
  const suggestedPreset = getSuggestedFocusPreset(task);
  const [selectedPreset, setSelectedPreset] = useState<FocusPreset>(suggestedPreset);
  const [phase, setPhase] = useState<FocusPhase>("work");
  const activeMinutes = phase === "rest" ? selectedPreset.restMinutes : selectedPreset.workMinutes;
  const defaultSeconds = activeMinutes * 60;
  const [secondsLeft, setSecondsLeft] = useState(defaultSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [showStuckHelp, setShowStuckHelp] = useState(false);

  useEffect(() => {
    const nextPreset = getSuggestedFocusPreset(task);
    setSelectedPreset(nextPreset);
    setPhase("work");
    setSecondsLeft(nextPreset.workMinutes * 60);
    setIsRunning(false);
    setShowStuckHelp(false);
  }, [task.id]);

  useEffect(() => {
    if (!isRunning) return;
    const interval = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          window.clearInterval(interval);
          setIsRunning(false);
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [isRunning]);

  function markDone() {
    updateTask(task.id, { completed: true, skipped: false });
    close();
  }

  function skipMission() {
    updateTask(task.id, { skipped: true, completed: false });
    close();
  }

  function snoozeMission() {
    snoozeTask(task.id);
    close();
  }

  function choosePreset(preset: FocusPreset) {
    setSelectedPreset(preset);
    setPhase("work");
    setSecondsLeft(preset.workMinutes * 60);
    setIsRunning(false);
  }

  function startRest() {
    if (selectedPreset.restMinutes <= 0) return;
    setPhase("rest");
    setSecondsLeft(selectedPreset.restMinutes * 60);
    setIsRunning(true);
  }

  function continueSession() {
    setPhase("work");
    setSecondsLeft(selectedPreset.workMinutes * 60);
    setIsRunning(true);
  }

  function resetTimer() {
    setSecondsLeft(defaultSeconds);
    setIsRunning(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-[calc(1rem+env(safe-area-inset-top))] backdrop-blur-sm sm:items-center sm:p-5">
      <section className="max-h-[calc(100dvh-2rem)] w-full max-w-2xl overflow-y-auto rounded-[1.5rem] border border-amber-300/25 bg-[#07101f] p-4 shadow-[0_28px_100px_rgba(0,0,0,0.55)] sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-amber-200">Focus Mode</p>
            <h2 className="mt-2 break-words text-2xl font-black leading-tight text-white sm:text-4xl">{task.title}</h2>
          </div>
          <button type="button" onClick={close} className="secondary-button min-h-11 shrink-0 rounded-full px-3" aria-label="Close focus mode">
            <X size={18} />
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Badge tone="gold">{task.time}</Badge>
          <Badge tone={task.category}>{task.category}</Badge>
          <Badge tone={task.priority === "S" ? "gold" : "dark"}>{task.priority}-Tier</Badge>
          <Badge tone="dark">{task.points} KPM</Badge>
        </div>

        <p className="mt-4 text-sm leading-6 text-slate-300">{getMissionReason(task)}</p>

        <div className="mt-5 rounded-2xl border border-teal-300/20 bg-teal-300/10 p-4">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-teal-100">Start with this small first step:</p>
          <p className="mt-2 text-lg font-black leading-snug text-white">{getFirstMissionStep(task)}</p>
        </div>

        <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-amber-200">Focus Timer</p>
              <p className="mt-1 text-sm font-bold text-slate-300">Suggested: {suggestedPreset.name} - {suggestedPreset.workMinutes} min focus{suggestedPreset.restMinutes > 0 ? ` + ${suggestedPreset.restMinutes} min rest` : ""}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge tone={phase === "rest" ? "green" : "gold"}>{phase === "rest" ? "Rest" : "Focus"}</Badge>
                <Badge tone="dark">Work: {selectedPreset.workMinutes} min</Badge>
                <Badge tone="dark">Rest: {selectedPreset.restMinutes} min</Badge>
              </div>
              <p className="mt-1 font-mono text-5xl font-black text-white">{formatTimer(secondsLeft)}</p>
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              <button type="button" onClick={() => setIsRunning((running) => !running)} className="primary-button">
                {isRunning ? "Pause" : "Start"}
              </button>
              <button type="button" onClick={resetTimer} className="secondary-button">
                Reset
              </button>
              <button type="button" onClick={() => setShowStuckHelp(true)} className="secondary-button border-amber-300/25 text-amber-100">
                I&apos;m Stuck
              </button>
            </div>
          </div>
          {secondsLeft === 0 && phase === "work" ? (
            <div className="mt-4 rounded-2xl border border-emerald-300/25 bg-emerald-400/10 p-3">
              <p className="text-sm font-black text-emerald-100">Focus session complete. Choose your next move.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" onClick={markDone} className="primary-button">Mark Done</button>
                <button type="button" onClick={continueSession} className="secondary-button">Continue another session</button>
                {selectedPreset.restMinutes > 0 ? <button type="button" onClick={startRest} className="secondary-button">Start {selectedPreset.restMinutes} min rest</button> : null}
                <button type="button" onClick={skipMission} className="secondary-button border-orange-300/25 text-orange-100">Skip</button>
              </div>
            </div>
          ) : null}
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {focusPresets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => choosePreset(preset)}
                className={`min-h-12 rounded-2xl px-4 text-left text-sm font-black ${
                  selectedPreset.id === preset.id
                    ? "bg-amber-300 text-slate-950"
                    : "border border-white/10 bg-white/[0.06] text-slate-300"
                }`}
              >
                {preset.shortLabel}
              </button>
            ))}
          </div>
        </div>

        {showStuckHelp ? (
          <div className="mt-5 rounded-2xl border border-orange-300/25 bg-orange-400/10 p-4">
            <p className="text-lg font-black text-white">Reduce the mission to 5 minutes.</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              <button type="button" onClick={() => { choosePreset(focusPresets[0]); setIsRunning(true); }} className="secondary-button">
                Do only 5 minutes
              </button>
              <button type="button" onClick={() => setShowStuckHelp(false)} className="secondary-button">
                Break into smaller task
              </button>
              <button type="button" onClick={skipMission} className="secondary-button border-orange-300/25 text-orange-100">
                Skip without guilt
              </button>
            </div>
          </div>
        ) : null}

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <button type="button" onClick={markDone} className="primary-button">
            <CheckCircle2 size={18} />
            Mark Done
          </button>
          <button type="button" onClick={skipMission} className="secondary-button border-orange-300/25 text-orange-100">
            <X size={18} />
            Skip Mission
          </button>
          <button type="button" onClick={snoozeMission} className="secondary-button">
            <Clock3 size={18} />
            Snooze 15 min
          </button>
          <button type="button" onClick={close} className="secondary-button">
            Close
          </button>
        </div>
      </section>
    </div>
  );
}

function MorePage({ setActiveSection }: { setActiveSection: Dispatch<SetStateAction<SectionId>> }) {
  const links: Array<{ id: SectionId; title: string; body: string; icon: LucideIcon }> = [
    { id: "Command Center", title: "Command Center", body: "Open the full dashboard, streaks, notes, and 7-day test view.", icon: LayoutDashboard },
    { id: "History", title: "History", body: "Review past days, scores, tasks, notes, and reflections.", icon: History },
    { id: "Analytics", title: "Analytics", body: "See score trends and category summaries.", icon: BarChart3 },
    { id: "Template Editor", title: "Default Schedule Template", body: "Edit the recurring schedule for future days.", icon: Pencil },
    { id: "Settings", title: "Settings", body: "Backup data, install the app, change modes, and manage storage.", icon: Settings }
  ];

  return (
    <section className="grid gap-4">
      <Panel>
        <p className="text-sm font-black uppercase tracking-[0.2em] text-amber-200">More</p>
        <h2 className="mt-2 text-3xl font-black text-white">Advanced tools</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">The home screen stays simple. Everything deeper is still here when you need it.</p>
      </Panel>
      <div className="grid gap-3 md:grid-cols-2">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <button
              key={link.id}
              type="button"
              onClick={() => setActiveSection(link.id)}
              className="flex min-w-0 items-start gap-4 rounded-[1.35rem] border border-white/10 bg-white/[0.06] p-4 text-left shadow-[0_18px_44px_rgba(0,0,0,0.18)] transition hover:border-amber-300/30 hover:bg-white/[0.09]"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-300/15 text-amber-100">
                <Icon size={21} />
              </span>
              <span className="min-w-0">
                <span className="block text-lg font-black text-white">{link.title}</span>
                <span className="mt-1 block text-sm leading-6 text-slate-400">{link.body}</span>
              </span>
              <ChevronRight className="ml-auto shrink-0 text-slate-500" size={18} />
            </button>
          );
        })}
      </div>
    </section>
  );
}

function Dashboard({
  stats,
  dayLevel,
  nextTask,
  mainMission,
  tasks,
  streaks,
  todayMode,
  selectedTodayMode,
  defaultTodayMode,
  setSelectedTodayMode,
  generateTodayByMode,
  startDay,
  quickStartToday,
  quickStartMessage,
  dailyNotes,
  setDailyNotes,
  updateMainMissionTitle,
  sevenDayTest,
  setActiveSection
}: {
  stats: Stats;
  dayLevel: string;
  nextTask?: Task;
  mainMission?: Task;
  tasks: Task[];
  streaks: Streaks;
  todayMode: DailyMode;
  selectedTodayMode: DailyMode;
  defaultTodayMode?: DailyMode;
  setSelectedTodayMode: Dispatch<SetStateAction<DailyMode>>;
  generateTodayByMode: (mode?: DailyMode) => boolean;
  startDay: (mode: DailyMode | undefined, mainMissionTitle: string) => void;
  quickStartToday: () => void;
  quickStartMessage: string;
  dailyNotes: string;
  setDailyNotes: Dispatch<SetStateAction<string>>;
  updateMainMissionTitle: (title: string) => void;
  sevenDayTest: SevenDayTestSummary;
  setActiveSection: Dispatch<SetStateAction<SectionId>>;
}) {
  return (
    <section className="sunny-dashboard grid gap-5">
      <DailyStartFlow
        selectedTodayMode={selectedTodayMode}
        defaultTodayMode={defaultTodayMode}
        setSelectedTodayMode={setSelectedTodayMode}
        mainMission={mainMission}
        startDay={startDay}
        updateMainMissionTitle={updateMainMissionTitle}
        openToday={() => setActiveSection("Today Task List")}
      />
      <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
        <Panel compact>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-200">Quick Start</p>
              <h3 className="mt-1 text-xl font-black text-white">Start today's system</h3>
              {quickStartMessage ? <p className="mt-2 text-sm font-bold text-emerald-100">{quickStartMessage}</p> : null}
            </div>
            <button type="button" onClick={quickStartToday} className="primary-button justify-center">
              <Sparkles size={18} />
              Quick Start Today
            </button>
          </div>
        </Panel>
        <NextMissionCard task={nextTask} />
      </div>
      <DailyNotesCard value={dailyNotes} onChange={setDailyNotes} />
      <SevenDayProgress summary={sevenDayTest} />

      <Panel>
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-200">Today&apos;s Mode</p>
            <h3 className="mt-2 text-2xl font-black text-white">{todayMode} Mode</h3>
            <p className="mt-1 text-sm leading-6 text-slate-400">{modeProfiles[todayMode].note}</p>
            {selectedTodayMode !== todayMode ? <p className="mt-2 text-sm font-bold text-amber-100">Selected to generate: {selectedTodayMode} Mode</p> : null}
          </div>
          <button onClick={() => generateTodayByMode()} className="primary-button justify-center">
            <Sparkles size={18} />
            Generate Today&apos;s Missions
          </button>
        </div>
        <ModeSelector value={selectedTodayMode} onChange={setSelectedTodayMode} />
      </Panel>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-4">
        <StatCard icon={Trophy} label="KPM Score" value={stats.points} detail={dayLevel} accent="gold" />
        <StatCard icon={CheckCircle2} label="Missions Cleared" value={stats.completed} detail={`${stats.remaining} remaining`} accent="green" />
        <StatCard icon={Clock3} label="Next Mission" value={nextTask?.time || "Clear"} detail={nextTask?.title || "No active mission"} accent="blue" />
        <StatCard icon={Flame} label="Main Mission" value={mainMission?.time || "Set one"} detail={mainMission?.title || "Plan tomorrow"} accent="gold" />
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-4">
        <StatCard icon={Flame} label="Current Streak" value={streaks.current} detail="51+ KPM days" accent="gold" />
        <StatCard icon={Trophy} label="Best Streak" value={streaks.best} detail="Best 51+ KPM run" accent="green" />
        <StatCard icon={BarChart3} label="Productive Streak" value={streaks.productive} detail="121+ KPM days" accent="blue" />
        <StatCard icon={Target} label="Main Mission Streak" value={streaks.mainMission} detail="Main mission cleared" accent="gold" />
      </div>

      <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)]">
        <Panel>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-200">Mission Board</p>
              <h3 className="mt-2 text-2xl font-black text-white">Today's operating rhythm</h3>
            </div>
            <button onClick={() => setActiveSection("Today Task List")} className="primary-button">
              Open Missions <ChevronRight size={18} />
            </button>
          </div>
          <MissionArtPanel imageSrc={artPaths.heroWorking} eyebrow="Today's Main Mission" title={mainMission?.title ?? "Choose one mission"} className="mt-5" minHeight="min-h-[13rem]">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="gold">{mainMission?.time ?? "Set time"}</Badge>
              <Badge tone={mainMission?.category ?? "gold"}>{mainMission?.category ?? "Plan"}</Badge>
              <Badge tone="dark">{stats.completed}/{tasks.length} missions clear</Badge>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/15">
              <div className="h-full rounded-full bg-gradient-to-r from-amber-300 to-teal-300" style={{ width: `${Math.round((stats.completed / Math.max(tasks.length, 1)) * 100)}%` }} />
            </div>
          </MissionArtPanel>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <MissionPreview label="Main Mission" task={mainMission} />
            <MissionPreview label="Next Mission" task={nextTask} />
          </div>
        </Panel>

        <Panel>
          <h3 className="text-xl font-black text-white">Progress Summary</h3>
          <div className="mt-5 grid gap-4">
            {categories.map((category) => {
              const categoryTasks = tasks.filter((task) => task.category === category);
              const done = categoryTasks.filter((task) => task.completed).length;
              const total = categoryTasks.length || 1;
              return (
                <ProgressLine key={category} label={category} value={done} total={categoryTasks.length} percent={Math.round((done / total) * 100)} />
              );
            })}
          </div>
        </Panel>
      </div>
    </section>
  );
}

function DailyStartFlow({
  selectedTodayMode,
  setSelectedTodayMode,
  defaultTodayMode,
  mainMission,
  startDay,
  updateMainMissionTitle,
  openToday
}: {
  selectedTodayMode: DailyMode;
  setSelectedTodayMode: Dispatch<SetStateAction<DailyMode>>;
  defaultTodayMode?: DailyMode;
  mainMission?: Task;
  startDay: (mode: DailyMode | undefined, mainMissionTitle: string) => void;
  updateMainMissionTitle: (title: string) => void;
  openToday: () => void;
}) {
  const [flowMode, setFlowMode] = useState<DailyMode>(() => resolveDailyMode(selectedTodayMode, defaultTodayMode));
  const [mainMissionTitle, setMainMissionTitle] = useState(mainMission?.title ?? "");
  const [mainMissionEdited, setMainMissionEdited] = useState(false);

  useEffect(() => {
    setFlowMode(resolveDailyMode(selectedTodayMode, defaultTodayMode));
  }, [defaultTodayMode, selectedTodayMode]);

  useEffect(() => {
    setMainMissionTitle(mainMission?.title ?? "");
    setMainMissionEdited(false);
  }, [mainMission?.id, mainMission?.title]);

  function chooseFlowMode(mode: DailyMode) {
    setFlowMode(mode);
    setSelectedTodayMode(mode);
  }

  function generateFromFlow() {
    const modeToGenerate = resolveDailyMode(flowMode, defaultTodayMode);
    setSelectedTodayMode(modeToGenerate);
    startDay(modeToGenerate, mainMissionEdited ? mainMissionTitle : "");
  }

  return (
    <Panel className="sunny-start-panel">
      <div className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-200">Morning Start</p>
          <h3 className="mt-2 text-2xl font-black text-white">Start today in 4 steps</h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">Choose the mode, confirm the main mission, generate missions, then start the day.</p>
        </div>
        <div className="grid gap-4">
          <div>
            <p className="mb-2 text-sm font-black text-white">1. Choose today&apos;s mode</p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {dailyModes.map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => chooseFlowMode(mode)}
                  className={`min-h-11 shrink-0 rounded-2xl px-4 text-sm font-black ${flowMode === mode ? "bg-amber-300 text-slate-950" : "bg-white/[0.06] text-slate-300"}`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <Field label="2. Confirm or edit today's main mission">
            <input
              value={mainMissionTitle}
              onChange={(event) => {
                setMainMissionTitle(event.target.value);
                setMainMissionEdited(true);
              }}
              onBlur={() => updateMainMissionTitle(mainMissionTitle)}
              className="form-control"
              placeholder="One mission that matters today"
            />
          </Field>

          <div className="grid gap-3 sm:grid-cols-2">
            <button onClick={generateFromFlow} className="primary-button min-h-14 justify-center">
              <Sparkles size={19} />
              3. Generate Today's Missions
            </button>
            <button type="button" onClick={() => updateMainMissionTitle(mainMissionTitle)} className="secondary-button min-h-14 justify-center">
              <Check size={18} />
              Save Main Mission
            </button>
            <button type="button" onClick={openToday} className="secondary-button min-h-14 justify-center sm:col-span-2">
              <ChevronRight size={18} />
              4. Start the Day
            </button>
          </div>
        </div>
      </div>
    </Panel>
  );
}

function SevenDayProgress({ summary }: { summary: SevenDayTestSummary }) {
  const bestLabel = summary.bestDay ? `${summary.bestDay.date} · ${summary.bestDay.score} KPM` : "No completed day yet";

  return (
    <Panel className="sunny-seven-panel">
      <div className="mb-5 flex min-w-0 flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-200">7-Day Test Progress</p>
          <h3 className="mt-2 text-2xl font-black text-white">Day {summary.currentDay} / 7</h3>
          <p className="mt-1 text-sm leading-6 text-slate-400">{summary.completedDays} / 7 review days completed since {summary.startDate}.</p>
        </div>
        <div className="grid min-w-0 gap-3 sm:grid-cols-3 xl:w-full xl:max-w-[520px]">
          <MiniMetric label="Best day so far" value={bestLabel} />
          <MiniMetric label="Average score" value={summary.averageScore} />
          <MiniMetric label="Main mission rate" value={`${summary.mainMissionCompletionRate}%`} />
        </div>
      </div>
      <SevenDayTracker days={summary.days} compact />
    </Panel>
  );
}

function SevenDayTracker({ days, compact = false }: { days: SevenDayTestDay[]; compact?: boolean }) {
  return (
    <div className={`grid min-w-0 gap-3 ${compact ? "sm:grid-cols-2 xl:grid-cols-[repeat(auto-fit,minmax(135px,1fr))]" : "lg:grid-cols-2"}`}>
      {days.map((day) => (
        <div key={day.date} className="min-w-0 rounded-2xl border border-white/10 bg-black/20 p-3">
          <div className="flex min-w-0 flex-col gap-2 2xl:flex-row 2xl:items-start 2xl:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-200">Day {day.dayNumber}</p>
              <p className="mt-1 break-words text-sm font-black text-white">{day.date}</p>
            </div>
            <Badge tone={day.reviewCompleted ? "gold" : "dark"}>{day.reviewCompleted ? "Reviewed" : "Open"}</Badge>
          </div>
          <div className="mt-3 grid gap-2 text-sm">
            <SummaryRow label="KPM Score" value={`${day.score}`} />
            <SummaryRow label="Day level" value={day.dayLevel} />
            <SummaryRow label="Main mission" value={day.mainMissionCompleted ? "Yes" : "No"} />
            <SummaryRow label="Review" value={day.reviewCompleted ? "Yes" : "No"} />
          </div>
        </div>
      ))}
    </div>
  );
}

function TaskList({
  tasks,
  todayMode,
  updateTask,
  resetToday,
  addTask,
  editTask,
  deleteTask
}: {
  tasks: Task[];
  todayMode: DailyMode;
  updateTask: (id: string, patch: Partial<Task>) => void;
  resetToday: () => void;
  addTask: (draft: TaskDraft) => void;
  editTask: (id: string, draft: TaskDraft) => void;
  deleteTask: (id: string) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<TaskDraft>(defaultTaskDraft);
  const customTaskCount = tasks.filter((task) => task.custom && !task.insertedGoal).length;

  function startEdit(task: Task) {
    setEditingId(task.id);
    setDraft(taskToDraft(task));
  }

  function cancelEdit() {
    setEditingId(null);
    setDraft(defaultTaskDraft);
  }

  function submitTask() {
    if (!draft.title.trim()) return;
    if (editingId) {
      editTask(editingId, draft);
    } else {
      addTask(draft);
    }
    cancelEdit();
  }

  return (
    <section className="sunny-today-board grid gap-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-200">Daily Mission Board</p>
          <h2 className="mt-2 text-3xl font-black text-white">Today's Missions</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge tone="gold">Today&apos;s Mode: {todayMode} Mode</Badge>
            <Badge tone="dark">{modeProfiles[todayMode].note}</Badge>
          </div>
        </div>
        <button onClick={resetToday} className="danger-button">
          <RotateCcw size={18} />
          Reset today
        </button>
      </div>

      <TaskEditor draft={draft} setDraft={setDraft} editingId={editingId} submitTask={submitTask} cancelEdit={cancelEdit} />

      {customTaskCount === 0 ? (
        <Panel compact>
          <p className="text-lg font-black text-white">No custom missions yet.</p>
          <p className="mt-1 text-sm leading-6 text-slate-400">Use the Custom Mission form above when today needs one extra task outside the default system.</p>
        </Panel>
      ) : null}

      {blocks.map((block) => {
        const blockTasks = tasks.filter((task) => (task.block || getTaskBlock(task.time)) === block.name);
        const done = blockTasks.filter((task) => task.completed).length;
        return (
          <MissionSection key={block.name} block={block} done={done} total={blockTasks.length}>
            {blockTasks.map((task) => (
              <TaskCard key={task.id} task={task} updateTask={updateTask} startEdit={startEdit} deleteTask={deleteTask} />
            ))}
          </MissionSection>
        );
      })}
    </section>
  );
}

function TaskEditor({
  draft,
  setDraft,
  editingId,
  submitTask,
  cancelEdit
}: {
  draft: TaskDraft;
  setDraft: Dispatch<SetStateAction<TaskDraft>>;
  editingId: string | null;
  submitTask: () => void;
  cancelEdit: () => void;
}) {
  return (
    <Panel>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-200">{editingId ? "Edit Mission" : "Custom Mission"}</p>
          <h3 className="mt-1 text-2xl font-black text-white">{editingId ? "Update today's mission" : "Add a mission to today"}</h3>
        </div>
        {editingId && (
          <button onClick={cancelEdit} className="min-h-11 rounded-2xl bg-white/[0.06] px-4 text-sm font-black text-slate-300">
            <X className="mr-2 inline" size={16} />
            Cancel
          </button>
        )}
      </div>
      <div className="grid gap-3 lg:grid-cols-[0.7fr_1.4fr_0.8fr_0.8fr_0.6fr_auto]">
        <Field label="Time">
          <input value={draft.time} onChange={(event) => setDraft({ ...draft, time: event.target.value })} className="form-control" />
        </Field>
        <Field label="Title">
          <input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} className="form-control" placeholder="New useful mission" />
        </Field>
        <SelectField label="Category" value={draft.category} options={categories} onChange={(category) => setDraft({ ...draft, category: category as Category })} />
        <SelectField label="Priority" value={draft.priority} options={priorities} onChange={(priority) => setDraft({ ...draft, priority: priority as Priority })} />
        <Field label="KPM">
          <input type="number" min="0" value={draft.points} onChange={(event) => setDraft({ ...draft, points: Number(event.target.value) })} className="form-control" />
        </Field>
        <div className="flex items-end">
          <button onClick={submitTask} className="primary-button min-h-[3.25rem] w-full justify-center">
            {editingId ? <Save size={18} /> : <Plus size={18} />}
            {editingId ? "Save" : "Add"}
          </button>
        </div>
      </div>
      <div className="mt-3">
        <Field label="Notes">
          <textarea value={draft.notes} onChange={(event) => setDraft({ ...draft, notes: event.target.value })} className="form-control min-h-20" />
        </Field>
      </div>
    </Panel>
  );
}

function TemplateEditor({
  templateTasks,
  shiftEarlier,
  addTemplateTask,
  editTemplateTask,
  disableTemplateTask,
  enableTemplateTask,
  deleteTemplateTask,
  resetDefaultTemplate,
  applyTemplateToTomorrow,
  applyTemplateToToday
}: {
  templateTasks: TemplateTask[];
  shiftEarlier: boolean;
  addTemplateTask: (draft: TemplateDraft) => void;
  editTemplateTask: (id: string, draft: TemplateDraft) => void;
  disableTemplateTask: (id: string) => void;
  enableTemplateTask: (id: string) => void;
  deleteTemplateTask: (id: string) => void;
  resetDefaultTemplate: () => void;
  applyTemplateToTomorrow: () => void;
  applyTemplateToToday: () => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<TemplateDraft>(defaultTemplateDraft);
  const enabledCount = templateTasks.filter((task) => task.enabled).length;

  function startEdit(task: TemplateTask) {
    setEditingId(task.id);
    setDraft(templateToDraft(task));
  }

  function cancelEdit() {
    setEditingId(null);
    setDraft(defaultTemplateDraft);
  }

  function submitTemplateTask() {
    if (!draft.title.trim()) return;
    if (editingId) {
      editTemplateTask(editingId, draft);
    } else {
      addTemplateTask(draft);
    }
    cancelEdit();
  }

  return (
    <section className="grid gap-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-200">Future Day Blueprint</p>
          <h2 className="mt-2 text-3xl font-black text-white">Default Schedule Template</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Edit the recurring schedule used when KPM Sunny Daily OS creates future days. Today and history stay unchanged unless you apply the template manually.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge tone="gold">{enabledCount} enabled</Badge>
          <Badge tone="dark">{templateTasks.length} total</Badge>
          {shiftEarlier ? <Badge tone="gold">5:00 AM shift preview</Badge> : <Badge tone="dark">5:30 AM template</Badge>}
        </div>
      </div>

      <Panel>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-200">{editingId ? "Edit Default Task" : "Recurring Task"}</p>
            <h3 className="mt-1 text-2xl font-black text-white">{editingId ? "Update template mission" : "Add a recurring mission"}</h3>
          </div>
          {editingId ? (
            <button onClick={cancelEdit} className="min-h-11 rounded-2xl bg-white/[0.06] px-4 text-sm font-black text-slate-300">
              <X className="mr-2 inline" size={16} />
              Cancel
            </button>
          ) : null}
        </div>

        <div className="grid gap-3 lg:grid-cols-[0.7fr_1.35fr_0.8fr_0.7fr_0.55fr_1fr_auto]">
          <Field label="Time">
            <input value={draft.time} onChange={(event) => setDraft({ ...draft, time: event.target.value })} className="form-control" />
          </Field>
          <Field label="Title">
            <input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} className="form-control" placeholder="Check job sites" />
          </Field>
          <SelectField label="Category" value={draft.category} options={categories} onChange={(category) => setDraft({ ...draft, category: category as Category })} />
          <SelectField label="Priority" value={draft.priority} options={priorities} onChange={(priority) => setDraft({ ...draft, priority: priority as Priority })} />
          <Field label="KPM">
            <input type="number" min="0" value={draft.points} onChange={(event) => setDraft({ ...draft, points: Number(event.target.value) })} className="form-control" />
          </Field>
          <SelectField label="Section" value={draft.block} options={blockNames} onChange={(block) => setDraft({ ...draft, block })} />
          <div className="flex items-end">
            <button onClick={submitTemplateTask} className="primary-button min-h-[3.25rem] w-full justify-center">
              {editingId ? <Save size={18} /> : <Plus size={18} />}
              {editingId ? "Save" : "Add"}
            </button>
          </div>
        </div>

        <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_auto] lg:items-end">
          <Field label="Default notes">
            <textarea value={draft.notes} onChange={(event) => setDraft({ ...draft, notes: event.target.value })} className="form-control min-h-20" placeholder="Optional notes that appear when a day is generated" />
          </Field>
          <label className="flex min-h-[3.25rem] items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 text-sm font-black text-slate-200">
            <input
              type="checkbox"
              checked={draft.enabled}
              onChange={(event) => setDraft({ ...draft, enabled: event.target.checked })}
              className="h-5 w-5 accent-amber-300"
            />
            Enabled for future days
          </label>
        </div>
      </Panel>

      <Panel>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-xl font-black text-white">Template Actions</h3>
            <p className="mt-1 text-sm leading-6 text-slate-400">Tomorrow can be regenerated safely. Applying to today asks first because it replaces the active mission list.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button onClick={applyTemplateToTomorrow} className="primary-button justify-center">
              <ChevronRight size={18} />
              Apply Template to Tomorrow
            </button>
            <button onClick={applyTemplateToToday} className="danger-button">
              <RotateCcw size={18} />
              Apply Template to Today
            </button>
            <button onClick={resetDefaultTemplate} className="danger-button">
              <Trash2 size={18} />
              Reset to Original 5:30 AM Template
            </button>
          </div>
        </div>
      </Panel>

      {blocks.map((block) => {
        const blockTasks = templateTasks.filter((task) => task.block === block.name);
        if (blockTasks.length === 0) return null;
        return (
          <section key={block.name} className="rounded-[1.5rem] border border-white/10 bg-white/[0.055] p-4 shadow-[0_22px_60px_rgba(0,0,0,0.25)] backdrop-blur-xl sm:p-5">
            <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h3 className="text-2xl font-black text-white">{block.name}</h3>
                <p className="mt-1 text-sm leading-6 text-slate-400">{block.description}</p>
              </div>
              <Badge tone="dark">{blockTasks.filter((task) => task.enabled).length}/{blockTasks.length} enabled</Badge>
            </div>
            <div className="grid gap-3">
              {blockTasks.map((task) => (
                <TemplateTaskCard
                  key={task.id}
                  task={task}
                  shiftEarlier={shiftEarlier}
                  startEdit={startEdit}
                  disableTemplateTask={disableTemplateTask}
                  enableTemplateTask={enableTemplateTask}
                  deleteTemplateTask={deleteTemplateTask}
                />
              ))}
            </div>
          </section>
        );
      })}
    </section>
  );
}

function TemplateTaskCard({
  task,
  shiftEarlier,
  startEdit,
  disableTemplateTask,
  enableTemplateTask,
  deleteTemplateTask
}: {
  task: TemplateTask;
  shiftEarlier: boolean;
  startEdit: (task: TemplateTask) => void;
  disableTemplateTask: (id: string) => void;
  enableTemplateTask: (id: string) => void;
  deleteTemplateTask: (id: string) => void;
}) {
  const displayTime = shiftEarlier ? shiftTime(task.time, -30) : task.time;

  return (
    <article className={`rounded-2xl border p-4 transition ${task.enabled ? "border-white/10 bg-[#0b1220]/80" : "border-orange-400/35 bg-orange-400/[0.08] opacity-80"}`}>
      <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-black text-amber-200">{displayTime}</span>
            {shiftEarlier ? <Badge tone="dark">Template {task.time}</Badge> : null}
            <Badge tone={task.category}>{task.category}</Badge>
            <Badge tone={task.priority === "S" ? "gold" : "dark"}>{task.priority}-Tier</Badge>
            <Badge tone="dark">{task.points} KPM</Badge>
            <Badge tone={task.enabled ? "gold" : "dark"}>{task.enabled ? "Enabled" : "Disabled"}</Badge>
            {task.flexible ? <Badge tone="dark">Flexible</Badge> : null}
          </div>
          {task.displayLabel ? <p className="mt-2 text-xs font-black uppercase tracking-[0.2em] text-amber-200">{task.displayLabel}</p> : null}
          <h4 className="mt-2 text-lg font-black leading-snug text-white sm:text-xl">{task.title}</h4>
          <p className="mt-1 text-sm font-semibold text-slate-400">{task.block}</p>
          {task.notes ? <p className="mt-3 rounded-2xl bg-black/20 px-4 py-3 text-sm leading-6 text-slate-300">{task.notes}</p> : null}
        </div>

        <div className="grid gap-2 sm:grid-cols-3 lg:min-w-[320px]">
          <button onClick={() => startEdit(task)} className="secondary-button justify-center">
            <Pencil size={16} />
            Edit
          </button>
          <button onClick={() => (task.enabled ? disableTemplateTask(task.id) : enableTemplateTask(task.id))} className="secondary-button justify-center">
            {task.enabled ? "Disable" : "Enable"}
          </button>
          <button
            onClick={() => {
              if (window.confirm(`Delete "${task.title}" from the default template permanently?`)) deleteTemplateTask(task.id);
            }}
            className="danger-button"
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}

function MissionSection({
  block,
  done,
  total,
  children
}: {
  block: (typeof blocks)[number];
  done: number;
  total: number;
  children: ReactNode;
}) {
  return (
    <section className="sunny-mission-section rounded-[1.5rem] border border-white/10 bg-white/[0.055] p-4 shadow-[0_22px_60px_rgba(0,0,0,0.25)] backdrop-blur-xl sm:p-5">
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h3 className="text-2xl font-black text-white">{block.name}</h3>
          <p className="mt-1 text-sm leading-6 text-slate-400">{block.description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge tone="gold">{block.start} - {block.end}</Badge>
          <Badge tone="dark">{done}/{total} clear</Badge>
        </div>
      </div>
      <MissionArtPanel imageSrc={artPaths.block[block.name]} title={block.name} eyebrow={`${done} / ${total} clear`} className="mb-4" minHeight="min-h-[8.5rem]">
        <p className="max-w-[18rem] text-sm leading-6 text-slate-200">{block.description}</p>
      </MissionArtPanel>
      <div className="grid gap-3">{children}</div>
    </section>
  );
}

function TaskCard({
  task,
  updateTask,
  startEdit,
  deleteTask
}: {
  task: Task;
  updateTask: (id: string, patch: Partial<Task>) => void;
  startEdit: (task: Task) => void;
  deleteTask: (id: string) => void;
}) {
  const statusClass = task.completed
    ? "border-emerald-400/35 bg-emerald-400/[0.09] opacity-80"
    : task.skipped
      ? "border-orange-400/45 bg-orange-400/[0.08]"
      : task.priority === "S"
        ? "border-amber-300/45 bg-white/[0.065] shadow-[0_0_28px_rgba(245,158,11,0.10)]"
        : "border-white/10 bg-[#0b1220]/80";

  return (
    <article className={`sunny-task-card rounded-2xl border p-4 transition ${statusClass}`}>
      <div className="grid gap-4 sm:grid-cols-[auto_1fr_auto] sm:items-start">
        <button
          aria-label="Mark complete"
          onClick={() => updateTask(task.id, { completed: !task.completed, skipped: false })}
          className={`flex h-12 w-12 items-center justify-center rounded-2xl border text-lg transition ${
            task.completed
              ? "border-emerald-300 bg-emerald-400 text-[#04110b]"
              : "border-white/15 bg-white/[0.06] text-slate-300 hover:border-amber-300/60"
          }`}
        >
          {task.completed && <Check size={24} />}
        </button>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-black text-amber-200">{task.time}</span>
            <Badge tone={task.category}>{task.category}</Badge>
            <Badge tone={task.priority === "S" ? "gold" : "dark"}>{task.priority}-Tier</Badge>
            <Badge tone="dark">{task.points} KPM</Badge>
            {task.flexible ? <Badge tone="dark">Flexible</Badge> : null}
          </div>
          {task.displayLabel ? <p className="mt-2 text-xs font-black uppercase tracking-[0.2em] text-amber-200">{task.displayLabel}</p> : null}
          <h4 className="mt-2 text-lg font-black leading-snug text-white sm:text-xl">{task.title}</h4>
          {task.subtitle ? <p className="mt-1 text-sm font-semibold leading-6 text-slate-300">{task.subtitle}</p> : null}
          <textarea
            value={task.notes}
            onChange={(event) => updateTask(task.id, { notes: event.target.value })}
            placeholder="Notes"
            className="mt-3 min-h-12 w-full resize-y rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-amber-300/60"
          />
        </div>

        <div className="grid gap-2 sm:min-w-28">
          <button
            onClick={() => updateTask(task.id, { skipped: !task.skipped, completed: false })}
            className={`min-h-11 rounded-2xl px-4 text-sm font-black transition ${
              task.skipped
                ? "bg-orange-400 text-slate-950"
                : "bg-white/[0.06] text-slate-300 hover:bg-orange-400/15 hover:text-orange-200"
            }`}
          >
            {task.skipped ? "Skipped" : "Skip"}
          </button>
          <button onClick={() => startEdit(task)} className="min-h-11 rounded-2xl bg-white/[0.06] px-4 text-sm font-black text-slate-300">
            <Pencil className="mr-2 inline" size={15} />
            Edit
          </button>
          <button onClick={() => deleteTask(task.id)} className="min-h-11 rounded-2xl border border-red-400/30 bg-red-400/10 px-4 text-sm font-black text-red-200">
            <Trash2 className="mr-2 inline" size={15} />
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}

function PlanFoundation({
  plan,
  setPlan,
  tomorrowMode,
  selectTomorrowMode,
  findBestTimeSlot,
  missionPreview,
  updateMissionPreviewAction,
  applyMissionPreview,
  cancelMissionPreview,
  tomorrowTasks,
  activePlans,
  addActivePlan,
  updateActivePlan,
  updatePlanStatus,
  profile,
  setProfile,
  foodLibrary,
  setFoodLibrary,
  dailyFoodLogs,
  setDailyFoodLogs,
  moneySpendingLogs,
  setMoneySpendingLogs,
  moneyIncomeLogs,
  setMoneyIncomeLogs,
  moneySavingLogs,
  setMoneySavingLogs,
  moneyOpportunityLogs,
  setMoneyOpportunityLogs,
  todayKey,
  longStudyDraft,
  setLongStudyDraft,
  longStudyPreview,
  createLongStudyPreview,
  saveLongStudyPreview,
  addLongStudyPreviewKeyBlocksToToday,
  useLongStudyPreviewAsTodayEvent,
  cancelLongStudyPreview,
  longStudySessions,
  setLongStudySessions,
  copyLongStudyBlocksToToday,
  longTermPlanning,
  setLongTermPlanning,
  sendLongTermTaskToToday
}: {
  plan: Plan;
  setPlan: Dispatch<SetStateAction<Plan>>;
  tomorrowMode: DailyMode;
  selectTomorrowMode: (mode: DailyMode) => void;
  findBestTimeSlot: () => void;
  missionPreview: MissionPlanPreviewItem[];
  updateMissionPreviewAction: (id: string, action: ConflictAction) => void;
  applyMissionPreview: () => void;
  cancelMissionPreview: () => void;
  tomorrowTasks: Task[];
  activePlans: ActivePlan[];
  addActivePlan: (plan: ActivePlan) => void;
  updateActivePlan: (planId: string, updater: SetStateAction<ActivePlan | null>) => void;
  updatePlanStatus: (planId: string, status: PlanStatus) => void;
  profile: ProfileState;
  setProfile: Dispatch<SetStateAction<ProfileState>>;
  foodLibrary: FoodItem[];
  setFoodLibrary: Dispatch<SetStateAction<FoodItem[]>>;
  dailyFoodLogs: DailyFoodLogs;
  setDailyFoodLogs: Dispatch<SetStateAction<DailyFoodLogs>>;
  moneySpendingLogs: MoneySpendingLog[];
  setMoneySpendingLogs: Dispatch<SetStateAction<MoneySpendingLog[]>>;
  moneyIncomeLogs: MoneyIncomeLog[];
  setMoneyIncomeLogs: Dispatch<SetStateAction<MoneyIncomeLog[]>>;
  moneySavingLogs: MoneySavingLog[];
  setMoneySavingLogs: Dispatch<SetStateAction<MoneySavingLog[]>>;
  moneyOpportunityLogs: MoneyOpportunityLog[];
  setMoneyOpportunityLogs: Dispatch<SetStateAction<MoneyOpportunityLog[]>>;
  todayKey: string;
  longStudyDraft: LongStudyDraft;
  setLongStudyDraft: Dispatch<SetStateAction<LongStudyDraft>>;
  longStudyPreview: LongStudyPreview | null;
  createLongStudyPreview: (draft: LongStudyDraft) => void;
  saveLongStudyPreview: () => void;
  addLongStudyPreviewKeyBlocksToToday: () => void;
  useLongStudyPreviewAsTodayEvent: () => void;
  cancelLongStudyPreview: () => void;
  longStudySessions: LongStudySession[];
  setLongStudySessions: Dispatch<SetStateAction<LongStudySession[]>>;
  copyLongStudyBlocksToToday: (session: LongStudySession) => void;
  longTermPlanning: LongTermPlanningState;
  setLongTermPlanning: Dispatch<SetStateAction<LongTermPlanningState>>;
  sendLongTermTaskToToday: (source: "Weekly Mission" | "Next Action", item: WeeklyMission | NextAction) => void;
}) {
  const activeCount = activePlans.filter((item) => item.status === "active").length;
  const pausedCount = activePlans.filter((item) => item.status === "paused").length;
  const activePlanDetails = activePlans.length
    ? `${activeCount} active · ${pausedCount} paused`
    : activePlanFoundation.type || "Foundation ready";
  const [showEssentialsSetup, setShowEssentialsSetup] = useState(false);
  const [showGetLeanSetup, setShowGetLeanSetup] = useState(false);
  const [showLearnSetup, setShowLearnSetup] = useState(false);
  const [showSleepSetup, setShowSleepSetup] = useState(false);
  const [showProjectSetup, setShowProjectSetup] = useState(false);
  const [showMoneySetup, setShowMoneySetup] = useState(false);
  const [showLifeResetSetup, setShowLifeResetSetup] = useState(false);
  const [essentialsSetup, setEssentialsSetup] = useState<EssentialsSetup>(defaultEssentialsSetup);
  const [getLeanSetup, setGetLeanSetup] = useState<GetLeanSetup>(() => createGetLeanSetupFromProfile(profile));
  const [learnSetup, setLearnSetup] = useState<LearnMasterSetup>(defaultLearnMasterSetup);
  const [sleepSetup, setSleepSetup] = useState<SleepEnergySetup>(() => createSleepEnergySetupFromProfile(profile));
  const [projectSetup, setProjectSetup] = useState<ProjectSetup>(defaultProjectSetup);
  const [moneySetup, setMoneySetup] = useState<MoneySetup>(defaultMoneySetup);
  const [lifeResetSetup, setLifeResetSetup] = useState<LifeResetSetup>(() => createLifeResetSetupFromProfile(profile));
  const [planTabFilter, setPlanTabFilter] = useState<PlanTabFilter>("All");
  const presetPlans = [
    { name: "Get Lean / Shred", category: "Body & Energy", purpose: "Create a simple rule-based fat-loss plan using my profile data." },
    { name: "Fix Sleep & Energy", category: "Body & Energy", purpose: "Stabilize wake time, sunlight, meals, wind-down, and recovery." },
    { name: "Life Reset", category: "Body & Energy", purpose: "Clean the baseline: body, room, money, admin, relationships, and rhythm." },
    { name: "Learn / Master Subject", category: "Skill & Project", purpose: "Turn one subject into daily practice, review, and weekly proof." },
    { name: "Build a Project", category: "Skill & Project", purpose: "Ship one project through small daily build, test, and review blocks." },
    { name: "Money Plan", category: "Money", purpose: "Build income actions and protect savings." },
    { name: "Everyday Essentials", category: "Essentials", purpose: "Make sure I have the basic things I need for daily life." }
  ];
  const presetGroups = ["Body & Energy", "Skill & Project", "Money", "Essentials"].map((category) => ({
    category,
    plans: presetPlans.filter((preset) => preset.category === category)
  }));
  const reviewDuePlans = activePlans.filter((item) => item.status === "active" && getPlanWeeklyReviews(item).length === 0);
  const archivedPlans = activePlans.filter((item) => item.status === "archived" || item.status === "completed");
  const recommendation = getPlanRecommendedAction(activePlans, longStudySessions);
  const showActiveSection = planTabFilter === "All" || planTabFilter === "Active" || planTabFilter === "Archived";
  const showPresetsSection = planTabFilter === "All" || planTabFilter === "Presets";
  const showEventsSection = planTabFilter === "All" || planTabFilter === "Events";
  const showReviewsSection = planTabFilter === "All" || planTabFilter === "Reviews Due";
  const showArchivedSection = planTabFilter === "All" || planTabFilter === "Archived";

  function setupEverydayEssentials() {
    const nextPlan = createEverydayEssentialsPlan(essentialsSetup);
    addActivePlan(nextPlan);
    setProfile((current) => ({ ...normalizeProfile(current), activePlan: nextPlan.name }));
    setShowEssentialsSetup(false);
  }

  function setupGetLeanPlan() {
    const nextPlan = createGetLeanPlan(getLeanSetup, profile.sleepTargetHours);
    addActivePlan(nextPlan);
    setProfile((current) => ({ ...normalizeProfile(current), activePlan: nextPlan.name }));
    setShowGetLeanSetup(false);
  }

  function setupLearnMasterPlan() {
    const nextPlan = createLearnMasterPlan(learnSetup);
    addActivePlan(nextPlan);
    setProfile((current) => ({ ...normalizeProfile(current), activePlan: nextPlan.name }));
    setShowLearnSetup(false);
  }

  function setupSleepEnergyPlan() {
    const nextPlan = createSleepEnergyPlan(sleepSetup);
    addActivePlan(nextPlan);
    setProfile((current) => ({ ...normalizeProfile(current), activePlan: nextPlan.name }));
    setShowSleepSetup(false);
  }

  function setupBuildProjectPlan() {
    const nextPlan = createBuildProjectPlan(projectSetup);
    addActivePlan(nextPlan);
    setProfile((current) => ({ ...normalizeProfile(current), activePlan: nextPlan.name }));
    setShowProjectSetup(false);
  }

  function setupMoneyPlan() {
    const nextPlan = createMoneyPlan(moneySetup);
    addActivePlan(nextPlan);
    setProfile((current) => ({ ...normalizeProfile(current), activePlan: nextPlan.name }));
    setShowMoneySetup(false);
  }

  function setupLifeResetPlan() {
    const nextPlan = createLifeResetPlan(lifeResetSetup);
    addActivePlan(nextPlan);
    setProfile((current) => ({ ...normalizeProfile(current), activePlan: nextPlan.name }));
    setShowLifeResetSetup(false);
  }

  function openPresetSetup(name: string) {
    if (name === "Everyday Essentials") {
      setShowEssentialsSetup((current) => !current);
      setShowGetLeanSetup(false);
      setShowLearnSetup(false);
      setShowSleepSetup(false);
      setShowProjectSetup(false);
      setShowMoneySetup(false);
      setShowLifeResetSetup(false);
      return;
    }
    if (name === "Get Lean / Shred") {
      setGetLeanSetup((current) => mergeGetLeanSetupWithProfile(current, profile));
      setShowGetLeanSetup((current) => !current);
      setShowEssentialsSetup(false);
      setShowLearnSetup(false);
      setShowSleepSetup(false);
      setShowProjectSetup(false);
      setShowMoneySetup(false);
      setShowLifeResetSetup(false);
      return;
    }
    if (name === "Learn / Master Subject") {
      setShowLearnSetup((current) => !current);
      setShowEssentialsSetup(false);
      setShowGetLeanSetup(false);
      setShowSleepSetup(false);
      setShowProjectSetup(false);
      setShowMoneySetup(false);
      setShowLifeResetSetup(false);
      return;
    }
    if (name === "Fix Sleep & Energy") {
      setSleepSetup((current) => mergeSleepEnergySetupWithProfile(current, profile));
      setShowSleepSetup((current) => !current);
      setShowEssentialsSetup(false);
      setShowGetLeanSetup(false);
      setShowLearnSetup(false);
      setShowProjectSetup(false);
      setShowMoneySetup(false);
      setShowLifeResetSetup(false);
      return;
    }
    if (name === "Build a Project") {
      setShowProjectSetup((current) => !current);
      setShowEssentialsSetup(false);
      setShowGetLeanSetup(false);
      setShowLearnSetup(false);
      setShowSleepSetup(false);
      setShowMoneySetup(false);
      setShowLifeResetSetup(false);
      return;
    }
    if (name === "Money Plan") {
      setShowMoneySetup((current) => !current);
      setShowEssentialsSetup(false);
      setShowGetLeanSetup(false);
      setShowLearnSetup(false);
      setShowSleepSetup(false);
      setShowProjectSetup(false);
      setShowLifeResetSetup(false);
      return;
    }
    if (name === "Life Reset") {
      setLifeResetSetup((current) => mergeLifeResetSetupWithProfile(current, profile));
      setShowLifeResetSetup((current) => !current);
      setShowEssentialsSetup(false);
      setShowGetLeanSetup(false);
      setShowLearnSetup(false);
      setShowSleepSetup(false);
      setShowProjectSetup(false);
      setShowMoneySetup(false);
    }
  }

  return (
    <section className="grid gap-5">
      <Panel>
        <p className="text-sm font-black uppercase tracking-[0.2em] text-amber-200">Plan</p>
        <h2 className="mt-2 text-3xl font-black text-white">What is my long-term plan?</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Active plans, preset systems, and tomorrow planning live here without crowding Today.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {(["All", "Active", "Presets", "Events", "Reviews Due", "Archived"] as PlanTabFilter[]).map((filter) => (
            <button key={filter} type="button" onClick={() => setPlanTabFilter(filter)} className={`rounded-full border px-3 py-2 text-xs font-black uppercase tracking-[0.14em] ${planTabFilter === filter ? "border-cyan-200/50 bg-cyan-300/[0.12] text-cyan-100" : "border-white/10 bg-white/[0.04] text-slate-300"}`}>
              {filter}
            </button>
          ))}
        </div>
      </Panel>

      {showActiveSection ? <ActivePlansManager activePlans={activePlans} updateActivePlan={updateActivePlan} updatePlanStatus={updatePlanStatus} /> : null}

      {planTabFilter === "All" ? (
        <Panel compact>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-100">Recommended Next Action</p>
          <h3 className="mt-2 text-xl font-black text-white">{recommendation.title}</h3>
          <p className="mt-1 text-sm leading-6 text-slate-400">{recommendation.detail}</p>
        </Panel>
      ) : null}

      {showPresetsSection ? (
      <Panel>
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-amber-200">Preset Plans Library</p>
            <h3 className="mt-2 text-2xl font-black text-white">Choose the system you want to start</h3>
          </div>
          <Badge tone="dark">Grouped</Badge>
        </div>
        <div className="grid gap-5">
          {presetGroups.map((group) => (
            <section key={group.category} className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <h4 className="text-lg font-black text-white">{group.category}</h4>
              <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {group.plans.map((preset) => {
                  const isAvailable = true;
                  const activeMatch = activePlans.find((plan) => plan.name === preset.name && plan.status === "active");
                  return (
                    <article key={preset.name} className="rounded-[1.1rem] border border-white/10 bg-white/[0.04] p-4">
                      <div className="flex items-start justify-between gap-3">
                        <h5 className="break-words text-base font-black text-white">{preset.name}</h5>
                        <Badge tone={activeMatch ? "green" : isAvailable ? "gold" : "dark"}>{activeMatch ? "Active" : "Available"}</Badge>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-400">{preset.purpose}</p>
                      <button
                        type="button"
                        onClick={() => activeMatch ? document.getElementById("active-plan-control-center")?.scrollIntoView({ behavior: "smooth", block: "start" }) : openPresetSetup(preset.name)}
                        className="secondary-button mt-4 w-full justify-center"
                      >
                        {activeMatch ? "Open Active Plan" : "Set Up Plan"}
                      </button>
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </Panel>
      ) : null}

      {showEventsSection ? (
      <CollapsibleSection title="Special Event Plans" subtitle="Special events do not replace your normal day unless you choose to connect them to Today." defaultOpen={true}>
        <LongStudyModePanel
          draft={longStudyDraft}
          setDraft={setLongStudyDraft}
          preview={longStudyPreview}
          createPreview={createLongStudyPreview}
          applyPreview={saveLongStudyPreview}
          addKeyBlocksToToday={addLongStudyPreviewKeyBlocksToToday}
          useAsTodayMainEvent={useLongStudyPreviewAsTodayEvent}
          cancel={cancelLongStudyPreview}
          events={longStudySessions}
          setEvents={setLongStudySessions}
          copyKeyBlocksToToday={copyLongStudyBlocksToToday}
        />
      </CollapsibleSection>
      ) : null}

      {showReviewsSection ? <WeeklyReviewsDue plans={reviewDuePlans} /> : null}

      {showArchivedSection ? <ArchivedPlansSection plans={archivedPlans} updatePlanStatus={updatePlanStatus} /> : null}

      {planTabFilter === "All" ? (
      <LongTermPlanningHub
        planning={longTermPlanning}
        setPlanning={setLongTermPlanning}
        activePlans={activePlans}
        sendLongTermTaskToToday={sendLongTermTaskToToday}
      />
      ) : null}

      {showEssentialsSetup ? (
        <Panel>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-amber-200">Everyday Essentials Setup</p>
          <h3 className="mt-2 text-2xl font-black text-white">Make sure I have the basic things I need for daily life.</h3>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <EssentialsSelect label="Living situation" value={essentialsSetup.livingSituation} options={["Alone", "With family", "Shared room / shared home"]} onChange={(livingSituation) => setEssentialsSetup({ ...essentialsSetup, livingSituation })} />
            <EssentialsSelect label="Budget level" value={essentialsSetup.budgetLevel} options={["Basic", "Normal", "Comfortable"]} onChange={(budgetLevel) => setEssentialsSetup({ ...essentialsSetup, budgetLevel })} />
            <EssentialsSelect label="Skin / hair needs" value={essentialsSetup.skinHairNeeds} options={["Normal", "Sensitive", "Oily", "Dry"]} onChange={(skinHairNeeds) => setEssentialsSetup({ ...essentialsSetup, skinHairNeeds })} />
            <EssentialsSelect label="Food style" value={essentialsSetup.foodStyle} options={["Simple", "Fitness", "Stomach-sensitive"]} onChange={(foodStyle) => setEssentialsSetup({ ...essentialsSetup, foodStyle })} />
            <EssentialsSelect label="Laundry access" value={essentialsSetup.laundryAccess} options={["Home", "Outside"]} onChange={(laundryAccess) => setEssentialsSetup({ ...essentialsSetup, laundryAccess })} />
            <EssentialsSelect label="Emergency level" value={essentialsSetup.emergencyLevel} options={["Simple", "Prepared"]} onChange={(emergencyLevel) => setEssentialsSetup({ ...essentialsSetup, emergencyLevel })} />
            <EssentialsSelect label="Restock reminder" value={essentialsSetup.restockReminder} options={["Weekly", "Every 2 weeks", "Monthly"]} onChange={(restockReminder) => setEssentialsSetup({ ...essentialsSetup, restockReminder })} />
          </div>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={setupEverydayEssentials} className="primary-button justify-center">Save Everyday Essentials Plan</button>
            <button type="button" onClick={() => setShowEssentialsSetup(false)} className="secondary-button justify-center">Cancel</button>
          </div>
        </Panel>
      ) : null}

      {showGetLeanSetup ? (
        <GetLeanSetupPanel
          setup={getLeanSetup}
          setSetup={setGetLeanSetup}
          profile={profile}
          onSave={setupGetLeanPlan}
          onCancel={() => setShowGetLeanSetup(false)}
        />
      ) : null}

      {showLearnSetup ? (
        <LearnMasterSetupPanel
          setup={learnSetup}
          setSetup={setLearnSetup}
          onSave={setupLearnMasterPlan}
          onCancel={() => setShowLearnSetup(false)}
        />
      ) : null}

      {showSleepSetup ? (
        <SleepEnergySetupPanel
          setup={sleepSetup}
          setSetup={setSleepSetup}
          onSave={setupSleepEnergyPlan}
          onCancel={() => setShowSleepSetup(false)}
        />
      ) : null}

      {showProjectSetup ? (
        <BuildProjectSetupPanel
          setup={projectSetup}
          setSetup={setProjectSetup}
          onSave={setupBuildProjectPlan}
          onCancel={() => setShowProjectSetup(false)}
        />
      ) : null}

      {showMoneySetup ? (
        <MoneyPlanSetupPanel
          setup={moneySetup}
          setSetup={setMoneySetup}
          onSave={setupMoneyPlan}
          onCancel={() => setShowMoneySetup(false)}
        />
      ) : null}

      {showLifeResetSetup ? (
        <LifeResetSetupPanel
          setup={lifeResetSetup}
          setSetup={setLifeResetSetup}
          onSave={setupLifeResetPlan}
          onCancel={() => setShowLifeResetSetup(false)}
        />
      ) : null}

      {activePlans.length > 0 ? (
        <CollapsibleSection title="Active plan details" subtitle="Open this when you want the full checklist or plan controls." defaultOpen={false}>
          <div className="grid gap-5">
            {activePlans.map((item) => {
              const planSetter: Dispatch<SetStateAction<ActivePlan | null>> = (updater) => updateActivePlan(item.id, updater);
              if (item.type === "everyday_essentials") return <div key={item.id} id={`plan-details-${item.id}`}><EssentialsChecklistManager activePlan={normalizeEverydayEssentialsPlan(item)} setActivePlan={planSetter} /></div>;
              if (item.type === "get_lean_shred") {
                return (
                  <div key={item.id} id={`plan-details-${item.id}`}>
                    <GetLeanPlanDetails
                      activePlan={normalizeGetLeanPlan(item)}
                      setActivePlan={planSetter}
                      foodLibrary={foodLibrary}
                      setFoodLibrary={setFoodLibrary}
                      dailyFoodLogs={dailyFoodLogs}
                      setDailyFoodLogs={setDailyFoodLogs}
                      todayKey={todayKey}
                    />
                  </div>
                );
              }
              if (item.type === "learn_master_subject") return <div key={item.id} id={`plan-details-${item.id}`}><LearnMasterPlanDetails activePlan={normalizeLearnMasterPlan(item)} setActivePlan={planSetter} /></div>;
              if (item.type === "fix_sleep_energy") return <div key={item.id} id={`plan-details-${item.id}`}><SleepEnergyPlanDetails activePlan={normalizeSleepEnergyPlan(item)} setActivePlan={planSetter} /></div>;
              if (item.type === "build_project") return <div key={item.id} id={`plan-details-${item.id}`}><BuildProjectPlanDetails activePlan={normalizeBuildProjectPlan(item)} setActivePlan={planSetter} /></div>;
              if (item.type === "money_plan") {
                return (
                  <div key={item.id} id={`plan-details-${item.id}`}>
                    <MoneyPlanDetails
                      activePlan={normalizeMoneyPlan(item)}
                      setActivePlan={planSetter}
                      spendingLogs={moneySpendingLogs}
                      setSpendingLogs={setMoneySpendingLogs}
                      incomeLogs={moneyIncomeLogs}
                      setIncomeLogs={setMoneyIncomeLogs}
                      savingLogs={moneySavingLogs}
                      setSavingLogs={setMoneySavingLogs}
                      opportunityLogs={moneyOpportunityLogs}
                      setOpportunityLogs={setMoneyOpportunityLogs}
                    />
                  </div>
                );
              }
              if (item.type === "life_reset") return <div key={item.id} id={`plan-details-${item.id}`}><LifeResetPlanDetails activePlan={normalizeLifeResetPlan(item)} setActivePlan={planSetter} /></div>;
              return null;
            })}
          </div>
        </CollapsibleSection>
      ) : null}

      <CollapsibleSection title="Plan Tomorrow" subtitle="Schedule tomorrow's main mission when you are ready." defaultOpen={false}>
        <PlanTomorrow
          plan={plan}
          setPlan={setPlan}
          tomorrowMode={tomorrowMode}
          selectTomorrowMode={selectTomorrowMode}
          findBestTimeSlot={findBestTimeSlot}
          missionPreview={missionPreview}
          updateMissionPreviewAction={updateMissionPreviewAction}
          applyMissionPreview={applyMissionPreview}
          cancelMissionPreview={cancelMissionPreview}
          tomorrowTasks={tomorrowTasks}
        />
      </CollapsibleSection>
    </section>
  );
}

function LongTermPlanningHub({
  planning,
  setPlanning,
  activePlans,
  sendLongTermTaskToToday
}: {
  planning: LongTermPlanningState;
  setPlanning: Dispatch<SetStateAction<LongTermPlanningState>>;
  activePlans: ActivePlan[];
  sendLongTermTaskToToday: (source: "Weekly Mission" | "Next Action", item: WeeklyMission | NextAction) => void;
}) {
  const normalized = normalizeLongTermPlanning(planning);
  const [bigGoalDraft, setBigGoalDraft] = useState<BigGoal>(() => createDefaultBigGoal());
  const [ninetyDayDraft, setNinetyDayDraft] = useState<NinetyDayPlan>(() => createDefaultNinetyDayPlan(normalized.bigGoals[0]?.id));
  const [monthlyDraft, setMonthlyDraft] = useState<MonthlyFocus>(() => createDefaultMonthlyFocus(normalized.ninetyDayPlans[0]?.id));
  const [weeklyDraft, setWeeklyDraft] = useState<WeeklyMission>(() => createDefaultWeeklyMission(normalized.monthlyFocuses[0]?.id));
  const [actionDraft, setActionDraft] = useState<NextAction>(() => createDefaultNextAction(normalized.weeklyMissions[0]?.id));
  const activeCount = activePlans.filter((plan) => plan.status === "active").length;
  const pausedCount = activePlans.filter((plan) => plan.status === "paused").length;
  const archivedCount = activePlans.filter((plan) => plan.status === "archived" || plan.status === "completed").length;

  function updatePlanning(updater: (current: LongTermPlanningState) => LongTermPlanningState) {
    setPlanning((current) => normalizeLongTermPlanning(updater(normalizeLongTermPlanning(current))));
  }

  return (
    <CollapsibleSection title="Long-Term Planning Hub" subtitle="Big goals, 90-day plans, monthly focus, weekly missions, and next actions." defaultOpen={true}>
      <div className="grid gap-5">
        <section className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-100">Active Plans</p>
              <h3 className="mt-2 text-xl font-black text-white">Strategy layer summary</h3>
            </div>
            <button type="button" onClick={() => document.getElementById("active-plan-control-center")?.scrollIntoView({ behavior: "smooth", block: "start" })} className="secondary-button min-h-9 px-3 py-2 text-xs">Open Active Plan Control Center</button>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <MiniMetric compact label="Active" value={activeCount} />
            <MiniMetric compact label="Paused" value={pausedCount} />
            <MiniMetric compact label="Archived / Done" value={archivedCount} />
          </div>
        </section>

        <PlanningFlowHelper />

        <section className="grid gap-5 xl:grid-cols-2">
          <PlanningFormCard title="Big Goals" emptyText="No big goals yet. Create one clear direction.">
            <div className="grid gap-3">
              <Field label="Title"><input value={bigGoalDraft.title} onChange={(event) => setBigGoalDraft({ ...bigGoalDraft, title: event.target.value })} className="form-control" placeholder="Build KPM Sunny into my daily Life OS" /></Field>
              <SelectField label="Category" value={bigGoalDraft.category} options={longTermCategories} onChange={(category) => setBigGoalDraft({ ...bigGoalDraft, category: category as LongTermCategory })} />
              <Field label="Why this matters"><textarea value={bigGoalDraft.why} onChange={(event) => setBigGoalDraft({ ...bigGoalDraft, why: event.target.value })} className="form-control min-h-20" /></Field>
              <Field label="Target result"><input value={bigGoalDraft.targetResult} onChange={(event) => setBigGoalDraft({ ...bigGoalDraft, targetResult: event.target.value })} className="form-control" /></Field>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Target date"><input type="date" value={bigGoalDraft.targetDate} onChange={(event) => setBigGoalDraft({ ...bigGoalDraft, targetDate: event.target.value })} className="form-control" /></Field>
                <SelectField label="Priority" value={bigGoalDraft.priority} options={priorities} onChange={(priority) => setBigGoalDraft({ ...bigGoalDraft, priority: priority as Priority })} />
              </div>
              <Field label="Notes"><textarea value={bigGoalDraft.notes} onChange={(event) => setBigGoalDraft({ ...bigGoalDraft, notes: event.target.value })} className="form-control min-h-20" /></Field>
              <button type="button" onClick={() => {
                if (!bigGoalDraft.title.trim()) return;
                updatePlanning((current) => ({ ...current, bigGoals: upsertById(current.bigGoals, { ...bigGoalDraft, title: bigGoalDraft.title.trim() }) }));
                setBigGoalDraft(createDefaultBigGoal());
              }} className="primary-button justify-center">{normalized.bigGoals.some((goal) => goal.id === bigGoalDraft.id) ? "Save Big Goal" : "Create Big Goal"}</button>
            </div>
          </PlanningFormCard>
          <PlanningList title="Big Goal List" items={normalized.bigGoals} emptyText="No big goals yet. Create one clear direction." render={(goal) => (
            <LongTermCard key={goal.id} title={goal.title} badge={goal.priority} meta={`${goal.category} · ${goal.status}`} detail={goal.targetResult || goal.why || "No target result yet"}>
              <PlanningCardActions edit={() => setBigGoalDraft(goal)} complete={() => updatePlanning((current) => updateBigGoalStatus(current, goal.id, "completed"))} archive={() => updatePlanning((current) => updateBigGoalStatus(current, goal.id, "archived"))} remove={() => window.confirm("Delete this big goal?") && updatePlanning((current) => ({ ...current, bigGoals: current.bigGoals.filter((item) => item.id !== goal.id) }))} />
            </LongTermCard>
          )} />
        </section>

        <section className="grid gap-5 xl:grid-cols-2">
          <PlanningFormCard title="90-Day Plan" emptyText="No 90-day plan yet. Build a bridge between your goal and weekly missions.">
            <div className="grid gap-3">
              <Field label="Title"><input value={ninetyDayDraft.title} onChange={(event) => setNinetyDayDraft({ ...ninetyDayDraft, title: event.target.value })} className="form-control" /></Field>
              <SelectField label="Linked big goal" value={ninetyDayDraft.linkedBigGoalId} options={["", ...normalized.bigGoals.map((goal) => goal.id)]} optionLabels={getBigGoalLabels(normalized.bigGoals)} onChange={(linkedBigGoalId) => setNinetyDayDraft({ ...ninetyDayDraft, linkedBigGoalId })} />
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Start date"><input type="date" value={ninetyDayDraft.startDate} onChange={(event) => setNinetyDayDraft({ ...ninetyDayDraft, startDate: event.target.value })} className="form-control" /></Field>
                <Field label="End date"><input type="date" value={ninetyDayDraft.endDate} onChange={(event) => setNinetyDayDraft({ ...ninetyDayDraft, endDate: event.target.value })} className="form-control" /></Field>
              </div>
              <Field label="Main outcome"><input value={ninetyDayDraft.mainOutcome} onChange={(event) => setNinetyDayDraft({ ...ninetyDayDraft, mainOutcome: event.target.value })} className="form-control" /></Field>
              <Field label="Success definition"><textarea value={ninetyDayDraft.successDefinition} onChange={(event) => setNinetyDayDraft({ ...ninetyDayDraft, successDefinition: event.target.value })} className="form-control min-h-20" /></Field>
              <Field label="3 key milestones"><textarea value={ninetyDayDraft.milestones.map((milestone) => milestone.title).join("\n")} onChange={(event) => setNinetyDayDraft({ ...ninetyDayDraft, milestones: linesToMilestones(event.target.value) })} className="form-control min-h-24" placeholder={"Use app daily for 7 days\nTrack food and money for 30 days\nBuild one feature weekly"} /></Field>
              <Field label="Risks / blockers"><textarea value={ninetyDayDraft.risks} onChange={(event) => setNinetyDayDraft({ ...ninetyDayDraft, risks: event.target.value })} className="form-control min-h-20" /></Field>
              <button type="button" onClick={() => {
                if (!ninetyDayDraft.title.trim()) return;
                updatePlanning((current) => ({ ...current, ninetyDayPlans: upsertById(current.ninetyDayPlans, { ...ninetyDayDraft, title: ninetyDayDraft.title.trim() }) }));
                setNinetyDayDraft(createDefaultNinetyDayPlan(normalized.bigGoals[0]?.id));
              }} className="primary-button justify-center">{normalized.ninetyDayPlans.some((item) => item.id === ninetyDayDraft.id) ? "Save 90-Day Plan" : "Create 90-Day Plan"}</button>
            </div>
          </PlanningFormCard>
          <PlanningList title="90-Day Plans" items={normalized.ninetyDayPlans} emptyText="No 90-day plan yet. Build a bridge between your goal and weekly missions." render={(item) => (
            <LongTermCard key={item.id} title={item.title} badge={item.status} meta={`${item.startDate || "No start"} -> ${item.endDate || "No end"}`} detail={item.mainOutcome || item.successDefinition || "No main outcome yet"}>
              <PlanningCardActions edit={() => setNinetyDayDraft(item)} complete={() => updatePlanning((current) => updateNinetyDayStatus(current, item.id, "completed"))} archive={() => updatePlanning((current) => updateNinetyDayStatus(current, item.id, "archived"))} remove={() => window.confirm("Delete this 90-day plan?") && updatePlanning((current) => ({ ...current, ninetyDayPlans: current.ninetyDayPlans.filter((plan) => plan.id !== item.id) }))} />
            </LongTermCard>
          )} />
        </section>

        <section className="grid gap-5 xl:grid-cols-2">
          <PlanningFormCard title="Monthly Focus" emptyText="No monthly focus yet. Choose what matters most this month.">
            <div className="grid gap-3">
              <Field label="Month"><input type="month" value={monthlyDraft.month} onChange={(event) => setMonthlyDraft({ ...monthlyDraft, month: event.target.value })} className="form-control" /></Field>
              <Field label="Focus title"><input value={monthlyDraft.focusTitle} onChange={(event) => setMonthlyDraft({ ...monthlyDraft, focusTitle: event.target.value })} className="form-control" /></Field>
              <SelectField label="Linked 90-day plan" value={monthlyDraft.linkedNinetyDayPlanId} options={["", ...normalized.ninetyDayPlans.map((item) => item.id)]} optionLabels={getNinetyDayLabels(normalized.ninetyDayPlans)} onChange={(linkedNinetyDayPlanId) => setMonthlyDraft({ ...monthlyDraft, linkedNinetyDayPlanId })} />
              <SelectField label="Focus area" value={monthlyDraft.focusArea} options={monthlyFocusAreas} onChange={(focusArea) => setMonthlyDraft({ ...monthlyDraft, focusArea: focusArea as MonthlyFocus["focusArea"] })} />
              <Field label="Main target"><input value={monthlyDraft.mainTarget} onChange={(event) => setMonthlyDraft({ ...monthlyDraft, mainTarget: event.target.value })} className="form-control" /></Field>
              <Field label="Must-do list"><textarea value={monthlyDraft.mustDo} onChange={(event) => setMonthlyDraft({ ...monthlyDraft, mustDo: event.target.value })} className="form-control min-h-20" /></Field>
              <Field label="Avoid list"><textarea value={monthlyDraft.avoid} onChange={(event) => setMonthlyDraft({ ...monthlyDraft, avoid: event.target.value })} className="form-control min-h-20" /></Field>
              <button type="button" onClick={() => {
                if (!monthlyDraft.focusTitle.trim()) return;
                updatePlanning((current) => ({ ...current, monthlyFocuses: upsertById(current.monthlyFocuses, { ...monthlyDraft, focusTitle: monthlyDraft.focusTitle.trim() }) }));
                setMonthlyDraft(createDefaultMonthlyFocus(normalized.ninetyDayPlans[0]?.id));
              }} className="primary-button justify-center">{normalized.monthlyFocuses.some((item) => item.id === monthlyDraft.id) ? "Save Monthly Focus" : "Create Monthly Focus"}</button>
            </div>
          </PlanningFormCard>
          <PlanningList title="Monthly Focuses" items={normalized.monthlyFocuses} emptyText="No monthly focus yet. Choose what matters most this month." render={(item) => (
            <LongTermCard key={item.id} title={item.focusTitle} badge={item.status} meta={`${item.month || "No month"} · ${item.focusArea}`} detail={item.mainTarget || "No main target yet"}>
              <PlanningCardActions edit={() => setMonthlyDraft(item)} complete={() => updatePlanning((current) => updateMonthlyFocusStatus(current, item.id, "completed"))} archive={() => updatePlanning((current) => updateMonthlyFocusStatus(current, item.id, "archived"))} remove={() => window.confirm("Delete this monthly focus?") && updatePlanning((current) => ({ ...current, monthlyFocuses: current.monthlyFocuses.filter((focus) => focus.id !== item.id) }))} />
            </LongTermCard>
          )} />
        </section>

        <section className="grid gap-5 xl:grid-cols-2">
          <PlanningFormCard title="Weekly Missions" emptyText="No weekly missions yet. Create 1-3 missions for this week.">
            <div className="grid gap-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Week start"><input type="date" value={weeklyDraft.weekStartDate} onChange={(event) => setWeeklyDraft({ ...weeklyDraft, weekStartDate: event.target.value })} className="form-control" /></Field>
                <Field label="Week end"><input type="date" value={weeklyDraft.weekEndDate} onChange={(event) => setWeeklyDraft({ ...weeklyDraft, weekEndDate: event.target.value })} className="form-control" /></Field>
              </div>
              <Field label="Title"><input value={weeklyDraft.title} onChange={(event) => setWeeklyDraft({ ...weeklyDraft, title: event.target.value })} className="form-control" /></Field>
              <SelectField label="Linked monthly focus" value={weeklyDraft.linkedMonthlyFocusId} options={["", ...normalized.monthlyFocuses.map((item) => item.id)]} optionLabels={getMonthlyFocusLabels(normalized.monthlyFocuses)} onChange={(linkedMonthlyFocusId) => setWeeklyDraft({ ...weeklyDraft, linkedMonthlyFocusId })} />
              <div className="grid gap-3 sm:grid-cols-2">
                <SelectField label="Mission type" value={weeklyDraft.missionType} options={weeklyMissionTypes} onChange={(missionType) => setWeeklyDraft({ ...weeklyDraft, missionType: missionType as WeeklyMissionType })} />
                <SelectField label="Category" value={weeklyDraft.category} options={longTermCategories} onChange={(category) => setWeeklyDraft({ ...weeklyDraft, category: category as LongTermCategory })} />
                <SelectField label="Priority" value={weeklyDraft.priority} options={priorities} onChange={(priority) => setWeeklyDraft({ ...weeklyDraft, priority: priority as Priority })} />
                <SelectField label="Status" value={weeklyDraft.status} options={weeklyMissionStatuses} onChange={(status) => setWeeklyDraft({ ...weeklyDraft, status: status as WeeklyMissionStatus })} />
              </div>
              <Field label="Target result"><input value={weeklyDraft.targetResult} onChange={(event) => setWeeklyDraft({ ...weeklyDraft, targetResult: event.target.value })} className="form-control" /></Field>
              <Field label="Notes"><textarea value={weeklyDraft.notes} onChange={(event) => setWeeklyDraft({ ...weeklyDraft, notes: event.target.value })} className="form-control min-h-20" /></Field>
              <button type="button" onClick={() => {
                if (!weeklyDraft.title.trim()) return;
                updatePlanning((current) => ({ ...current, weeklyMissions: upsertById(current.weeklyMissions, { ...weeklyDraft, title: weeklyDraft.title.trim() }) }));
                setWeeklyDraft(createDefaultWeeklyMission(normalized.monthlyFocuses[0]?.id));
              }} className="primary-button justify-center">{normalized.weeklyMissions.some((item) => item.id === weeklyDraft.id) ? "Save Weekly Mission" : "Create Weekly Mission"}</button>
            </div>
          </PlanningFormCard>
          <PlanningList title="Weekly Mission List" items={normalized.weeklyMissions} emptyText="No weekly missions yet. Create 1-3 missions for this week." render={(item) => (
            <LongTermCard key={item.id} title={item.title} badge={item.priority} meta={`${item.missionType} · ${item.status}`} detail={item.targetResult || item.notes || "No target result yet"}>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => sendLongTermTaskToToday("Weekly Mission", item)} className="secondary-button min-h-9 px-3 py-2 text-xs">Send to Today</button>
                <PlanningCardActions edit={() => setWeeklyDraft(item)} complete={() => updatePlanning((current) => updateWeeklyMissionStatus(current, item.id, "completed"))} archive={() => updatePlanning((current) => updateWeeklyMissionStatus(current, item.id, "skipped"))} remove={() => window.confirm("Delete this weekly mission?") && updatePlanning((current) => ({ ...current, weeklyMissions: current.weeklyMissions.filter((mission) => mission.id !== item.id) }))} />
              </div>
            </LongTermCard>
          )} />
        </section>

        <section className="grid gap-5 xl:grid-cols-2">
          <PlanningFormCard title="Next Actions" emptyText="No next actions yet. Break a weekly mission into one small action.">
            <div className="grid gap-3">
              <Field label="Title"><input value={actionDraft.title} onChange={(event) => setActionDraft({ ...actionDraft, title: event.target.value })} className="form-control" /></Field>
              <SelectField label="Linked weekly mission" value={actionDraft.linkedWeeklyMissionId} options={["", ...normalized.weeklyMissions.map((item) => item.id)]} optionLabels={getWeeklyMissionLabels(normalized.weeklyMissions)} onChange={(linkedWeeklyMissionId) => setActionDraft({ ...actionDraft, linkedWeeklyMissionId })} />
              <div className="grid gap-3 sm:grid-cols-2">
                <SelectField label="Estimated time" value={actionDraft.estimatedTime} options={nextActionTimes} onChange={(estimatedTime) => setActionDraft({ ...actionDraft, estimatedTime: estimatedTime as NextAction["estimatedTime"] })} />
                <SelectField label="Category" value={actionDraft.category} options={longTermCategories} onChange={(category) => setActionDraft({ ...actionDraft, category: category as LongTermCategory })} />
                <SelectField label="Priority" value={actionDraft.priority} options={priorities} onChange={(priority) => setActionDraft({ ...actionDraft, priority: priority as Priority })} />
                <SelectField label="Status" value={actionDraft.status} options={nextActionStatuses} onChange={(status) => setActionDraft({ ...actionDraft, status: status as NextActionStatus })} />
              </div>
              <button type="button" onClick={() => {
                if (!actionDraft.title.trim()) return;
                updatePlanning((current) => ({ ...current, nextActions: upsertById(current.nextActions, { ...actionDraft, title: actionDraft.title.trim() }) }));
                setActionDraft(createDefaultNextAction(normalized.weeklyMissions[0]?.id));
              }} className="primary-button justify-center">{normalized.nextActions.some((item) => item.id === actionDraft.id) ? "Save Next Action" : "Create Next Action"}</button>
            </div>
          </PlanningFormCard>
          <PlanningList title="Next Action List" items={normalized.nextActions} emptyText="No next actions yet. Break a weekly mission into one small action." render={(item) => (
            <LongTermCard key={item.id} title={item.title} badge={item.priority} meta={`${item.estimatedTime} · ${item.status}`} detail={getLinkedWeeklyMissionTitle(normalized.weeklyMissions, item.linkedWeeklyMissionId)}>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => sendLongTermTaskToToday("Next Action", item)} className="secondary-button min-h-9 px-3 py-2 text-xs">Send to Today</button>
                <PlanningCardActions edit={() => setActionDraft(item)} complete={() => updatePlanning((current) => updateNextActionStatus(current, item.id, "completed"))} archive={() => updatePlanning((current) => updateNextActionStatus(current, item.id, "archived"))} remove={() => window.confirm("Delete this next action?") && updatePlanning((current) => ({ ...current, nextActions: current.nextActions.filter((action) => action.id !== item.id) }))} />
              </div>
            </LongTermCard>
          )} />
        </section>
      </div>
    </CollapsibleSection>
  );
}

function PlanningFlowHelper() {
  return (
    <section className="rounded-2xl border border-cyan-200/15 bg-cyan-300/[0.055] p-4">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-100">Planning Flow Helper</p>
      <div className="mt-3 grid gap-2 md:grid-cols-5">
        {["Create Big Goal", "Create 90-Day Plan", "Create Monthly Focus", "Create Weekly Missions", "Create Next Actions"].map((step, index) => (
          <div key={step} className="rounded-xl border border-white/10 bg-black/20 p-3">
            <p className="text-xs font-black text-amber-100">Step {index + 1}</p>
            <p className="mt-1 text-sm font-black text-white">{step}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function PlanningFormCard({ title, emptyText, children }: { title: string; emptyText: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <h3 className="font-black text-white">{title}</h3>
      <p className="mt-1 text-sm text-slate-400">{emptyText}</p>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function PlanningList<T>({ title, items, emptyText, render }: { title: string; items: T[]; emptyText: string; render: (item: T) => ReactNode }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <h3 className="font-black text-white">{title}</h3>
      <div className="mt-4 grid gap-3">
        {items.length ? items.map(render) : <p className="text-sm text-slate-400">{emptyText}</p>}
      </div>
    </section>
  );
}

function LongTermCard({ title, badge, meta, detail, children }: { title: string; badge: string; meta: string; detail: string; children: ReactNode }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h4 className="break-words font-black text-white">{title || "Untitled"}</h4>
          <p className="mt-1 break-words text-sm text-slate-400">{meta}</p>
        </div>
        <Badge tone="dark">{badge}</Badge>
      </div>
      <p className="mt-3 break-words text-sm leading-6 text-slate-300">{detail}</p>
      <div className="mt-4">{children}</div>
    </article>
  );
}

function PlanningCardActions({ edit, complete, archive, remove }: { edit: () => void; complete: () => void; archive: () => void; remove: () => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      <button type="button" onClick={edit} className="secondary-button min-h-9 px-3 py-2 text-xs">Edit</button>
      <button type="button" onClick={complete} className="secondary-button min-h-9 px-3 py-2 text-xs">Complete</button>
      <button type="button" onClick={archive} className="secondary-button min-h-9 px-3 py-2 text-xs">Archive</button>
      <button type="button" onClick={remove} className="danger-button min-h-9 px-3 py-2 text-xs">Delete</button>
    </div>
  );
}

function ActivePlansManager({
  activePlans,
  updateActivePlan,
  updatePlanStatus
}: {
  activePlans: ActivePlan[];
  updateActivePlan: (planId: string, updater: SetStateAction<ActivePlan | null>) => void;
  updatePlanStatus: (planId: string, status: PlanStatus) => void;
}) {
  const [filter, setFilter] = useState<PlanStatus | "all">("active");
  const [openPlanId, setOpenPlanId] = useState<string | null>(null);
  const [editPlanId, setEditPlanId] = useState<string | null>(null);
  const [reviewPlanId, setReviewPlanId] = useState<string | null>(null);
  const visiblePlans = activePlans.filter((plan) => filter === "all" ? true : plan.status === filter);
  const openPlan = activePlans.find((plan) => plan.id === openPlanId);
  const editPlan = activePlans.find((plan) => plan.id === editPlanId);
  const reviewPlan = activePlans.find((plan) => plan.id === reviewPlanId);

  function archivePlan(plan: ActivePlan) {
    updatePlanStatus(plan.id, "archived");
    if (openPlanId === plan.id) setOpenPlanId(null);
  }

  function deletePlan(plan: ActivePlan) {
    if (!window.confirm(`Delete "${getPlanDisplayName(plan)}" permanently from this device? This removes its setup and logs.`)) return;
    updateActivePlan(plan.id, null);
    if (openPlanId === plan.id) setOpenPlanId(null);
    if (editPlanId === plan.id) setEditPlanId(null);
    if (reviewPlanId === plan.id) setReviewPlanId(null);
  }

  return (
    <Panel>
      <span id="active-plan-control-center" className="block scroll-mt-24" />
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-amber-200">Active Plan Control Center</p>
          <h3 className="mt-2 text-2xl font-black text-white">Control every life system from one place</h3>
          <p className="mt-1 text-sm leading-6 text-slate-400">Open, edit, pause, review, and archive plans. Only active plans send tasks to Today.</p>
        </div>
        <Badge tone="dark">{activePlans.length} plans</Badge>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {(["active", "paused", "archived", "all"] as Array<PlanStatus | "all">).map((option) => (
          <button key={option} type="button" onClick={() => setFilter(option)} className={`rounded-full border px-3 py-2 text-xs font-black uppercase tracking-[0.14em] ${filter === option ? "border-amber-200/50 bg-amber-300/[0.12] text-amber-100" : "border-white/10 bg-white/[0.04] text-slate-300"}`}>
            {option === "all" ? "All" : option}
          </button>
        ))}
      </div>

      {activePlans.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm leading-6 text-slate-300">
          No active plans yet. Set up a preset plan below to start.
        </div>
      ) : visiblePlans.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm leading-6 text-slate-300">
          No plans match this filter.
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {visiblePlans.map((plan) => (
            <article key={plan.id} className="rounded-[1.35rem] border border-white/10 bg-black/20 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h4 className="break-words text-lg font-black text-white">{getPlanDisplayName(plan)}</h4>
                  <p className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">{formatPlanType(plan.type)}</p>
                </div>
                <Badge tone={plan.status === "active" ? "green" : plan.status === "paused" ? "orange" : "dark"}>{plan.status}</Badge>
              </div>
              <div className="mt-3 grid gap-2 text-sm leading-6 text-slate-400">
                <SummaryRow label="Started" value={plan.startDate || "Unknown"} />
                <SummaryRow label="Today tasks" value={`${getPlanCompletion(plan).completed}/${getPlanCompletion(plan).total}`} />
                <SummaryRow label="Weekly" value={getPlanWeeklyCompletionText(plan)} />
                <SummaryRow label="Last log" value={getPlanLastLogText(plan)} />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" onClick={() => setOpenPlanId(openPlanId === plan.id ? null : plan.id)} className="secondary-button min-h-9 px-3 py-2 text-xs">Open</button>
                <button type="button" onClick={() => setEditPlanId(plan.id)} className="secondary-button min-h-9 px-3 py-2 text-xs">Edit Setup</button>
                {plan.status === "active" ? (
                  <button type="button" onClick={() => updatePlanStatus(plan.id, "paused")} className="secondary-button min-h-9 px-3 py-2 text-xs">Pause</button>
                ) : (
                  <button type="button" onClick={() => updatePlanStatus(plan.id, "active")} className="secondary-button min-h-9 px-3 py-2 text-xs">Resume</button>
                )}
                <button type="button" onClick={() => setReviewPlanId(plan.id)} className="secondary-button min-h-9 px-3 py-2 text-xs">Weekly Review</button>
                <button type="button" onClick={() => archivePlan(plan)} className="danger-button min-h-9 px-3 py-2 text-xs">Archive</button>
              </div>
            </article>
          ))}
        </div>
      )}

      {openPlan ? (
        <PlanControlDetail
          plan={openPlan}
          updatePlanStatus={updatePlanStatus}
          editPlan={() => setEditPlanId(openPlan.id)}
          reviewPlan={() => setReviewPlanId(openPlan.id)}
          deletePlan={() => deletePlan(openPlan)}
        />
      ) : null}

      {editPlan ? (
        <PlanSetupEditor plan={editPlan} updateActivePlan={updateActivePlan} close={() => setEditPlanId(null)} />
      ) : null}

      {reviewPlan ? (
        <PlanWeeklyReviewEditor plan={reviewPlan} updateActivePlan={updateActivePlan} close={() => setReviewPlanId(null)} />
      ) : null}
    </Panel>
  );
}

function WeeklyReviewsDue({ plans }: { plans: ActivePlan[] }) {
  return (
    <Panel compact>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-amber-200">Weekly Reviews Due</p>
          <h3 className="mt-2 text-xl font-black text-white">Plans that need a review</h3>
        </div>
        <Badge tone={plans.length ? "orange" : "green"}>{plans.length ? `${plans.length} due` : "Clear"}</Badge>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {plans.length ? plans.map((plan) => (
          <article key={plan.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <h4 className="break-words font-black text-white">{getPlanDisplayName(plan)}</h4>
            <p className="mt-1 text-sm text-slate-400">Last review: {getPlanWeeklyReviews(plan).at(-1)?.date ?? "No review yet"}</p>
            <p className="mt-3 text-xs font-bold uppercase tracking-[0.16em] text-amber-100">Use Weekly Review in Active Plan Control Center</p>
          </article>
        )) : <p className="text-sm text-slate-400">No weekly reviews due right now.</p>}
      </div>
    </Panel>
  );
}

function ArchivedPlansSection({ plans, updatePlanStatus }: { plans: ActivePlan[]; updatePlanStatus: (planId: string, status: PlanStatus) => void }) {
  return (
    <CollapsibleSection title="Archived / Completed Plans" subtitle="Paused history stays here. Restore only when useful." defaultOpen={false}>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {plans.length ? plans.map((plan) => (
          <article key={plan.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="flex items-start justify-between gap-3">
              <h4 className="break-words font-black text-white">{getPlanDisplayName(plan)}</h4>
              <Badge tone="dark">{plan.status}</Badge>
            </div>
            <p className="mt-1 text-sm text-slate-400">{formatPlanType(plan.type)} · Started {plan.startDate || "Unknown"}</p>
            <button type="button" onClick={() => updatePlanStatus(plan.id, "active")} className="secondary-button mt-4 w-full justify-center">Restore / Reopen</button>
          </article>
        )) : <p className="text-sm text-slate-400">No archived or completed plans yet.</p>}
      </div>
    </CollapsibleSection>
  );
}

function PlanProgressSummaryCard({ activePlan }: { activePlan: ActivePlan }) {
  const progress = getPlanCompletion(activePlan);
  const lastLog = getPlanLastLogText(activePlan);
  return (
    <article className="rounded-[1.35rem] border border-white/10 bg-black/20 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h4 className="break-words text-lg font-black text-white">{getPlanDisplayName(activePlan)}</h4>
          <p className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">{formatPlanType(activePlan.type)}</p>
        </div>
        <Badge tone={activePlan.status === "active" ? "green" : activePlan.status === "paused" ? "orange" : "dark"}>{activePlan.status}</Badge>
      </div>
      <div className="mt-4 grid gap-3">
        <MiniMetric label="Today Completion" value={`${progress.completed}/${progress.total}`} />
        <MiniMetric label="Weekly Completion" value={getPlanWeeklyCompletionText(activePlan)} />
        <MiniMetric label="Last Log" value={lastLog} />
      </div>
    </article>
  );
}

function ProgressPlanReviewCard({
  plan,
  todayKey,
  dailyFoodLogs,
  moneySpendingLogs,
  moneyIncomeLogs,
  moneySavingLogs,
  moneyOpportunityLogs
}: {
  plan: ActivePlan;
  todayKey: string;
  dailyFoodLogs: DailyFoodLogs;
  moneySpendingLogs: MoneySpendingLog[];
  moneyIncomeLogs: MoneyIncomeLog[];
  moneySavingLogs: MoneySavingLog[];
  moneyOpportunityLogs: MoneyOpportunityLog[];
}) {
  const progress = getPlanCompletion(plan);
  const rows = getProgressPlanRows(plan, todayKey, dailyFoodLogs, moneySpendingLogs, moneyIncomeLogs, moneySavingLogs, moneyOpportunityLogs);
  const percent = progress.total ? Math.round((progress.completed / progress.total) * 100) : 0;

  return (
    <article className="rounded-[1.35rem] border border-white/10 bg-black/20 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h4 className="break-words text-lg font-black text-white">{getPlanDisplayName(plan)}</h4>
          <p className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">{formatPlanType(plan.type)}</p>
        </div>
        <Badge tone={plan.status === "active" ? "green" : plan.status === "paused" ? "orange" : "dark"}>{plan.status}</Badge>
      </div>
      <div className="mt-4">
        <ProgressLine label="Today tasks" value={progress.completed} total={Math.max(progress.total, 1)} percent={percent} />
      </div>
      <div className="mt-4 grid gap-2 text-sm">
        {rows.map((row) => <SummaryRow key={row.label} label={row.label} value={row.value} />)}
      </div>
    </article>
  );
}

function LongStudyProgressCard({ sessions, reviews }: { sessions: LongStudySession[]; reviews: LongStudyReview[] }) {
  const latest = [...sessions].sort((a, b) => b.date.localeCompare(a.date)).at(0);
  if (!latest) {
    return (
      <article className="rounded-[1.35rem] border border-white/10 bg-black/20 p-4">
        <h4 className="font-black text-white">Long Study Event</h4>
        <p className="mt-2 text-sm text-slate-400">No long study events yet.</p>
      </article>
    );
  }
  const review = reviews.find((item) => item.sessionId === latest.id);
  return (
    <article className="rounded-[1.35rem] border border-cyan-200/15 bg-cyan-300/[0.055] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="break-words text-lg font-black text-white">{latest.eventName}</h4>
          <p className="mt-1 text-sm text-slate-400">{latest.subject} · {latest.date}</p>
        </div>
        <Badge tone={review ? "green" : "orange"}>{review ? "reviewed" : "review due"}</Badge>
      </div>
      <div className="mt-4 grid gap-2 text-sm">
        <SummaryRow label="Planned study" value={`${latest.plannedStudyMinutes} min`} />
        <SummaryRow label="Completed study" value={review ? `${roundMacro(review.totalStudyHoursCompleted)}h` : "No review yet"} />
        <SummaryRow label="Finish estimate" value={latest.estimatedFinishTime} />
      </div>
    </article>
  );
}

function LogsCenter({
  activePlans,
  dailyFoodLogs,
  moneySpendingLogs,
  moneyIncomeLogs,
  moneySavingLogs,
  moneyOpportunityLogs,
  longStudyReviews
}: {
  activePlans: ActivePlan[];
  dailyFoodLogs: DailyFoodLogs;
  moneySpendingLogs: MoneySpendingLog[];
  moneyIncomeLogs: MoneyIncomeLog[];
  moneySavingLogs: MoneySavingLog[];
  moneyOpportunityLogs: MoneyOpportunityLog[];
  longStudyReviews: LongStudyReview[];
}) {
  const foodDays = Object.entries(dailyFoodLogs).filter(([, entries]) => entries.length > 0).length;
  const sleepLogs = activePlans.filter((plan): plan is SleepEnergyPlan => plan.type === "fix_sleep_energy").flatMap((plan) => normalizeSleepEnergyPlan(plan).logs);
  const projectLogs = activePlans.filter((plan): plan is BuildProjectPlan => plan.type === "build_project").flatMap((plan) => normalizeBuildProjectPlan(plan).logs);
  const lifeResetLogs = activePlans.filter((plan): plan is LifeResetPlan => plan.type === "life_reset").flatMap((plan) => normalizeLifeResetPlan(plan).logs);
  const weeklyReviews = activePlans.flatMap((plan) => getPlanWeeklyReviews(plan).map((review) => ({ ...review, planName: getPlanDisplayName(plan) })));

  return (
    <Panel>
      <p className="text-sm font-black uppercase tracking-[0.2em] text-amber-200">Logs Center</p>
      <h3 className="mt-2 text-2xl font-black text-white">Everything recorded</h3>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Grouped logs stay readable here. Detailed log editors remain below when you need to update entries.</p>
      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <LogSummaryCard title="Food Logs" value={`${foodDays} days`} detail={foodDays ? "Food entries saved" : "No food logs yet"} />
        <LogSummaryCard title="Sleep Logs" value={sleepLogs.length} detail={sleepLogs.at(-1)?.date ?? "No sleep logs yet"} />
        <LogSummaryCard title="Money Logs" value={moneySpendingLogs.length + moneyIncomeLogs.length + moneySavingLogs.length + moneyOpportunityLogs.length} detail={`${moneySpendingLogs.length} spending · ${moneyIncomeLogs.length} income · ${moneySavingLogs.length} saving`} />
        <LogSummaryCard title="Project Logs" value={projectLogs.length} detail={projectLogs.at(-1)?.date ?? "No project logs yet"} />
        <LogSummaryCard title="Life Reset Logs" value={lifeResetLogs.length} detail={lifeResetLogs.at(-1)?.date ?? "No life reset logs yet"} />
        <LogSummaryCard title="Long Study Event Reviews" value={longStudyReviews.length} detail={longStudyReviews.at(-1)?.date ?? "No long study reviews yet"} />
        <LogSummaryCard title="Weekly Reviews" value={weeklyReviews.length} detail={weeklyReviews.at(-1) ? `${weeklyReviews.at(-1)?.planName} · ${weeklyReviews.at(-1)?.date}` : "No weekly reviews yet"} />
      </div>
    </Panel>
  );
}

function LogSummaryCard({ title, value, detail }: { title: string; value: string | number; detail: string }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">{title}</p>
      <p className="mt-2 text-2xl font-black text-white">{value}</p>
      <p className="mt-1 break-words text-sm text-slate-400">{detail}</p>
    </article>
  );
}

function LongTermPlanningProgressSummary({ planning, todayKey }: { planning: LongTermPlanningState; todayKey: string }) {
  const normalized = normalizeLongTermPlanning(planning);
  const overdueMissions = normalized.weeklyMissions.filter((mission) => mission.status !== "completed" && mission.status !== "skipped" && mission.weekEndDate && mission.weekEndDate < todayKey).length;
  return (
    <Panel>
      <p className="text-sm font-black uppercase tracking-[0.2em] text-amber-200">Long-Term Planning Summary</p>
      <h3 className="mt-2 text-2xl font-black text-white">Strategy progress</h3>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <MiniMetric label="Active Big Goals" value={normalized.bigGoals.filter((goal) => goal.status === "active").length} />
        <MiniMetric label="Active 90-Day Plans" value={normalized.ninetyDayPlans.filter((plan) => plan.status === "active").length} />
        <MiniMetric label="Monthly Focus Count" value={normalized.monthlyFocuses.length} />
        <MiniMetric label="Weekly Missions Completed" value={normalized.weeklyMissions.filter((mission) => mission.status === "completed").length} />
        <MiniMetric label="Next Actions Completed" value={normalized.nextActions.filter((action) => action.status === "completed").length} />
        <MiniMetric label="Overdue Missions" value={overdueMissions} />
      </div>
    </Panel>
  );
}

function RealUseTestSection({ logs, setLogs, todayKey }: { logs: RealUseTestLog[]; setLogs: Dispatch<SetStateAction<RealUseTestLog[]>>; todayKey: string }) {
  const normalizedLogs = normalizeRealUseTestLogs(logs);
  const existingTodayLog = normalizedLogs.find((log) => log.date === todayKey);
  const [draft, setDraft] = useState<RealUseTestLog>(() => existingTodayLog ?? createDefaultRealUseTestLog(todayKey));
  const summary = getRealUseTestSummary(normalizedLogs, todayKey);

  useEffect(() => {
    setDraft(existingTodayLog ?? createDefaultRealUseTestLog(todayKey));
  }, [existingTodayLog, todayKey]);

  function updateDraft(patch: Partial<RealUseTestLog>) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  function saveLog() {
    setLogs((current) => {
      const nextLog = normalizeRealUseTestLog(draft);
      return [nextLog, ...normalizeRealUseTestLogs(current).filter((log) => log.date !== nextLog.date)]
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 30);
    });
  }

  return (
    <Panel>
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-amber-200">7-Day Real Use Test</p>
          <h3 className="mt-2 text-2xl font-black text-white">What works in real life?</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">One small daily log for testing friction, usefulness, bugs, and what to improve next.</p>
        </div>
        <Badge tone={existingTodayLog ? "green" : "orange"}>{existingTodayLog ? "Today saved" : "Today not saved"}</Badge>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <MiniMetric label="Days App Opened" value={`${summary.daysOpened}/7`} />
        <MiniMetric label="Build Today Used" value={`${summary.buildTodayDays}/7`} />
        <MiniMetric label="Avg Usefulness" value={`${summary.averageUsefulness}/10`} />
        <MiniMetric label="Common Annoyance" value={summary.commonAnnoyance} />
        <MiniMetric label="Requested Improvement" value={summary.requestedImprovement} />
        <MiniMetric label="Bugs Reported" value={summary.bugsReported} />
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        <section className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <h4 className="font-black text-white">Today&apos;s test log</h4>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <RealUseToggle label="Opened app today" checked={draft.openedApp} onChange={(openedApp) => updateDraft({ openedApp })} />
            <RealUseToggle label="Used Build Today" checked={draft.usedBuildToday} onChange={(usedBuildToday) => updateDraft({ usedBuildToday })} />
            <Field label="Today helped me know what to do">
              <select value={draft.todayHelpfulness} onChange={(event) => updateDraft({ todayHelpfulness: Number(event.target.value) || 5 })} className="form-control">
                {Array.from({ length: 10 }, (_, index) => index + 1).map((score) => <option key={score} value={score}>{score}/10</option>)}
              </select>
            </Field>
            <RealUseToggle label="Used Start Mission" checked={draft.usedStartMission} onChange={(usedStartMission) => updateDraft({ usedStartMission })} />
            <RealUseToggle label="Logged food" checked={draft.loggedFood} onChange={(loggedFood) => updateDraft({ loggedFood })} />
            <RealUseToggle label="Logged money" checked={draft.loggedMoney} onChange={(loggedMoney) => updateDraft({ loggedMoney })} />
            <RealUseToggle label="Logged sleep / energy" checked={draft.loggedSleepEnergy} onChange={(loggedSleepEnergy) => updateDraft({ loggedSleepEnergy })} />
          </div>
          <div className="mt-4 grid gap-4">
            <Field label="What felt useful?"><textarea value={draft.useful} onChange={(event) => updateDraft({ useful: event.target.value })} className="form-control min-h-20" /></Field>
            <Field label="What felt annoying?"><textarea value={draft.annoying} onChange={(event) => updateDraft({ annoying: event.target.value })} className="form-control min-h-20" /></Field>
            <Field label="What was too many clicks?"><textarea value={draft.tooManyClicks} onChange={(event) => updateDraft({ tooManyClicks: event.target.value })} className="form-control min-h-20" /></Field>
            <Field label="What did I ignore?"><textarea value={draft.ignored} onChange={(event) => updateDraft({ ignored: event.target.value })} className="form-control min-h-20" /></Field>
            <Field label="What broke?"><textarea value={draft.broke} onChange={(event) => updateDraft({ broke: event.target.value })} className="form-control min-h-20" /></Field>
            <Field label="One thing to improve next"><textarea value={draft.improveNext} onChange={(event) => updateDraft({ improveNext: event.target.value })} className="form-control min-h-20" /></Field>
          </div>
          <button type="button" onClick={saveLog} className="primary-button mt-5 w-full justify-center">Save Today&apos;s Test Log</button>
        </section>

        <section className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <h4 className="font-black text-white">Recent test days</h4>
          <div className="mt-4 grid gap-2">
            {summary.recentLogs.length ? summary.recentLogs.map((log) => (
              <SummaryRow key={log.date} label={log.date} value={`${log.todayHelpfulness}/10 · ${log.openedApp ? "opened" : "not opened"}${log.broke.trim() ? " · bug noted" : ""}`} />
            )) : <p className="text-sm text-slate-400">No real-use test logs yet.</p>}
          </div>
        </section>
      </div>
    </Panel>
  );
}

function RealUseToggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex min-h-[3.25rem] items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-black text-white">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-5 w-5 accent-cyan-300" />
      {label}
    </label>
  );
}

function PlanControlDetail({
  plan,
  updatePlanStatus,
  editPlan,
  reviewPlan,
  deletePlan
}: {
  plan: ActivePlan;
  updatePlanStatus: (planId: string, status: PlanStatus) => void;
  editPlan: () => void;
  reviewPlan: () => void;
  deletePlan: () => void;
}) {
  const setupRows = getPlanSetupRows(plan);
  const targetRows = getPlanTargetRows(plan);
  const todayRows = getPlanTodayTaskRows(plan);
  const weeklyRows = getPlanWeeklyRows(plan);
  const reviewCount = getPlanWeeklyReviews(plan).length;

  return (
    <section className="mt-5 rounded-[1.35rem] border border-cyan-200/15 bg-cyan-300/[0.055] p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-100">Plan Detail View</p>
          <h3 className="mt-2 break-words text-2xl font-black text-white">{getPlanDisplayName(plan)}</h3>
          <p className="mt-1 text-sm leading-6 text-slate-400">{formatPlanType(plan.type)} · {plan.status} · Started {plan.startDate || "Unknown"}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={editPlan} className="secondary-button min-h-9 px-3 py-2 text-xs">Edit Setup</button>
          <button type="button" onClick={() => updatePlanStatus(plan.id, plan.status === "active" ? "paused" : "active")} className="secondary-button min-h-9 px-3 py-2 text-xs">{plan.status === "active" ? "Pause" : "Resume"}</button>
          <button type="button" onClick={reviewPlan} className="secondary-button min-h-9 px-3 py-2 text-xs">Weekly Review</button>
          <button type="button" onClick={() => updatePlanStatus(plan.id, "archived")} className="danger-button min-h-9 px-3 py-2 text-xs">Archive</button>
        </div>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        <PlanInfoBlock title="Setup Answers" rows={setupRows} />
        <PlanInfoBlock title="Calculated Targets / Summary" rows={targetRows} />
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        <section className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <h4 className="font-black text-white">Today tasks from this plan</h4>
          <div className="mt-3 grid gap-2">
            {todayRows.length ? todayRows.slice(0, 8).map((row) => <PlanTaskMiniRow key={row.id} row={{ ...row, source: getPlanTaskSourceLabel(plan) }} onToggle={() => {}} />) : <p className="text-sm text-slate-400">No tasks.</p>}
          </div>
        </section>
        <section className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <h4 className="font-black text-white">Weekly tasks / reviews</h4>
          <div className="mt-3 grid gap-2 text-sm leading-6 text-slate-300">
            {weeklyRows.length ? weeklyRows.map((row) => <SummaryRow key={row.label} label={row.label} value={row.value} />) : <p className="text-slate-400">No weekly tasks yet.</p>}
            <SummaryRow label="Weekly reviews saved" value={String(reviewCount)} />
          </div>
        </section>
      </div>

      <section className="mt-5 rounded-2xl border border-red-300/20 bg-red-400/[0.06] p-4">
        <p className="font-black text-white">Danger Zone</p>
        <p className="mt-1 text-sm text-slate-400">Delete only if you really want to remove this plan setup and logs from this device.</p>
        <button type="button" onClick={deletePlan} className="danger-button mt-3 min-h-9 px-3 py-2 text-xs">Delete Plan</button>
      </section>
    </section>
  );
}

function PlanInfoBlock({ title, rows }: { title: string; rows: Array<{ label: string; value: string | number | boolean }> }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <h4 className="font-black text-white">{title}</h4>
      <div className="mt-3 grid gap-2 text-sm leading-6 text-slate-300">
        {rows.length ? rows.map((row) => <SummaryRow key={row.label} label={row.label} value={String(row.value)} />) : <p className="text-slate-400">Nothing to show yet.</p>}
      </div>
    </section>
  );
}

function PlanSetupEditor({ plan, updateActivePlan, close }: { plan: ActivePlan; updateActivePlan: (planId: string, updater: SetStateAction<ActivePlan | null>) => void; close: () => void }) {
  const [draft, setDraft] = useState<ActivePlan>(plan);

  useEffect(() => {
    setDraft(plan);
  }, [plan]);

  function save() {
    updateActivePlan(plan.id, draft);
    close();
  }

  return (
    <section className="mt-5 rounded-[1.35rem] border border-amber-200/20 bg-amber-300/[0.055] p-4">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-100">Edit Plan Setup</p>
      <h3 className="mt-2 text-2xl font-black text-white">{getPlanDisplayName(plan)}</h3>
      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <PlanSpecificSetupFields plan={draft} setPlan={setDraft} />
      </div>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button type="button" onClick={save} className="primary-button justify-center">Save Setup Changes</button>
        <button type="button" onClick={close} className="secondary-button justify-center">Cancel</button>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-400">Saving setup updates future generated tasks and plan details. Existing logs are kept.</p>
    </section>
  );
}

function PlanSpecificSetupFields({ plan, setPlan }: { plan: ActivePlan; setPlan: Dispatch<SetStateAction<ActivePlan>> }) {
  if (plan.type === "everyday_essentials") {
    const setup = plan.setup;
    return (
      <>
        <EssentialsSelect label="Living situation" value={setup.livingSituation} options={["Alone", "With family", "Shared room / shared home"]} onChange={(livingSituation) => setPlan({ ...plan, setup: { ...setup, livingSituation } })} />
        <EssentialsSelect label="Budget level" value={setup.budgetLevel} options={["Basic", "Normal", "Comfortable"]} onChange={(budgetLevel) => setPlan({ ...plan, setup: { ...setup, budgetLevel } })} />
        <EssentialsSelect label="Restock reminder" value={setup.restockReminder} options={["Weekly", "Every 2 weeks", "Monthly"]} onChange={(restockReminder) => setPlan({ ...plan, setup: { ...setup, restockReminder } })} />
      </>
    );
  }
  if (plan.type === "get_lean_shred") {
    const setup = plan.setup;
    return (
      <>
        <Field label="Current weight"><input type="number" value={setup.currentWeightKg || ""} onChange={(event) => setPlan({ ...plan, setup: { ...setup, currentWeightKg: Number(event.target.value) || 0 } })} className="form-control" /></Field>
        <Field label="Goal weight"><input type="number" value={setup.goalWeightKg || ""} onChange={(event) => setPlan({ ...plan, setup: { ...setup, goalWeightKg: Number(event.target.value) || 0 } })} className="form-control" /></Field>
        <SelectField label="Speed" value={setup.speed} options={getLeanSpeeds} onChange={(speed) => setPlan({ ...plan, setup: { ...setup, speed } })} />
        <SelectField label="Exercise access" value={setup.exerciseAccess} options={getLeanExerciseAccess} onChange={(exerciseAccess) => setPlan({ ...plan, setup: { ...setup, exerciseAccess } })} />
      </>
    );
  }
  if (plan.type === "fix_sleep_energy") {
    const setup = plan.setup;
    return (
      <>
        <Field label="Target sleep time"><input type="time" value={timeToInputValue(setup.targetSleepTime)} onChange={(event) => setPlan({ ...plan, setup: { ...setup, targetSleepTime: inputValueToTime(event.target.value) } })} className="form-control" /></Field>
        <Field label="Caffeine cutoff"><input type="time" value={timeToInputValue(setup.caffeineCutoffTime)} onChange={(event) => setPlan({ ...plan, setup: { ...setup, caffeineCutoffTime: inputValueToTime(event.target.value) } })} className="form-control" /></Field>
        <SelectField label="Nap preference" value={setup.napPreference} options={napPreferenceOptions} onChange={(napPreference) => setPlan({ ...plan, setup: { ...setup, napPreference } })} />
        <label className="flex min-h-[3.25rem] items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-black text-white"><input type="checkbox" checked={setup.includeNannoSleepBoost} onChange={(event) => setPlan({ ...plan, setup: { ...setup, includeNannoSleepBoost: event.target.checked } })} className="h-5 w-5 accent-emerald-400" />Nanno Sleep Boost</label>
      </>
    );
  }
  if (plan.type === "learn_master_subject") {
    return (
      <>
        <Field label="Subject"><input value={plan.subjectName} onChange={(event) => setPlan({ ...plan, subjectName: event.target.value })} className="form-control" /></Field>
        <Field label="Daily minutes"><input type="number" value={plan.dailyMinutes || ""} onChange={(event) => setPlan({ ...plan, dailyMinutes: Number(event.target.value) || 60 })} className="form-control" /></Field>
        <SelectField label="Speed" value={plan.speed} options={learnSpeeds} onChange={(speed) => setPlan({ ...plan, speed })} />
        <SelectField label="Current level" value={plan.currentLevel} options={learnCurrentLevels} onChange={(currentLevel) => setPlan({ ...plan, currentLevel })} />
      </>
    );
  }
  if (plan.type === "money_plan") {
    const setup = plan.setup;
    return (
      <>
        <SelectField label="Main money goal" value={setup.mainMoneyGoal} options={moneyGoalOptions} onChange={(mainMoneyGoal) => setPlan({ ...plan, setup: { ...setup, mainMoneyGoal } })} />
        <Field label="Target amount"><input type="number" value={setup.targetAmount || ""} onChange={(event) => setPlan({ ...plan, setup: { ...setup, targetAmount: Number(event.target.value) || 0 } })} className="form-control" /></Field>
        <SelectField label="Deadline" value={setup.targetDeadline} options={moneyDeadlineOptions} onChange={(targetDeadline) => setPlan({ ...plan, setup: { ...setup, targetDeadline } })} />
        <SelectField label="Income path" value={setup.incomePath} options={moneyIncomePathOptions} onChange={(incomePath) => setPlan({ ...plan, setup: { ...setup, incomePath } })} />
        <SelectField label="Daily money time" value={setup.dailyMoneyTime} options={moneyDailyTimeOptions} onChange={(dailyMoneyTime) => setPlan({ ...plan, setup: { ...setup, dailyMoneyTime } })} />
        <SelectField label="Bottleneck" value={setup.currentBottleneck} options={moneyBottleneckOptions} onChange={(currentBottleneck) => setPlan({ ...plan, setup: { ...setup, currentBottleneck } })} />
      </>
    );
  }
  if (plan.type === "life_reset") {
    const setup = plan.setup;
    return (
      <>
        <SelectField label="Reset length" value={setup.resetLength} options={lifeResetLengthOptions} onChange={(resetLength) => setPlan({ ...plan, setup: { ...setup, resetLength } })} />
        <SelectField label="Reset intensity" value={setup.resetIntensity} options={lifeResetIntensityOptions} onChange={(resetIntensity) => setPlan({ ...plan, setup: { ...setup, resetIntensity } })} />
        <SelectField label="Main problem" value={setup.mainProblem} options={lifeResetProblemOptions} onChange={(mainProblem) => setPlan({ ...plan, setup: { ...setup, mainProblem } })} />
        <Field label="Wake time"><input type="time" value={timeToInputValue(setup.wakeTime)} onChange={(event) => setPlan({ ...plan, setup: { ...setup, wakeTime: inputValueToTime(event.target.value) } })} className="form-control" /></Field>
        <Field label="Target sleep time"><input type="time" value={timeToInputValue(setup.targetSleepTime)} onChange={(event) => setPlan({ ...plan, setup: { ...setup, targetSleepTime: inputValueToTime(event.target.value) } })} className="form-control" /></Field>
        <SelectField label="Main reset focus" value={setup.mainResetFocus} options={lifeResetFocusOptions} onChange={(mainResetFocus) => setPlan({ ...plan, setup: { ...setup, mainResetFocus } })} />
        <SelectField label="Daily reset time" value={setup.dailyResetTime} options={lifeResetTimeOptions} onChange={(dailyResetTime) => setPlan({ ...plan, setup: { ...setup, dailyResetTime } })} />
      </>
    );
  }
  const setup = plan.setup;
  return (
    <>
      <Field label="Project name"><input value={setup.projectName} onChange={(event) => setPlan({ ...plan, setup: { ...setup, projectName: event.target.value } })} className="form-control" /></Field>
      <SelectField label="Current stage" value={setup.currentStage} options={projectStageOptions} onChange={(currentStage) => setPlan({ ...plan, setup: { ...setup, currentStage } })} />
      <SelectField label="Daily project time" value={setup.dailyProjectTime} options={projectDailyTimeOptions} onChange={(dailyProjectTime) => setPlan({ ...plan, setup: { ...setup, dailyProjectTime } })} />
      <SelectField label="Project speed" value={setup.projectSpeed} options={projectSpeedOptions} onChange={(projectSpeed) => setPlan({ ...plan, setup: { ...setup, projectSpeed } })} />
    </>
  );
}

function PlanWeeklyReviewEditor({ plan, updateActivePlan, close }: { plan: ActivePlan; updateActivePlan: (planId: string, updater: SetStateAction<ActivePlan | null>) => void; close: () => void }) {
  const [draft, setDraft] = useState<PlanWeeklyReview>(() => createDefaultPlanWeeklyReview(plan));

  function updateDraft(patch: Partial<PlanWeeklyReview>) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  function updateSpecific(key: string, value: string | number | boolean) {
    setDraft((current) => ({ ...current, specifics: { ...current.specifics, [key]: value } }));
  }

  function save() {
    updateActivePlan(plan.id, (current) => {
      const target = current ? normalizeActivePlan(current) : plan;
      return { ...target, weeklyReviews: [...getPlanWeeklyReviews(target), draft] } as ActivePlan;
    });
    close();
  }

  return (
    <section className="mt-5 rounded-[1.35rem] border border-teal-200/20 bg-teal-300/[0.055] p-4">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-teal-100">Weekly Review</p>
      <h3 className="mt-2 text-2xl font-black text-white">{getPlanDisplayName(plan)}</h3>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Field label="What went well"><textarea value={draft.wentWell} onChange={(event) => updateDraft({ wentWell: event.target.value })} className="form-control min-h-24" /></Field>
        <Field label="What was hard"><textarea value={draft.hard} onChange={(event) => updateDraft({ hard: event.target.value })} className="form-control min-h-24" /></Field>
        <Field label="Completion rating 1-10"><input type="number" min="1" max="10" value={draft.completionRating} onChange={(event) => updateDraft({ completionRating: clampNumber(Number(event.target.value) || 1, 1, 10) })} className="form-control" /></Field>
        <SelectField label="Decision" value={draft.decision} options={["continue", "adjust", "pause"]} onChange={(decision) => updateDraft({ decision: decision as PlanWeeklyReview["decision"] })} />
        <Field label="Next week focus"><input value={draft.nextWeekFocus} onChange={(event) => updateDraft({ nextWeekFocus: event.target.value })} className="form-control" /></Field>
        <PlanSpecificReviewFields plan={plan} draft={draft} updateSpecific={updateSpecific} />
      </div>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button type="button" onClick={save} className="primary-button justify-center">Save Weekly Review</button>
        <button type="button" onClick={close} className="secondary-button justify-center">Cancel</button>
      </div>
    </section>
  );
}

function PlanSpecificReviewFields({ plan, draft, updateSpecific }: { plan: ActivePlan; draft: PlanWeeklyReview; updateSpecific: (key: string, value: string | number | boolean) => void }) {
  const s = draft.specifics;
  if (plan.type === "get_lean_shred") {
    return (
      <>
        <Field label="Current weight"><input type="number" value={Number(s.currentWeight) || ""} onChange={(event) => updateSpecific("currentWeight", Number(event.target.value) || 0)} className="form-control" /></Field>
        <Field label="Hunger 1-10"><input type="number" value={Number(s.hunger) || ""} onChange={(event) => updateSpecific("hunger", clampNumber(Number(event.target.value) || 1, 1, 10))} className="form-control" /></Field>
        <Field label="Energy 1-10"><input type="number" value={Number(s.energy) || ""} onChange={(event) => updateSpecific("energy", clampNumber(Number(event.target.value) || 1, 1, 10))} className="form-control" /></Field>
        <Field label="Calories consistency"><input value={String(s.caloriesConsistency ?? "")} onChange={(event) => updateSpecific("caloriesConsistency", event.target.value)} className="form-control" /></Field>
        <Field label="Protein consistency"><input value={String(s.proteinConsistency ?? "")} onChange={(event) => updateSpecific("proteinConsistency", event.target.value)} className="form-control" /></Field>
      </>
    );
  }
  if (plan.type === "fix_sleep_energy") {
    return (
      <>
        <Field label="Average sleep"><input type="number" value={Number(s.averageSleep) || ""} onChange={(event) => updateSpecific("averageSleep", Number(event.target.value) || 0)} className="form-control" /></Field>
        <Field label="Energy average"><input type="number" value={Number(s.energyAverage) || ""} onChange={(event) => updateSpecific("energyAverage", Number(event.target.value) || 0)} className="form-control" /></Field>
        <Field label="Caffeine cutoff success"><input value={String(s.caffeineCutoffSuccess ?? "")} onChange={(event) => updateSpecific("caffeineCutoffSuccess", event.target.value)} className="form-control" /></Field>
        <Field label="Night routine consistency"><input value={String(s.nightRoutineConsistency ?? "")} onChange={(event) => updateSpecific("nightRoutineConsistency", event.target.value)} className="form-control" /></Field>
      </>
    );
  }
  if (plan.type === "build_project") {
    return (
      <>
        <Field label="Project minutes"><input type="number" value={Number(s.projectMinutes) || ""} onChange={(event) => updateSpecific("projectMinutes", Number(event.target.value) || 0)} className="form-control" /></Field>
        <Field label="Progress made"><input value={String(s.progressMade ?? "")} onChange={(event) => updateSpecific("progressMade", event.target.value)} className="form-control" /></Field>
        <Field label="Blocker"><input value={String(s.blocker ?? "")} onChange={(event) => updateSpecific("blocker", event.target.value)} className="form-control" /></Field>
        <Field label="Next milestone"><input value={String(s.nextMilestone ?? "")} onChange={(event) => updateSpecific("nextMilestone", event.target.value)} className="form-control" /></Field>
      </>
    );
  }
  if (plan.type === "learn_master_subject") {
    return (
      <>
        <Field label="Study days"><input type="number" value={Number(s.studyDays) || ""} onChange={(event) => updateSpecific("studyDays", Number(event.target.value) || 0)} className="form-control" /></Field>
        <Field label="Topic learned"><input value={String(s.topicLearned ?? "")} onChange={(event) => updateSpecific("topicLearned", event.target.value)} className="form-control" /></Field>
        <Field label="Difficulty"><input value={String(s.difficulty ?? "")} onChange={(event) => updateSpecific("difficulty", event.target.value)} className="form-control" /></Field>
        <Field label="Can explain without notes?"><input value={String(s.canExplain ?? "")} onChange={(event) => updateSpecific("canExplain", event.target.value)} className="form-control" /></Field>
      </>
    );
  }
  if (plan.type === "money_plan") {
    return (
      <>
        <Field label="Total income this week"><input type="number" value={Number(s.totalIncomeThisWeek) || ""} onChange={(event) => updateSpecific("totalIncomeThisWeek", Number(event.target.value) || 0)} className="form-control" /></Field>
        <Field label="Total spending this week"><input type="number" value={Number(s.totalSpendingThisWeek) || ""} onChange={(event) => updateSpecific("totalSpendingThisWeek", Number(event.target.value) || 0)} className="form-control" /></Field>
        <Field label="Amount saved this week"><input type="number" value={Number(s.amountSavedThisWeek) || ""} onChange={(event) => updateSpecific("amountSavedThisWeek", Number(event.target.value) || 0)} className="form-control" /></Field>
        <Field label="Money actions completed"><input type="number" value={Number(s.moneyActionsCompleted) || ""} onChange={(event) => updateSpecific("moneyActionsCompleted", Number(event.target.value) || 0)} className="form-control" /></Field>
        <Field label="What worked"><input value={String(s.whatWorked ?? "")} onChange={(event) => updateSpecific("whatWorked", event.target.value)} className="form-control" /></Field>
        <Field label="What wasted money"><input value={String(s.whatWastedMoney ?? "")} onChange={(event) => updateSpecific("whatWastedMoney", event.target.value)} className="form-control" /></Field>
      </>
    );
  }
  if (plan.type === "life_reset") {
    return (
      <>
        <Field label="What became better"><input value={String(s.whatBecameBetter ?? "")} onChange={(event) => updateSpecific("whatBecameBetter", event.target.value)} className="form-control" /></Field>
        <Field label="What is still weak"><input value={String(s.whatIsStillWeak ?? "")} onChange={(event) => updateSpecific("whatIsStillWeak", event.target.value)} className="form-control" /></Field>
        <SelectField label="Continue reset?" value={String(s.continueReset ?? "continue")} options={["continue", "adjust", "switch plan", "pause"]} onChange={(continueReset) => updateSpecific("continueReset", continueReset)} />
        <Field label="Switch plan idea"><input value={String(s.switchPlan ?? "")} onChange={(event) => updateSpecific("switchPlan", event.target.value)} className="form-control" /></Field>
        <Field label="Next focus"><input value={String(s.nextFocus ?? "")} onChange={(event) => updateSpecific("nextFocus", event.target.value)} className="form-control" /></Field>
      </>
    );
  }
  return (
    <>
      <Field label="Missing items"><input value={String(s.missingItems ?? "")} onChange={(event) => updateSpecific("missingItems", event.target.value)} className="form-control" /></Field>
      <Field label="Restock needed"><input value={String(s.restockNeeded ?? "")} onChange={(event) => updateSpecific("restockNeeded", event.target.value)} className="form-control" /></Field>
      <Field label="Life maintenance score"><input type="number" value={Number(s.lifeMaintenanceScore) || ""} onChange={(event) => updateSpecific("lifeMaintenanceScore", Number(event.target.value) || 0)} className="form-control" /></Field>
    </>
  );
}

function ProgressFoundation({
  review,
  setReview,
  stats,
  dayLevel,
  tasks,
  todayKey,
  history,
  sevenDayTest,
  analytics,
  streaks,
  activePlans,
  updateActivePlan,
  dailyFoodLogs,
  moneySpendingLogs,
  moneyIncomeLogs,
  moneySavingLogs,
  moneyOpportunityLogs,
  longStudySessions,
  longStudyReviews,
  saveLongStudyReview,
  realUseTestLogs,
  setRealUseTestLogs,
  longTermPlanning
}: {
  review: Review;
  setReview: Dispatch<SetStateAction<Review>>;
  stats: Stats;
  dayLevel: string;
  tasks: Task[];
  todayKey: string;
  history: HistoryEntry[];
  sevenDayTest: SevenDayTestSummary;
  analytics: AnalyticsSummary;
  streaks: Streaks;
  activePlans: ActivePlan[];
  updateActivePlan: (planId: string, updater: SetStateAction<ActivePlan | null>) => void;
  dailyFoodLogs: DailyFoodLogs;
  moneySpendingLogs: MoneySpendingLog[];
  moneyIncomeLogs: MoneyIncomeLog[];
  moneySavingLogs: MoneySavingLog[];
  moneyOpportunityLogs: MoneyOpportunityLog[];
  longStudySessions: LongStudySession[];
  longStudyReviews: LongStudyReview[];
  saveLongStudyReview: (review: LongStudyReview) => void;
  realUseTestLogs: RealUseTestLog[];
  setRealUseTestLogs: Dispatch<SetStateAction<RealUseTestLog[]>>;
  longTermPlanning: LongTermPlanningState;
}) {
  const [progressFilter, setProgressFilter] = useState<ProgressTabFilter>("All");
  const [showWeeklyReviewTargets, setShowWeeklyReviewTargets] = useState(false);
  const progressFilters: ProgressTabFilter[] = ["All", "Today", "This Week", "Plans", "Logs", "Reviews Needed"];
  const activeProgressPlans = activePlans.filter((plan) => plan.status === "active");
  const inactiveProgressPlans = activePlans.filter((plan) => plan.status !== "active");
  const activePlanCount = activeProgressPlans.length;
  const weeklyReviewCount = activePlans.reduce((total, plan) => total + getPlanWeeklyReviews(plan).length, 0);
  const planLogCount = activeProgressPlans.reduce((total, plan) => total + getPlanLogCount(plan), 0);
  const mainMission = getMainMissionForDay(tasks);
  const todayCompletionPercent = tasks.length ? Math.round((stats.completed / tasks.length) * 100) : 0;
  const skippedToday = tasks.filter((task) => task.skipped).length;
  const activePlanTaskTotals = activeProgressPlans.reduce((total, plan) => {
    const progress = getPlanCompletion(plan);
    return {
      completed: total.completed + progress.completed,
      total: total.total + progress.total
    };
  }, { completed: 0, total: 0 });
  const weeklySnapshot = getWeeklyProgressSnapshot(history, todayKey, tasks, activePlans);
  const reviewReminders = getProgressReviewReminders(activePlans, dailyFoodLogs, moneySpendingLogs, moneySavingLogs, longStudySessions, longStudyReviews, todayKey);
  const plansNeedingWeeklyReview = activeProgressPlans.filter((plan) => !hasPlanReviewThisWeek(plan, todayKey));
  const showToday = progressFilter === "All" || progressFilter === "Today";
  const showWeek = progressFilter === "All" || progressFilter === "This Week";
  const showPlans = progressFilter === "All" || progressFilter === "Plans";
  const showLogs = progressFilter === "All" || progressFilter === "Logs";
  const showReviews = progressFilter === "All" || progressFilter === "Reviews Needed";

  return (
    <section className="grid gap-6">
      <Panel compact>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-amber-200">Progress Review Center</p>
            <h2 className="mt-2 text-3xl font-black text-white">What is improving, and what needs attention?</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Daily completion, active plan progress, logs, weekly reviews, history, and analytics in one place.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {progressFilters.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setProgressFilter(filter)}
                className={`min-h-9 rounded-xl px-3 py-2 text-xs font-black transition ${progressFilter === filter ? "bg-amber-300 text-slate-950" : "border border-white/10 bg-white/[0.05] text-slate-300 hover:border-cyan-200/40"}`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </Panel>

      {showToday ? (
        <Panel>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-cyan-100">Today Progress Summary</p>
              <h3 className="mt-2 text-2xl font-black text-white">{todayKey}</h3>
            </div>
            <Badge tone={todayCompletionPercent >= 70 ? "green" : todayCompletionPercent >= 40 ? "orange" : "dark"}>{todayCompletionPercent}% complete</Badge>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MiniMetric label="Completion" value={`${todayCompletionPercent}%`} />
            <MiniMetric label="Completed" value={stats.completed} />
            <MiniMetric label="Skipped" value={skippedToday} />
            <MiniMetric label="KPM Score" value={stats.points} />
            <MiniMetric label="Day Level" value={dayLevel} />
            <MiniMetric label="Main Mission" value={mainMission ? mainMission.completed ? "Done" : mainMission.skipped ? "Skipped" : "Open" : "None"} />
            <MiniMetric label="Active Plan Tasks" value={`${activePlanTaskTotals.completed}/${activePlanTaskTotals.total}`} />
            <MiniMetric label="Remaining" value={stats.remaining} />
          </div>
          <div className="mt-5">
            <ProgressLine label="Today missions" value={stats.completed} total={Math.max(tasks.length, 1)} percent={todayCompletionPercent} />
          </div>
        </Panel>
      ) : null}

      {showWeek ? (
        <Panel>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-cyan-100">Weekly Snapshot</p>
          <h3 className="mt-2 text-2xl font-black text-white">Last 7 days</h3>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <MiniMetric label="Days Active" value={`${weeklySnapshot.daysActive}/7`} />
            <MiniMetric label="Total Tasks Completed" value={weeklySnapshot.totalCompleted} />
            <MiniMetric label="Average Completion" value={`${weeklySnapshot.averageCompletion}%`} />
            <MiniMetric label="Weekly Reviews Completed" value={weeklySnapshot.weeklyReviewsCompleted} />
            <MiniMetric label="Best Day" value={weeklySnapshot.bestDay} />
            <MiniMetric label="Weakest Day" value={weeklySnapshot.weakestDay} />
          </div>
        </Panel>
      ) : null}

      {showReviews ? (
        <Panel>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-amber-200">Review Needed</p>
              <h3 className="mt-2 text-2xl font-black text-white">What should I review next?</h3>
            </div>
            <button type="button" onClick={() => setShowWeeklyReviewTargets((current) => !current)} className="primary-button justify-center">Start Weekly Review</button>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {reviewReminders.length ? reviewReminders.map((reminder) => (
              <article key={`${reminder.title}-${reminder.detail}`} className="rounded-2xl border border-amber-200/15 bg-amber-300/[0.055] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-black text-white">{reminder.title}</h4>
                    <p className="mt-1 text-sm leading-6 text-slate-400">{reminder.detail}</p>
                  </div>
                  <Badge tone={reminder.tone}>{reminder.label}</Badge>
                </div>
              </article>
            )) : <p className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-slate-400">No reviews are due right now.</p>}
          </div>
          {showWeeklyReviewTargets ? (
            <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
              <h4 className="font-black text-white">Plans needing weekly review</h4>
              <div className="mt-3 grid gap-2">
                {plansNeedingWeeklyReview.length ? plansNeedingWeeklyReview.map((plan) => (
                  <SummaryRow key={plan.id} label={getPlanDisplayName(plan)} value={`Last review: ${getPlanWeeklyReviews(plan).at(-1)?.date ?? "No review yet"}`} />
                )) : <p className="text-sm text-slate-400">All active plans have a weekly review this week.</p>}
              </div>
              <p className="mt-3 text-sm text-slate-400">Open the Plan tab, then use Weekly Review on the plan card to save a review.</p>
            </div>
          ) : null}
        </Panel>
      ) : null}

      {(progressFilter === "All" || progressFilter === "Today" || progressFilter === "Reviews Needed") ? (
        <RealUseTestSection logs={realUseTestLogs} setLogs={setRealUseTestLogs} todayKey={todayKey} />
      ) : null}

      {showPlans ? (
        <Panel>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-amber-200">Active Plan Progress</p>
              <h3 className="mt-2 text-2xl font-black text-white">Plan-specific signals</h3>
              <p className="mt-2 text-sm text-slate-400">Only active plans feed Today. Paused and archived plans stay out of Today tasks.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge tone="green">{activePlanCount} active</Badge>
              <Badge tone="orange">{inactiveProgressPlans.length} paused / archived</Badge>
            </div>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {activeProgressPlans.length ? activeProgressPlans.map((plan) => (
              <ProgressPlanReviewCard
                key={plan.id}
                plan={plan}
                todayKey={todayKey}
                dailyFoodLogs={dailyFoodLogs}
                moneySpendingLogs={moneySpendingLogs}
                moneyIncomeLogs={moneyIncomeLogs}
                moneySavingLogs={moneySavingLogs}
                moneyOpportunityLogs={moneyOpportunityLogs}
              />
            )) : <p className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-slate-400">No active plans yet.</p>}
            <LongStudyProgressCard sessions={longStudySessions} reviews={longStudyReviews} />
          </div>
        </Panel>
      ) : null}

      {showPlans ? <LongTermPlanningProgressSummary planning={longTermPlanning} todayKey={todayKey} /> : null}

      {showLogs ? (
        <LogsCenter
          activePlans={activePlans}
          dailyFoodLogs={dailyFoodLogs}
          moneySpendingLogs={moneySpendingLogs}
          moneyIncomeLogs={moneyIncomeLogs}
          moneySavingLogs={moneySavingLogs}
          moneyOpportunityLogs={moneyOpportunityLogs}
          longStudyReviews={longStudyReviews}
        />
      ) : null}

      <Panel compact>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MiniMetric label="Current Streak" value={streaks.current} />
          <MiniMetric label="Best Streak" value={streaks.best} />
          <MiniMetric label="Active Plans" value={activePlanCount} />
          <MiniMetric label="Paused / Archived" value={inactiveProgressPlans.length} />
          <MiniMetric label="Weekly Reviews" value={weeklyReviewCount} />
          <MiniMetric label="Recent Plan Logs" value={planLogCount} />
          <MiniMetric label="Productive" value={streaks.productive} />
          <MiniMetric label="Daily Log Model" value={dailyLogFoundation.date || "Ready"} />
        </div>
      </Panel>

      {showLogs && longStudySessions.length ? (
        <LongStudyProgressPanel sessions={longStudySessions} reviews={longStudyReviews} todayKey={todayKey} saveReview={saveLongStudyReview} />
      ) : null}

      {showLogs && activeProgressPlans.some((plan) => plan.type === "get_lean_shred" || plan.type === "learn_master_subject" || plan.type === "fix_sleep_energy" || plan.type === "build_project" || plan.type === "money_plan" || plan.type === "life_reset") ? (
        <CollapsibleSection title="Detailed Log Editors" subtitle="Fitness, sleep, project, money, reset, and study logs for active plans." defaultOpen={false}>
          <div className="grid gap-5">
            {activeProgressPlans.some((plan) => plan.type === "get_lean_shred") ? (
              <GetLeanNutritionSummary activePlans={activeProgressPlans} dailyFoodLogs={dailyFoodLogs} />
            ) : null}
            {activeProgressPlans.some((plan) => plan.type === "money_plan") ? (
              <MoneyPlanProgressSummary activePlans={activeProgressPlans} spendingLogs={moneySpendingLogs} incomeLogs={moneyIncomeLogs} savingLogs={moneySavingLogs} opportunityLogs={moneyOpportunityLogs} />
            ) : null}
            {activeProgressPlans.map((plan) => {
              const planSetter: Dispatch<SetStateAction<ActivePlan | null>> = (updater) => updateActivePlan(plan.id, updater);
              if (plan.type === "get_lean_shred") return <GetLeanProgressPanel key={plan.id} activePlan={normalizeGetLeanPlan(plan)} setActivePlan={planSetter} />;
              if (plan.type === "fix_sleep_energy") return <SleepEnergyProgressPanel key={plan.id} activePlan={normalizeSleepEnergyPlan(plan)} setActivePlan={planSetter} />;
              if (plan.type === "build_project") return <BuildProjectProgressPanel key={plan.id} activePlan={normalizeBuildProjectPlan(plan)} setActivePlan={planSetter} />;
              if (plan.type === "learn_master_subject") return <LearnMasterProgressPanel key={plan.id} activePlan={normalizeLearnMasterPlan(plan)} setActivePlan={planSetter} />;
              if (plan.type === "life_reset") return <LifeResetPlanDetails key={plan.id} activePlan={normalizeLifeResetPlan(plan)} setActivePlan={planSetter} />;
              return null;
            })}
          </div>
        </CollapsibleSection>
      ) : null}

      <CollapsibleSection title="Weekly Review" subtitle="Save the evening review and close the day." defaultOpen={false}>
        <EveningReview review={review} setReview={setReview} stats={stats} dayLevel={dayLevel} tasks={tasks} todayKey={todayKey} />
      </CollapsibleSection>
      <CollapsibleSection title="History" subtitle="Recent days and 7-day test details." defaultOpen={false}>
        <HistoryPage history={history} sevenDayTest={sevenDayTest} />
      </CollapsibleSection>
      <CollapsibleSection title="Streaks / Analytics" subtitle="Score trends, categories, streaks, and simple charts." defaultOpen={false}>
        <AnalyticsPage analytics={analytics} streaks={streaks} />
      </CollapsibleSection>
    </section>
  );
}

function ProfileScreen({
  profile,
  setProfile,
  settings,
  setSettings,
  resetToday,
  clearAllLocalData,
  exportAllData,
  importAllData,
  todayMode,
  activePlans,
  selectedTodayMode,
  setSelectedTodayMode,
  generateTodayByMode,
  resetDefaultTemplate
}: {
  profile: ProfileState;
  setProfile: Dispatch<SetStateAction<ProfileState>>;
  settings: SettingsState;
  setSettings: Dispatch<SetStateAction<SettingsState>>;
  resetToday: () => void;
  clearAllLocalData: () => void;
  exportAllData: () => void;
  importAllData: (rawJson: string) => string;
  todayMode: DailyMode;
  activePlans: ActivePlan[];
  selectedTodayMode: DailyMode;
  setSelectedTodayMode: Dispatch<SetStateAction<DailyMode>>;
  generateTodayByMode: (mode?: DailyMode) => boolean;
  resetDefaultTemplate: () => void;
}) {
  const [draft, setDraft] = useState<ProfileState>(profile);
  const [editing, setEditing] = useState(!profile.name && !profile.dateOfBirth);
  const [profileTab, setProfileTab] = useState<"Profile" | "Settings" | "Backup" | "Version">("Profile");
  const age = draft.dateOfBirth ? calculateAge(draft.dateOfBirth) : null;
  const fieldClass = "form-control";
  const activePlanNames = activePlans.map(getPlanDisplayName);

  useEffect(() => {
    setDraft(profile);
    if (!profile.name && !profile.dateOfBirth) setEditing(true);
  }, [profile]);

  function updateDraft(patch: Partial<ProfileState>) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  function saveProfile() {
    setProfile(normalizeProfile(draft));
    setEditing(false);
  }

  function resetProfile() {
    if (!window.confirm("Reset local profile data on this device? Existing tasks and history will stay safe.")) return;
    setProfile(defaultProfile);
    setDraft(defaultProfile);
    setEditing(true);
  }

  return (
    <section className="grid gap-5">
      <Panel>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-amber-200">Profile</p>
            <h2 className="mt-2 text-3xl font-black text-white">Profile + Settings</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Your profile, app settings, storage backup, version notes, and danger actions live here.</p>
            <p className="mt-2 text-sm font-bold text-amber-100">{activePlans.length} active plan{activePlans.length === 1 ? "" : "s"} saved locally.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(["Profile", "Settings", "Backup", "Version"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setProfileTab(tab)}
                className={profileTab === tab ? "primary-button" : "secondary-button"}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        {!profile.name && !profile.dateOfBirth ? (
          <div className="mt-5 rounded-2xl border border-amber-300/25 bg-amber-300/[0.08] p-4">
            <p className="font-black text-white">Set up your local profile.</p>
            <p className="mt-1 text-sm leading-6 text-slate-300">No profile exists yet. Add the basics, then save.</p>
          </div>
        ) : null}
      </Panel>

      {profileTab === "Profile" ? (
        <Panel>
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-amber-200">My Profile</p>
              <h3 className="mt-2 text-2xl font-black text-white">Personal baseline</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setEditing(true)} className="secondary-button">Edit Profile</button>
              <button type="button" onClick={saveProfile} className="primary-button">Save Profile</button>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Name / nickname">
              <input disabled={!editing} value={draft.name} onChange={(event) => updateDraft({ name: event.target.value })} className={fieldClass} placeholder="Sunny" />
            </Field>
            <Field label="Date of birth">
              <input disabled={!editing} type="date" value={draft.dateOfBirth} onChange={(event) => updateDraft({ dateOfBirth: event.target.value })} className={fieldClass} />
            </Field>
            <Field label="Calculated age">
              <input readOnly value={age === null ? "Add date of birth" : `${age} years old`} className={fieldClass} />
            </Field>
            <SelectField label="Sex" value={draft.sex} options={["", "Female", "Male", "Intersex", "Prefer not to say"]} onChange={(sex) => updateDraft({ sex })} />
            <Field label="Height in cm">
              <input disabled={!editing} type="number" value={draft.heightCm || ""} onChange={(event) => updateDraft({ heightCm: Number(event.target.value) || 0 })} className={fieldClass} />
            </Field>
            <Field label="Current weight in kg">
              <input disabled={!editing} type="number" value={draft.currentWeightKg || ""} onChange={(event) => updateDraft({ currentWeightKg: Number(event.target.value) || 0 })} className={fieldClass} />
            </Field>
            <Field label="Goal weight in kg">
              <input disabled={!editing} type="number" value={draft.goalWeightKg || ""} onChange={(event) => updateDraft({ goalWeightKg: Number(event.target.value) || 0 })} className={fieldClass} />
            </Field>
            <SelectField label="Activity level" value={draft.activityLevel} options={["", "Low", "Light", "Moderate", "High", "Very High"]} onChange={(activityLevel) => updateDraft({ activityLevel })} />
            <Field label="Normal wake-up time">
              <input disabled={!editing} type="time" value={draft.normalWakeTime ? timeToInputValue(draft.normalWakeTime) : ""} onChange={(event) => updateDraft({ normalWakeTime: inputValueToTime(event.target.value) })} className={fieldClass} />
            </Field>
            <Field label="Sleep target hours">
              <input disabled={!editing} type="number" min="1" max="14" value={draft.sleepTargetHours || 8} onChange={(event) => updateDraft({ sleepTargetHours: Number(event.target.value) || 8 })} className={fieldClass} />
            </Field>
            <SelectField label="Main life focus" value={draft.mainLifeFocus} options={["", ...mainLifeFocusOptions]} onChange={(mainLifeFocus) => updateDraft({ mainLifeFocus })} />
            <Field label="Active plan">
              <input disabled={!editing} value={draft.activePlan} onChange={(event) => updateDraft({ activePlan: event.target.value })} className={fieldClass} placeholder="Everyday Essentials" />
            </Field>
            <Field label="Active plans count">
              <input readOnly value={`${activePlans.length} plan${activePlans.length === 1 ? "" : "s"}`} className={fieldClass} />
            </Field>
            <div className="md:col-span-2">
              <Field label="Active plan names">
                <textarea readOnly value={activePlanNames.join("\n")} className="form-control min-h-24" placeholder="No active plans yet" />
              </Field>
            </div>
            <div className="md:col-span-2">
              <Field label="Food restrictions / personal rules">
                <textarea
                  disabled={!editing}
                  value={draft.foodRules.join("\n")}
                  onChange={(event) => updateDraft({ foodRules: event.target.value.split("\n").map((rule) => rule.trim()).filter(Boolean) })}
                  className="form-control min-h-28"
                  placeholder="One rule per line"
                />
              </Field>
            </div>
          </div>
        </Panel>
      ) : null}

      {profileTab === "Settings" ? (
        <ProfileAppSettingsSection
          settings={settings}
          setSettings={setSettings}
          todayMode={todayMode}
          selectedTodayMode={selectedTodayMode}
          setSelectedTodayMode={setSelectedTodayMode}
          generateTodayByMode={generateTodayByMode}
        />
      ) : null}

      {profileTab === "Backup" ? (
        <>
          <ProfileBackupSection exportAllData={exportAllData} importAllData={importAllData} clearAllLocalData={clearAllLocalData} />
          <ProfileDangerZone resetToday={resetToday} resetProfile={resetProfile} resetDefaultTemplate={resetDefaultTemplate} clearAllLocalData={clearAllLocalData} />
        </>
      ) : null}

      {profileTab === "Version" ? <ProfileVersionSection /> : null}
    </section>
  );
}

function ProfileAppSettingsSection({
  settings,
  setSettings,
  todayMode,
  selectedTodayMode,
  setSelectedTodayMode,
  generateTodayByMode
}: {
  settings: SettingsState;
  setSettings: Dispatch<SetStateAction<SettingsState>>;
  todayMode: DailyMode;
  selectedTodayMode: DailyMode;
  setSelectedTodayMode: Dispatch<SetStateAction<DailyMode>>;
  generateTodayByMode: (mode?: DailyMode) => boolean;
}) {
  return (
    <section className="grid gap-5">
      <Panel>
        <p className="text-sm font-black uppercase tracking-[0.2em] text-amber-200">App Settings</p>
        <h3 className="mt-2 text-2xl font-black text-white">Daily defaults</h3>
        <div className="mt-5 grid gap-5">
          <div>
            <h4 className="text-lg font-black text-white">Default wake time / schedule start</h4>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {[
                { value: "5:30" as const, title: "5:30 AM", description: "Default Sunny schedule." },
                { value: "5:00" as const, title: "5:00 AM", description: "Move all missions 30 minutes earlier." }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSettings({ ...settings, scheduleVersion: option.value })}
                  className={`rounded-2xl border p-4 text-left transition ${
                    settings.scheduleVersion === option.value
                      ? "border-amber-300/60 bg-amber-300/[0.12] shadow-[0_0_30px_rgba(245,158,11,0.12)]"
                      : "border-white/10 bg-white/[0.04] hover:bg-white/[0.07]"
                  }`}
                >
                  <p className="text-xl font-black text-white">{option.title}</p>
                  <p className="mt-1 text-sm text-slate-400">{option.description}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-lg font-black text-white">Default daily mode</h4>
            <p className="mt-1 text-sm text-slate-400">Used by Quick Start Today and future generated days when no special mode is selected.</p>
            <div className="mt-3">
              <ModeSelector value={settings.defaultDailyMode ?? "Full Day"} onChange={(defaultDailyMode) => setSettings({ ...settings, defaultDailyMode })} />
            </div>
          </div>

          <div>
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h4 className="text-lg font-black text-white">Generate today by mode</h4>
                <p className="mt-1 text-sm text-slate-400">{modeProfiles[todayMode].note}</p>
                {selectedTodayMode !== todayMode ? <p className="mt-1 text-sm font-bold text-amber-100">Selected to generate: {selectedTodayMode} Mode</p> : null}
              </div>
              <button onClick={() => generateTodayByMode()} className="primary-button justify-center">
                <Sparkles size={18} />
                Generate Today&apos;s Missions
              </button>
            </div>
            <ModeSelector value={selectedTodayMode} onChange={setSelectedTodayMode} />
          </div>
        </div>
      </Panel>

      <Panel>
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#E7D79B] to-[#D8C27A] text-slate-950 shadow-[0_12px_28px_rgba(216,194,122,0.16)]">
            <Download size={21} />
          </div>
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-amber-200">Install App</p>
            <h3 className="mt-1 text-2xl font-black text-white">PWA install instructions</h3>
            <p className="mt-1 text-sm leading-6 text-slate-300">Open KPM Sunny Daily OS like a normal app from your phone or computer.</p>
          </div>
        </div>
        <div className="mt-4 grid gap-3">
          <InstallStep title="iPhone / Safari" body="Tap Share, then Add to Home Screen." />
          <InstallStep title="Android / Chrome" body="Tap menu, then Install app or Add to Home screen." />
          <InstallStep title="Desktop / Chrome" body="Click the install icon in the address bar if available." />
        </div>
      </Panel>
    </section>
  );
}

function ProfileBackupSection({ exportAllData, importAllData, clearAllLocalData }: { exportAllData: () => void; importAllData: (rawJson: string) => string; clearAllLocalData: () => void }) {
  const [importText, setImportText] = useState("");
  const [importStatus, setImportStatus] = useState("");
  const [storageInfo, setStorageInfo] = useState<StorageInfo>({ usedBytes: 0, limitBytes: LOCAL_STORAGE_LIMIT_BYTES, percent: 0 });

  useEffect(() => {
    setStorageInfo(calculateStorageInfo());
  }, [importStatus]);

  function handleImport() {
    const result = importAllData(importText);
    setImportStatus(result);
    setStorageInfo(calculateStorageInfo());
  }

  function handleImportFile(file?: File) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = importAllData(typeof reader.result === "string" ? reader.result : "");
      setImportStatus(result);
      setStorageInfo(calculateStorageInfo());
    };
    reader.onerror = () => setImportStatus("Import failed: backup file could not be read.");
    reader.readAsText(file);
  }

  const storageTone = storageInfo.percent >= 90 ? "border-red-300/35 bg-red-400/10 text-red-100" : storageInfo.percent >= 70 ? "border-orange-300/35 bg-orange-400/10 text-orange-100" : "border-emerald-300/25 bg-emerald-400/10 text-emerald-100";
  const storageWarning = storageInfo.percent >= 90
    ? "Danger: local storage is above 90%. Export a backup and clear old data soon."
    : storageInfo.percent >= 70
      ? "Warning: local storage is above 70%. Export a backup regularly."
      : "Storage looks healthy.";

  return (
    <Panel>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-amber-200">Storage + Backup</p>
          <h3 className="mt-2 text-2xl font-black text-white">Local data safety</h3>
          <p className="mt-1 text-sm leading-6 text-slate-400">Your data is saved only on this device until cloud sync is added. Export backup regularly.</p>
        </div>
        <button onClick={exportAllData} className="primary-button justify-center">
          <Download size={18} />
          Export Data
        </button>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <MiniMetric label="Storage Used" value={formatBytes(storageInfo.usedBytes)} />
        <MiniMetric label="Storage Limit" value={formatBytes(storageInfo.limitBytes)} />
        <MiniMetric label="Used" value={`${storageInfo.percent}%`} />
      </div>

      <div className={`mt-4 rounded-2xl border p-4 ${storageTone}`}>
        <p className="text-sm font-black">{storageWarning}</p>
      </div>

      <div className="mt-4 grid gap-3">
        <Field label="Import backup JSON file">
          <input
            type="file"
            accept="application/json,.json"
            onChange={(event) => handleImportFile(event.target.files?.[0])}
            className="form-control"
          />
        </Field>
        <Field label="Or paste backup JSON">
          <textarea
            value={importText}
            onChange={(event) => setImportText(event.target.value)}
            className="form-control min-h-32"
            placeholder="Paste a KPM Sunny Daily OS backup JSON file here"
          />
        </Field>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button onClick={handleImport} className="secondary-button">
            Import Data
          </button>
          <button onClick={clearAllLocalData} className="danger-button">
            <Trash2 size={18} />
            Clear All Data
          </button>
          {importStatus ? <p className="text-sm font-bold text-amber-100">{importStatus}</p> : null}
        </div>
      </div>
    </Panel>
  );
}

function ProfileDangerZone({ resetToday, resetProfile, resetDefaultTemplate, clearAllLocalData }: { resetToday: () => void; resetProfile: () => void; resetDefaultTemplate: () => void; clearAllLocalData: () => void }) {
  return (
    <Panel>
      <p className="text-sm font-black uppercase tracking-[0.2em] text-red-200">Danger Zone</p>
      <h3 className="mt-2 text-2xl font-black text-white">Confirmed reset actions</h3>
      <p className="mt-1 text-sm leading-6 text-slate-400">These actions ask for confirmation before changing local data.</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <button onClick={resetToday} className="danger-button justify-center">
          <RotateCcw size={18} />
          Reset Today
        </button>
        <button onClick={resetProfile} className="danger-button justify-center">
          <RotateCcw size={18} />
          Reset Profile
        </button>
        <button onClick={resetDefaultTemplate} className="danger-button justify-center">
          <RotateCcw size={18} />
          Reset Template
        </button>
        <button onClick={clearAllLocalData} className="danger-button justify-center">
          <Trash2 size={18} />
          Clear Local Data
        </button>
      </div>
    </Panel>
  );
}

function ProfileVersionSection() {
  const environment = typeof window !== "undefined" && ["localhost", "127.0.0.1"].includes(window.location.hostname) ? "Local" : "Production";

  return (
    <Panel>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-amber-200">App Version</p>
          <h3 className="mt-2 text-2xl font-black text-white">KPM Sunny Daily OS · {APP_VERSION}</h3>
          <p className="mt-1 text-sm leading-6 text-slate-400">Version, changelog, and deployment note.</p>
        </div>
        <Badge tone="gold">{environment}</Badge>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <MiniMetric label="Current version" value={APP_VERSION} />
        <MiniMetric label="Last updated" value={APP_LAST_UPDATED} />
        <MiniMetric label="Environment" value={environment} />
      </div>
      <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
        <p className="font-black text-white">Changelog</p>
        <ul className="mt-3 grid gap-2 text-sm leading-6 text-slate-300">
          <li>V1.6 Stability + backup foundation</li>
          <li>V1.7 Vercel deployment</li>
          <li>V1.8 7-day real use test</li>
          <li>V1.9 Smart Mission Scheduler</li>
          <li>Storage + Backup Center</li>
          <li>V2.0 Life OS foundation</li>
          <li>V2.1 Everyday Essentials preset plan</li>
          <li>V2.2 Get Lean / Shred preset plan</li>
          <li>V2.3 Learn / Master Subject preset plan</li>
          <li>V2.4 Multiple active plans</li>
          <li>V2.5 Today Priority Control</li>
          <li>V2.6 Wake time + target sleep Build Today</li>
          <li>V2.7 Get Lean macro targets + food log</li>
          <li>V2.8 Fix Sleep & Energy preset plan</li>
          <li>V2.9 Build a Project preset plan</li>
          <li>V2.10 Active Plan Control Center</li>
          <li>V2.11 Stability + backup test pass</li>
          <li>V3.0 Money Plan - Increase Income + Saving Plan</li>
          <li>V3.1 Life Reset preset plan</li>
          <li>V3.2 Long Study Event Planner</li>
          <li>V3.3 Plan tab organization</li>
          <li>V3.4 Progress Review Center</li>
          <li>V3.5 Full stability + data safety pass</li>
          <li>V3.6 7-Day Real Use Test Mode</li>
          <li>V3.7 Long-Term Planning Hub</li>
        </ul>
      </div>
      <p className="mt-4 text-sm leading-6 text-amber-100">If the live Vercel app looks old, push the latest Git commit and refresh the app.</p>
    </Panel>
  );
}

function EssentialsSelect({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <SelectField label={label} value={value} options={options} onChange={onChange} />
  );
}

function ActivePlanTasksSection({
  activePlans,
  updateActivePlan,
  foodLogs,
  todayKey,
  moneySpendingLogs,
  moneyIncomeLogs,
  moneySavingLogs,
  moneyOpportunityLogs
}: {
  activePlans: ActivePlan[];
  updateActivePlan: (planId: string, updater: SetStateAction<ActivePlan | null>) => void;
  foodLogs: DailyFoodLogs;
  todayKey: string;
  moneySpendingLogs: MoneySpendingLog[];
  moneyIncomeLogs: MoneyIncomeLog[];
  moneySavingLogs: MoneySavingLog[];
  moneyOpportunityLogs: MoneyOpportunityLog[];
}) {
  const [filter, setFilter] = useState<PlanTaskFilter>("All");
  const [showMore, setShowMore] = useState(false);
  const prioritizedRows = useMemo(() => getPrioritizedPlanTaskRows(activePlans), [activePlans]);
  const filteredRows = filter === "All" ? prioritizedRows : prioritizedRows.filter((row) => row.filterGroup === filter);
  const visibleRows = showMore ? filteredRows : filteredRows.slice(0, 5);
  const hiddenCount = Math.max(filteredRows.length - 5, 0);
  const getLeanPlan = activePlans.find((plan): plan is GetLeanPlan => plan.type === "get_lean_shred");
  const sleepPlan = activePlans.find((plan): plan is SleepEnergyPlan => plan.type === "fix_sleep_energy");
  const projectPlan = activePlans.find((plan): plan is BuildProjectPlan => plan.type === "build_project");
  const moneyPlan = activePlans.find((plan): plan is MoneyPlan => plan.type === "money_plan");
  const lifeResetPlan = activePlans.find((plan): plan is LifeResetPlan => plan.type === "life_reset");

  return (
    <Panel compact>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-cyan-100">Active Disciplines</p>
          <h3 className="mt-1 text-2xl font-black text-white">Plan systems for today</h3>
          <p className="mt-1 text-sm leading-6 text-slate-400">Showing the top 5 priority tasks from all active plans.</p>
        </div>
        <Badge tone="dark">{filteredRows.length} tasks</Badge>
      </div>

      {getLeanPlan ? (
        <CompactMacroSummary activePlan={normalizeGetLeanPlan(getLeanPlan)} entries={foodLogs[todayKey] ?? []} />
      ) : null}

      {sleepPlan ? <CompactSleepEnergySummary activePlan={normalizeSleepEnergyPlan(sleepPlan)} /> : null}

      {projectPlan ? <CompactProjectSummary activePlan={normalizeBuildProjectPlan(projectPlan)} /> : null}

      {moneyPlan ? <CompactMoneySummary activePlan={normalizeMoneyPlan(moneyPlan)} spendingLogs={moneySpendingLogs} incomeLogs={moneyIncomeLogs} savingLogs={moneySavingLogs} opportunityLogs={moneyOpportunityLogs} /> : null}

      {lifeResetPlan ? <CompactLifeResetSummary activePlan={normalizeLifeResetPlan(lifeResetPlan)} /> : null}

      <div className="mt-5 flex flex-wrap gap-2">
        {(["All", "Main", "Body", "Skill", "Essentials"] as PlanTaskFilter[]).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => {
              setFilter(option);
              setShowMore(false);
            }}
            className={`rounded-full border px-3 py-2 text-xs font-black uppercase tracking-[0.14em] transition ${filter === option ? "border-cyan-200/40 bg-[#172033] text-[#F3F4F7] shadow-[0_0_18px_rgba(89,195,255,0.12)]" : "border-white/10 bg-white/[0.04] text-slate-300 hover:border-cyan-200/40 hover:text-white"}`}
          >
            {option}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-2">
        {visibleRows.length > 0 ? (
          visibleRows.map((row) => (
            <PlanTaskMiniRow key={`${row.plan.id}-${row.id}`} row={row} onToggle={() => togglePlanTask(row.plan, row.id, updateActivePlan)} />
          ))
        ) : (
          <p className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm font-semibold text-slate-300">No plan tasks match this filter.</p>
        )}
      </div>
      {filteredRows.length > 5 ? (
        <button type="button" onClick={() => setShowMore((current) => !current)} className="secondary-button mt-4 w-full justify-center">
          {showMore ? "Show Less Plan Tasks" : `View More Plan Tasks (${hiddenCount} hidden)`}
        </button>
      ) : null}
    </Panel>
  );
}

function TodayFocusCard({ focusItems }: { focusItems: TodayFocusItem[] }) {
  return (
    <Panel compact className="border-cyan-200/15 bg-[linear-gradient(135deg,rgba(111,214,209,0.075),rgba(19,33,58,0.70))]">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-cyan-100">Core Priorities</p>
          <h3 className="mt-1 text-xl font-black text-white">Three directives to execute</h3>
        </div>
        <Badge tone="gold">{focusItems.length}/3 focus</Badge>
      </div>
      <div className="mt-4 grid gap-2 lg:grid-cols-3">
        {focusItems.map((item) => (
          <div key={`${item.source}-${item.title}`} className="min-w-0 rounded-2xl border border-white/10 bg-black/25 p-3">
            <p className="break-words text-sm font-black text-white">{item.title}</p>
            {item.detail ? <p className="mt-1 break-words text-xs font-bold leading-5 text-slate-300">{item.detail}</p> : null}
            <span className="mt-2 inline-flex">
              <Badge tone="dark">{item.source}</Badge>
            </span>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function PlanTaskMiniRow({ row, onToggle }: { row: PlanTaskRow & { source?: string; filterGroup?: string }; onToggle: () => void }) {
  return (
    <div className={`rounded-2xl border p-3 ${row.completed ? "border-emerald-300/35 bg-emerald-400/[0.08]" : "border-white/10 bg-white/[0.04]"}`}>
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={onToggle}
          className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border ${row.completed ? "border-emerald-300 bg-emerald-400 text-slate-950" : "border-white/15 bg-black/20 text-slate-400"}`}
        >
          {row.completed ? <Check size={16} /> : null}
        </button>
        <div className="min-w-0 flex-1">
          <p className="break-words text-sm font-black text-white">{row.title}</p>
          {row.detail ? <p className="mt-1 break-words text-xs font-bold leading-5 text-slate-300">{row.detail}</p> : null}
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge tone="dark">{row.badge}</Badge>
            {row.source ? <Badge tone="gold">{row.source}</Badge> : null}
            {row.filterGroup ? <Badge tone="dark">{row.filterGroup}</Badge> : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function EverydayEssentialsTodayCard({ activePlan, setActivePlan }: { activePlan: EverydayEssentialsPlan; setActivePlan: Dispatch<SetStateAction<ActivePlan | null>> }) {
  const visibleItems = activePlan.dailyTasks.filter((item) => !item.disabled).slice(0, 5);
  const completed = activePlan.dailyTasks.filter((item) => !item.disabled && item.completed).length;
  const total = activePlan.dailyTasks.filter((item) => !item.disabled).length;
  const [expanded, setExpanded] = useState(false);

  return (
    <Panel compact>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-amber-200">Everyday Essentials</p>
          <h3 className="mt-1 text-2xl font-black text-white">Basic life inventory</h3>
          <p className="mt-1 text-sm leading-6 text-slate-400">{completed}/{total} daily essentials complete</p>
        </div>
        <button type="button" onClick={() => setExpanded((current) => !current)} className="secondary-button justify-center">
          {expanded ? "Hide Full Checklist" : "View Full Essentials Checklist"}
        </button>
      </div>
      <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
        {(expanded ? activePlan.dailyTasks.filter((item) => !item.disabled) : visibleItems).map((item) => (
          <EssentialsItemRow key={item.id} item={item} list="dailyTasks" activePlan={activePlan} setActivePlan={setActivePlan} compact />
        ))}
      </div>
    </Panel>
  );
}

function EssentialsChecklistManager({ activePlan, setActivePlan }: { activePlan: EverydayEssentialsPlan; setActivePlan: Dispatch<SetStateAction<ActivePlan | null>> }) {
  const [customTitle, setCustomTitle] = useState("");
  const [customCategory, setCustomCategory] = useState<EssentialsCategory>("Hygiene");
  const [customList, setCustomList] = useState<"dailyTasks" | "weeklyTasks" | "monthlyTasks">("dailyTasks");

  function addCustomItem() {
    const title = customTitle.trim();
    if (!title) return;
    const item: EssentialsItem = {
      id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title,
      category: customCategory,
      completed: false,
      disabled: false,
      custom: true
    };
    setActivePlan({ ...activePlan, [customList]: [...activePlan[customList], item] });
    setCustomTitle("");
  }

  return (
    <Panel>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-amber-200">Active Plan Details</p>
          <h3 className="mt-2 text-2xl font-black text-white">Everyday Essentials</h3>
          <p className="mt-1 text-sm leading-6 text-slate-400">Started {activePlan.startDate}. Restock reminder: {activePlan.setup.restockReminder}.</p>
        </div>
        <Badge tone="green">Active</Badge>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_0.8fr_0.8fr_auto]">
        <Field label="Custom item">
          <input value={customTitle} onChange={(event) => setCustomTitle(event.target.value)} className="form-control" placeholder="Add custom essential" />
        </Field>
        <SelectField label="Checklist" value={customList} options={["dailyTasks", "weeklyTasks", "monthlyTasks"]} onChange={(value) => setCustomList(value as "dailyTasks" | "weeklyTasks" | "monthlyTasks")} />
        <SelectField label="Category" value={customCategory} options={["Hygiene", "Clothing", "Food & Water", "Health", "Room & Cleaning", "Sleep", "Tech", "Emergency"]} onChange={(value) => setCustomCategory(value as EssentialsCategory)} />
        <div className="flex items-end">
          <button type="button" onClick={addCustomItem} className="primary-button min-h-[3.25rem] w-full justify-center">
            <Plus size={18} />
            Add Item
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-3">
        <EssentialsChecklistSection title="Daily Use Checklist" list="dailyTasks" activePlan={activePlan} setActivePlan={setActivePlan} />
        <EssentialsChecklistSection title="Weekly Restock Checklist" list="weeklyTasks" activePlan={activePlan} setActivePlan={setActivePlan} />
        <EssentialsChecklistSection title="Monthly Inventory Checklist" list="monthlyTasks" activePlan={activePlan} setActivePlan={setActivePlan} />
      </div>
    </Panel>
  );
}

function EssentialsChecklistSection({
  title,
  list,
  activePlan,
  setActivePlan
}: {
  title: string;
  list: "dailyTasks" | "weeklyTasks" | "monthlyTasks";
  activePlan: EverydayEssentialsPlan;
  setActivePlan: Dispatch<SetStateAction<ActivePlan | null>>;
}) {
  const items = activePlan[list];
  const enabled = items.filter((item) => !item.disabled);
  const completed = enabled.filter((item) => item.completed).length;

  return (
    <section className="rounded-[1.35rem] border border-white/10 bg-black/20 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-lg font-black text-white">{title}</h4>
          <p className="mt-1 text-sm text-slate-400">{completed}/{enabled.length} complete</p>
        </div>
        <button type="button" onClick={() => resetEssentialsList(activePlan, setActivePlan, list)} className="secondary-button min-h-10 px-3 py-2 text-xs">Reset</button>
      </div>
      <div className="mt-4 grid gap-2">
        {items.map((item) => (
          <EssentialsItemRow key={item.id} item={item} list={list} activePlan={activePlan} setActivePlan={setActivePlan} />
        ))}
      </div>
    </section>
  );
}

function EssentialsItemRow({
  item,
  list,
  activePlan,
  setActivePlan,
  compact = false
}: {
  item: EssentialsItem;
  list: "dailyTasks" | "weeklyTasks" | "monthlyTasks";
  activePlan: EverydayEssentialsPlan;
  setActivePlan: Dispatch<SetStateAction<ActivePlan | null>>;
  compact?: boolean;
}) {
  if (item.disabled && compact) return null;
  return (
    <div className={`rounded-2xl border p-3 ${item.completed ? "border-emerald-300/35 bg-emerald-400/[0.08]" : item.disabled ? "border-orange-300/25 bg-orange-400/[0.06] opacity-70" : "border-white/10 bg-white/[0.04]"}`}>
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={() => updateEssentialsItem(activePlan, setActivePlan, list, item.id, { completed: !item.completed })}
          className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border ${item.completed ? "border-emerald-300 bg-emerald-400 text-slate-950" : "border-white/15 bg-black/20 text-slate-400"}`}
        >
          {item.completed ? <Check size={16} /> : null}
        </button>
        <div className="min-w-0 flex-1">
          <p className="break-words text-sm font-black text-white">{item.title}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge tone="dark">{item.category}</Badge>
            {item.custom ? <Badge tone="gold">Custom</Badge> : null}
            {item.disabled ? <Badge tone="orange">Disabled</Badge> : null}
          </div>
        </div>
        {!compact ? (
          <button type="button" onClick={() => updateEssentialsItem(activePlan, setActivePlan, list, item.id, { disabled: !item.disabled })} className="secondary-button min-h-9 px-3 py-2 text-xs">
            {item.disabled ? "Enable" : "Disable"}
          </button>
        ) : null}
      </div>
    </div>
  );
}

function MoneyPlanSetupPanel({
  setup,
  setSetup,
  onSave,
  onCancel
}: {
  setup: MoneySetup;
  setSetup: Dispatch<SetStateAction<MoneySetup>>;
  onSave: () => void;
  onCancel: () => void;
}) {
  const calculations = calculateMoneyPlan(setup);

  function updateSetup(patch: Partial<MoneySetup>) {
    setSetup((current) => ({ ...current, ...patch }));
  }

  return (
    <Panel>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-amber-200">Money Plan Setup</p>
          <h3 className="mt-2 text-2xl font-black text-white">Increase income, control spending, and save toward a goal.</h3>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-400">This is a personal money planning tool, not financial advice.</p>
        </div>
        <Badge tone="gold">{setup.incomePath}</Badge>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <SelectField label="Main money goal" value={setup.mainMoneyGoal} options={moneyGoalOptions} onChange={(mainMoneyGoal) => updateSetup({ mainMoneyGoal })} />
        <SelectField label="Target amount" value={moneyTargetAmountOptions.includes(String(setup.targetAmount)) ? String(setup.targetAmount) : "custom"} options={moneyTargetAmountOptions} onChange={(value) => updateSetup({ targetAmount: value === "custom" ? setup.customTargetAmount : Number(value) || 0 })} />
        <Field label="Custom target amount"><input type="number" value={setup.customTargetAmount || ""} onChange={(event) => updateSetup({ customTargetAmount: Number(event.target.value) || 0, targetAmount: Number(event.target.value) || setup.targetAmount })} className="form-control" /></Field>
        <SelectField label="Target deadline" value={setup.targetDeadline} options={moneyDeadlineOptions} onChange={(targetDeadline) => updateSetup({ targetDeadline })} />
        {setup.targetDeadline === "custom date" ? <Field label="Custom deadline"><input type="date" value={setup.customDeadline} onChange={(event) => updateSetup({ customDeadline: event.target.value })} className="form-control" /></Field> : null}
        <Field label="Current monthly income"><input type="number" value={setup.currentMonthlyIncome || ""} onChange={(event) => updateSetup({ currentMonthlyIncome: Number(event.target.value) || 0 })} className="form-control" /></Field>
        <Field label="Current monthly fixed expenses"><input type="number" value={setup.currentMonthlyFixedExpenses || ""} onChange={(event) => updateSetup({ currentMonthlyFixedExpenses: Number(event.target.value) || 0 })} className="form-control" /></Field>
        <Field label="Current savings"><input type="number" value={setup.currentSavings || ""} onChange={(event) => updateSetup({ currentSavings: Number(event.target.value) || 0 })} className="form-control" /></Field>
        <Field label="Currency"><input value={setup.currency} onChange={(event) => updateSetup({ currency: event.target.value || "USD" })} className="form-control" /></Field>
        <SelectField label="Income path" value={setup.incomePath} options={moneyIncomePathOptions} onChange={(incomePath) => updateSetup({ incomePath })} />
        <SelectField label="Daily money time" value={setup.dailyMoneyTime} options={moneyDailyTimeOptions} onChange={(dailyMoneyTime) => updateSetup({ dailyMoneyTime })} />
        {setup.dailyMoneyTime === "custom" ? <Field label="Custom daily minutes"><input type="number" value={setup.customDailyMinutes || ""} onChange={(event) => updateSetup({ customDailyMinutes: Number(event.target.value) || 30 })} className="form-control" /></Field> : null}
        <SelectField label="Current bottleneck" value={setup.currentBottleneck} options={moneyBottleneckOptions} onChange={(currentBottleneck) => updateSetup({ currentBottleneck })} />
        <SelectField label="Saving style" value={setup.savingStyle} options={moneySavingStyleOptions} onChange={(savingStyle) => updateSetup({ savingStyle })} />
        <div className="md:col-span-2 xl:col-span-3">
          <Field label="Spending categories to track">
            <textarea value={setup.spendingCategories.join(", ")} onChange={(event) => updateSetup({ spendingCategories: event.target.value.split(",").map((item) => item.trim()).filter(Boolean) })} className="form-control min-h-24" />
          </Field>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MiniMetric label="Monthly Leftover" value={formatMoney(calculations.monthlyLeftover, setup.currency)} />
        <MiniMetric label="Remaining Needed" value={formatMoney(calculations.remainingSavingNeeded, setup.currency)} />
        <MiniMetric label="Daily Saving" value={calculations.neededSavingPerDay === null ? "No deadline" : formatMoney(calculations.neededSavingPerDay, setup.currency)} />
        <MiniMetric label="Progress" value={`${calculations.progressPercent}%`} />
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button type="button" onClick={onSave} className="primary-button justify-center">Save Money Plan</button>
        <button type="button" onClick={onCancel} className="secondary-button justify-center">Cancel</button>
      </div>
    </Panel>
  );
}

function CompactMoneySummary({
  activePlan,
  spendingLogs,
  incomeLogs,
  savingLogs,
  opportunityLogs
}: {
  activePlan: MoneyPlan;
  spendingLogs: MoneySpendingLog[];
  incomeLogs: MoneyIncomeLog[];
  savingLogs: MoneySavingLog[];
  opportunityLogs: MoneyOpportunityLog[];
}) {
  const summary = getMoneySummary(activePlan, spendingLogs, incomeLogs, savingLogs, opportunityLogs);
  const action = getTodayMoneyAction(activePlan);
  return (
    <div className="mt-5 rounded-2xl border border-amber-200/20 bg-amber-300/[0.06] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-100">Money Plan</p>
          <h4 className="mt-1 text-lg font-black text-white">Goal: Save {formatMoney(activePlan.setup.targetAmount, activePlan.setup.currency)}</h4>
          <p className="mt-1 text-sm leading-6 text-slate-300">Progress: {formatMoney(summary.currentSavings, activePlan.setup.currency)} / {formatMoney(activePlan.setup.targetAmount, activePlan.setup.currency)}</p>
        </div>
        <Badge tone="gold">{activePlan.setup.incomePath}</Badge>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        <MacroMini label="Today saving target" value={activePlan.calculations.neededSavingPerDay === null ? "No deadline" : formatMoney(activePlan.calculations.neededSavingPerDay, activePlan.setup.currency)} />
        <MacroMini label="Money action" value={action} />
        <MacroMini label="Week spending" value={formatMoney(summary.weekSpending, activePlan.setup.currency)} />
        <MacroMini label="Month income" value={formatMoney(summary.monthIncome, activePlan.setup.currency)} />
      </div>
    </div>
  );
}

function MoneyPlanDetails({
  activePlan,
  setActivePlan,
  spendingLogs,
  setSpendingLogs,
  incomeLogs,
  setIncomeLogs,
  savingLogs,
  setSavingLogs,
  opportunityLogs,
  setOpportunityLogs
}: {
  activePlan: MoneyPlan;
  setActivePlan: Dispatch<SetStateAction<ActivePlan | null>>;
  spendingLogs: MoneySpendingLog[];
  setSpendingLogs: Dispatch<SetStateAction<MoneySpendingLog[]>>;
  incomeLogs: MoneyIncomeLog[];
  setIncomeLogs: Dispatch<SetStateAction<MoneyIncomeLog[]>>;
  savingLogs: MoneySavingLog[];
  setSavingLogs: Dispatch<SetStateAction<MoneySavingLog[]>>;
  opportunityLogs: MoneyOpportunityLog[];
  setOpportunityLogs: Dispatch<SetStateAction<MoneyOpportunityLog[]>>;
}) {
  const [spendingDraft, setSpendingDraft] = useState<MoneySpendingLog>(() => createDefaultSpendingLog(activePlan));
  const [incomeDraft, setIncomeDraft] = useState<MoneyIncomeLog>(() => createDefaultIncomeLog());
  const [savingDraft, setSavingDraft] = useState<MoneySavingLog>(() => createDefaultSavingLog(activePlan));
  const [opportunityDraft, setOpportunityDraft] = useState<MoneyOpportunityLog>(() => createDefaultOpportunityLog(activePlan));
  const summary = getMoneySummary(activePlan, spendingLogs, incomeLogs, savingLogs, opportunityLogs);

  function saveSpendingLog() {
    setSpendingLogs((current) => upsertMoneyLog(current, normalizeMoneySpendingLog(spendingDraft)));
    setSpendingDraft(createDefaultSpendingLog(activePlan));
  }

  function saveIncomeLog() {
    setIncomeLogs((current) => upsertMoneyLog(current, normalizeMoneyIncomeLog(incomeDraft)));
    setIncomeDraft(createDefaultIncomeLog());
  }

  function saveSavingLog() {
    setSavingLogs((current) => upsertMoneyLog(current, normalizeMoneySavingLog(savingDraft)));
    setSavingDraft(createDefaultSavingLog(activePlan));
  }

  function saveOpportunityLog() {
    const normalized = normalizeMoneyOpportunityLog(opportunityDraft);
    setOpportunityLogs((current) => upsertMoneyLog(current, normalized));
    setActivePlan({ ...activePlan, logs: upsertMoneyLog(activePlan.logs, normalized) });
    setOpportunityDraft(createDefaultOpportunityLog(activePlan));
  }

  return (
    <div className="grid gap-5">
      <Panel>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-amber-200">Active Plan Details</p>
            <h3 className="mt-2 text-2xl font-black text-white">Money Plan</h3>
            <p className="mt-1 text-sm leading-6 text-slate-400">Increase income, control spending, and save toward a goal. This is not financial advice.</p>
          </div>
          <Badge tone="green">Active</Badge>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MiniMetric label="Target" value={formatMoney(activePlan.setup.targetAmount, activePlan.setup.currency)} />
          <MiniMetric label="Current Savings" value={formatMoney(summary.currentSavings, activePlan.setup.currency)} />
          <MiniMetric label="Remaining" value={formatMoney(summary.remainingNeeded, activePlan.setup.currency)} />
          <MiniMetric label="Progress" value={`${summary.progressPercent}%`} />
          <MiniMetric label="Daily Saving" value={activePlan.calculations.neededSavingPerDay === null ? "No deadline" : formatMoney(activePlan.calculations.neededSavingPerDay, activePlan.setup.currency)} />
          <MiniMetric label="Weekly Saving" value={activePlan.calculations.neededSavingPerWeek === null ? "No deadline" : formatMoney(activePlan.calculations.neededSavingPerWeek, activePlan.setup.currency)} />
          <MiniMetric label="Monthly Leftover" value={formatMoney(activePlan.calculations.monthlyLeftover, activePlan.setup.currency)} />
          <MiniMetric label="Income Path" value={activePlan.setup.incomePath} />
        </div>
      </Panel>

      <Panel>
        <p className="text-sm font-black uppercase tracking-[0.2em] text-amber-200">Daily Money Tasks</p>
        <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {activePlan.dailyTasks.map((item) => <MoneyTaskRow key={item.id} item={item} activePlan={activePlan} setActivePlan={setActivePlan} list="dailyTasks" />)}
        </div>
      </Panel>

      <Panel>
        <p className="text-sm font-black uppercase tracking-[0.2em] text-amber-200">Money Logs</p>
        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          <MoneySpendingLogForm draft={spendingDraft} setDraft={setSpendingDraft} categories={activePlan.setup.spendingCategories} onSave={saveSpendingLog} />
          <MoneyIncomeLogForm draft={incomeDraft} setDraft={setIncomeDraft} onSave={saveIncomeLog} />
          <MoneySavingLogForm draft={savingDraft} setDraft={setSavingDraft} onSave={saveSavingLog} />
          <MoneyOpportunityLogForm draft={opportunityDraft} setDraft={setOpportunityDraft} onSave={saveOpportunityLog} />
        </div>
      </Panel>

      <Panel>
        <p className="text-sm font-black uppercase tracking-[0.2em] text-amber-200">Recent Money Records</p>
        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          <MoneySpendingLogList logs={spendingLogs} currency={activePlan.setup.currency} editLog={setSpendingDraft} deleteLog={(id) => {
            if (window.confirm("Delete this spending log?")) setSpendingLogs((current) => current.filter((log) => log.id !== id));
          }} />
          <MoneyIncomeLogList logs={incomeLogs} currency={activePlan.setup.currency} editLog={setIncomeDraft} deleteLog={(id) => {
            if (window.confirm("Delete this income log?")) setIncomeLogs((current) => current.filter((log) => log.id !== id));
          }} />
          <MoneySavingLogList logs={savingLogs} currency={activePlan.setup.currency} editLog={setSavingDraft} deleteLog={(id) => {
            if (window.confirm("Delete this saving log?")) setSavingLogs((current) => current.filter((log) => log.id !== id));
          }} />
          <MoneyOpportunityLogList
            logs={opportunityLogs}
            editLog={setOpportunityDraft}
            deleteLog={(id) => {
              if (!window.confirm("Delete this opportunity log?")) return;
              setOpportunityLogs((current) => current.filter((log) => log.id !== id));
              setActivePlan({ ...activePlan, logs: activePlan.logs.filter((log) => log.id !== id) });
            }}
            updateStatus={(id, status) => {
              setOpportunityLogs((current) => current.map((log) => log.id === id ? { ...log, status } : log));
              setActivePlan({ ...activePlan, logs: activePlan.logs.map((log) => log.id === id ? { ...log, status } : log) });
            }}
          />
        </div>
      </Panel>

      <MoneyPlanProgressSummary activePlans={[activePlan]} spendingLogs={spendingLogs} incomeLogs={incomeLogs} savingLogs={savingLogs} opportunityLogs={opportunityLogs} />
    </div>
  );
}

function MoneyTaskRow({ item, activePlan, setActivePlan, list, compact = false }: { item: MoneyTask; activePlan: MoneyPlan; setActivePlan: Dispatch<SetStateAction<ActivePlan | null>>; list: "dailyTasks" | "weeklyTasks"; compact?: boolean }) {
  if (item.disabled && compact) return null;
  return (
    <div className={`rounded-2xl border p-3 ${item.completed ? "border-emerald-300/35 bg-emerald-400/[0.08]" : item.disabled ? "border-orange-300/25 bg-orange-400/[0.06] opacity-70" : "border-white/10 bg-white/[0.04]"}`}>
      <div className="flex items-start gap-3">
        <button type="button" onClick={() => updateMoneyTask(activePlan, setActivePlan, list, item.id, { completed: !item.completed })} className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border ${item.completed ? "border-emerald-300 bg-emerald-400 text-slate-950" : "border-white/15 bg-black/20 text-slate-400"}`}>
          {item.completed ? <Check size={16} /> : null}
        </button>
        <div className="min-w-0 flex-1">
          <p className="break-words text-sm font-black text-white">{item.title}</p>
          <p className="mt-1 break-words text-xs font-bold leading-5 text-slate-300">{item.detail}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge tone="dark">{item.kind}</Badge>
            {item.disabled ? <Badge tone="orange">Disabled</Badge> : null}
          </div>
        </div>
        {!compact ? <button type="button" onClick={() => updateMoneyTask(activePlan, setActivePlan, list, item.id, { disabled: !item.disabled })} className="secondary-button min-h-9 px-3 py-2 text-xs">{item.disabled ? "Enable" : "Disable"}</button> : null}
      </div>
    </div>
  );
}

function MoneySpendingLogForm({ draft, setDraft, categories, onSave }: { draft: MoneySpendingLog; setDraft: Dispatch<SetStateAction<MoneySpendingLog>>; categories: string[]; onSave: () => void }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <h4 className="font-black text-white">Spending Log</h4>
      <div className="mt-4 grid gap-3">
        <Field label="Date"><input type="date" value={draft.date} onChange={(event) => setDraft((current) => ({ ...current, date: event.target.value }))} className="form-control" /></Field>
        <SelectField label="Category" value={draft.category} options={categories.length ? categories : defaultMoneySetup.spendingCategories} onChange={(category) => setDraft((current) => ({ ...current, category }))} />
        <Field label="Amount"><input type="number" value={draft.amount || ""} onChange={(event) => setDraft((current) => ({ ...current, amount: Number(event.target.value) || 0 }))} className="form-control" /></Field>
        <label className="flex min-h-[3.25rem] items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-black text-white"><input type="checkbox" checked={draft.necessary} onChange={(event) => setDraft((current) => ({ ...current, necessary: event.target.checked }))} className="h-5 w-5 accent-emerald-400" />Necessary?</label>
        <Field label="Note"><input value={draft.note} onChange={(event) => setDraft((current) => ({ ...current, note: event.target.value }))} className="form-control" /></Field>
        <button type="button" onClick={onSave} className="primary-button justify-center">Save Spending</button>
      </div>
    </section>
  );
}

function MoneyIncomeLogForm({ draft, setDraft, onSave }: { draft: MoneyIncomeLog; setDraft: Dispatch<SetStateAction<MoneyIncomeLog>>; onSave: () => void }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <h4 className="font-black text-white">Income Log</h4>
      <div className="mt-4 grid gap-3">
        <Field label="Date"><input type="date" value={draft.date} onChange={(event) => setDraft((current) => ({ ...current, date: event.target.value }))} className="form-control" /></Field>
        <Field label="Source"><input value={draft.source} onChange={(event) => setDraft((current) => ({ ...current, source: event.target.value }))} className="form-control" /></Field>
        <Field label="Amount"><input type="number" value={draft.amount || ""} onChange={(event) => setDraft((current) => ({ ...current, amount: Number(event.target.value) || 0 }))} className="form-control" /></Field>
        <Field label="Note"><input value={draft.note} onChange={(event) => setDraft((current) => ({ ...current, note: event.target.value }))} className="form-control" /></Field>
        <button type="button" onClick={onSave} className="primary-button justify-center">Save Income</button>
      </div>
    </section>
  );
}

function MoneySavingLogForm({ draft, setDraft, onSave }: { draft: MoneySavingLog; setDraft: Dispatch<SetStateAction<MoneySavingLog>>; onSave: () => void }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <h4 className="font-black text-white">Saving Log</h4>
      <div className="mt-4 grid gap-3">
        <Field label="Date"><input type="date" value={draft.date} onChange={(event) => setDraft((current) => ({ ...current, date: event.target.value }))} className="form-control" /></Field>
        <Field label="Amount saved"><input type="number" value={draft.amountSaved || ""} onChange={(event) => setDraft((current) => ({ ...current, amountSaved: Number(event.target.value) || 0 }))} className="form-control" /></Field>
        <Field label="Note"><input value={draft.note} onChange={(event) => setDraft((current) => ({ ...current, note: event.target.value }))} className="form-control" /></Field>
        <button type="button" onClick={onSave} className="primary-button justify-center">Save Savings</button>
      </div>
    </section>
  );
}

function MoneyOpportunityLogForm({ draft, setDraft, onSave }: { draft: MoneyOpportunityLog; setDraft: Dispatch<SetStateAction<MoneyOpportunityLog>>; onSave: () => void }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <h4 className="font-black text-white">Opportunity Tracker</h4>
      <div className="mt-4 grid gap-3">
        <SelectField label="Type" value={draft.type} options={moneyOpportunityTypes} onChange={(type) => setDraft((current) => ({ ...current, type }))} />
        <Field label="Title"><input value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} className="form-control" /></Field>
        <SelectField label="Status" value={draft.status} options={moneyOpportunityStatuses} onChange={(status) => setDraft((current) => ({ ...current, status }))} />
        <Field label="Date"><input type="date" value={draft.date} onChange={(event) => setDraft((current) => ({ ...current, date: event.target.value }))} className="form-control" /></Field>
        <Field label="Note"><input value={draft.note} onChange={(event) => setDraft((current) => ({ ...current, note: event.target.value }))} className="form-control" /></Field>
        <button type="button" onClick={onSave} className="primary-button justify-center">Save Opportunity</button>
      </div>
    </section>
  );
}

function MoneySpendingLogList({ logs, currency, editLog, deleteLog }: { logs: MoneySpendingLog[]; currency: string; editLog: (log: MoneySpendingLog) => void; deleteLog: (id: string) => void }) {
  return (
    <MoneyLogSection title="Spending">
      {logs.slice(-5).reverse().map((log) => (
        <MoneyLogRow key={log.id} title={`${log.category} · ${formatMoney(log.amount, currency)}`} detail={`${log.date}${log.necessary ? " · necessary" : " · optional"}${log.note ? ` · ${log.note}` : ""}`} onEdit={() => editLog(log)} onDelete={() => deleteLog(log.id)} />
      ))}
      {logs.length === 0 ? <p className="text-sm text-slate-400">No spending logs yet.</p> : null}
    </MoneyLogSection>
  );
}

function MoneyIncomeLogList({ logs, currency, editLog, deleteLog }: { logs: MoneyIncomeLog[]; currency: string; editLog: (log: MoneyIncomeLog) => void; deleteLog: (id: string) => void }) {
  return (
    <MoneyLogSection title="Income">
      {logs.slice(-5).reverse().map((log) => (
        <MoneyLogRow key={log.id} title={`${log.source || "Income"} · ${formatMoney(log.amount, currency)}`} detail={`${log.date}${log.note ? ` · ${log.note}` : ""}`} onEdit={() => editLog(log)} onDelete={() => deleteLog(log.id)} />
      ))}
      {logs.length === 0 ? <p className="text-sm text-slate-400">No income logs yet.</p> : null}
    </MoneyLogSection>
  );
}

function MoneySavingLogList({ logs, currency, editLog, deleteLog }: { logs: MoneySavingLog[]; currency: string; editLog: (log: MoneySavingLog) => void; deleteLog: (id: string) => void }) {
  return (
    <MoneyLogSection title="Savings">
      {logs.slice(-5).reverse().map((log) => (
        <MoneyLogRow key={log.id} title={`Saved ${formatMoney(log.amountSaved, currency)}`} detail={`${log.date}${log.note ? ` · ${log.note}` : ""}`} onEdit={() => editLog(log)} onDelete={() => deleteLog(log.id)} />
      ))}
      {logs.length === 0 ? <p className="text-sm text-slate-400">No saving logs yet.</p> : null}
    </MoneyLogSection>
  );
}

function MoneyOpportunityLogList({ logs, editLog, deleteLog, updateStatus }: { logs: MoneyOpportunityLog[]; editLog: (log: MoneyOpportunityLog) => void; deleteLog: (id: string) => void; updateStatus: (id: string, status: string) => void }) {
  return (
    <MoneyLogSection title="Opportunities">
      {logs.slice(-5).reverse().map((log) => (
        <div key={log.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="break-words text-sm font-black text-white">{log.title}</p>
              <p className="mt-1 break-words text-xs font-bold leading-5 text-slate-300">{log.type} · {log.date}{log.note ? ` · ${log.note}` : ""}</p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <select value={log.status} onChange={(event) => updateStatus(log.id, event.target.value)} className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-xs font-black text-white outline-none">
                {moneyOpportunityStatuses.map((status) => <option key={status}>{status}</option>)}
              </select>
              <button type="button" onClick={() => editLog(log)} className="secondary-button min-h-9 px-3 py-2 text-xs">Edit</button>
              <button type="button" onClick={() => deleteLog(log.id)} className="danger-button min-h-9 px-3 py-2 text-xs">Delete</button>
            </div>
          </div>
        </div>
      ))}
      {logs.length === 0 ? <p className="text-sm text-slate-400">No opportunity logs yet.</p> : null}
    </MoneyLogSection>
  );
}

function MoneyLogSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <h4 className="font-black text-white">{title}</h4>
      <div className="mt-3 grid gap-2">{children}</div>
    </section>
  );
}

function MoneyLogRow({ title, detail, onEdit, onDelete }: { title: string; detail: string; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="break-words text-sm font-black text-white">{title}</p>
          <p className="mt-1 break-words text-xs font-bold leading-5 text-slate-300">{detail}</p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <button type="button" onClick={onEdit} className="secondary-button min-h-9 px-3 py-2 text-xs">Edit</button>
          <button type="button" onClick={onDelete} className="danger-button min-h-9 px-3 py-2 text-xs">Delete</button>
        </div>
      </div>
    </div>
  );
}

function LifeResetSetupPanel({ setup, setSetup, onSave, onCancel }: { setup: LifeResetSetup; setSetup: Dispatch<SetStateAction<LifeResetSetup>>; onSave: () => void; onCancel: () => void }) {
  function updateSetup(patch: Partial<LifeResetSetup>) {
    setSetup((current) => ({ ...current, ...patch }));
  }

  return (
    <Panel>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-amber-200">Life Reset Setup</p>
          <h3 className="mt-2 text-2xl font-black text-white">Reset your basics, restore control, and rebuild momentum.</h3>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-400">A personal routine reset tool, not medical advice.</p>
        </div>
        <Badge tone="gold">{setup.resetIntensity}</Badge>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <SelectField label="Reset length" value={setup.resetLength} options={lifeResetLengthOptions} onChange={(resetLength) => updateSetup({ resetLength })} />
        <SelectField label="Reset intensity" value={setup.resetIntensity} options={lifeResetIntensityOptions} onChange={(resetIntensity) => updateSetup({ resetIntensity })} />
        <SelectField label="Main problem right now" value={setup.mainProblem} options={lifeResetProblemOptions} onChange={(mainProblem) => updateSetup({ mainProblem })} />
        <Field label="Wake time"><input type="time" value={timeToInputValue(setup.wakeTime)} onChange={(event) => updateSetup({ wakeTime: inputValueToTime(event.target.value) })} className="form-control" /></Field>
        <Field label="Target sleep time"><input type="time" value={timeToInputValue(setup.targetSleepTime)} onChange={(event) => updateSetup({ targetSleepTime: inputValueToTime(event.target.value) })} className="form-control" /></Field>
        <SelectField label="Main reset focus" value={setup.mainResetFocus} options={lifeResetFocusOptions} onChange={(mainResetFocus) => updateSetup({ mainResetFocus })} />
        <SelectField label="Daily reset time" value={setup.dailyResetTime} options={lifeResetTimeOptions} onChange={(dailyResetTime) => updateSetup({ dailyResetTime })} />
        {setup.dailyResetTime === "custom" ? <Field label="Custom daily minutes"><input type="number" value={setup.customDailyMinutes || ""} onChange={(event) => updateSetup({ customDailyMinutes: Number(event.target.value) || 60 })} className="form-control" /></Field> : null}
        <label className="flex min-h-[3.25rem] items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-black text-white"><input type="checkbox" checked={setup.includeNannoSleepBoost} onChange={(event) => updateSetup({ includeNannoSleepBoost: event.target.checked })} className="h-5 w-5 accent-emerald-400" />Include Nanno&apos;s Sleep Boost</label>
      </div>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button type="button" onClick={onSave} className="primary-button justify-center">Save Life Reset Plan</button>
        <button type="button" onClick={onCancel} className="secondary-button justify-center">Cancel</button>
      </div>
    </Panel>
  );
}

function CompactLifeResetSummary({ activePlan }: { activePlan: LifeResetPlan }) {
  const nextTask = activePlan.dailyTasks.find((task) => !task.completed && !task.disabled) ?? activePlan.dailyTasks.find((task) => !task.disabled);
  return (
    <div className="mt-5 rounded-2xl border border-cyan-200/20 bg-cyan-300/[0.06] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-100">Life Reset</p>
          <h4 className="mt-1 text-lg font-black text-white">Focus: {activePlan.setup.mainResetFocus}</h4>
          <p className="mt-1 text-sm leading-6 text-slate-300">Today Reset Mission: {nextTask?.title ?? "Reset complete"} + sleep by {activePlan.setup.targetSleepTime}</p>
        </div>
        <Badge tone="gold">{activePlan.setup.resetIntensity}</Badge>
      </div>
    </div>
  );
}

function LifeResetPlanDetails({ activePlan, setActivePlan }: { activePlan: LifeResetPlan; setActivePlan: Dispatch<SetStateAction<ActivePlan | null>> }) {
  const todayKey = getDateKey(new Date());
  const todayLog = activePlan.logs.find((log) => log.date === todayKey);
  const [draft, setDraft] = useState<LifeResetLog>(todayLog ?? createDefaultLifeResetLog(todayKey, activePlan.setup));
  const summary = getLifeResetSummary(activePlan);

  useEffect(() => {
    setDraft(todayLog ?? createDefaultLifeResetLog(todayKey, activePlan.setup));
  }, [activePlan.setup, todayKey, todayLog]);

  function updateDraft(patch: Partial<LifeResetLog>) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  function saveLog() {
    setActivePlan({ ...activePlan, logs: [...activePlan.logs.filter((log) => log.date !== draft.date), normalizeLifeResetLog(draft)].sort((a, b) => a.date.localeCompare(b.date)) });
  }

  return (
    <div className="grid gap-5">
      <Panel>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-amber-200">Active Plan Details</p>
            <h3 className="mt-2 text-2xl font-black text-white">Life Reset</h3>
            <p className="mt-1 text-sm leading-6 text-slate-400">Started {activePlan.startDate}. {activePlan.setup.resetLength} · {activePlan.setup.resetIntensity} · {activePlan.setup.mainResetFocus}.</p>
          </div>
          <Badge tone="green">Active</Badge>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MiniMetric label="Reset Days" value={summary.resetDaysCompleted} />
          <MiniMetric label="Hygiene Days" value={summary.hygieneCompletedDays} />
          <MiniMetric label="Room Days" value={summary.roomResetDays} />
          <MiniMetric label="Sleep Target Days" value={summary.sleepTargetDays} />
          <MiniMetric label="Money Check Days" value={summary.moneyCheckDays} />
          <MiniMetric label="Main Mission Days" value={summary.mainMissionDays} />
        </div>
      </Panel>

      <Panel>
        <p className="text-sm font-black uppercase tracking-[0.2em] text-amber-200">Daily Reset Tasks</p>
        <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {activePlan.dailyTasks.map((item) => <LifeResetTaskRow key={item.id} item={item} activePlan={activePlan} setActivePlan={setActivePlan} list="dailyTasks" />)}
        </div>
      </Panel>

      <Panel>
        <p className="text-sm font-black uppercase tracking-[0.2em] text-amber-200">Life Reset Log</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Field label="Energy 1-10"><input type="number" min="1" max="10" value={draft.energy} onChange={(event) => updateDraft({ energy: clampNumber(Number(event.target.value) || 1, 1, 10) })} className="form-control" /></Field>
          <Field label="Room condition 1-10"><input type="number" min="1" max="10" value={draft.roomCondition} onChange={(event) => updateDraft({ roomCondition: clampNumber(Number(event.target.value) || 1, 1, 10) })} className="form-control" /></Field>
          <Field label="Mood 1-10"><input type="number" min="1" max="10" value={draft.mood} onChange={(event) => updateDraft({ mood: clampNumber(Number(event.target.value) || 1, 1, 10) })} className="form-control" /></Field>
          <Field label="Sleep readiness 1-10"><input type="number" min="1" max="10" value={draft.sleepReadiness} onChange={(event) => updateDraft({ sleepReadiness: clampNumber(Number(event.target.value) || 1, 1, 10) })} className="form-control" /></Field>
          <Field label="Money stress 1-10"><input type="number" min="1" max="10" value={draft.moneyStress} onChange={(event) => updateDraft({ moneyStress: clampNumber(Number(event.target.value) || 1, 1, 10) })} className="form-control" /></Field>
          <Field label="Tomorrow reset focus"><input value={draft.tomorrowResetFocus} onChange={(event) => updateDraft({ tomorrowResetFocus: event.target.value })} className="form-control" /></Field>
          <div className="md:col-span-2 xl:col-span-3"><Field label="What improved today"><textarea value={draft.improvedToday} onChange={(event) => updateDraft({ improvedToday: event.target.value })} className="form-control min-h-24" /></Field></div>
          <div className="md:col-span-2 xl:col-span-3"><Field label="What still feels messy"><textarea value={draft.stillMessy} onChange={(event) => updateDraft({ stillMessy: event.target.value })} className="form-control min-h-24" /></Field></div>
        </div>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <button type="button" onClick={saveLog} className="primary-button justify-center">Save Life Reset Log</button>
          <button type="button" onClick={() => setDraft(createDefaultLifeResetLog(todayKey, activePlan.setup))} className="secondary-button justify-center">Reset Today Log</button>
        </div>
        <div className="mt-5 rounded-2xl border border-teal-300/20 bg-teal-300/[0.06] p-4 text-sm leading-6 text-slate-300">
          <p className="font-black text-white">Rule-based feedback</p>
          <p className="mt-2">{getLifeResetFeedback(activePlan)}</p>
        </div>
      </Panel>
    </div>
  );
}

function LifeResetTaskRow({ item, activePlan, setActivePlan, list, compact = false }: { item: LifeResetTask; activePlan: LifeResetPlan; setActivePlan: Dispatch<SetStateAction<ActivePlan | null>>; list: "dailyTasks" | "weeklyTasks" | "resetChecklist"; compact?: boolean }) {
  if (item.disabled && compact) return null;
  return (
    <div className={`rounded-2xl border p-3 ${item.completed ? "border-emerald-300/35 bg-emerald-400/[0.08]" : item.disabled ? "border-orange-300/25 bg-orange-400/[0.06] opacity-70" : "border-white/10 bg-white/[0.04]"}`}>
      <div className="flex items-start gap-3">
        <button type="button" onClick={() => updateLifeResetTask(activePlan, setActivePlan, list, item.id, { completed: !item.completed })} className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border ${item.completed ? "border-emerald-300 bg-emerald-400 text-slate-950" : "border-white/15 bg-black/20 text-slate-400"}`}>
          {item.completed ? <Check size={16} /> : null}
        </button>
        <div className="min-w-0 flex-1">
          <p className="break-words text-sm font-black text-white">{item.title}</p>
          <p className="mt-1 break-words text-xs font-bold leading-5 text-slate-300">{item.detail}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge tone="dark">{item.category}</Badge>
            {item.disabled ? <Badge tone="orange">Disabled</Badge> : null}
          </div>
        </div>
        {!compact ? <button type="button" onClick={() => updateLifeResetTask(activePlan, setActivePlan, list, item.id, { disabled: !item.disabled })} className="secondary-button min-h-9 px-3 py-2 text-xs">{item.disabled ? "Enable" : "Disable"}</button> : null}
      </div>
    </div>
  );
}

function GetLeanSetupPanel({
  setup,
  setSetup,
  profile,
  onSave,
  onCancel
}: {
  setup: GetLeanSetup;
  setSetup: Dispatch<SetStateAction<GetLeanSetup>>;
  profile: ProfileState;
  onSave: () => void;
  onCancel: () => void;
}) {
  const calculations = calculateGetLean(setup, profile.sleepTargetHours);
  const missingProfile = !profile.dateOfBirth || !profile.sex || !profile.heightCm || !profile.currentWeightKg || !profile.goalWeightKg || !profile.activityLevel;
  const fieldClass = "form-control";

  function updateSetup(patch: Partial<GetLeanSetup>) {
    setSetup((current) => ({ ...current, ...patch }));
  }

  return (
    <Panel>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-amber-200">Get Lean / Shred Setup</p>
          <h3 className="mt-2 text-2xl font-black text-white">Create a simple rule-based fat-loss plan.</h3>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-400">General planning only. Adjust slowly. If you feel unwell, slow down and prioritize sleep, food quality, and recovery.</p>
        </div>
        <Badge tone="gold">{setup.speed}</Badge>
      </div>

      {missingProfile ? (
        <div className="mt-5 rounded-2xl border border-amber-300/25 bg-amber-300/[0.08] p-4 text-sm leading-6 text-amber-100">
          Complete your Profile first for better calculations. You can still set up this plan here.
        </div>
      ) : null}

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <Field label="Current weight in kg">
          <input type="number" value={setup.currentWeightKg || ""} onChange={(event) => updateSetup({ currentWeightKg: Number(event.target.value) || 0 })} className={fieldClass} />
        </Field>
        <Field label="Goal weight in kg">
          <input type="number" value={setup.goalWeightKg || ""} onChange={(event) => updateSetup({ goalWeightKg: Number(event.target.value) || 0 })} className={fieldClass} />
        </Field>
        <Field label="Height in cm">
          <input type="number" value={setup.heightCm || ""} onChange={(event) => updateSetup({ heightCm: Number(event.target.value) || 0 })} className={fieldClass} />
        </Field>
        <SelectField label="Sex" value={setup.sex} options={["", "Male", "Female"]} onChange={(sex) => updateSetup({ sex })} />
        <Field label="Date of birth">
          <input type="date" value={setup.dateOfBirth} onChange={(event) => updateSetup({ dateOfBirth: event.target.value })} className={fieldClass} />
        </Field>
        <Field label="Calculated age">
          <input readOnly value={setup.dateOfBirth ? `${calculations.age} years old` : "Add date of birth"} className={fieldClass} />
        </Field>
        <SelectField label="Activity level" value={setup.activityLevel} options={getLeanActivityLevels} onChange={(activityLevel) => updateSetup({ activityLevel })} />
        <SelectField label="Exercise access" value={setup.exerciseAccess} options={getLeanExerciseAccess} onChange={(exerciseAccess) => updateSetup({ exerciseAccess })} />
        <SelectField label="Diet style" value={setup.dietStyle} options={getLeanDietStyles} onChange={(dietStyle) => updateSetup({ dietStyle })} />
        <SelectField label="Speed" value={setup.speed} options={getLeanSpeeds} onChange={(speed) => updateSetup({ speed })} />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MiniMetric label="Estimated BMR" value={`${Math.round(calculations.bmr)} kcal`} />
        <MiniMetric label="Maintenance" value={`${Math.round(calculations.maintenanceCalories)} kcal`} />
        <MiniMetric label="Target Calories" value={`${Math.round(calculations.targetCalories)} kcal`} />
        <MiniMetric label="Protein Target" value={`${Math.round(calculations.proteinTarget)}g`} />
        <MiniMetric label="Carb Target" value={`${Math.round(calculations.carbTarget)}g`} />
        <MiniMetric label="Fat Target" value={`${Math.round(calculations.fatTarget)}g`} />
        <MiniMetric label="Step Target" value={`${calculations.stepTarget.toLocaleString()} steps`} />
        <MiniMetric label="Workout Plan" value={calculations.workoutDaysPerWeek} />
        <MiniMetric label="Water Target" value={calculations.waterTarget} />
        <MiniMetric label="Sleep Target" value={`${calculations.sleepTarget}h`} />
      </div>

      <div className={`mt-5 rounded-2xl border p-4 text-sm leading-6 ${setup.speed === "Shred Fast" ? "border-orange-300/35 bg-orange-400/[0.08] text-orange-100" : "border-white/10 bg-white/[0.04] text-slate-300"}`}>
        <p className="font-black text-white">{setup.speed}</p>
        <p className="mt-1">{getLeanSpeedDescription(setup.speed)}</p>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button type="button" onClick={onSave} className="primary-button justify-center">Save Get Lean / Shred Plan</button>
        <button type="button" onClick={onCancel} className="secondary-button justify-center">Cancel</button>
      </div>
    </Panel>
  );
}

function GetLeanTodayCard({ activePlan, setActivePlan }: { activePlan: GetLeanPlan; setActivePlan: Dispatch<SetStateAction<ActivePlan | null>> }) {
  const visibleItems = activePlan.dailyTasks.filter((item) => !item.disabled).slice(0, 5);
  const completed = activePlan.dailyTasks.filter((item) => !item.disabled && item.completed).length;
  const total = activePlan.dailyTasks.filter((item) => !item.disabled).length;
  const [expanded, setExpanded] = useState(false);

  return (
    <Panel compact>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-amber-200">Get Lean / Shred</p>
          <h3 className="mt-1 text-2xl font-black text-white">{Math.round(activePlan.calculations.targetCalories)} kcal · {Math.round(activePlan.calculations.proteinTarget)}g protein</h3>
          <p className="mt-1 text-sm leading-6 text-slate-400">{completed}/{total} fitness basics complete today</p>
        </div>
        <button type="button" onClick={() => setExpanded((current) => !current)} className="secondary-button justify-center">
          {expanded ? "Hide Fitness Plan" : "View Full Fitness Plan"}
        </button>
      </div>
      <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
        {(expanded ? activePlan.dailyTasks.filter((item) => !item.disabled) : visibleItems).map((item) => (
          <GetLeanTaskRow key={item.id} item={item} activePlan={activePlan} setActivePlan={setActivePlan} compact />
        ))}
      </div>
    </Panel>
  );
}

function GetLeanPlanDetails({
  activePlan,
  setActivePlan,
  foodLibrary,
  setFoodLibrary,
  dailyFoodLogs,
  setDailyFoodLogs,
  todayKey
}: {
  activePlan: GetLeanPlan;
  setActivePlan: Dispatch<SetStateAction<ActivePlan | null>>;
  foodLibrary: FoodItem[];
  setFoodLibrary: Dispatch<SetStateAction<FoodItem[]>>;
  dailyFoodLogs: DailyFoodLogs;
  setDailyFoodLogs: Dispatch<SetStateAction<DailyFoodLogs>>;
  todayKey: string;
}) {
  const completed = activePlan.dailyTasks.filter((item) => !item.disabled && item.completed).length;
  const total = activePlan.dailyTasks.filter((item) => !item.disabled).length;
  const macroTargets = getMacroTargets(activePlan);

  return (
    <div className="grid gap-5">
    <Panel>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-amber-200">Active Plan Details</p>
          <h3 className="mt-2 text-2xl font-black text-white">Get Lean / Shred</h3>
          <p className="mt-1 text-sm leading-6 text-slate-400">Started {activePlan.startDate}. Weekly review day: {activePlan.weeklyReviewDay}.</p>
        </div>
        <Badge tone="green">Active</Badge>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MiniMetric label="BMR" value={`${Math.round(activePlan.calculations.bmr)} kcal`} />
        <MiniMetric label="Maintenance" value={`${Math.round(activePlan.calculations.maintenanceCalories)} kcal`} />
        <MiniMetric label="Target Calories" value={`${Math.round(activePlan.calculations.targetCalories)} kcal`} />
        <MiniMetric label="Protein" value={`${macroTargets.protein}g`} />
        <MiniMetric label="Carbs" value={`${macroTargets.carbs}g`} />
        <MiniMetric label="Fat" value={`${macroTargets.fat}g`} />
        <MiniMetric label="Steps" value={`${activePlan.calculations.stepTarget.toLocaleString()}`} />
        <MiniMetric label="Workout" value={activePlan.calculations.workoutDaysPerWeek} />
        <MiniMetric label="Water" value={activePlan.calculations.waterTarget} />
        <MiniMetric label="Daily Fitness" value={`${completed}/${total}`} />
      </div>

      <div className="mt-5 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
        {activePlan.dailyTasks.map((item) => (
          <GetLeanTaskRow key={item.id} item={item} activePlan={activePlan} setActivePlan={setActivePlan} />
        ))}
      </div>

      <div className="mt-5 rounded-2xl border border-teal-300/20 bg-teal-300/[0.06] p-4 text-sm leading-6 text-teal-50">
        {getLeanSpeedDescription(activePlan.speed)} Adjust slowly. If you feel unwell, slow down and prioritize sleep, food quality, and recovery.
      </div>
    </Panel>
    <GetLeanFoodLog
      activePlan={activePlan}
      foodLibrary={foodLibrary}
      setFoodLibrary={setFoodLibrary}
      dailyFoodLogs={dailyFoodLogs}
      setDailyFoodLogs={setDailyFoodLogs}
      todayKey={todayKey}
    />
    </div>
  );
}

function CompactMacroSummary({ activePlan, entries }: { activePlan: GetLeanPlan; entries: FoodEntry[] }) {
  const targets = getMacroTargets(activePlan);
  const totals = getFoodTotals(entries);
  return (
    <div className="mt-4 rounded-2xl border border-cyan-200/15 bg-cyan-300/[0.055] p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-100">Today Macros</p>
        <Badge tone="dark">Get Lean</Badge>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs font-black text-slate-200">
        <MacroMini label="Calories" value={`${totals.calories} / ${targets.calories}`} />
        <MacroMini label="Protein" value={`${totals.protein}g / ${targets.protein}g`} />
        <MacroMini label="Carbs" value={`${totals.carbs}g / ${targets.carbs}g`} />
        <MacroMini label="Fat" value={`${totals.fat}g / ${targets.fat}g`} />
      </div>
    </div>
  );
}

function MacroMini({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-xl border border-white/10 bg-black/20 p-2">
      <p className="text-[10px] uppercase tracking-[0.12em] text-slate-400">{label}</p>
      <p className="mt-1 break-words text-sm text-white">{value}</p>
    </div>
  );
}

function CompactSleepEnergySummary({ activePlan }: { activePlan: SleepEnergyPlan }) {
  const setup = activePlan.setup;
  return (
    <div className="mt-4 rounded-2xl border border-indigo-200/15 bg-indigo-300/[0.055] p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-100">Sleep & Energy</p>
        <Badge tone="dark">Routine</Badge>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs font-black text-slate-200">
        <MacroMini label="Sleep target" value={`${getSleepTargetHours(setup)}h · ${setup.targetSleepTime}`} />
        <MacroMini label="Caffeine cutoff" value={setup.caffeineCutoffTime} />
        <MacroMini label="Shutdown" value={getNightShutdownTime(setup.targetSleepTime, 720)} />
        <MacroMini label="Sleep Boost" value={setup.includeNannoSleepBoost ? "Enabled" : "Off"} />
      </div>
    </div>
  );
}

function CompactProjectSummary({ activePlan }: { activePlan: BuildProjectPlan }) {
  const nextTask = activePlan.dailyTasks.find((task) => !task.completed && !task.disabled) ?? activePlan.dailyTasks.find((task) => !task.disabled);
  return (
    <div className="mt-4 rounded-2xl border border-amber-200/15 bg-amber-300/[0.055] p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-amber-100">Build Project</p>
        <Badge tone="dark">{activePlan.setup.currentStage}</Badge>
      </div>
      <div className="grid gap-2">
        <MacroMini label="Project" value={activePlan.setup.projectName || "Untitled project"} />
        <MacroMini label="Today mission" value={nextTask?.title ?? "Choose one tiny project task"} />
        <MacroMini label="Time" value={`${getProjectDailyMinutes(activePlan.setup)} min`} />
      </div>
    </div>
  );
}

function GetLeanFoodLog({
  activePlan,
  foodLibrary,
  setFoodLibrary,
  dailyFoodLogs,
  setDailyFoodLogs,
  todayKey
}: {
  activePlan: GetLeanPlan;
  foodLibrary: FoodItem[];
  setFoodLibrary: Dispatch<SetStateAction<FoodItem[]>>;
  dailyFoodLogs: DailyFoodLogs;
  setDailyFoodLogs: Dispatch<SetStateAction<DailyFoodLogs>>;
  todayKey: string;
}) {
  const normalizedLibrary = normalizeFoodLibrary(foodLibrary);
  const entries = normalizeFoodEntries(dailyFoodLogs[todayKey] ?? [], normalizedLibrary);
  const targets = getMacroTargets(activePlan);
  const totals = getFoodTotals(entries);
  const [entryDraft, setEntryDraft] = useState(() => createDefaultFoodEntryDraft(normalizedLibrary));
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [foodDraft, setFoodDraft] = useState<FoodItem>(createBlankFoodItem());
  const [editingFoodId, setEditingFoodId] = useState<string | null>(null);

  useEffect(() => {
    setEntryDraft((current) => normalizedLibrary.some((food) => food.id === current.foodId) ? current : createDefaultFoodEntryDraft(normalizedLibrary));
  }, [normalizedLibrary]);

  function saveEntries(nextEntries: FoodEntry[]) {
    setDailyFoodLogs((current) => ({ ...current, [todayKey]: nextEntries.map((entry) => normalizeFoodEntry(entry, normalizedLibrary)) }));
  }

  function saveFoodLibrary(nextLibrary: FoodItem[]) {
    setFoodLibrary(normalizeFoodLibrary(nextLibrary));
  }

  function addOrUpdateEntry() {
    const food = normalizedLibrary.find((item) => item.id === entryDraft.foodId);
    if (!food || entryDraft.amount <= 0) return;
    const nutrition = calculateFoodEntryNutrition(food, entryDraft.amount);
    const nextEntry: FoodEntry = {
      id: editingEntryId ?? `food-entry-${Date.now()}`,
      foodId: food.id,
      foodName: food.name,
      meal: entryDraft.meal,
      amount: entryDraft.amount,
      unit: food.unit,
      measurementType: food.measurementType,
      calories: nutrition.calories,
      protein: nutrition.protein,
      carbs: nutrition.carbs,
      fat: nutrition.fat,
      note: entryDraft.note.trim()
    };
    saveEntries([...entries.filter((entry) => entry.id !== nextEntry.id), nextEntry]);
    setEditingEntryId(null);
    setEntryDraft(createDefaultFoodEntryDraft(normalizedLibrary));
  }

  function editEntry(entry: FoodEntry) {
    setEditingEntryId(entry.id);
    setEntryDraft({ foodId: entry.foodId, meal: entry.meal, amount: entry.amount, note: entry.note });
  }

  function deleteEntry(id: string) {
    if (!window.confirm("Delete this food entry?")) return;
    saveEntries(entries.filter((entry) => entry.id !== id));
  }

  function saveFood() {
    if (!foodDraft.name.trim()) return;
    const normalizedFood = normalizeFoodItem({ ...foodDraft, id: editingFoodId ?? foodDraft.id ?? `food-${Date.now()}`, custom: true });
    saveFoodLibrary([...normalizedLibrary.filter((food) => food.id !== normalizedFood.id), normalizedFood]);
    setEditingFoodId(null);
    setFoodDraft(createBlankFoodItem());
  }

  function editFood(food: FoodItem) {
    setEditingFoodId(food.id);
    setFoodDraft(food);
  }

  const groupedEntries = mealTypes.map((meal) => ({ meal, entries: entries.filter((entry) => entry.meal === meal) }));

  return (
    <Panel>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-amber-200">Get Lean Food Log</p>
          <h3 className="mt-2 text-2xl font-black text-white">Macro targets + simple food record</h3>
          <p className="mt-1 text-sm leading-6 text-slate-400">Nutrition values are estimates. Edit foods to match your real portions, oil, skin, cooking method, and brand.</p>
        </div>
        <Badge tone="dark">{todayKey}</Badge>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MiniMetric label="Calories" value={`${targets.calories} kcal`} />
        <MiniMetric label="Protein" value={`${targets.protein}g`} />
        <MiniMetric label="Carbs" value={`${targets.carbs}g`} />
        <MiniMetric label="Fat" value={`${targets.fat}g`} />
        <MiniMetric label="Water" value={targets.water} />
        <MiniMetric label="Steps" value={targets.steps.toLocaleString()} />
        <MiniMetric label="Sleep" value={`${targets.sleep}h`} />
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <MacroSummaryCard title="Consumed so far" values={totals} />
        <MacroSummaryCard title="Remaining today" values={getRemainingMacros(targets, totals)} remaining />
      </div>

      <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
        <h4 className="font-black text-white">{editingEntryId ? "Edit Food Entry" : "Add Food Entry"}</h4>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <SelectField label="Food" value={entryDraft.foodId} options={normalizedLibrary.map((food) => food.id)} onChange={(foodId) => setEntryDraft((current) => ({ ...current, foodId }))} optionLabels={Object.fromEntries(normalizedLibrary.map((food) => [food.id, `${food.name} (${food.unit})`]))} />
          <SelectField label="Meal" value={entryDraft.meal} options={mealTypes} onChange={(meal) => setEntryDraft((current) => ({ ...current, meal: meal as MealType }))} />
          <Field label="Amount">
            <input type="number" value={entryDraft.amount || ""} onChange={(event) => setEntryDraft((current) => ({ ...current, amount: Number(event.target.value) || 0 }))} className="form-control" />
          </Field>
          <Field label="Note">
            <input value={entryDraft.note} onChange={(event) => setEntryDraft((current) => ({ ...current, note: event.target.value }))} className="form-control" placeholder="Optional" />
          </Field>
        </div>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <button type="button" onClick={addOrUpdateEntry} className="primary-button justify-center">{editingEntryId ? "Save Entry" : "Add Food"}</button>
          {editingEntryId ? <button type="button" onClick={() => { setEditingEntryId(null); setEntryDraft(createDefaultFoodEntryDraft(normalizedLibrary)); }} className="secondary-button justify-center">Cancel Edit</button> : null}
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {groupedEntries.map(({ meal, entries: mealEntries }) => (
          <section key={meal} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <div className="flex items-center justify-between gap-2">
              <h4 className="font-black text-white">{meal}</h4>
              <Badge tone="dark">{mealEntries.length}</Badge>
            </div>
            <div className="mt-3 grid gap-2">
              {mealEntries.length ? mealEntries.map((entry) => (
                <FoodEntryRow key={entry.id} entry={entry} editEntry={editEntry} deleteEntry={deleteEntry} />
              )) : <p className="text-sm font-semibold text-slate-400">No food logged.</p>}
            </div>
          </section>
        ))}
      </div>

      <CollapsibleSection title="Food Library" subtitle="Edit default nutrition estimates or create custom foods." defaultOpen={false}>
        <div className="grid gap-4">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <Field label="Food name"><input value={foodDraft.name} onChange={(event) => setFoodDraft((current) => ({ ...current, name: event.target.value }))} className="form-control" /></Field>
            <Field label="Unit"><input value={foodDraft.unit} onChange={(event) => setFoodDraft((current) => ({ ...current, unit: event.target.value }))} className="form-control" /></Field>
            <SelectField label="Measurement type" value={foodDraft.measurementType} options={measurementTypes} onChange={(measurementType) => setFoodDraft((current) => ({ ...current, measurementType: measurementType as FoodMeasurementType }))} />
            <Field label="Calories"><input type="number" value={foodDraft.calories || ""} onChange={(event) => setFoodDraft((current) => ({ ...current, calories: Number(event.target.value) || 0 }))} className="form-control" /></Field>
            <Field label="Protein"><input type="number" value={foodDraft.protein || ""} onChange={(event) => setFoodDraft((current) => ({ ...current, protein: Number(event.target.value) || 0 }))} className="form-control" /></Field>
            <Field label="Carbs"><input type="number" value={foodDraft.carbs || ""} onChange={(event) => setFoodDraft((current) => ({ ...current, carbs: Number(event.target.value) || 0 }))} className="form-control" /></Field>
            <Field label="Fat"><input type="number" value={foodDraft.fat || ""} onChange={(event) => setFoodDraft((current) => ({ ...current, fat: Number(event.target.value) || 0 }))} className="form-control" /></Field>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={saveFood} className="primary-button justify-center">{editingFoodId ? "Save Food" : "Create Custom Food"}</button>
            {editingFoodId ? <button type="button" onClick={() => { setEditingFoodId(null); setFoodDraft(createBlankFoodItem()); }} className="secondary-button justify-center">Cancel Edit</button> : null}
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            {normalizedLibrary.map((food) => (
              <div key={food.id} className="rounded-2xl border border-white/10 bg-black/20 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="break-words text-sm font-black text-white">{food.name}</p>
                    <p className="mt-1 text-xs font-bold leading-5 text-slate-400">{food.unit} · {food.calories} kcal · P {food.protein}g · C {food.carbs}g · F {food.fat}g</p>
                  </div>
                  <button type="button" onClick={() => editFood(food)} className="secondary-button min-h-9 px-3 py-2 text-xs">Edit</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CollapsibleSection>
    </Panel>
  );
}

function MacroSummaryCard({ title, values, remaining = false }: { title: string; values: MacroTotals; remaining?: boolean }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <h4 className="font-black text-white">{title}</h4>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <MacroMini label="Calories" value={remaining ? formatRemaining(values.calories, "kcal") : `${values.calories} kcal`} />
        <MacroMini label="Protein" value={remaining ? formatRemaining(values.protein, "g") : `${values.protein}g`} />
        <MacroMini label="Carbs" value={remaining ? formatRemaining(values.carbs, "g") : `${values.carbs}g`} />
        <MacroMini label="Fat" value={remaining ? formatRemaining(values.fat, "g") : `${values.fat}g`} />
      </div>
    </section>
  );
}

function FoodEntryRow({ entry, editEntry, deleteEntry }: { entry: FoodEntry; editEntry: (entry: FoodEntry) => void; deleteEntry: (id: string) => void }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="break-words text-sm font-black text-white">{entry.foodName}</p>
          <p className="mt-1 text-xs font-bold leading-5 text-slate-400">{entry.amount} {getAmountUnitLabel(entry)} · {entry.calories} kcal · P {entry.protein}g · C {entry.carbs}g · F {entry.fat}g</p>
          {entry.note ? <p className="mt-1 break-words text-xs text-slate-400">{entry.note}</p> : null}
        </div>
        <div className="flex shrink-0 gap-2">
          <button type="button" onClick={() => editEntry(entry)} className="secondary-button min-h-9 px-3 py-2 text-xs">Edit</button>
          <button type="button" onClick={() => deleteEntry(entry.id)} className="secondary-button min-h-9 border-red-300/25 px-3 py-2 text-xs text-red-100">Delete</button>
        </div>
      </div>
    </div>
  );
}

function GetLeanTaskRow({
  item,
  activePlan,
  setActivePlan,
  compact = false
}: {
  item: EssentialsItem;
  activePlan: GetLeanPlan;
  setActivePlan: Dispatch<SetStateAction<ActivePlan | null>>;
  compact?: boolean;
}) {
  if (item.disabled && compact) return null;
  const targetDetail = getLeanTaskTargetDetail(item.id, activePlan);
  return (
    <div className={`rounded-2xl border p-3 ${item.completed ? "border-emerald-300/35 bg-emerald-400/[0.08]" : item.disabled ? "border-orange-300/25 bg-orange-400/[0.06] opacity-70" : "border-white/10 bg-white/[0.04]"}`}>
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={() => updateGetLeanTask(activePlan, setActivePlan, item.id, { completed: !item.completed })}
          className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border ${item.completed ? "border-emerald-300 bg-emerald-400 text-slate-950" : "border-white/15 bg-black/20 text-slate-400"}`}
        >
          {item.completed ? <Check size={16} /> : null}
        </button>
        <div className="min-w-0 flex-1">
          <p className="break-words text-sm font-black text-white">{item.title}</p>
          {targetDetail ? <p className="mt-1 break-words text-xs font-bold leading-5 text-slate-300">{targetDetail}</p> : null}
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge tone="dark">{item.category}</Badge>
            {item.disabled ? <Badge tone="orange">Disabled</Badge> : null}
          </div>
        </div>
        {!compact ? (
          <button type="button" onClick={() => updateGetLeanTask(activePlan, setActivePlan, item.id, { disabled: !item.disabled })} className="secondary-button min-h-9 px-3 py-2 text-xs">
            {item.disabled ? "Enable" : "Disable"}
          </button>
        ) : null}
      </div>
    </div>
  );
}

function GetLeanProgressPanel({ activePlan, setActivePlan }: { activePlan: GetLeanPlan; setActivePlan: Dispatch<SetStateAction<ActivePlan | null>> }) {
  const todayKey = getDateKey(new Date());
  const todayLog = activePlan.logs.find((log) => log.date === todayKey);
  const [draft, setDraft] = useState<FitnessLog>(todayLog ?? createDefaultFitnessLog(todayKey));
  const latestFeedback = getLeanFeedback(activePlan);

  useEffect(() => {
    setDraft(todayLog ?? createDefaultFitnessLog(todayKey));
  }, [todayKey, todayLog]);

  function updateDraft(patch: Partial<FitnessLog>) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  function saveLog() {
    setActivePlan({
      ...activePlan,
      logs: [...activePlan.logs.filter((log) => log.date !== draft.date), draft].sort((a, b) => a.date.localeCompare(b.date))
    });
  }

  return (
    <Panel>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-amber-200">Get Lean / Shred Progress</p>
          <h3 className="mt-2 text-2xl font-black text-white">Daily fitness log</h3>
          <p className="mt-1 text-sm leading-6 text-slate-400">Track the basic signals without turning the app into a complicated tracker.</p>
        </div>
        <Badge tone="dark">{activePlan.logs.length} logs</Badge>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Field label="Weight kg">
          <input type="number" value={draft.weightKg ?? ""} onChange={(event) => updateDraft({ weightKg: event.target.value ? Number(event.target.value) : null })} className="form-control" />
        </Field>
        <Field label="Sleep hours">
          <input type="number" value={draft.sleepHours ?? ""} onChange={(event) => updateDraft({ sleepHours: event.target.value ? Number(event.target.value) : null })} className="form-control" />
        </Field>
        <Field label="Steps">
          <input type="number" value={draft.steps ?? ""} onChange={(event) => updateDraft({ steps: event.target.value ? Number(event.target.value) : null })} className="form-control" />
        </Field>
        <Field label="Energy 1-10">
          <input type="number" min="1" max="10" value={draft.energy} onChange={(event) => updateDraft({ energy: clampNumber(Number(event.target.value) || 1, 1, 10) })} className="form-control" />
        </Field>
        <Field label="Hunger 1-10">
          <input type="number" min="1" max="10" value={draft.hunger} onChange={(event) => updateDraft({ hunger: clampNumber(Number(event.target.value) || 1, 1, 10) })} className="form-control" />
        </Field>
        <label className="flex min-h-[3.25rem] items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-black text-white">
          <input type="checkbox" checked={draft.workoutCompleted} onChange={(event) => updateDraft({ workoutCompleted: event.target.checked })} className="h-5 w-5 accent-emerald-400" />
          Workout completed
        </label>
        <div className="md:col-span-2 xl:col-span-3">
          <Field label="Notes">
            <textarea value={draft.notes} onChange={(event) => updateDraft({ notes: event.target.value })} className="form-control min-h-24" placeholder="Energy, hunger, food, workout, or anything useful." />
          </Field>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button type="button" onClick={saveLog} className="primary-button justify-center">Save Fitness Log</button>
        <button type="button" onClick={() => setDraft(createDefaultFitnessLog(todayKey))} className="secondary-button justify-center">Reset Today Log</button>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <section className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <h4 className="font-black text-white">Weekly review questions</h4>
          <ul className="mt-3 grid gap-2 text-sm leading-6 text-slate-300">
            <li>Current weight</li>
            <li>Average sleep</li>
            <li>Hunger level</li>
            <li>Energy level</li>
            <li>Workout completed?</li>
            <li>Steps completed?</li>
          </ul>
        </section>
        <section className="rounded-2xl border border-teal-300/20 bg-teal-300/[0.06] p-4">
          <h4 className="font-black text-white">Rule-based feedback</h4>
          <p className="mt-3 text-sm leading-6 text-slate-300">{latestFeedback}</p>
          <p className="mt-3 text-sm leading-6 text-slate-400">General planning only. Adjust slowly. If you feel unwell, slow down and prioritize sleep, food quality, and recovery.</p>
        </section>
      </div>
    </Panel>
  );
}

function GetLeanNutritionSummary({ activePlans, dailyFoodLogs }: { activePlans: ActivePlan[]; dailyFoodLogs: DailyFoodLogs }) {
  const getLeanPlan = activePlans.find((plan): plan is GetLeanPlan => plan.type === "get_lean_shred");
  if (!getLeanPlan) return null;
  const normalizedPlan = normalizeGetLeanPlan(getLeanPlan);
  const targets = getMacroTargets(normalizedPlan);
  const loggedDays = Object.entries(dailyFoodLogs)
    .map(([date, entries]) => ({ date, totals: getFoodTotals(entries) }))
    .filter((day) => day.totals.calories > 0 || day.totals.protein > 0 || day.totals.carbs > 0 || day.totals.fat > 0);
  const daysLogged = loggedDays.length;
  const sums = loggedDays.reduce<MacroTotals>((total, day) => ({
    calories: total.calories + day.totals.calories,
    protein: total.protein + day.totals.protein,
    carbs: total.carbs + day.totals.carbs,
    fat: total.fat + day.totals.fat
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
  const average = {
    calories: daysLogged ? Math.round(sums.calories / daysLogged) : 0,
    protein: daysLogged ? Math.round(sums.protein / daysLogged) : 0,
    carbs: daysLogged ? Math.round(sums.carbs / daysLogged) : 0,
    fat: daysLogged ? Math.round(sums.fat / daysLogged) : 0
  };
  const calorieRange = Math.round(targets.calories * 0.1);
  const daysCaloriesWithinTarget = loggedDays.filter((day) => Math.abs(day.totals.calories - targets.calories) <= calorieRange).length;
  const daysProteinTargetHit = loggedDays.filter((day) => day.totals.protein >= targets.protein).length;

  return (
    <Panel>
      <p className="text-sm font-black uppercase tracking-[0.2em] text-amber-200">Get Lean Nutrition Summary</p>
      <h3 className="mt-2 text-2xl font-black text-white">Food log consistency</h3>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MiniMetric label="Days Logged" value={daysLogged} />
        <MiniMetric label="Avg Calories" value={`${average.calories} kcal`} />
        <MiniMetric label="Avg Protein" value={`${average.protein}g`} />
        <MiniMetric label="Avg Carbs" value={`${average.carbs}g`} />
        <MiniMetric label="Avg Fat" value={`${average.fat}g`} />
        <MiniMetric label="Calories In Range" value={`${daysCaloriesWithinTarget}/${daysLogged || 0}`} />
        <MiniMetric label="Protein Hit" value={`${daysProteinTargetHit}/${daysLogged || 0}`} />
      </div>
    </Panel>
  );
}

function SleepEnergySetupPanel({
  setup,
  setSetup,
  onSave,
  onCancel
}: {
  setup: SleepEnergySetup;
  setSetup: Dispatch<SetStateAction<SleepEnergySetup>>;
  onSave: () => void;
  onCancel: () => void;
}) {
  function updateSetup(patch: Partial<SleepEnergySetup>) {
    setSetup((current) => ({ ...current, ...patch }));
  }

  return (
    <Panel>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-amber-200">Fix Sleep & Energy Setup</p>
          <h3 className="mt-2 text-2xl font-black text-white">Stabilize sleep, protect energy, and build a better night routine.</h3>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-400">This is a personal routine tracker, not medical advice.</p>
        </div>
        <Badge tone="gold">Sleep rhythm</Badge>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Field label="Normal wake time"><input type="time" value={timeToInputValue(setup.normalWakeTime)} onChange={(event) => updateSetup({ normalWakeTime: inputValueToTime(event.target.value) })} className="form-control" /></Field>
        <Field label="Target sleep time"><input type="time" value={timeToInputValue(setup.targetSleepTime)} onChange={(event) => updateSetup({ targetSleepTime: inputValueToTime(event.target.value) })} className="form-control" /></Field>
        <SelectField label="Target sleep duration" value={setup.targetSleepDuration} options={sleepDurationOptions} onChange={(targetSleepDuration) => updateSetup({ targetSleepDuration })} />
        {setup.targetSleepDuration === "custom" ? <Field label="Custom sleep hours"><input type="number" value={setup.customSleepDuration || ""} onChange={(event) => updateSetup({ customSleepDuration: Number(event.target.value) || 8 })} className="form-control" /></Field> : null}
        <SelectField label="Current sleep problem" value={setup.currentSleepProblem} options={sleepProblemOptions} onChange={(currentSleepProblem) => updateSetup({ currentSleepProblem })} />
        <SelectField label="Caffeine habit" value={setup.caffeineHabit} options={caffeineHabitOptions} onChange={(caffeineHabit) => updateSetup({ caffeineHabit })} />
        <Field label="Caffeine cutoff time"><input type="time" value={timeToInputValue(setup.caffeineCutoffTime)} onChange={(event) => updateSetup({ caffeineCutoffTime: inputValueToTime(event.target.value) })} className="form-control" /></Field>
        <SelectField label="Nap preference" value={setup.napPreference} options={napPreferenceOptions} onChange={(napPreference) => updateSetup({ napPreference })} />
        <SelectField label="Night routine preference" value={setup.nightRoutinePreference} options={nightRoutineOptions} onChange={(nightRoutinePreference) => updateSetup({ nightRoutinePreference })} />
        <label className="flex min-h-[3.25rem] items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-black text-white">
          <input type="checkbox" checked={setup.includeNannoSleepBoost} onChange={(event) => updateSetup({ includeNannoSleepBoost: event.target.checked })} className="h-5 w-5 accent-emerald-400" />
          Include Nanno&apos;s Sleep Boost
        </label>
      </div>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button type="button" onClick={onSave} className="primary-button justify-center">Save Fix Sleep & Energy Plan</button>
        <button type="button" onClick={onCancel} className="secondary-button justify-center">Cancel</button>
      </div>
    </Panel>
  );
}

function SleepEnergyPlanDetails({ activePlan, setActivePlan }: { activePlan: SleepEnergyPlan; setActivePlan: Dispatch<SetStateAction<ActivePlan | null>> }) {
  const completed = activePlan.dailyTasks.filter((item) => !item.disabled && item.completed).length;
  const total = activePlan.dailyTasks.filter((item) => !item.disabled).length;
  return (
    <div className="grid gap-5">
      <Panel>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-amber-200">Active Plan Details</p>
            <h3 className="mt-2 text-2xl font-black text-white">Fix Sleep & Energy</h3>
            <p className="mt-1 text-sm leading-6 text-slate-400">Started {activePlan.startDate}. This is a personal routine tracker, not medical advice.</p>
          </div>
          <Badge tone="green">Active</Badge>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MiniMetric label="Wake Time" value={activePlan.setup.normalWakeTime} />
          <MiniMetric label="Sleep Time" value={activePlan.setup.targetSleepTime} />
          <MiniMetric label="Sleep Target" value={`${getSleepTargetHours(activePlan.setup)}h`} />
          <MiniMetric label="Caffeine Cutoff" value={activePlan.setup.caffeineCutoffTime} />
          <MiniMetric label="Night Shutdown" value={getNightShutdownTime(activePlan.setup.targetSleepTime, 720)} />
          <MiniMetric label="Daily Sleep Tasks" value={`${completed}/${total}`} />
        </div>
        <div className="mt-5 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {activePlan.dailyTasks.map((item) => <SleepEnergyTaskRow key={item.id} item={item} activePlan={activePlan} setActivePlan={setActivePlan} />)}
        </div>
      </Panel>
      <SleepEnergyProgressPanel activePlan={activePlan} setActivePlan={setActivePlan} />
    </div>
  );
}

function SleepEnergyTaskRow({ item, activePlan, setActivePlan, compact = false }: { item: EssentialsItem; activePlan: SleepEnergyPlan; setActivePlan: Dispatch<SetStateAction<ActivePlan | null>>; compact?: boolean }) {
  if (item.disabled && compact) return null;
  const detail = getSleepTaskDetail(item.id, activePlan);
  return (
    <div className={`rounded-2xl border p-3 ${item.completed ? "border-emerald-300/35 bg-emerald-400/[0.08]" : item.disabled ? "border-orange-300/25 bg-orange-400/[0.06] opacity-70" : "border-white/10 bg-white/[0.04]"}`}>
      <div className="flex items-start gap-3">
        <button type="button" onClick={() => updateSleepEnergyTask(activePlan, setActivePlan, item.id, { completed: !item.completed })} className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border ${item.completed ? "border-emerald-300 bg-emerald-400 text-slate-950" : "border-white/15 bg-black/20 text-slate-400"}`}>
          {item.completed ? <Check size={16} /> : null}
        </button>
        <div className="min-w-0 flex-1">
          <p className="break-words text-sm font-black text-white">{item.title}</p>
          {detail ? <p className="mt-1 break-words text-xs font-bold leading-5 text-slate-300">{detail}</p> : null}
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge tone="dark">{item.category}</Badge>
            {item.disabled ? <Badge tone="orange">Disabled</Badge> : null}
          </div>
        </div>
        {!compact ? <button type="button" onClick={() => updateSleepEnergyTask(activePlan, setActivePlan, item.id, { disabled: !item.disabled })} className="secondary-button min-h-9 px-3 py-2 text-xs">{item.disabled ? "Enable" : "Disable"}</button> : null}
      </div>
    </div>
  );
}

function SleepEnergyProgressPanel({ activePlan, setActivePlan }: { activePlan: SleepEnergyPlan; setActivePlan: Dispatch<SetStateAction<ActivePlan | null>> }) {
  const todayKey = getDateKey(new Date());
  const todayLog = activePlan.logs.find((log) => log.date === todayKey);
  const [draft, setDraft] = useState<SleepEnergyLog>(todayLog ?? createDefaultSleepEnergyLog(todayKey, activePlan.setup));
  const summary = getSleepEnergySummary(activePlan);

  useEffect(() => {
    setDraft(todayLog ?? createDefaultSleepEnergyLog(todayKey, activePlan.setup));
  }, [activePlan.setup, todayKey, todayLog]);

  function updateDraft(patch: Partial<SleepEnergyLog>) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  function saveLog() {
    setActivePlan({ ...activePlan, logs: [...activePlan.logs.filter((log) => log.date !== draft.date), normalizeSleepEnergyLog(draft, activePlan.setup)].sort((a, b) => a.date.localeCompare(b.date)) });
  }

  return (
    <Panel>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-amber-200">Sleep & Energy Progress</p>
          <h3 className="mt-2 text-2xl font-black text-white">Quick daily sleep log</h3>
          <p className="mt-1 text-sm leading-6 text-slate-400">This is a personal routine tracker, not medical advice.</p>
        </div>
        <Badge tone="dark">{activePlan.logs.length} logs</Badge>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Field label="Sleep time"><input type="time" value={timeToInputValue(draft.sleepTime)} onChange={(event) => updateDraft({ sleepTime: inputValueToTime(event.target.value) })} className="form-control" /></Field>
        <Field label="Wake time"><input type="time" value={timeToInputValue(draft.wakeTime)} onChange={(event) => updateDraft({ wakeTime: inputValueToTime(event.target.value) })} className="form-control" /></Field>
        <Field label="Sleep hours"><input type="number" value={draft.sleepHours || ""} onChange={(event) => updateDraft({ sleepHours: Number(event.target.value) || 0 })} className="form-control" /></Field>
        <Field label="Wake-ups count"><input type="number" value={draft.wakeUpsCount} onChange={(event) => updateDraft({ wakeUpsCount: Number(event.target.value) || 0 })} className="form-control" /></Field>
        <Field label="Energy 1-10"><input type="number" min="1" max="10" value={draft.energy} onChange={(event) => updateDraft({ energy: clampNumber(Number(event.target.value) || 1, 1, 10) })} className="form-control" /></Field>
        <label className="flex min-h-[3.25rem] items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-black text-white"><input type="checkbox" checked={draft.caffeineAfterCutoff} onChange={(event) => updateDraft({ caffeineAfterCutoff: event.target.checked })} className="h-5 w-5 accent-orange-400" />Caffeine after cutoff?</label>
        <label className="flex min-h-[3.25rem] items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-black text-white"><input type="checkbox" checked={draft.napTaken} onChange={(event) => updateDraft({ napTaken: event.target.checked })} className="h-5 w-5 accent-emerald-400" />Nap taken?</label>
        <label className="flex min-h-[3.25rem] items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-black text-white"><input type="checkbox" checked={draft.nightRoutineCompleted} onChange={(event) => updateDraft({ nightRoutineCompleted: event.target.checked })} className="h-5 w-5 accent-emerald-400" />Night routine completed?</label>
        <label className="flex min-h-[3.25rem] items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-black text-white"><input type="checkbox" checked={draft.targetSleepTimeSuccess} onChange={(event) => updateDraft({ targetSleepTimeSuccess: event.target.checked })} className="h-5 w-5 accent-emerald-400" />Slept on target time?</label>
        <div className="md:col-span-2 xl:col-span-3"><Field label="Note"><textarea value={draft.notes} onChange={(event) => updateDraft({ notes: event.target.value })} className="form-control min-h-24" placeholder="Energy, phone use, caffeine, wake-ups, or routine notes." /></Field></div>
      </div>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button type="button" onClick={saveLog} className="primary-button justify-center">Save Sleep Log</button>
        <button type="button" onClick={() => setDraft(createDefaultSleepEnergyLog(todayKey, activePlan.setup))} className="secondary-button justify-center">Reset Today Log</button>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <MiniMetric label="Days Logged" value={summary.daysLogged} />
        <MiniMetric label="Avg Sleep" value={`${summary.averageSleepHours}h`} />
        <MiniMetric label="Avg Energy" value={summary.averageEnergy} />
        <MiniMetric label="Caffeine Cutoff" value={`${summary.caffeineCutoffSuccessDays}/${summary.daysLogged}`} />
        <MiniMetric label="Night Routine" value={`${summary.nightRoutineCompletedDays}/${summary.daysLogged}`} />
        <MiniMetric label="Sleep Time Hit" value={`${summary.targetSleepTimeSuccessDays}/${summary.daysLogged}`} />
      </div>
      <div className="mt-5 rounded-2xl border border-teal-300/20 bg-teal-300/[0.06] p-4 text-sm leading-6 text-slate-300">
        <p className="font-black text-white">Rule-based feedback</p>
        <p className="mt-2">{getSleepEnergyFeedback(activePlan)}</p>
      </div>
    </Panel>
  );
}

function BuildProjectSetupPanel({
  setup,
  setSetup,
  onSave,
  onCancel
}: {
  setup: ProjectSetup;
  setSetup: Dispatch<SetStateAction<ProjectSetup>>;
  onSave: () => void;
  onCancel: () => void;
}) {
  function updateSetup(patch: Partial<ProjectSetup>) {
    setSetup((current) => ({ ...current, ...patch }));
  }

  return (
    <Panel>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-amber-200">Build a Project Setup</p>
          <h3 className="mt-2 text-2xl font-black text-white">Turn an idea into daily building missions and weekly milestones.</h3>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-400">Use this for apps, tools, writing, study projects, business ideas, or anything useful you want to ship.</p>
        </div>
        <Badge tone="gold">{setup.projectSpeed}</Badge>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Field label="Project name"><input value={setup.projectName} onChange={(event) => updateSetup({ projectName: event.target.value })} className="form-control" placeholder="KPM Sunny" /></Field>
        <SelectField label="Project type" value={setup.projectType} options={projectTypeOptions} onChange={(projectType) => updateSetup({ projectType })} />
        <SelectField label="Project goal" value={setup.projectGoal} options={projectGoalOptions} onChange={(projectGoal) => updateSetup({ projectGoal })} />
        <SelectField label="Current stage" value={setup.currentStage} options={projectStageOptions} onChange={(currentStage) => updateSetup({ currentStage })} />
        <SelectField label="Daily project time" value={setup.dailyProjectTime} options={projectDailyTimeOptions} onChange={(dailyProjectTime) => updateSetup({ dailyProjectTime })} />
        {setup.dailyProjectTime === "custom" ? <Field label="Custom daily minutes"><input type="number" value={setup.customDailyMinutes || ""} onChange={(event) => updateSetup({ customDailyMinutes: Number(event.target.value) || 60 })} className="form-control" /></Field> : null}
        <SelectField label="Project speed" value={setup.projectSpeed} options={projectSpeedOptions} onChange={(projectSpeed) => updateSetup({ projectSpeed })} />
        <SelectField label="Deadline" value={setup.deadline} options={projectDeadlineOptions} onChange={(deadline) => updateSetup({ deadline })} />
        {setup.deadline === "custom date" ? <Field label="Custom deadline"><input type="date" value={setup.customDeadline} onChange={(event) => updateSetup({ customDeadline: event.target.value })} className="form-control" /></Field> : null}
        <SelectField label="Main bottleneck" value={setup.mainBottleneck} options={projectBottleneckOptions} onChange={(mainBottleneck) => updateSetup({ mainBottleneck })} />
        <SelectField label="Build style" value={setup.buildStyle} options={projectBuildStyleOptions} onChange={(buildStyle) => updateSetup({ buildStyle })} />
      </div>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button type="button" onClick={onSave} className="primary-button justify-center">Save Build a Project Plan</button>
        <button type="button" onClick={onCancel} className="secondary-button justify-center">Cancel</button>
      </div>
    </Panel>
  );
}

function BuildProjectPlanDetails({ activePlan, setActivePlan }: { activePlan: BuildProjectPlan; setActivePlan: Dispatch<SetStateAction<ActivePlan | null>> }) {
  const completedDaily = activePlan.dailyTasks.filter((item) => !item.disabled && item.completed).length;
  const totalDaily = activePlan.dailyTasks.filter((item) => !item.disabled).length;
  const completedMilestones = activePlan.projectRoadmap.filter((item) => item.completed).length;
  return (
    <div className="grid gap-5">
      <Panel>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-amber-200">Active Plan Details</p>
            <h3 className="mt-2 text-2xl font-black text-white">{getProjectDisplayTitle(activePlan)}</h3>
            <p className="mt-1 text-sm leading-6 text-slate-400">Started {activePlan.startDate}. Stage: {activePlan.setup.currentStage}.</p>
          </div>
          <Badge tone="green">Active</Badge>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MiniMetric label="Daily Time" value={`${getProjectDailyMinutes(activePlan.setup)} min`} />
          <MiniMetric label="Speed" value={activePlan.setup.projectSpeed} />
          <MiniMetric label="Stage" value={activePlan.setup.currentStage} />
          <MiniMetric label="Milestones" value={`${completedMilestones}/${activePlan.projectRoadmap.length}`} />
          <MiniMetric label="Daily Build" value={`${completedDaily}/${totalDaily}`} />
          <MiniMetric label="Deadline" value={getProjectDeadlineLabel(activePlan.setup)} />
        </div>
      </Panel>

      <Panel>
        <p className="text-sm font-black uppercase tracking-[0.2em] text-amber-200">Project Roadmap</p>
        <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {activePlan.projectRoadmap.map((item) => <ProjectTaskRow key={item.id} item={item} activePlan={activePlan} setActivePlan={setActivePlan} list="projectRoadmap" />)}
        </div>
      </Panel>

      <Panel>
        <p className="text-sm font-black uppercase tracking-[0.2em] text-amber-200">Daily Project Missions</p>
        <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {activePlan.dailyTasks.map((item) => <ProjectTaskRow key={item.id} item={item} activePlan={activePlan} setActivePlan={setActivePlan} list="dailyTasks" />)}
        </div>
      </Panel>

      <Panel>
        <p className="text-sm font-black uppercase tracking-[0.2em] text-amber-200">Weekly Project Tasks</p>
        <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {activePlan.weeklyTasks.map((item) => <ProjectTaskRow key={item.id} item={item} activePlan={activePlan} setActivePlan={setActivePlan} list="weeklyTasks" />)}
        </div>
      </Panel>

      <BuildProjectProgressPanel activePlan={activePlan} setActivePlan={setActivePlan} />
    </div>
  );
}

function ProjectTaskRow({ item, activePlan, setActivePlan, list, compact = false }: { item: ProjectTask; activePlan: BuildProjectPlan; setActivePlan: Dispatch<SetStateAction<ActivePlan | null>>; list: "projectRoadmap" | "dailyTasks" | "weeklyTasks"; compact?: boolean }) {
  if (item.disabled && compact) return null;
  return (
    <div className={`rounded-2xl border p-3 ${item.completed ? "border-emerald-300/35 bg-emerald-400/[0.08]" : item.disabled ? "border-orange-300/25 bg-orange-400/[0.06] opacity-70" : "border-white/10 bg-white/[0.04]"}`}>
      <div className="flex items-start gap-3">
        <button type="button" onClick={() => updateProjectTask(activePlan, setActivePlan, list, item.id, { completed: !item.completed })} className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border ${item.completed ? "border-emerald-300 bg-emerald-400 text-slate-950" : "border-white/15 bg-black/20 text-slate-400"}`}>
          {item.completed ? <Check size={16} /> : null}
        </button>
        <div className="min-w-0 flex-1">
          <p className="break-words text-sm font-black text-white">{item.title}</p>
          <p className="mt-1 break-words text-xs font-bold leading-5 text-slate-300">{item.detail}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge tone="dark">{getFocusPreset(item.timerPreset).shortLabel}</Badge>
            {item.disabled ? <Badge tone="orange">Disabled</Badge> : null}
          </div>
        </div>
        {!compact ? <button type="button" onClick={() => updateProjectTask(activePlan, setActivePlan, list, item.id, { disabled: !item.disabled })} className="secondary-button min-h-9 px-3 py-2 text-xs">{item.disabled ? "Enable" : "Disable"}</button> : null}
      </div>
    </div>
  );
}

function BuildProjectProgressPanel({ activePlan, setActivePlan }: { activePlan: BuildProjectPlan; setActivePlan: Dispatch<SetStateAction<ActivePlan | null>> }) {
  const todayKey = getDateKey(new Date());
  const todayLog = activePlan.logs.find((log) => log.date === todayKey);
  const [draft, setDraft] = useState<ProjectLog>(todayLog ?? createDefaultProjectLog(todayKey, activePlan));
  const summary = getProjectSummary(activePlan);

  useEffect(() => {
    setDraft(todayLog ?? createDefaultProjectLog(todayKey, activePlan));
  }, [activePlan, todayKey, todayLog]);

  function updateDraft(patch: Partial<ProjectLog>) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  function saveLog() {
    setActivePlan({ ...activePlan, logs: [...activePlan.logs.filter((log) => log.date !== draft.date), normalizeProjectLog(draft, activePlan)].sort((a, b) => a.date.localeCompare(b.date)) });
  }

  return (
    <Panel>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-amber-200">Build Project Progress</p>
          <h3 className="mt-2 text-2xl font-black text-white">Daily project log</h3>
          <p className="mt-1 text-sm leading-6 text-slate-400">Keep the next project step obvious. No complexity theater.</p>
        </div>
        <Badge tone="dark">{activePlan.logs.length} logs</Badge>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Field label="What I worked on"><input value={draft.workedOn} onChange={(event) => updateDraft({ workedOn: event.target.value })} className="form-control" /></Field>
        <Field label="Minutes worked"><input type="number" value={draft.minutesWorked || ""} onChange={(event) => updateDraft({ minutesWorked: Number(event.target.value) || 0 })} className="form-control" /></Field>
        <Field label="Difficulty 1-10"><input type="number" min="1" max="10" value={draft.difficulty} onChange={(event) => updateDraft({ difficulty: clampNumber(Number(event.target.value) || 1, 1, 10) })} className="form-control" /></Field>
        <Field label="Focus 1-10"><input type="number" min="1" max="10" value={draft.focus} onChange={(event) => updateDraft({ focus: clampNumber(Number(event.target.value) || 1, 1, 10) })} className="form-control" /></Field>
        <Field label="Blocker"><input value={draft.blocker} onChange={(event) => updateDraft({ blocker: event.target.value })} className="form-control" placeholder="Optional" /></Field>
        <Field label="Next step"><input value={draft.nextStep} onChange={(event) => updateDraft({ nextStep: event.target.value })} className="form-control" /></Field>
        <label className="flex min-h-[3.25rem] items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-black text-white"><input type="checkbox" checked={draft.weeklyReviewCompleted} onChange={(event) => updateDraft({ weeklyReviewCompleted: event.target.checked })} className="h-5 w-5 accent-emerald-400" />Weekly review completed?</label>
        <div className="md:col-span-2 xl:col-span-3"><Field label="Note"><textarea value={draft.note} onChange={(event) => updateDraft({ note: event.target.value })} className="form-control min-h-24" placeholder="What changed, what broke, what to do next." /></Field></div>
      </div>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button type="button" onClick={saveLog} className="primary-button justify-center">Save Project Log</button>
        <button type="button" onClick={() => setDraft(createDefaultProjectLog(todayKey, activePlan))} className="secondary-button justify-center">Reset Today Log</button>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <MiniMetric label="Days Worked" value={summary.daysWorked} />
        <MiniMetric label="Total Minutes" value={summary.totalMinutes} />
        <MiniMetric label="Stage" value={activePlan.setup.currentStage} />
        <MiniMetric label="Milestones" value={`${summary.completedMilestones}/${activePlan.projectRoadmap.length}`} />
        <MiniMetric label="Open Blockers" value={summary.openBlockers} />
        <MiniMetric label="Weekly Reviews" value={summary.weeklyReviewCount} />
      </div>
      <div className="mt-5 rounded-2xl border border-teal-300/20 bg-teal-300/[0.06] p-4 text-sm leading-6 text-slate-300">
        <p className="font-black text-white">Rule-based feedback</p>
        <p className="mt-2">{getProjectFeedback(activePlan)}</p>
        {summary.lastProgressNote ? <p className="mt-2 text-slate-400">Last note: {summary.lastProgressNote}</p> : null}
      </div>
    </Panel>
  );
}

function LearnMasterSetupPanel({
  setup,
  setSetup,
  onSave,
  onCancel
}: {
  setup: LearnMasterSetup;
  setSetup: Dispatch<SetStateAction<LearnMasterSetup>>;
  onSave: () => void;
  onCancel: () => void;
}) {
  const dailyMinutes = getLearnDailyMinutes(setup);
  const deadlineValue = getLearnDeadlineValue(setup);

  function updateSetup(patch: Partial<LearnMasterSetup>) {
    setSetup((current) => ({ ...current, ...patch }));
  }

  return (
    <Panel>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-amber-200">Learn / Master Setup</p>
          <h3 className="mt-2 text-2xl font-black text-white">Create a study structure for any subject.</h3>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-400">This app does not teach the subject. It gives you a Learn - Practice - Recall - Review - Apply structure and tracks consistency.</p>
        </div>
        <Badge tone="gold">{setup.speed}</Badge>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <Field label="Subject name">
          <input value={setup.subjectName} onChange={(event) => updateSetup({ subjectName: event.target.value })} className="form-control" placeholder="Coding, English, math, design..." />
        </Field>
        <SelectField label="Current level" value={setup.currentLevel} options={learnCurrentLevels} onChange={(currentLevel) => updateSetup({ currentLevel })} />
        <SelectField label="Goal type" value={setup.goalType} options={learnGoalTypes} onChange={(goalType) => updateSetup({ goalType })} />
        <SelectField label="Daily study time" value={setup.dailyStudyTime} options={learnDailyStudyTimes} onChange={(dailyStudyTime) => updateSetup({ dailyStudyTime })} />
        {setup.dailyStudyTime === "Custom" ? (
          <Field label="Custom minutes">
            <input type="number" min="5" value={setup.customDailyMinutes || ""} onChange={(event) => updateSetup({ customDailyMinutes: Number(event.target.value) || 0 })} className="form-control" />
          </Field>
        ) : null}
        <SelectField label="Speed" value={setup.speed} options={learnSpeeds} onChange={(speed) => updateSetup({ speed })} />
        <SelectField label="Deadline" value={setup.deadline} options={learnDeadlines} onChange={(deadline) => updateSetup({ deadline })} />
        {setup.deadline === "Custom date" ? (
          <Field label="Custom deadline">
            <input type="date" value={setup.customDeadline} onChange={(event) => updateSetup({ customDeadline: event.target.value })} className="form-control" />
          </Field>
        ) : null}
        <SelectField label="Study style" value={setup.studyStyle} options={learnStudyStyles} onChange={(studyStyle) => updateSetup({ studyStyle })} />
        <SelectField label="Main resource" value={setup.mainResource} options={learnMainResources} onChange={(mainResource) => updateSetup({ mainResource })} />
        {setup.mainResource === "Custom" ? (
          <Field label="Custom resource">
            <input value={setup.customResource} onChange={(event) => updateSetup({ customResource: event.target.value })} className="form-control" placeholder="Your resource" />
          </Field>
        ) : null}
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <MiniMetric label="Daily Study Time" value={`${dailyMinutes} min`} />
        <MiniMetric label="Study Loop" value="Learn -> Practice -> Recall" />
        <MiniMetric label="Deadline" value={deadlineValue || "No deadline"} />
      </div>

      <div className="mt-5 rounded-2xl border border-teal-300/20 bg-teal-300/[0.06] p-4 text-sm leading-6 text-slate-300">
        <p className="font-black text-white">{setup.speed} Study Template</p>
        <ul className="mt-2 grid gap-1">
          {getLearnSpeedTemplate(setup.speed).map((item) => <li key={item}>{item}</li>)}
        </ul>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button type="button" onClick={onSave} className="primary-button justify-center">Save Learn / Master Plan</button>
        <button type="button" onClick={onCancel} className="secondary-button justify-center">Cancel</button>
      </div>
    </Panel>
  );
}

function LearnMasterTodayCard({ activePlan, setActivePlan }: { activePlan: LearnMasterPlan; setActivePlan: Dispatch<SetStateAction<ActivePlan | null>> }) {
  const visibleItems = activePlan.dailyTasks.filter((item) => !item.disabled).slice(0, 5);
  const nextTask = visibleItems.find((item) => !item.completed);
  const completed = activePlan.dailyTasks.filter((item) => !item.disabled && item.completed).length;
  const total = activePlan.dailyTasks.filter((item) => !item.disabled).length;
  const [expanded, setExpanded] = useState(false);

  return (
    <Panel compact>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-amber-200">Learn / Master Subject</p>
          <h3 className="mt-1 text-2xl font-black text-white">{activePlan.subjectName || "Study subject"}</h3>
          <p className="mt-1 text-sm leading-6 text-slate-400">{activePlan.dailyMinutes} min · {activePlan.speed} · Next: {nextTask?.title ?? "Study complete"}</p>
        </div>
        <button type="button" onClick={() => setExpanded((current) => !current)} className="secondary-button justify-center">
          {expanded ? "Hide Study Plan" : "View Full Study Plan"}
        </button>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-gradient-to-r from-amber-300 to-teal-300" style={{ width: `${total ? Math.round((completed / total) * 100) : 0}%` }} />
      </div>
      <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
        {(expanded ? activePlan.dailyTasks.filter((item) => !item.disabled) : visibleItems).map((item) => (
          <LearnStudyTaskRow key={item.id} item={item} activePlan={activePlan} setActivePlan={setActivePlan} compact />
        ))}
      </div>
    </Panel>
  );
}

function LearnMasterPlanDetails({ activePlan, setActivePlan }: { activePlan: LearnMasterPlan; setActivePlan: Dispatch<SetStateAction<ActivePlan | null>> }) {
  const completed = activePlan.dailyTasks.filter((item) => !item.disabled && item.completed).length;
  const total = activePlan.dailyTasks.filter((item) => !item.disabled).length;

  return (
    <Panel>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-amber-200">Active Plan Details</p>
          <h3 className="mt-2 text-2xl font-black text-white">Learn / Master Subject</h3>
          <p className="mt-1 text-sm leading-6 text-slate-400">Started {activePlan.startDate}. Weekly review day: {activePlan.weeklyReviewDay}.</p>
        </div>
        <Badge tone="green">Active</Badge>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MiniMetric label="Subject" value={activePlan.subjectName || "Untitled"} />
        <MiniMetric label="Level" value={activePlan.currentLevel} />
        <MiniMetric label="Goal" value={activePlan.goalType} />
        <MiniMetric label="Daily Time" value={`${activePlan.dailyMinutes} min`} />
        <MiniMetric label="Speed" value={activePlan.speed} />
        <MiniMetric label="Style" value={activePlan.studyStyle} />
        <MiniMetric label="Resource" value={activePlan.mainResource} />
        <MiniMetric label="Daily Study" value={`${completed}/${total}`} />
      </div>

      <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
        <p className="text-sm font-black uppercase tracking-[0.16em] text-amber-200">Core Loop</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {activePlan.studyLoop.map((step) => <Badge key={step} tone="dark">{step}</Badge>)}
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
        <p className="text-sm font-black uppercase tracking-[0.16em] text-amber-200">Daily Task Breakdown</p>
        <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {activePlan.dailyTasks.map((item) => (
            <LearnStudyTaskRow key={item.id} item={item} activePlan={activePlan} setActivePlan={setActivePlan} />
          ))}
        </div>
      </div>
    </Panel>
  );
}

function LearnStudyTaskRow({
  item,
  activePlan,
  setActivePlan,
  compact = false
}: {
  item: StudyTask;
  activePlan: LearnMasterPlan;
  setActivePlan: Dispatch<SetStateAction<ActivePlan | null>>;
  compact?: boolean;
}) {
  if (item.disabled && compact) return null;
  return (
    <div className={`rounded-2xl border p-3 ${item.completed ? "border-emerald-300/35 bg-emerald-400/[0.08]" : item.disabled ? "border-orange-300/25 bg-orange-400/[0.06] opacity-70" : "border-white/10 bg-white/[0.04]"}`}>
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={() => updateLearnTask(activePlan, setActivePlan, item.id, { completed: !item.completed })}
          className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border ${item.completed ? "border-emerald-300 bg-emerald-400 text-slate-950" : "border-white/15 bg-black/20 text-slate-400"}`}
        >
          {item.completed ? <Check size={16} /> : null}
        </button>
        <div className="min-w-0 flex-1">
          <p className="break-words text-sm font-black text-white">{item.title}</p>
          <p className="mt-1 break-words text-xs font-bold leading-5 text-slate-300">{item.detail}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge tone="dark">Study</Badge>
            {item.disabled ? <Badge tone="orange">Disabled</Badge> : null}
          </div>
        </div>
        {!compact ? (
          <button type="button" onClick={() => updateLearnTask(activePlan, setActivePlan, item.id, { disabled: !item.disabled })} className="secondary-button min-h-9 px-3 py-2 text-xs">
            {item.disabled ? "Enable" : "Disable"}
          </button>
        ) : null}
      </div>
    </div>
  );
}

function LearnMasterProgressPanel({ activePlan, setActivePlan }: { activePlan: LearnMasterPlan; setActivePlan: Dispatch<SetStateAction<ActivePlan | null>> }) {
  const todayKey = getDateKey(new Date());
  const todayLog = activePlan.logs.find((log) => log.date === todayKey);
  const [draft, setDraft] = useState<StudyLog>(todayLog ?? createDefaultStudyLog(todayKey, activePlan.dailyMinutes));
  const feedback = getLearnFeedback(activePlan);

  useEffect(() => {
    setDraft(todayLog ?? createDefaultStudyLog(todayKey, activePlan.dailyMinutes));
  }, [activePlan.dailyMinutes, todayKey, todayLog]);

  function updateDraft(patch: Partial<StudyLog>) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  function saveLog() {
    setActivePlan({
      ...activePlan,
      logs: [...activePlan.logs.filter((log) => log.date !== draft.date), draft].sort((a, b) => a.date.localeCompare(b.date))
    });
  }

  return (
    <Panel>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-amber-200">Learn / Master Progress</p>
          <h3 className="mt-2 text-2xl font-black text-white">Study log</h3>
          <p className="mt-1 text-sm leading-6 text-slate-400">Track consistency for {activePlan.subjectName || "your subject"}.</p>
        </div>
        <Badge tone="dark">{activePlan.logs.length} logs</Badge>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <label className="flex min-h-[3.25rem] items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-black text-white">
          <input type="checkbox" checked={draft.studyCompleted} onChange={(event) => updateDraft({ studyCompleted: event.target.checked })} className="h-5 w-5 accent-emerald-400" />
          Study completed
        </label>
        <Field label="Minutes studied">
          <input type="number" min="0" value={draft.minutesStudied || ""} onChange={(event) => updateDraft({ minutesStudied: Number(event.target.value) || 0 })} className="form-control" />
        </Field>
        <Field label="Focus level 1-10">
          <input type="number" min="1" max="10" value={draft.focusLevel} onChange={(event) => updateDraft({ focusLevel: clampNumber(Number(event.target.value) || 1, 1, 10) })} className="form-control" />
        </Field>
        <SelectField label="Difficulty" value={draft.difficulty} options={["Easy", "Medium", "Hard"]} onChange={(difficulty) => updateDraft({ difficulty: difficulty as StudyLog["difficulty"] })} />
        <Field label="Topic studied">
          <input value={draft.topicStudied} onChange={(event) => updateDraft({ topicStudied: event.target.value })} className="form-control" placeholder="Topic, lesson, chapter, bug, drill..." />
        </Field>
        <div className="md:col-span-2 xl:col-span-3">
          <Field label="Notes">
            <textarea value={draft.notes} onChange={(event) => updateDraft({ notes: event.target.value })} className="form-control min-h-24" placeholder="What did you learn, practice, recall, or apply?" />
          </Field>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button type="button" onClick={saveLog} className="primary-button justify-center">Save Study Log</button>
        <button type="button" onClick={() => setDraft(createDefaultStudyLog(todayKey, activePlan.dailyMinutes))} className="secondary-button justify-center">Reset Today Log</button>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <section className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <h4 className="font-black text-white">Weekly review questions</h4>
          <ul className="mt-3 grid gap-2 text-sm leading-6 text-slate-300">
            <li>How many study days completed?</li>
            <li>Average focus level?</li>
            <li>What topic was hardest?</li>
            <li>Did I practice or only watch/read?</li>
            <li>Can I explain what I learned without notes?</li>
            <li>Continue, slow down, or increase?</li>
          </ul>
        </section>
        <section className="rounded-2xl border border-teal-300/20 bg-teal-300/[0.06] p-4">
          <h4 className="font-black text-white">Rule-based feedback</h4>
          <p className="mt-3 text-sm leading-6 text-slate-300">{feedback}</p>
          <p className="mt-3 text-sm leading-6 text-slate-400">The app creates structure and tracks consistency. It does not teach the subject.</p>
        </section>
      </div>
    </Panel>
  );
}

function PlanTomorrow({
  plan,
  setPlan,
  tomorrowMode,
  selectTomorrowMode,
  findBestTimeSlot,
  missionPreview,
  updateMissionPreviewAction,
  applyMissionPreview,
  cancelMissionPreview,
  tomorrowTasks
}: {
  plan: Plan;
  setPlan: Dispatch<SetStateAction<Plan>>;
  tomorrowMode: DailyMode;
  selectTomorrowMode: (mode: DailyMode) => void;
  findBestTimeSlot: () => void;
  missionPreview: MissionPlanPreviewItem[];
  updateMissionPreviewAction: (id: string, action: ConflictAction) => void;
  applyMissionPreview: () => void;
  cancelMissionPreview: () => void;
  tomorrowTasks: Task[];
}) {
  const plannedGoals = tomorrowTasks.filter((task) => task.insertedGoal);
  const previewConflictCount = missionPreview.filter((item) => item.hasConflict).length;

  return (
    <section className="sunny-plan-page grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
      <Panel className="sunny-plan-form">
        <div className="mb-5">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-200">Plan Tomorrow</p>
          <h2 className="mt-2 text-3xl font-black text-white">Tomorrow's Main Mission</h2>
          <p className="mt-2 text-base text-slate-400">Choose the mission your future self will thank you for.</p>
        </div>

        <MissionArtPanel imageSrc={artPaths.heroWorking} eyebrow="Tomorrow Focus" title={plan.title || "Choose the mission"} className="mb-5" minHeight="min-h-[12rem]">
          <p className="max-w-sm text-sm leading-6 text-slate-200">{plan.why || "Your future self needs one clear target."}</p>
        </MissionArtPanel>

        <div className="grid gap-4">
          <div>
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-xl font-black text-white">Tomorrow Mode</h3>
                <p className="mt-1 text-sm text-slate-400">{modeProfiles[tomorrowMode].note}</p>
              </div>
              <Badge tone="gold">{tomorrowMode} Mode</Badge>
            </div>
            <ModeSelector value={tomorrowMode} onChange={selectTomorrowMode} />
          </div>

          <Field label="Goal title">
            <input
              value={plan.title}
              onChange={(event) => setPlan({ ...plan, title: event.target.value })}
              className="form-control"
              placeholder="Apply for three jobs"
            />
          </Field>
          <Field label="Why it matters">
            <textarea
              value={plan.why}
              onChange={(event) => setPlan({ ...plan, why: event.target.value })}
              className="form-control min-h-28"
              placeholder="Because this moves life forward."
            />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <SelectField label="Category" value={plan.goalCategory} options={["Money", "Skill", "Health", "Cleaning", "Admin", "Personal", "Fun"]} onChange={(goalCategory) => setPlan({ ...plan, goalCategory: goalCategory as GoalCategory })} />
            <SelectField label="Time needed" value={plan.timeNeeded} options={["15 min", "30 min", "1 hour", "2 hours", "3 hours"]} onChange={(timeNeeded) => setPlan({ ...plan, timeNeeded: timeNeeded as TimeNeeded })} />
            <SelectField label="Priority" value={plan.priority} options={priorities} onChange={(priority) => setPlan({ ...plan, priority: priority as Priority })} />
            <SelectField label="Energy needed" value={plan.energy} options={["Low", "Medium", "High"]} onChange={(energy) => setPlan({ ...plan, energy: energy as Energy })} />
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-black text-white">Is this a big goal?</p>
                <p className="mt-1 text-sm leading-6 text-slate-400">Big goals are broken into smaller scheduled missions.</p>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:min-w-48">
                <button
                  type="button"
                  onClick={() => setPlan({ ...plan, isBigGoal: true })}
                  className={`min-h-11 rounded-2xl px-4 text-sm font-black ${plan.isBigGoal ? "bg-amber-300 text-slate-950" : "bg-white/[0.06] text-slate-300"}`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setPlan({ ...plan, isBigGoal: false })}
                  className={`min-h-11 rounded-2xl px-4 text-sm font-black ${!plan.isBigGoal ? "bg-amber-300 text-slate-950" : "bg-white/[0.06] text-slate-300"}`}
                >
                  No
                </button>
              </div>
            </div>
          </div>
          <button onClick={findBestTimeSlot} className="primary-button min-h-14 justify-center text-base">
            <Target size={20} />
            Find Best Time Slot
          </button>

          {plan.suggested && (
            <div className={`rounded-2xl border p-4 ${plan.scheduledAt ? "border-emerald-300/30 bg-emerald-400/[0.09]" : "border-orange-300/30 bg-orange-400/[0.08]"}`}>
              <p className="text-lg font-black text-white">{plan.suggested}</p>
              {plannedGoals.length > 1 && <p className="mt-1 text-sm text-emerald-100">Long mission split into {plannedGoals.length} focused blocks.</p>}
            </div>
          )}

          {missionPreview.length > 0 && (
            <div className="rounded-2xl border border-amber-300/30 bg-amber-300/[0.08] p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-200">Tomorrow Mission Plan Preview</p>
                  <h3 className="mt-2 text-2xl font-black text-white">{missionPreview.length} mission{missionPreview.length === 1 ? "" : "s"} ready</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-300">
                    {previewConflictCount ? `${previewConflictCount} time conflict${previewConflictCount === 1 ? "" : "s"} need a choice.` : "No time conflicts detected."}
                  </p>
                </div>
                <Badge tone={previewConflictCount ? "orange" : "green"}>{previewConflictCount ? "Conflict Check" : "Clean Plan"}</Badge>
              </div>
              <div className="mt-4 grid gap-3">
                {missionPreview.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-white/10 bg-black/24 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-sm font-black text-amber-200">{item.time}</p>
                        <p className="font-black text-white">{item.title}</p>
                        {item.hasConflict ? (
                          <p className="mt-1 text-sm leading-6 text-orange-200">Conflict: {item.conflictTaskTitle}</p>
                        ) : (
                          <p className="mt-1 text-sm leading-6 text-emerald-200">Open slot</p>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge tone={item.category}>{item.category}</Badge>
                        <Badge tone="dark">{item.priority}-Tier</Badge>
                        <Badge tone="gold">{item.points} KPM</Badge>
                      </div>
                    </div>
                    <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto] sm:items-center">
                      <p className="text-sm leading-6 text-slate-400">
                        {describePreviewAction(item)}
                      </p>
                      {item.hasConflict ? (
                        <select
                          value={item.action}
                          onChange={(event) => updateMissionPreviewAction(item.id, event.target.value as ConflictAction)}
                          className="form-control min-h-11 py-2 text-sm"
                        >
                          <option value="move-next">Move to next best slot</option>
                          <option value="add-after">Add after existing task</option>
                          <option value="replace">Replace existing task</option>
                          <option value="bonus">Add as bonus mission</option>
                          <option value="skip">Skip this generated mission</option>
                        </select>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <button type="button" onClick={applyMissionPreview} className="primary-button justify-center">Apply to Tomorrow</button>
                <button type="button" onClick={() => setPlan({ ...plan, suggested: "Edit the plan, then run Find Best Time Slot again." })} className="secondary-button justify-center">Edit Plan</button>
                <button type="button" onClick={cancelMissionPreview} className="secondary-button justify-center">Cancel</button>
              </div>
            </div>
          )}
        </div>
      </Panel>

      <Panel className="sunny-plan-timeline">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-2xl font-black text-white">Tomorrow Mission Timeline</h3>
          <Badge tone="gold">{tomorrowMode} Mode</Badge>
        </div>
        <MissionArtPanel imageSrc={artPaths.block["Main Mission Block"]} eyebrow="Suggested time slot" title={plan.scheduledAt || "Find the best slot"} className="mt-5" minHeight="min-h-[10rem]">
          <p className="text-sm leading-6 text-slate-200">{plan.scheduledAt ? "The main mission is placed into tomorrow's timeline." : "Use the planner to place the mission into the day."}</p>
        </MissionArtPanel>
        {plannedGoals.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-lg font-black text-white">No tomorrow main mission yet.</p>
            <p className="mt-1 text-sm leading-6 text-slate-400">Add a goal and tap Find Best Time Slot when you know the mission your future self should wake up to.</p>
          </div>
        ) : null}
        <div className="mt-5 grid gap-2">
          {tomorrowTasks.map((task) => (
            <div
              key={task.id}
              className={`rounded-2xl border px-4 py-3 ${
                task.insertedGoal ? "border-amber-300/45 bg-amber-300/[0.10]" : "border-white/10 bg-white/[0.035]"
              }`}
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-black text-amber-200">{task.time}</p>
                  <p className="font-bold text-white">{task.title}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge tone={task.insertedGoal ? "gold" : "dark"}>{task.insertedGoal ? "Main Mission" : task.category}</Badge>
                  <Badge tone="dark">{task.priority}-Tier</Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </section>
  );
}

function EveningReview({
  review,
  setReview,
  stats,
  dayLevel,
  tasks,
  todayKey
}: {
  review: Review;
  setReview: Dispatch<SetStateAction<Review>>;
  stats: Stats;
  dayLevel: string;
  tasks: Task[];
  todayKey: string;
}) {
  const mainMission = getMainMissionForDay(tasks);
  const categoryStats = getCategoryStatsFromTasks(tasks);
  const bestCategory = topCategoryByPercent(categoryStats, "best");
  const weakestCategory = topCategoryByPercent(categoryStats, "weakest");
  const savedReview = normalizeReview(review);
  const showSummary = Boolean(savedReview.savedAt);

  function saveReview() {
    setReview({ ...review, savedAt: new Date().toISOString() });
  }

  return (
    <section className="grid gap-5 xl:grid-cols-[1fr_0.85fr]">
      <Panel>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-200">Night Command Review</p>
            <h2 className="mt-2 text-3xl font-black text-white">Evening Review</h2>
            <p className="mt-2 text-slate-400">Close today clearly so tomorrow starts cleaner.</p>
          </div>
          <Badge tone="gold">{stats.points} KPM / {dayLevel}</Badge>
        </div>

        <div className="grid gap-4">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-black text-white">Did I complete my main mission?</p>
                <p className="mt-1 text-sm text-slate-400">{mainMission?.title ?? "No main mission set"}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Yes", value: true },
                  { label: "No", value: false }
                ].map((option) => (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() => setReview({ ...review, mainMissionCompleted: option.value, savedAt: undefined })}
                    className={`min-h-11 rounded-2xl px-5 text-sm font-black ${savedReview.mainMissionCompleted === option.value ? "bg-amber-300 text-slate-950" : "bg-white/[0.06] text-slate-300"}`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <Field label="What went well?">
            <textarea value={review.wins} onChange={(event) => setReview({ ...review, wins: event.target.value, savedAt: undefined })} className="form-control min-h-28" />
          </Field>
          <Field label="What blocked me?">
            <textarea value={review.stuck} onChange={(event) => setReview({ ...review, stuck: event.target.value, savedAt: undefined })} className="form-control min-h-24" />
          </Field>
          <Field label="What should tomorrow focus on?">
            <textarea value={review.improve} onChange={(event) => setReview({ ...review, improve: event.target.value, savedAt: undefined })} className="form-control min-h-24" />
          </Field>
          <Field label="What is tomorrow's main mission?">
            <input value={review.tomorrowMainMission} onChange={(event) => setReview({ ...review, tomorrowMainMission: event.target.value, savedAt: undefined })} className="form-control" placeholder="One mission that matters most" />
          </Field>
          <Field label="What felt annoying or missing in the app today?">
            <textarea value={review.appFeedback ?? ""} onChange={(event) => setReview({ ...review, appFeedback: event.target.value, savedAt: undefined })} className="form-control min-h-24" placeholder="Tiny friction, confusing wording, missing shortcut, anything." />
          </Field>

          <div className="grid gap-4 md:grid-cols-2">
            <RatingControl label="Energy today" value={review.energy} onChange={(energy) => setReview({ ...review, energy, savedAt: undefined })} />
            <RatingControl label="Mood today" value={review.mood} onChange={(mood) => setReview({ ...review, mood, savedAt: undefined })} />
            <RatingControl label="Focus today" value={review.focus} onChange={(focus) => setReview({ ...review, focus, savedAt: undefined })} />
            <RatingControl label="Sleep readiness" value={review.sleepReadiness} onChange={(sleepReadiness) => setReview({ ...review, sleepReadiness, savedAt: undefined })} />
          </div>

          <button onClick={saveReview} className="primary-button min-h-14 justify-center text-base">
            <Save size={20} />
            Save Evening Review
          </button>
        </div>
      </Panel>

      <div className="grid gap-5">
        {showSummary ? (
          <Panel>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-200">Daily Summary</p>
            <h3 className="mt-2 text-2xl font-black text-white">{todayKey}</h3>
            <div className="mt-5 grid gap-3">
              <SummaryRow label="KPM Score" value={`${stats.points}`} />
              <SummaryRow label="Day Result Level" value={dayLevel} />
              <SummaryRow label="Missions Cleared" value={`${stats.completed}/${tasks.length}`} />
              <SummaryRow label="Main Mission completed" value={savedReview.mainMissionCompleted ? "Yes" : "No"} />
              <SummaryRow label="Best category" value={bestCategory} />
              <SummaryRow label="Weakest category" value={weakestCategory} />
              <SummaryRow label="Tomorrow's Main Mission" value={review.tomorrowMainMission || "Not set"} />
              <SummaryRow label="App feedback" value={review.appFeedback || "None"} />
            </div>
          </Panel>
        ) : (
          <Panel>
            <p className="text-lg font-black text-white">Summary appears after saving.</p>
            <p className="mt-2 text-slate-400">Use it as your night snapshot before shutdown.</p>
          </Panel>
        )}

        <Panel>
          <h3 className="text-xl font-black text-white">Quick Ratings</h3>
          <div className="mt-4 grid gap-3">
            <ProgressLine label="Energy" value={review.energy} total={10} percent={review.energy * 10} />
            <ProgressLine label="Mood" value={review.mood} total={10} percent={review.mood * 10} />
            <ProgressLine label="Focus" value={review.focus} total={10} percent={review.focus * 10} />
            <ProgressLine label="Sleep readiness" value={review.sleepReadiness} total={10} percent={review.sleepReadiness * 10} />
          </div>
        </Panel>
      </div>
    </section>
  );
}

function RatingControl({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="font-black text-white">{label}</p>
        <Badge tone="gold">{value}/10</Badge>
      </div>
      <div className="grid grid-cols-10 gap-1">
        {Array.from({ length: 10 }, (_, index) => index + 1).map((score) => (
          <button
            key={score}
            onClick={() => onChange(score)}
            className={`min-h-9 rounded-xl text-sm font-black ${
              score <= value ? "bg-amber-300 text-slate-950" : "bg-white/[0.06] text-slate-400"
            }`}
          >
            {score}
          </button>
        ))}
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl bg-white/[0.04] p-3 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-sm font-bold text-slate-400">{label}</span>
      <span className="font-black text-white">{value}</span>
    </div>
  );
}

function HistoryPage({ history, sevenDayTest }: { history: HistoryEntry[]; sevenDayTest: SevenDayTestSummary }) {
  const recent = [...history].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 14);
  const [openDate, setOpenDate] = useState<string | null>(null);

  return (
    <section className="grid gap-5">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-200">Daily Archive</p>
        <h2 className="mt-2 text-3xl font-black text-white">History</h2>
      </div>

      <Panel>
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-200">7-Day Test Tracker</p>
            <h3 className="mt-2 text-2xl font-black text-white">Day {sevenDayTest.currentDay} / 7</h3>
          </div>
          <Badge tone="gold">{sevenDayTest.completedDays}/7 reviews saved</Badge>
        </div>
        <SevenDayTracker days={sevenDayTest.days} />
      </Panel>

      {recent.length === 0 ? (
        <Panel>
          <p className="text-lg font-bold text-white">No archived days yet.</p>
          <p className="mt-2 text-slate-400">A day is saved here when KPM Sunny Daily OS detects a new date.</p>
        </Panel>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {recent.map((day) => (
            <article key={day.date} className="rounded-[1.5rem] border border-white/10 bg-white/[0.06] p-5 shadow-[0_22px_60px_rgba(0,0,0,0.24)] backdrop-blur-xl">
              <div>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-black text-amber-200">{day.date}</p>
                    <h3 className="mt-1 text-2xl font-black text-white">{day.dayLevel}</h3>
                    <Badge tone="gold">{day.mode ?? "Full Day"} Mode</Badge>
                    <p className="mt-2 text-sm text-slate-400">Main Mission: {day.mainMission}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge tone="gold">{day.totalScore} KPM</Badge>
                    <Badge tone="dark">{day.completedMissions}/{day.totalMissions} cleared</Badge>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setOpenDate(openDate === day.date ? null : day.date)}
                  className="secondary-button mt-4 min-h-[2.75rem] px-4"
                >
                  {openDate === day.date ? "Hide details" : "View details"}
                </button>
              </div>
              {openDate === day.date ? (
              <div className="mt-5 grid gap-4 border-t border-white/10 pt-4">
                <div className="grid gap-3 sm:grid-cols-3">
                  <MiniMetric label="Skipped" value={day.skippedMissions} />
                  <MiniMetric label="Main Done" value={day.mainMissionCompleted ? "Yes" : "No"} />
                  <MiniMetric label="Missions" value={day.totalMissions} />
                </div>
                <div className="rounded-2xl bg-black/20 p-4">
                  <p className="font-black text-white">Daily Mode</p>
                  <p className="mt-2 text-sm text-slate-300">{day.mode ?? "Full Day"} Mode</p>
                  <p className="mt-1 text-sm text-slate-400">{modeProfiles[day.mode ?? "Full Day"].note}</p>
                </div>
                {day.dailyNotes ? (
                  <div className="rounded-2xl bg-black/20 p-4">
                    <p className="font-black text-white">Daily Notes</p>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-300">{day.dailyNotes}</p>
                  </div>
                ) : null}
                <div className="rounded-2xl bg-black/20 p-4">
                  <p className="font-black text-white">Evening Review</p>
                  <p className="mt-2 text-sm text-slate-300">Completed: {day.eveningReview.wins || "No answer"}</p>
                  <p className="mt-1 text-sm text-slate-300">Blocked: {day.eveningReview.stuck || "No answer"}</p>
                  <p className="mt-1 text-sm text-slate-300">Tomorrow focus: {day.eveningReview.improve || "No answer"}</p>
                  <p className="mt-1 text-sm text-slate-300">Tomorrow: {day.eveningReview.tomorrowMainMission || "No answer"}</p>
                  <p className="mt-1 text-sm text-slate-300">App feedback: {day.eveningReview.appFeedback || "No feedback"}</p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-4">
                    <Badge tone="dark">Energy {day.eveningReview.energy}/10</Badge>
                    <Badge tone="dark">Mood {day.eveningReview.mood}/10</Badge>
                    <Badge tone="dark">Focus {day.eveningReview.focus}/10</Badge>
                    <Badge tone="dark">Sleep {day.eveningReview.sleepReadiness}/10</Badge>
                  </div>
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                  <TaskSummaryList title="Completed Tasks" tasks={day.taskSummary.filter((task) => task.completed)} />
                  <TaskSummaryList title="Skipped Tasks" tasks={day.taskSummary.filter((task) => task.skipped)} />
                </div>
                <TaskSummaryList title="Full Task List" tasks={day.taskSummary} />
              </div>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function TaskSummaryList({
  title,
  tasks
}: {
  title: string;
  tasks: HistoryEntry["taskSummary"];
}) {
  return (
    <div className="rounded-2xl bg-black/20 p-4">
      <p className="font-black text-white">{title}</p>
      {tasks.length === 0 ? (
        <p className="mt-2 text-sm text-slate-400">None</p>
      ) : (
        <div className="mt-3 grid gap-2">
          {tasks.map((task) => (
            <div key={`${title}-${task.id}`} className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-black text-amber-200">{task.time}</p>
                  <p className="font-bold text-white">{task.title}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge tone={task.category}>{task.category}</Badge>
                  <Badge tone={task.completed ? "gold" : "dark"}>{task.completed ? "Done" : task.skipped ? "Skipped" : "Open"}</Badge>
                </div>
              </div>
              {task.notes && <p className="mt-2 text-sm text-slate-400">{task.notes}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AnalyticsPage({ analytics, streaks }: { analytics: AnalyticsSummary; streaks: Streaks }) {
  const hasHistory = analytics.recentDays.length > 0;

  return (
    <section className="grid gap-5">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-200">Progress Intelligence</p>
        <h2 className="mt-2 text-3xl font-black text-white">Analytics</h2>
      </div>

      {!hasHistory ? (
        <Panel>
          <p className="text-xl font-black text-white">Complete a few days to unlock better analytics.</p>
          <p className="mt-2 text-slate-400">History cards and charts will appear after KPM Sunny Daily OS archives at least one completed day.</p>
        </Panel>
      ) : (
        <>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StatCard icon={Trophy} label="Last 7 Days Score" value={analytics.last7TotalScore} detail="Total KPM from recent days" accent="gold" />
        <StatCard icon={BarChart3} label="Average Daily Score" value={analytics.averageDailyScore} detail="Recent day average" accent="blue" />
        <StatCard icon={Sparkles} label="Best Day" value={analytics.bestDay?.totalScore ?? 0} detail={analytics.bestDay?.date ?? "No history yet"} accent="green" />
        <StatCard icon={Flame} label="Productive Days" value={analytics.productiveDays} detail="121+ KPM days in recent set" accent="gold" />
        <StatCard icon={CheckCircle2} label="Most Completed Category" value={analytics.mostCompletedCategory} detail="Based on completed missions" accent="green" />
        <StatCard icon={Clock3} label="Most Skipped Category" value={analytics.mostSkippedCategory} detail="Based on skipped missions" accent="blue" />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <LineChartCard title="Last 7 Days KPM Score" days={analytics.recentDays} valueKey="totalScore" />
        <BarChartCard title="Last 7 Days Completed Missions" days={analytics.recentDays} valueKey="completedMissions" />
      </div>

      <Panel>
        <h3 className="text-xl font-black text-white">Category Completion</h3>
        <div className="mt-5 grid gap-4">
          {categories.map((category) => {
            const stat = analytics.categoryStats[category];
            return (
              <div key={category} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    <Badge tone={category}>{category}</Badge>
                    <span className="text-sm text-slate-400">{stat.percent}% complete</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge tone="dark">Total {stat.total}</Badge>
                    <Badge tone="gold">Done {stat.completed}</Badge>
                    <Badge tone="dark">Skipped {stat.skipped}</Badge>
                  </div>
                </div>
                <ProgressLine label={`${category} progress`} value={stat.completed} total={Math.max(stat.total, 1)} percent={stat.percent} />
              </div>
            );
          })}
        </div>
      </Panel>

      <Panel>
        <h3 className="text-xl font-black text-white">Streak Snapshot</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MiniMetric label="Current" value={streaks.current} />
          <MiniMetric label="Best" value={streaks.best} />
          <MiniMetric label="Productive" value={streaks.productive} />
          <MiniMetric label="Main Mission" value={streaks.mainMission} />
        </div>
      </Panel>
        </>
      )}
    </section>
  );
}

function LineChartCard({ title, days, valueKey }: { title: string; days: HistoryEntry[]; valueKey: "totalScore" | "completedMissions" }) {
  const chartDays = [...days].reverse();
  const maxValue = Math.max(1, ...chartDays.map((day) => day[valueKey]));
  const points = chartDays.map((day, index) => {
    const x = chartDays.length <= 1 ? 50 : (index / (chartDays.length - 1)) * 100;
    const y = 90 - (day[valueKey] / maxValue) * 75;
    return `${x},${y}`;
  }).join(" ");

  return (
    <Panel>
      <h3 className="text-xl font-black text-white">{title}</h3>
      <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
        <svg viewBox="0 0 100 100" className="h-56 w-full overflow-visible">
          <polyline points={points} fill="none" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          {chartDays.map((day, index) => {
            const x = chartDays.length <= 1 ? 50 : (index / (chartDays.length - 1)) * 100;
            const y = 90 - (day[valueKey] / maxValue) * 75;
            return <circle key={day.date} cx={x} cy={y} r="2.6" fill="#34d399" />;
          })}
        </svg>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {chartDays.map((day) => (
            <div key={day.date} className="rounded-xl bg-white/[0.04] p-2 text-xs">
              <p className="font-bold text-slate-400">{day.date.slice(5)}</p>
              <p className="font-black text-white">{day[valueKey]}</p>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}

function BarChartCard({ title, days, valueKey }: { title: string; days: HistoryEntry[]; valueKey: "totalScore" | "completedMissions" }) {
  const chartDays = [...days].reverse();
  const maxValue = Math.max(1, ...chartDays.map((day) => day[valueKey]));

  return (
    <Panel>
      <h3 className="text-xl font-black text-white">{title}</h3>
      <div className="mt-5 flex h-64 items-end gap-2 rounded-2xl border border-white/10 bg-black/20 p-4">
        {chartDays.map((day) => {
          const height = Math.max(6, (day[valueKey] / maxValue) * 100);
          return (
            <div key={day.date} className="flex min-w-0 flex-1 flex-col items-center gap-2">
              <div className="flex h-48 w-full items-end">
                <div className="w-full rounded-t-xl bg-gradient-to-t from-emerald-400 to-amber-300" style={{ height: `${height}%` }} />
              </div>
              <p className="text-[11px] font-bold text-slate-400">{day.date.slice(5)}</p>
              <p className="text-xs font-black text-white">{day[valueKey]}</p>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

function SettingsPanel({
  settings,
  setSettings,
  resetToday,
  clearAllLocalData,
  exportAllData,
  importAllData,
  todayMode,
  selectedTodayMode,
  setSelectedTodayMode,
  generateTodayByMode
}: {
  settings: SettingsState;
  setSettings: Dispatch<SetStateAction<SettingsState>>;
  resetToday: () => void;
  clearAllLocalData: () => void;
  exportAllData: () => void;
  importAllData: (rawJson: string) => string;
  todayMode: DailyMode;
  selectedTodayMode: DailyMode;
  setSelectedTodayMode: Dispatch<SetStateAction<DailyMode>>;
  generateTodayByMode: (mode?: DailyMode) => boolean;
}) {
  const [importText, setImportText] = useState("");
  const [importStatus, setImportStatus] = useState("");
  const [storageInfo, setStorageInfo] = useState<StorageInfo>({ usedBytes: 0, limitBytes: LOCAL_STORAGE_LIMIT_BYTES, percent: 0 });

  useEffect(() => {
    setStorageInfo(calculateStorageInfo());
  }, [importStatus, settings]);

  function handleImport() {
    const result = importAllData(importText);
    setImportStatus(result);
  }

  function handleImportFile(file?: File) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = importAllData(typeof reader.result === "string" ? reader.result : "");
      setImportStatus(result);
    };
    reader.onerror = () => setImportStatus("Import failed: backup file could not be read.");
    reader.readAsText(file);
  }

  const storageTone = storageInfo.percent >= 90 ? "border-red-300/35 bg-red-400/10 text-red-100" : storageInfo.percent >= 70 ? "border-orange-300/35 bg-orange-400/10 text-orange-100" : "border-emerald-300/25 bg-emerald-400/10 text-emerald-100";
  const storageWarning = storageInfo.percent >= 90
    ? "Danger: local storage is above 90%. Export a backup and clear old data soon."
    : storageInfo.percent >= 70
      ? "Warning: local storage is above 70%. Export a backup regularly."
      : "Storage looks healthy.";
  const environment = typeof window !== "undefined" && ["localhost", "127.0.0.1"].includes(window.location.hostname) ? "Local" : "Production";

  return (
    <Panel>
      <div className="mb-6">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-200">Control Room</p>
        <h2 className="mt-2 text-3xl font-black text-white">Settings</h2>
      </div>

      <div className="grid gap-4">
        <div>
          <h3 className="text-lg font-black text-white">Schedule start time</h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {[
              { value: "5:30" as const, title: "5:30 AM", description: "Default Sunny schedule." },
              { value: "5:00" as const, title: "5:00 AM", description: "Move all missions 30 minutes earlier." }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setSettings({ ...settings, scheduleVersion: option.value })}
                className={`rounded-2xl border p-4 text-left transition ${
                  settings.scheduleVersion === option.value
                    ? "border-amber-300/60 bg-amber-300/[0.12] shadow-[0_0_30px_rgba(245,158,11,0.12)]"
                    : "border-white/10 bg-white/[0.04] hover:bg-white/[0.07]"
                }`}
              >
                <p className="text-xl font-black text-white">{option.title}</p>
                <p className="mt-1 text-sm text-slate-400">{option.description}</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-black text-white">Today Mode</h3>
              <p className="mt-1 text-sm text-slate-400">{modeProfiles[todayMode].note}</p>
              {selectedTodayMode !== todayMode ? <p className="mt-1 text-sm font-bold text-amber-100">Selected to generate: {selectedTodayMode} Mode</p> : null}
            </div>
            <button onClick={() => generateTodayByMode()} className="primary-button justify-center">
              <Sparkles size={18} />
              Generate Today&apos;s Missions
            </button>
          </div>
          <ModeSelector value={selectedTodayMode} onChange={setSelectedTodayMode} />
        </div>

        <div className="rounded-2xl border border-amber-300/20 bg-amber-300/[0.08] p-4 shadow-[0_0_34px_rgba(245,158,11,0.08)]">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#E7D79B] to-[#D8C27A] text-slate-950 shadow-[0_12px_28px_rgba(216,194,122,0.16)]">
              <Download size={21} />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Install App</h3>
              <p className="mt-1 text-sm leading-6 text-slate-300">Open KPM Sunny Daily OS like a normal app from your phone or computer.</p>
            </div>
          </div>

          <div className="mt-4 grid gap-3">
            <InstallStep title="iPhone / Safari" body="Tap Share, then Add to Home Screen." />
            <InstallStep title="Android / Chrome" body="Tap menu, then Install app or Add to Home screen." />
            <InstallStep title="Desktop / Chrome" body="Click the install icon in the address bar if available." />
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h3 className="text-lg font-black text-white">Storage + Backup</h3>
              <p className="mt-1 text-sm leading-6 text-slate-400">Your data is saved only on this device until cloud sync is added. Export backup regularly.</p>
            </div>
            <button onClick={exportAllData} className="primary-button justify-center">
              <Download size={18} />
              Export Data
            </button>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <MiniMetric label="Storage Used" value={formatBytes(storageInfo.usedBytes)} />
            <MiniMetric label="Storage Limit" value={formatBytes(storageInfo.limitBytes)} />
            <MiniMetric label="Used" value={`${storageInfo.percent}%`} />
          </div>

          <div className={`mt-4 rounded-2xl border p-4 ${storageTone}`}>
            <p className="text-sm font-black">{storageWarning}</p>
          </div>

          <div className="mt-4 grid gap-3">
            <Field label="Import backup JSON file">
              <input
                type="file"
                accept="application/json,.json"
                onChange={(event) => handleImportFile(event.target.files?.[0])}
                className="form-control"
              />
            </Field>
            <Field label="Or paste backup JSON">
              <textarea
                value={importText}
                onChange={(event) => setImportText(event.target.value)}
                className="form-control min-h-32"
                placeholder="Paste a KPM Sunny Daily OS backup JSON file here"
              />
            </Field>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button onClick={handleImport} className="secondary-button">
                Import Data
              </button>
              <button onClick={clearAllLocalData} className="danger-button">
                <Trash2 size={18} />
                Clear All Data
              </button>
              {importStatus ? <p className="text-sm font-bold text-amber-100">{importStatus}</p> : null}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
          <button onClick={resetToday} className="danger-button">
            <RotateCcw size={18} />
            Reset today's list
          </button>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-lg font-black text-white">App Version</h3>
              <p className="mt-1 text-sm leading-6 text-slate-400">KPM Sunny Daily OS · {APP_VERSION}</p>
            </div>
            <Badge tone="gold">{environment}</Badge>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <MiniMetric label="Current version" value={APP_VERSION} />
            <MiniMetric label="Last updated" value={APP_LAST_UPDATED} />
            <MiniMetric label="Environment" value={environment} />
          </div>
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <p className="font-black text-white">Changelog</p>
            <ul className="mt-3 grid gap-2 text-sm leading-6 text-slate-300">
              <li>V1.6 Stability + backup foundation</li>
              <li>V1.7 Vercel deployment</li>
              <li>V1.8 7-day real use test</li>
              <li>V1.9 Smart Mission Scheduler</li>
              <li>Storage + Backup Center</li>
              <li>V2.0 Life OS foundation</li>
              <li>V2.1 Everyday Essentials preset plan</li>
              <li>V2.2 Get Lean / Shred preset plan</li>
              <li>V2.3 Learn / Master Subject preset plan</li>
              <li>V2.4 Multiple active plans</li>
              <li>V2.5 Today Priority Control</li>
              <li>V2.6 Wake time + target sleep Build Today</li>
              <li>V2.7 Get Lean macro targets + food log</li>
              <li>V2.8 Fix Sleep & Energy preset plan</li>
              <li>V2.9 Build a Project preset plan</li>
              <li>V2.10 Active Plan Control Center</li>
              <li>V2.11 Stability + backup test pass</li>
              <li>V3.0 Money Plan - Increase Income + Saving Plan</li>
              <li>V3.1 Life Reset preset plan</li>
              <li>V3.2 Long Study Event Planner</li>
              <li>V3.3 Plan tab organization</li>
              <li>V3.4 Progress Review Center</li>
              <li>V3.5 Full stability + data safety pass</li>
              <li>V3.6 7-Day Real Use Test Mode</li>
              <li>V3.7 Long-Term Planning Hub</li>
            </ul>
          </div>
          <p className="mt-4 text-sm leading-6 text-amber-100">If the live Vercel app looks old, push the latest Git commit and refresh the app.</p>
        </div>
      </div>
    </Panel>
  );
}

function InstallStep({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
      <p className="text-sm font-black text-amber-100">{title}</p>
      <p className="mt-1 text-sm leading-6 text-slate-400">{body}</p>
    </div>
  );
}

function RightPanel({
  stats,
  dayLevel,
  mainMission,
  nextTask,
  tasks,
  streaks,
  todayMode
}: {
  stats: Stats;
  dayLevel: string;
  mainMission?: Task;
  nextTask?: Task;
  tasks: Task[];
  streaks: Streaks;
  todayMode: DailyMode;
}) {
  return (
    <aside className="sticky top-0 hidden h-screen w-[300px] min-w-0 overflow-y-auto border-l border-white/10 bg-black/20 p-4 backdrop-blur-xl 2xl:block">
      <div className="grid min-w-0 gap-4">
        <Panel compact>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-200">KPM Score</p>
          <p className="mt-2 break-words text-4xl font-black text-white">{stats.points}</p>
          <p className="mt-1 text-slate-400">{dayLevel}</p>
          <Badge tone="gold">{todayMode} Mode</Badge>
        </Panel>
        <MissionPreview label="Main Mission" task={mainMission} />
        <MissionPreview label="Next Mission" task={nextTask} />
        <Panel compact>
          <h3 className="text-lg font-black text-white">Progress Summary</h3>
          <div className="mt-4 grid gap-4">
            <ProgressLine label="Missions Cleared" value={stats.completed} total={tasks.length} percent={Math.round((stats.completed / tasks.length) * 100)} />
            <ProgressLine label="Remaining" value={stats.remaining} total={tasks.length} percent={Math.round((stats.remaining / tasks.length) * 100)} />
          </div>
        </Panel>
        <Panel compact>
          <h3 className="text-lg font-black text-white">Streaks</h3>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <MiniMetric label="Current" value={streaks.current} />
            <MiniMetric label="Best" value={streaks.best} />
            <MiniMetric label="Productive" value={streaks.productive} />
            <MiniMetric label="Main" value={streaks.mainMission} />
          </div>
        </Panel>
      </div>
    </aside>
  );
}

function Panel({ children, compact = false, className = "" }: { children: ReactNode; compact?: boolean; className?: string }) {
  return (
    <div className={`sunny-panel min-w-0 max-w-full rounded-[1.25rem] border border-white/10 bg-white/[0.06] shadow-[0_18px_46px_rgba(0,0,0,0.22)] backdrop-blur-xl ${compact ? "p-3.5" : "p-4 sm:p-5"} ${className}`}>
      {children}
    </div>
  );
}

function CollapsibleSection({
  title,
  subtitle,
  children,
  defaultOpen = false
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details className="group min-w-0 max-w-full rounded-[1.5rem] border border-white/10 bg-white/[0.055] p-4 shadow-[0_22px_60px_rgba(0,0,0,0.20)] backdrop-blur-xl sm:p-5" open={defaultOpen}>
      <summary className="flex cursor-pointer list-none flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-amber-200">{title}</p>
          {subtitle ? <p className="mt-1 text-sm leading-6 text-slate-400">{subtitle}</p> : null}
        </div>
        <span className="secondary-button min-h-10 shrink-0 px-3 py-2 text-xs group-open:hidden">Open</span>
        <span className="secondary-button hidden min-h-10 shrink-0 px-3 py-2 text-xs group-open:inline-flex">Close</span>
      </summary>
      <div className="mt-4 min-w-0">{children}</div>
    </details>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  detail,
  accent
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  detail: string;
  accent: "gold" | "green" | "blue";
}) {
  const color = accent === "green" ? "from-emerald-300 to-emerald-500" : accent === "blue" ? "from-sky-300 to-cyan-500" : "from-amber-300 to-orange-500";
  return (
    <div className="min-w-0 rounded-[1.5rem] border border-white/10 bg-white/[0.06] p-4 shadow-[0_22px_60px_rgba(0,0,0,0.22)] backdrop-blur-xl 2xl:p-5">
      <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${color} text-slate-950`}>
        <Icon size={23} />
      </div>
      <p className="text-sm font-bold uppercase tracking-[0.14em] text-slate-400">{label}</p>
      <p className="mt-2 break-words text-2xl font-black text-white 2xl:text-3xl">{value}</p>
      <p className="mt-1 line-clamp-2 text-sm text-slate-400">{detail}</p>
    </div>
  );
}

function MissionPreview({ label, task }: { label: string; task?: Task }) {
  return (
    <div className="min-w-0 rounded-[1.25rem] border border-white/10 bg-[#0b1220]/75 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-200">{label}</p>
      {task ? (
        <div className="mt-3">
          <p className="text-sm font-black text-amber-100">{task.time}</p>
          <p className="mt-1 break-words text-lg font-black leading-snug text-white">{task.title}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge tone={task.category}>{task.category}</Badge>
            <Badge tone={task.priority === "S" ? "gold" : "dark"}>{task.priority}-Tier</Badge>
            <Badge tone="dark">{task.points} KPM</Badge>
          </div>
        </div>
      ) : (
        <p className="mt-3 text-sm font-semibold text-slate-400">All missions cleared. Review your day.</p>
      )}
    </div>
  );
}

function NextMissionCard({ task }: { task?: Task }) {
  return (
    <Panel compact>
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-200">Next Mission</p>
      {task ? (
        <div className="mt-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-black text-amber-100">{task.time}</p>
              <h3 className="mt-1 text-2xl font-black leading-tight text-white">{task.title}</h3>
            </div>
            <Badge tone="gold">{task.points} KPM</Badge>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge tone={task.category}>{task.category}</Badge>
            <Badge tone={task.priority === "S" ? "gold" : "dark"}>{task.priority}-Tier</Badge>
            <Badge tone="dark">{task.block}</Badge>
          </div>
        </div>
      ) : (
        <p className="mt-3 text-lg font-black text-white">All missions cleared. Review your day.</p>
      )}
    </Panel>
  );
}

function DailyNotesCard({ value, onChange }: { value: string; onChange: Dispatch<SetStateAction<string>> }) {
  return (
    <Panel compact>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-200">Daily Notes</p>
          <h3 className="mt-1 text-xl font-black text-white">Quick notes for today</h3>
        </div>
        <Badge tone="dark">Auto-save</Badge>
      </div>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="form-control mt-4 min-h-32 resize-y"
        placeholder="Write anything important for today..."
      />
    </Panel>
  );
}

function MiniMetric({ label, value, compact = false }: { label: string; value: string | number; compact?: boolean }) {
  return (
    <div className={`min-w-0 rounded-2xl border border-white/10 bg-white/[0.06] ${compact ? "p-3" : "p-4"}`}>
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <p className={`break-words font-black text-white ${compact ? "mt-1 text-xl" : "mt-2 text-2xl"}`}>{value}</p>
    </div>
  );
}

function ProgressLine({ label, value, total, percent }: { label: string; value: number; total: number; percent: number }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3 text-sm font-bold">
        <span className="text-slate-200">{label}</span>
        <span className="text-amber-200">{value}/{total}</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-gradient-to-r from-amber-300 via-orange-400 to-emerald-400" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-2 text-sm font-black text-slate-200">
      {label}
      {children}
    </label>
  );
}

function SelectField({ label, value, options, onChange, optionLabels }: { label: string; value: string; options: string[]; onChange: (value: string) => void; optionLabels?: Record<string, string> }) {
  return (
    <Field label={label}>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="form-control">
        {options.map((option) => (
          <option key={option} value={option}>{optionLabels?.[option] ?? option}</option>
        ))}
      </select>
    </Field>
  );
}

function Badge({ children, tone = "dark" }: { children: ReactNode; tone?: Category | "gold" | "dark" | "green" | "orange" }) {
  const tones: Record<Category | "gold" | "dark" | "green" | "orange", string> = {
    Knowledge: "border-cyan-200/25 bg-cyan-300/10 text-cyan-100",
    Plan: "border-[#E8C86A]/30 bg-[#E8C86A]/10 text-[#F0D77A]",
    Monitoring: "border-[#8B7BC6]/30 bg-[#8B7BC6]/12 text-[#d6d0ff]",
    Sunny: "border-[#6FD6D1]/30 bg-[#6FD6D1]/10 text-[#BDF7F4]",
    gold: "border-[#E8C86A]/34 bg-[#E8C86A]/12 text-[#F0D77A]",
    green: "border-[#6FD6D1]/34 bg-[#6FD6D1]/10 text-[#BDF7F4]",
    orange: "border-[#8B7BC6]/34 bg-[#8B7BC6]/12 text-[#d6d0ff]",
    dark: "border-[#B7C2D6]/12 bg-[#13213A]/70 text-[#B7C2D6]"
  };
  return <span className={`inline-flex max-w-full items-center rounded-full border px-3 py-1 text-left text-xs font-black leading-snug break-words whitespace-normal ${tones[tone]}`}>{children}</span>;
}

function readStorage<T>(key: string, fallback: T): T {
  try {
    const saved = window.localStorage.getItem(key);
    return saved ? (JSON.parse(saved) as T) : fallback;
  } catch (error) {
    console.warn(`KPM Sunny could not parse localStorage key "${key}". Falling back to default data.`, error);
    return fallback;
  }
}

function writeStorage<T>(key: string, value: T) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage can fail in private browsing; the app still works in memory.
  }
}

function safeGetLocalStorageItem(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch (error) {
    console.warn(`KPM Sunny could not read localStorage key "${key}".`, error);
    return null;
  }
}

function safeSetLocalStorageItem(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch (error) {
    console.warn(`KPM Sunny could not write localStorage key "${key}".`, error);
  }
}

function clearKpmLocalData() {
  try {
    Object.keys(window.localStorage)
      .filter((key) => key.startsWith("kpm-sunny"))
      .forEach((key) => window.localStorage.removeItem(key));
  } catch (error) {
    console.warn("KPM Sunny could not clear local data.", error);
  }
}

function getRawKpmLocalData(): Record<string, string> {
  try {
    return Object.keys(window.localStorage)
      .filter((key) => key.startsWith("kpm-sunny"))
      .sort()
      .reduce<Record<string, string>>((data, key) => {
        data[key] = window.localStorage.getItem(key) ?? "";
        return data;
      }, {});
  } catch (error) {
    console.warn("KPM Sunny could not read raw local data.", error);
    return {};
  }
}

function exportRawLocalData() {
  const payload = {
    app: "KPM Sunny Daily OS",
    version: "raw-local-data",
    exportedAt: new Date().toISOString(),
    data: getRawKpmLocalData()
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `kpm-sunny-raw-local-data-${getDateKey(new Date())}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function seedDefaultDashboard() {
  const currentDate = getCurrentDateKey();
  const settings: SettingsState = {
    ...defaultSettings,
    onboardingComplete: true,
    sevenDayTestStartDate: currentDate
  };
  const template = createOriginalTemplate();
  const defaultTasks = buildModeSchedule(buildSchedule(template, false), settings.defaultDailyMode ?? "Full Day");

  writeStorage(SETTINGS_KEY, settings);
  writeStorage(TEMPLATE_KEY, template);
  writeStorage(`${TASKS_KEY_PREFIX}:${currentDate}`, defaultTasks);
  writeStorage(`${MODE_KEY_PREFIX}:${currentDate}`, settings.defaultDailyMode ?? "Full Day");
  safeSetLocalStorageItem(LAST_ACTIVE_DATE_KEY, currentDate);
}

function calculateStorageInfo(): StorageInfo {
  if (typeof window === "undefined") return { usedBytes: 0, limitBytes: LOCAL_STORAGE_LIMIT_BYTES, percent: 0 };
  let usedBytes = 0;
  try {
    Object.keys(window.localStorage)
      .filter((key) => key.startsWith("kpm-sunny"))
      .forEach((key) => {
        usedBytes += byteSize(key);
        usedBytes += byteSize(window.localStorage.getItem(key) ?? "");
      });
  } catch {
    usedBytes = 0;
  }
  return {
    usedBytes,
    limitBytes: LOCAL_STORAGE_LIMIT_BYTES,
    percent: Math.min(100, Math.round((usedBytes / LOCAL_STORAGE_LIMIT_BYTES) * 100))
  };
}

function byteSize(value: string): number {
  return new Blob([value]).size;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function isKpmBackupPayload(payload: unknown): payload is { app?: string; data: Record<string, unknown> } {
  if (!payload || typeof payload !== "object") return false;
  const candidate = payload as { app?: unknown; data?: unknown };
  if (!candidate.data || typeof candidate.data !== "object" || Array.isArray(candidate.data)) return false;
  const data = candidate.data as Record<string, unknown>;
  const keys = Object.keys(data);
  if (keys.length === 0 || !keys.every((key) => key.startsWith("kpm-sunny"))) return false;
  return typeof candidate.app !== "string" || candidate.app.includes("KPM Sunny");
}

function createHistoryEntry(date: string, dayTasks: Task[], dayReview: Review, mode: DailyMode = "Full Day", dailyNotes = ""): HistoryEntry {
  const stats = getStats(dayTasks);
  const mainMission = getMainMissionForDay(dayTasks);
  const review = normalizeReview(dayReview);
  return {
    date,
    mode,
    totalScore: stats.points,
    dayLevel: getDayLevel(stats.points),
    completedMissions: stats.completed,
    skippedMissions: dayTasks.filter((task) => task.skipped).length,
    totalMissions: dayTasks.length,
    mainMission: mainMission?.title ?? "No main mission",
    mainMissionCompleted: review.mainMissionCompleted ?? Boolean(mainMission?.completed),
    dailyNotes,
    eveningReview: review,
    taskSummary: dayTasks.map((task) => ({
      id: task.id,
      time: task.time,
      title: task.title,
      category: task.category,
      priority: task.priority,
      points: task.points,
      completed: task.completed,
      skipped: task.skipped,
      notes: task.notes
    }))
  };
}

function upsertHistoryEntry(history: HistoryEntry[], entry: HistoryEntry): HistoryEntry[] {
  return [entry, ...history.filter((day) => day.date !== entry.date)].sort((a, b) => b.date.localeCompare(a.date));
}

function getMainMissionForDay(dayTasks: Task[]): Task | undefined {
  return dayTasks.find((task) => task.insertedGoal) || dayTasks.find((task) => task.priority === "S");
}

function getCurrentMission(dayTasks: Task[], startTime = "5:30 AM"): Task | undefined {
  const incompleteTasks = dayTasks
    .filter((task) => !task.completed && !task.skipped)
    .sort((a, b) => relativeTaskMinutes(a.time, startTime) - relativeTaskMinutes(b.time, startTime));
  if (incompleteTasks.length === 0) return undefined;

  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const startMinutes = timeToMinutes(startTime);
  const nowRelativeMinutes = nowMinutes < startMinutes ? nowMinutes + 1440 - startMinutes : nowMinutes - startMinutes;
  return incompleteTasks.find((task) => relativeTaskMinutes(task.time, startTime) >= nowRelativeMinutes) ?? incompleteTasks[0];
}

function getMainMissionStatus(task?: Task): "Not started" | "In progress" | "Done" {
  if (!task) return "Not started";
  if (task.completed) return "Done";
  if (task.notes.trim().length > 0 || task.skipped) return "In progress";
  return "Not started";
}

function getMissionReason(task: Task): string {
  if (task.notes.trim()) return task.notes;
  if (task.priority === "S") return "This is a high-impact mission. Clear it before the day gets noisy.";
  if (task.category === "Sunny") return "This supports your body and keeps the day stable.";
  if (task.category === "Knowledge") return "This builds skill and long-term capability.";
  if (task.category === "Monitoring") return "This keeps your environment and resources under control.";
  return "This keeps the day organized and pointed in the right direction.";
}

function resolveDailyMode(mode?: DailyMode, fallback?: DailyMode): DailyMode {
  if (mode && dailyModes.includes(mode)) return mode;
  if (fallback && dailyModes.includes(fallback)) return fallback;
  return "Full Day";
}

function getFirstMissionStep(task: Task): string {
  const text = `${task.title} ${task.notes}`.toLowerCase();
  if (/(soak feet|warm water|nanno)/.test(text)) return "Prepare warm water, sit down, soak your feet, and let your body calm down.";
  if (/(money|job|apply|income|business|spending|expense|opportunit|resume|cv)/.test(text)) return "Open your job/app/money tool and choose one action.";
  if (task.category === "Knowledge" || /(skill|study|learn|coding|practice|lesson|project)/.test(text)) return "Open your lesson or project and review the last thing you did.";
  if (/(health|exercise|walk|stretch|sunlight|water|shower|sleep|meal)/.test(text)) return "Stand up, drink water, and begin with light movement.";
  if (/(clean|trash|desk|clothes|floor|bed|dish|room|mess)/.test(text)) return "Start with trash or the easiest visible mess.";
  if (/(admin|message|bill|note|reply|email|document)/.test(text)) return "Open messages, bills, or notes and handle one item.";
  if (task.category === "Sunny") return "Do the small reset action first.";
  return "Open what you need and work for 5 minutes.";
}

function getFocusPreset(id: FocusPresetId): FocusPreset {
  return focusPresets.find((preset) => preset.id === id) ?? focusPresets[3];
}

function getSuggestedFocusPreset(task: Task): FocusPreset {
  const text = `${task.title} ${task.notes}`.toLowerCase();

  if (task.timerPresetMinutes === 5) return getFocusPreset("quick-reset");
  if (task.timerPresetMinutes === 10) return getFocusPreset("routine");
  if (task.timerPresetMinutes === 15) return getFocusPreset("short-task");
  if (task.timerPresetMinutes === 25) return getFocusPreset("normal-focus");
  if (task.timerPresetMinutes === 50) return getFocusPreset("deep-work");
  if (task.timerPresetMinutes === 90) return getFocusPreset("ceo-block");

  if (/ceo mode|ceo block|major project|long deep work/.test(text)) return getFocusPreset("ceo-block");
  if (task.timerPresetMinutes === 15 || /(soak feet|warm water|nanno)/.test(text)) return getFocusPreset("short-task");

  if (/wake up|drink water|make bed|daily notes|quick notes|quick check/.test(text)) return getFocusPreset("quick-reset");
  if (/use toilet|brush teeth|wash face|wear clean clothes|fix hair|deodorant|wash dishes|simple clean|light stretch|fresh air|check spending|money|supplies/.test(text)) return getFocusPreset("routine");

  if (/shower|wipe body|bedtime routine|breakfast|reply important messages|message|small admin|plan tomorrow|evening review|relax time/.test(text)) return getFocusPreset("short-task");
  if (/walk|sunlight/.test(text) && !/exercise/.test(text)) return getFocusPreset("short-task");

  if (/main useful task|continue main task|serious work|deep work|coding|job application|apply for jobs|build app|study|skill learning|skill practice|practice/.test(text)) return getFocusPreset("deep-work");
  if (/exercise/.test(text)) return getFocusPreset("deep-work");

  if (/lunch|dinner|light learning|reading|planning|free time|hobby|game|small project|low energy work/.test(text)) return getFocusPreset("normal-focus");

  if (task.category === "Knowledge" || task.priority === "S") return getFocusPreset("deep-work");
  return getFocusPreset("normal-focus");
}

function formatTimer(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function applyMainMissionTitle(dayTasks: Task[], title?: string): Task[] {
  const cleanTitle = title?.trim();
  if (!cleanTitle) return dayTasks;
  const mainMission = getMainMissionForDay(dayTasks);
  if (!mainMission) return dayTasks;
  return dayTasks.map((task) => (task.id === mainMission.id ? { ...task, title: cleanTitle } : task));
}

function createSevenDayTest(startDate: string, todayKey: string, days: HistoryEntry[]): SevenDayTestSummary {
  const byDate = new Map(days.map((day) => [day.date, day]));
  const start = /^\d{4}-\d{2}-\d{2}$/.test(startDate) ? startDate : todayKey;
  const rows = Array.from({ length: 7 }, (_, index) => {
    const date = getDateKey(addDays(parseDateKey(start), index));
    const entry = byDate.get(date);
    return {
      dayNumber: index + 1,
      date,
      entry,
      score: entry?.totalScore ?? 0,
      dayLevel: entry?.dayLevel ?? "Not started",
      mainMissionCompleted: Boolean(entry?.mainMissionCompleted),
      reviewCompleted: Boolean(entry?.eveningReview?.savedAt)
    };
  });
  const activeRows = rows.filter((row) => row.reviewCompleted || row.score > 0);
  const completedDays = rows.filter((row) => row.reviewCompleted).length;
  const bestDay = activeRows.reduce<SevenDayTestDay | undefined>((best, day) => (!best || day.score > best.score ? day : best), undefined);
  const totalScore = activeRows.reduce((total, day) => total + day.score, 0);
  const completedMainMissions = activeRows.filter((day) => day.mainMissionCompleted).length;
  const currentDay = Math.min(7, Math.max(1, Math.floor((parseDateKey(todayKey).getTime() - parseDateKey(start).getTime()) / 86400000) + 1));

  return {
    startDate: start,
    currentDay,
    completedDays,
    bestDay,
    averageScore: activeRows.length ? Math.round(totalScore / activeRows.length) : 0,
    mainMissionCompletionRate: activeRows.length ? Math.round((completedMainMissions / activeRows.length) * 100) : 0,
    days: rows
  };
}

function resetTaskStatuses(dayTasks: Task[]): Task[] {
  return dayTasks.map((task) => ({
    ...task,
    completed: false,
    skipped: false,
    notes: task.insertedGoal ? task.notes : ""
  }));
}

function draftToTask(draft: TaskDraft, custom: boolean): Task {
  return {
    id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    time: draft.time,
    title: draft.title.trim(),
    category: draft.category,
    priority: draft.priority,
    points: Number(draft.points) || 0,
    completed: false,
    skipped: false,
    notes: draft.notes,
    block: getTaskBlock(draft.time),
    custom
  };
}

function taskToDraft(task: Task): TaskDraft {
  return {
    time: task.time,
    title: task.title,
    category: task.category,
    priority: task.priority,
    points: task.points,
    notes: task.notes
  };
}

function draftToTemplateTask(draft: TemplateDraft): TemplateTask {
  return {
    id: `template-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    time: draft.time,
    title: draft.title.trim(),
    category: draft.category,
    priority: draft.priority,
    points: Number(draft.points) || 0,
    block: blockNames.includes(draft.block) ? draft.block : getTaskBlock(draft.time),
    enabled: draft.enabled,
    notes: draft.notes
  };
}

function templateToDraft(task: TemplateTask): TemplateDraft {
  return {
    time: task.time,
    title: task.title,
    category: task.category,
    priority: task.priority,
    points: task.points,
    block: blockNames.includes(task.block) ? task.block : getTaskBlock(task.time),
    enabled: task.enabled,
    notes: task.notes
  };
}

function calculateStreaks(days: HistoryEntry[], todayKey: string): Streaks {
  const byDate = new Map(days.map((day) => [day.date, day]));
  const sortedAscending = [...days].sort((a, b) => a.date.localeCompare(b.date));
  let best = 0;
  let running = 0;

  sortedAscending.forEach((day) => {
    if (day.totalScore >= 51) {
      running += 1;
      best = Math.max(best, running);
    } else {
      running = 0;
    }
  });

  return {
    current: countBackwardStreak(todayKey, byDate, (day) => day.totalScore >= 51),
    best,
    productive: countBackwardStreak(todayKey, byDate, (day) => day.totalScore >= 121),
    mainMission: countBackwardStreak(todayKey, byDate, (day) => day.mainMissionCompleted)
  };
}

function countBackwardStreak(todayKey: string, byDate: Map<string, HistoryEntry>, qualifies: (day: HistoryEntry) => boolean): number {
  let count = 0;
  let cursor = todayKey;

  while (true) {
    const day = byDate.get(cursor);
    if (!day || !qualifies(day)) break;
    count += 1;
    cursor = getPreviousDateKey(cursor);
  }

  return count;
}

function calculateAnalytics(days: HistoryEntry[]): AnalyticsSummary {
  const recent = [...days].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 7);
  const last7TotalScore = recent.reduce((total, day) => total + day.totalScore, 0);
  const bestDay = recent.reduce<HistoryEntry | undefined>((best, day) => (!best || day.totalScore > best.totalScore ? day : best), undefined);
  const completedCounts = countCategories(recent, "completed");
  const skippedCounts = countCategories(recent, "skipped");
  const categoryStats = getCategoryStatsFromHistory(recent);

  return {
    last7TotalScore,
    averageDailyScore: recent.length ? Math.round(last7TotalScore / recent.length) : 0,
    bestDay,
    productiveDays: recent.filter((day) => day.totalScore >= 121).length,
    mostCompletedCategory: topCategory(completedCounts),
    mostSkippedCategory: topCategory(skippedCounts),
    recentDays: recent,
    categoryStats
  };
}

function countCategories(days: HistoryEntry[], status: "completed" | "skipped"): Record<Category, number> {
  return days.reduce<Record<Category, number>>(
    (counts, day) => {
      day.taskSummary.forEach((task) => {
        if (status === "completed" && task.completed) counts[task.category] += 1;
        if (status === "skipped" && task.skipped) counts[task.category] += 1;
      });
      return counts;
    },
    { Knowledge: 0, Plan: 0, Monitoring: 0, Sunny: 0 }
  );
}

function topCategory(counts: Record<Category, number>): string {
  const top = categories.reduce((best, category) => (counts[category] > counts[best] ? category : best), categories[0]);
  return counts[top] > 0 ? top : "Not enough data";
}

function normalizeReview(review: Partial<Review>): Review {
  return {
    wins: review.wins ?? "",
    stuck: review.stuck ?? "",
    learned: review.learned ?? "",
    improve: review.improve ?? "",
    tomorrowMainMission: review.tomorrowMainMission ?? "",
    mainMissionCompleted: Boolean(review.mainMissionCompleted),
    appFeedback: review.appFeedback ?? "",
    energy: clampRating(review.energy),
    mood: clampRating(review.mood),
    focus: clampRating(review.focus),
    sleepReadiness: clampRating(review.sleepReadiness),
    savedAt: review.savedAt
  };
}

function normalizePlan(plan: Partial<Plan>): Plan {
  return {
    ...defaultPlan,
    ...plan,
    goalCategory: plan.goalCategory && ["Money", "Skill", "Health", "Cleaning", "Admin", "Personal", "Fun"].includes(plan.goalCategory) ? plan.goalCategory : defaultPlan.goalCategory,
    timeNeeded: plan.timeNeeded && ["15 min", "30 min", "1 hour", "2 hours", "3 hours"].includes(plan.timeNeeded) ? plan.timeNeeded : defaultPlan.timeNeeded,
    priority: plan.priority && priorities.includes(plan.priority) ? plan.priority : defaultPlan.priority,
    energy: plan.energy && ["Low", "Medium", "High"].includes(plan.energy) ? plan.energy : defaultPlan.energy,
    isBigGoal: Boolean(plan.isBigGoal),
    tomorrowMode: plan.tomorrowMode && dailyModes.includes(plan.tomorrowMode) ? plan.tomorrowMode : "Full Day"
  };
}

function normalizeSettings(settings: Partial<SettingsState>): SettingsState {
  const scheduleVersion = settings.scheduleVersion === "5:00" ? "5:00" : "5:30";
  const defaultDailyMode = settings.defaultDailyMode && dailyModes.includes(settings.defaultDailyMode) ? settings.defaultDailyMode : "Full Day";
  const mainLifeFocus = settings.mainLifeFocus && mainLifeFocusOptions.includes(settings.mainLifeFocus) ? settings.mainLifeFocus : "Stability";
  const sevenDayTestStartDate = settings.sevenDayTestStartDate && /^\d{4}-\d{2}-\d{2}$/.test(settings.sevenDayTestStartDate) ? settings.sevenDayTestStartDate : undefined;
  return {
    scheduleVersion,
    onboardingComplete: Boolean(settings.onboardingComplete),
    defaultDailyMode,
    mainLifeFocus,
    sevenDayTestStartDate
  };
}

function normalizeProfile(profile: Partial<ProfileState>): ProfileState {
  return {
    name: profile.name ?? "",
    dateOfBirth: profile.dateOfBirth ?? "",
    sex: profile.sex ?? "",
    heightCm: Number(profile.heightCm) || 0,
    currentWeightKg: Number(profile.currentWeightKg) || 0,
    goalWeightKg: Number(profile.goalWeightKg) || 0,
    activityLevel: profile.activityLevel ?? "",
    normalWakeTime: profile.normalWakeTime ?? "",
    sleepTargetHours: Number(profile.sleepTargetHours) || 8,
    mainLifeFocus: profile.mainLifeFocus ?? "",
    foodRules: Array.isArray(profile.foodRules) ? profile.foodRules.filter(Boolean) : [],
    activePlan: profile.activePlan ?? ""
  };
}

function normalizeTask(task: Partial<Task>, index = 0): Task {
  const time = task.time || "8:00 AM";
  return {
    id: task.id || `recovered-task-${index}-${Date.now()}`,
    time,
    title: task.title || "Recovered mission",
    category: categories.includes(task.category as Category) ? task.category as Category : "Plan",
    priority: priorities.includes(task.priority as Priority) ? task.priority as Priority : "B",
    points: Number(task.points) || 0,
    completed: Boolean(task.completed),
    skipped: Boolean(task.skipped),
    notes: task.notes ?? "",
    block: task.block || getTaskBlock(time),
    custom: task.custom === true,
    insertedGoal: task.insertedGoal === true,
    displayLabel: task.displayLabel,
    subtitle: task.subtitle,
    flexible: task.flexible === true,
    timerPresetMinutes: Number(task.timerPresetMinutes) || undefined
  };
}

function normalizeTasks(tasks: unknown): Task[] {
  if (!Array.isArray(tasks)) return [];
  return tasks.map((task, index) => normalizeTask(task as Partial<Task>, index)).sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));
}

function normalizeHistoryEntry(entry: Partial<HistoryEntry>, index = 0): HistoryEntry {
  const taskSummary = Array.isArray(entry.taskSummary)
    ? entry.taskSummary.map((task, taskIndex) => {
      const normalized = normalizeTask(task as Partial<Task>, taskIndex);
      return {
        id: normalized.id,
        time: normalized.time,
        title: normalized.title,
        category: normalized.category,
        priority: normalized.priority,
        points: normalized.points,
        completed: normalized.completed,
        skipped: normalized.skipped,
        notes: normalized.notes
      };
    })
    : [];
  const totalMissions = Number(entry.totalMissions) || taskSummary.length;
  const completedMissions = Number(entry.completedMissions) || taskSummary.filter((task) => task.completed).length;
  const totalScore = Number(entry.totalScore) || taskSummary.filter((task) => task.completed).reduce((sum, task) => sum + task.points, 0);
  return {
    date: /^\d{4}-\d{2}-\d{2}$/.test(entry.date ?? "") ? entry.date as string : getDateKey(addDays(new Date(), -index)),
    mode: entry.mode && dailyModes.includes(entry.mode) ? entry.mode : "Full Day",
    totalScore,
    dayLevel: entry.dayLevel || getDayLevel(totalScore),
    completedMissions,
    skippedMissions: Number(entry.skippedMissions) || taskSummary.filter((task) => task.skipped).length,
    totalMissions,
    mainMission: entry.mainMission || taskSummary.find((task) => task.priority === "S")?.title || "No main mission",
    mainMissionCompleted: Boolean(entry.mainMissionCompleted),
    dailyNotes: entry.dailyNotes ?? "",
    eveningReview: normalizeReview(entry.eveningReview ?? defaultReview),
    taskSummary
  };
}

function normalizeHistoryEntries(history: unknown): HistoryEntry[] {
  if (!Array.isArray(history)) return [];
  return history
    .map((entry, index) => normalizeHistoryEntry(entry as Partial<HistoryEntry>, index))
    .sort((a, b) => b.date.localeCompare(a.date));
}

function createDefaultRealUseTestLog(date: string): RealUseTestLog {
  return {
    date,
    openedApp: true,
    usedBuildToday: false,
    todayHelpfulness: 5,
    usedStartMission: false,
    loggedFood: false,
    loggedMoney: false,
    loggedSleepEnergy: false,
    useful: "",
    annoying: "",
    tooManyClicks: "",
    ignored: "",
    broke: "",
    improveNext: ""
  };
}

function normalizeRealUseTestLog(log: Partial<RealUseTestLog>): RealUseTestLog {
  const fallback = createDefaultRealUseTestLog(getDateKey(new Date()));
  return {
    date: /^\d{4}-\d{2}-\d{2}$/.test(log.date ?? "") ? log.date as string : fallback.date,
    openedApp: Boolean(log.openedApp),
    usedBuildToday: Boolean(log.usedBuildToday),
    todayHelpfulness: clampNumber(Number(log.todayHelpfulness) || 5, 1, 10),
    usedStartMission: Boolean(log.usedStartMission),
    loggedFood: Boolean(log.loggedFood),
    loggedMoney: Boolean(log.loggedMoney),
    loggedSleepEnergy: Boolean(log.loggedSleepEnergy),
    useful: log.useful ?? "",
    annoying: log.annoying ?? "",
    tooManyClicks: log.tooManyClicks ?? "",
    ignored: log.ignored ?? "",
    broke: log.broke ?? "",
    improveNext: log.improveNext ?? ""
  };
}

function normalizeRealUseTestLogs(logs: unknown): RealUseTestLog[] {
  if (!Array.isArray(logs)) return [];
  return logs.map((log) => normalizeRealUseTestLog(log as Partial<RealUseTestLog>)).sort((a, b) => b.date.localeCompare(a.date));
}

function getRealUseTestSummary(logs: RealUseTestLog[], todayKey: string) {
  const recentKeys = getLastDateKeys(todayKey, 7);
  const recentLogs = normalizeRealUseTestLogs(logs).filter((log) => recentKeys.includes(log.date));
  const averageUsefulness = recentLogs.length
    ? Math.round((recentLogs.reduce((total, log) => total + log.todayHelpfulness, 0) / recentLogs.length) * 10) / 10
    : 0;
  return {
    recentLogs,
    daysOpened: recentLogs.filter((log) => log.openedApp).length,
    buildTodayDays: recentLogs.filter((log) => log.usedBuildToday).length,
    averageUsefulness,
    commonAnnoyance: getMostCommonNonEmptyText(recentLogs.map((log) => log.annoying)),
    requestedImprovement: getMostCommonNonEmptyText(recentLogs.map((log) => log.improveNext)),
    bugsReported: recentLogs.filter((log) => log.broke.trim()).length
  };
}

function getMostCommonNonEmptyText(values: string[]): string {
  const counts = values
    .map((value) => value.trim())
    .filter(Boolean)
    .reduce<Record<string, number>>((nextCounts, value) => {
      const key = value.toLowerCase();
      nextCounts[key] = (nextCounts[key] ?? 0) + 1;
      return nextCounts;
    }, {});
  const [top] = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  if (!top) return "Not enough data";
  return values.find((value) => value.trim().toLowerCase() === top[0])?.trim() ?? "Not enough data";
}

const longTermCategories: LongTermCategory[] = ["Body", "Money", "Skill", "Project", "Sleep/Energy", "Life", "Relationship", "Other"];
const monthlyFocusAreas: MonthlyFocus["focusArea"][] = ["Body", "Money", "Skill", "Project", "Sleep", "Life"];
const longTermStatuses: LongTermStatus[] = ["active", "paused", "completed", "archived"];
const weeklyMissionStatuses: WeeklyMissionStatus[] = ["not started", "in progress", "completed", "skipped"];
const weeklyMissionTypes: WeeklyMissionType[] = ["Main Mission", "Support Mission", "Maintenance Mission"];
const nextActionTimes: NextAction["estimatedTime"][] = ["5 min", "15 min", "30 min", "60 min", "90 min"];
const nextActionStatuses: NextActionStatus[] = ["open", "sent to today", "completed", "archived"];

function createDefaultLongTermPlanning(): LongTermPlanningState {
  return { bigGoals: [], ninetyDayPlans: [], monthlyFocuses: [], weeklyMissions: [], nextActions: [] };
}

function createLongTermId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function createDefaultBigGoal(): BigGoal {
  return { id: createLongTermId("big-goal"), title: "", category: "Project", why: "", targetResult: "", targetDate: "", priority: "A", status: "active", notes: "" };
}

function createDefaultNinetyDayPlan(linkedBigGoalId = ""): NinetyDayPlan {
  const startDate = getDateKey(new Date());
  return {
    id: createLongTermId("ninety-day"),
    title: "",
    linkedBigGoalId,
    startDate,
    endDate: getDateKey(addDays(new Date(), 90)),
    mainOutcome: "",
    successDefinition: "",
    milestones: linesToMilestones(""),
    risks: "",
    status: "active"
  };
}

function createDefaultMonthlyFocus(linkedNinetyDayPlanId = ""): MonthlyFocus {
  return { id: createLongTermId("monthly-focus"), month: getDateKey(new Date()).slice(0, 7), focusTitle: "", linkedNinetyDayPlanId, mainTarget: "", focusArea: "Life", mustDo: "", avoid: "", status: "active" };
}

function createDefaultWeeklyMission(linkedMonthlyFocusId = ""): WeeklyMission {
  const start = getDateKey(new Date());
  return { id: createLongTermId("weekly-mission"), weekStartDate: start, weekEndDate: getDateKey(addDays(new Date(), 6)), title: "", linkedMonthlyFocusId, category: "Project", priority: "A", targetResult: "", status: "not started", notes: "", missionType: "Main Mission" };
}

function createDefaultNextAction(linkedWeeklyMissionId = ""): NextAction {
  return { id: createLongTermId("next-action"), title: "", linkedWeeklyMissionId, estimatedTime: "30 min", category: "Project", priority: "B", status: "open" };
}

function normalizeLongTermPlanning(value: unknown): LongTermPlanningState {
  const source = value && typeof value === "object" ? value as Partial<LongTermPlanningState> : {};
  return {
    bigGoals: Array.isArray(source.bigGoals) ? source.bigGoals.map(normalizeBigGoal) : [],
    ninetyDayPlans: Array.isArray(source.ninetyDayPlans) ? source.ninetyDayPlans.map(normalizeNinetyDayPlan) : [],
    monthlyFocuses: Array.isArray(source.monthlyFocuses) ? source.monthlyFocuses.map(normalizeMonthlyFocus) : [],
    weeklyMissions: Array.isArray(source.weeklyMissions) ? source.weeklyMissions.map(normalizeWeeklyMission) : [],
    nextActions: Array.isArray(source.nextActions) ? source.nextActions.map(normalizeNextAction) : []
  };
}

function normalizeBigGoal(goal: Partial<BigGoal>): BigGoal {
  return {
    ...createDefaultBigGoal(),
    ...goal,
    id: goal.id || createLongTermId("big-goal"),
    category: longTermCategories.includes(goal.category as LongTermCategory) ? goal.category as LongTermCategory : "Other",
    priority: priorities.includes(goal.priority as Priority) ? goal.priority as Priority : "B",
    status: longTermStatuses.includes(goal.status as LongTermStatus) ? goal.status as LongTermStatus : "active"
  };
}

function normalizeNinetyDayPlan(plan: Partial<NinetyDayPlan>): NinetyDayPlan {
  return {
    ...createDefaultNinetyDayPlan(),
    ...plan,
    id: plan.id || createLongTermId("ninety-day"),
    milestones: Array.isArray(plan.milestones) ? plan.milestones.map(normalizeMilestone) : [],
    status: longTermStatuses.includes(plan.status as LongTermStatus) ? plan.status as LongTermStatus : "active"
  };
}

function normalizeMilestone(milestone: Partial<NinetyDayMilestone>): NinetyDayMilestone {
  return { id: milestone.id || createLongTermId("milestone"), title: milestone.title || "", targetDate: milestone.targetDate || "", status: longTermStatuses.includes(milestone.status as LongTermStatus) ? milestone.status as LongTermStatus : "active", notes: milestone.notes || "" };
}

function normalizeMonthlyFocus(focus: Partial<MonthlyFocus>): MonthlyFocus {
  return { ...createDefaultMonthlyFocus(), ...focus, id: focus.id || createLongTermId("monthly-focus"), focusArea: monthlyFocusAreas.includes(focus.focusArea as MonthlyFocus["focusArea"]) ? focus.focusArea as MonthlyFocus["focusArea"] : "Life", status: longTermStatuses.includes(focus.status as LongTermStatus) ? focus.status as LongTermStatus : "active" };
}

function normalizeWeeklyMission(mission: Partial<WeeklyMission>): WeeklyMission {
  return { ...createDefaultWeeklyMission(), ...mission, id: mission.id || createLongTermId("weekly-mission"), category: longTermCategories.includes(mission.category as LongTermCategory) ? mission.category as LongTermCategory : "Other", priority: priorities.includes(mission.priority as Priority) ? mission.priority as Priority : "B", status: weeklyMissionStatuses.includes(mission.status as WeeklyMissionStatus) ? mission.status as WeeklyMissionStatus : "not started", missionType: weeklyMissionTypes.includes(mission.missionType as WeeklyMissionType) ? mission.missionType as WeeklyMissionType : "Support Mission" };
}

function normalizeNextAction(action: Partial<NextAction>): NextAction {
  return { ...createDefaultNextAction(), ...action, id: action.id || createLongTermId("next-action"), category: longTermCategories.includes(action.category as LongTermCategory) ? action.category as LongTermCategory : "Other", priority: priorities.includes(action.priority as Priority) ? action.priority as Priority : "B", estimatedTime: nextActionTimes.includes(action.estimatedTime as NextAction["estimatedTime"]) ? action.estimatedTime as NextAction["estimatedTime"] : "30 min", status: nextActionStatuses.includes(action.status as NextActionStatus) ? action.status as NextActionStatus : "open" };
}

function upsertById<T extends { id: string }>(items: T[], item: T): T[] {
  return items.some((existing) => existing.id === item.id) ? items.map((existing) => existing.id === item.id ? item : existing) : [item, ...items];
}

function linesToMilestones(value: string): NinetyDayMilestone[] {
  const lines = value.split("\n").map((line) => line.trim()).filter(Boolean).slice(0, 3);
  return (lines.length ? lines : ["", "", ""]).map((title, index) => ({ id: createLongTermId(`milestone-${index}`), title, targetDate: "", status: "active", notes: "" }));
}

function getBigGoalLabels(goals: BigGoal[]): Record<string, string> {
  return { "": "No linked big goal", ...Object.fromEntries(goals.map((goal) => [goal.id, goal.title || "Untitled big goal"])) };
}

function getNinetyDayLabels(plans: NinetyDayPlan[]): Record<string, string> {
  return { "": "No linked 90-day plan", ...Object.fromEntries(plans.map((plan) => [plan.id, plan.title || "Untitled 90-day plan"])) };
}

function getMonthlyFocusLabels(focuses: MonthlyFocus[]): Record<string, string> {
  return { "": "No linked monthly focus", ...Object.fromEntries(focuses.map((focus) => [focus.id, focus.focusTitle || "Untitled monthly focus"])) };
}

function getWeeklyMissionLabels(missions: WeeklyMission[]): Record<string, string> {
  return { "": "No linked weekly mission", ...Object.fromEntries(missions.map((mission) => [mission.id, mission.title || "Untitled weekly mission"])) };
}

function getLinkedWeeklyMissionTitle(missions: WeeklyMission[], id: string): string {
  return missions.find((mission) => mission.id === id)?.title || "No linked weekly mission";
}

function updateBigGoalStatus(planning: LongTermPlanningState, id: string, status: LongTermStatus): LongTermPlanningState {
  return { ...planning, bigGoals: planning.bigGoals.map((item) => item.id === id ? { ...item, status } : item) };
}

function updateNinetyDayStatus(planning: LongTermPlanningState, id: string, status: LongTermStatus): LongTermPlanningState {
  return { ...planning, ninetyDayPlans: planning.ninetyDayPlans.map((item) => item.id === id ? { ...item, status } : item) };
}

function updateMonthlyFocusStatus(planning: LongTermPlanningState, id: string, status: LongTermStatus): LongTermPlanningState {
  return { ...planning, monthlyFocuses: planning.monthlyFocuses.map((item) => item.id === id ? { ...item, status } : item) };
}

function updateWeeklyMissionStatus(planning: LongTermPlanningState, id: string, status: WeeklyMissionStatus): LongTermPlanningState {
  return { ...planning, weeklyMissions: planning.weeklyMissions.map((item) => item.id === id ? { ...item, status } : item) };
}

function updateNextActionStatus(planning: LongTermPlanningState, id: string, status: NextActionStatus): LongTermPlanningState {
  return { ...planning, nextActions: planning.nextActions.map((item) => item.id === id ? { ...item, status } : item) };
}

function mapLongTermCategoryToTaskCategory(category: LongTermCategory): Category {
  if (category === "Skill" || category === "Project") return "Knowledge";
  if (category === "Money" || category === "Life") return "Plan";
  if (category === "Body" || category === "Sleep/Energy" || category === "Relationship") return "Sunny";
  return "Monitoring";
}

function createGetLeanSetupFromProfile(profile: ProfileState): GetLeanSetup {
  const normalized = normalizeProfile(profile);
  return {
    currentWeightKg: normalized.currentWeightKg,
    goalWeightKg: normalized.goalWeightKg,
    heightCm: normalized.heightCm,
    sex: normalizeGetLeanSex(normalized.sex),
    dateOfBirth: normalized.dateOfBirth,
    activityLevel: normalizeGetLeanActivityLevel(normalized.activityLevel),
    exerciseAccess: "Home",
    dietStyle: normalized.foodRules.length ? "Stomach-sensitive" : "Normal",
    speed: "Lean Moderate"
  };
}

function mergeGetLeanSetupWithProfile(setup: GetLeanSetup, profile: ProfileState): GetLeanSetup {
  const fromProfile = createGetLeanSetupFromProfile(profile);
  return {
    ...setup,
    currentWeightKg: setup.currentWeightKg || fromProfile.currentWeightKg,
    goalWeightKg: setup.goalWeightKg || fromProfile.goalWeightKg,
    heightCm: setup.heightCm || fromProfile.heightCm,
    sex: setup.sex || fromProfile.sex,
    dateOfBirth: setup.dateOfBirth || fromProfile.dateOfBirth,
    activityLevel: setup.activityLevel || fromProfile.activityLevel
  };
}

function createSleepEnergySetupFromProfile(profile: ProfileState): SleepEnergySetup {
  const normalized = normalizeProfile(profile);
  return {
    ...defaultSleepEnergySetup,
    normalWakeTime: normalized.normalWakeTime || defaultSleepEnergySetup.normalWakeTime,
    targetSleepDuration: sleepDurationOptions.includes(`${normalized.sleepTargetHours}h`) ? `${normalized.sleepTargetHours}h` : defaultSleepEnergySetup.targetSleepDuration,
    customSleepDuration: normalized.sleepTargetHours || defaultSleepEnergySetup.customSleepDuration
  };
}

function mergeSleepEnergySetupWithProfile(setup: SleepEnergySetup, profile: ProfileState): SleepEnergySetup {
  const fromProfile = createSleepEnergySetupFromProfile(profile);
  return {
    ...setup,
    normalWakeTime: setup.normalWakeTime || fromProfile.normalWakeTime,
    targetSleepDuration: setup.targetSleepDuration || fromProfile.targetSleepDuration,
    customSleepDuration: setup.customSleepDuration || fromProfile.customSleepDuration
  };
}

function createLifeResetSetupFromProfile(profile: ProfileState): LifeResetSetup {
  const normalized = normalizeProfile(profile);
  return {
    ...defaultLifeResetSetup,
    wakeTime: normalized.normalWakeTime || defaultLifeResetSetup.wakeTime
  };
}

function mergeLifeResetSetupWithProfile(setup: LifeResetSetup, profile: ProfileState): LifeResetSetup {
  const fromProfile = createLifeResetSetupFromProfile(profile);
  return {
    ...setup,
    wakeTime: setup.wakeTime || fromProfile.wakeTime,
    targetSleepTime: setup.targetSleepTime || fromProfile.targetSleepTime
  };
}

function normalizePlanStatus(status: unknown): PlanStatus {
  return status === "paused" || status === "completed" || status === "archived" || status === "active" ? status : "active";
}

function createPlanId(type: string): string {
  return `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeMaybeActivePlan(plan: unknown): ActivePlan | null {
  if (!plan || typeof plan !== "object") return null;
  const candidate = plan as Partial<ActivePlan> & { type?: string };
  if (candidate.type === "everyday_essentials") return normalizeEverydayEssentialsPlan(candidate as EverydayEssentialsPlan);
  if (candidate.type === "get_lean_shred") return normalizeGetLeanPlan(candidate as GetLeanPlan);
  if (candidate.type === "fix_sleep_energy") return normalizeSleepEnergyPlan(candidate as SleepEnergyPlan);
  if (candidate.type === "build_project") return normalizeBuildProjectPlan(candidate as BuildProjectPlan);
  if (candidate.type === "money_plan") return normalizeMoneyPlan(candidate as MoneyPlan);
  if (candidate.type === "life_reset") return normalizeLifeResetPlan(candidate as LifeResetPlan);
  if (candidate.type === "learn_master_subject") return normalizeLearnMasterPlan(candidate as LearnMasterPlan);
  return null;
}

function normalizeActivePlan(plan: ActivePlan): ActivePlan {
  return normalizeMaybeActivePlan(plan) ?? createEverydayEssentialsPlan(defaultEssentialsSetup);
}

function normalizeActivePlans(plans: unknown = []): ActivePlan[] {
  if (!Array.isArray(plans)) return [];
  return plans.map(normalizeMaybeActivePlan).filter((plan): plan is ActivePlan => Boolean(plan));
}

function getPlanDisplayName(plan: ActivePlan): string {
  if (plan.type === "learn_master_subject") return plan.subjectName ? `Learn / Master Subject: ${plan.subjectName}` : plan.name;
  if (plan.type === "build_project") return getProjectDisplayTitle(normalizeBuildProjectPlan(plan));
  return plan.name;
}

function getPlanTaskSourceLabel(plan: ActivePlan): string {
  if (plan.type === "everyday_essentials") return "Everyday Essentials";
  if (plan.type === "get_lean_shred") return "Get Lean / Shred";
  if (plan.type === "fix_sleep_energy") return "Fix Sleep & Energy";
  if (plan.type === "build_project") return normalizeBuildProjectPlan(plan).setup.projectName ? `Build ${normalizeBuildProjectPlan(plan).setup.projectName}` : "Build a Project";
  if (plan.type === "money_plan") return "Money Plan";
  if (plan.type === "life_reset") return "Life Reset";
  if (plan.type === "learn_master_subject") return plan.subjectName ? `Learn ${plan.subjectName}` : "Learn / Master Subject";
  return "Other active plan";
}

function getTaskSourceLabel(task: Task): string {
  if (task.displayLabel === "Long Study Mode" || task.notes.toLowerCase().includes("source: long study mode")) return "Long Study Mode";
  if (task.notes.toLowerCase().includes("source: long-term planning")) return "Long-Term Planning";
  if (task.insertedGoal) return "Plan Tomorrow";
  if (task.custom) return "Manual Today Mission";
  return "Build Today";
}

function formatPlanType(type: ActivePlan["type"]): string {
  if (type === "everyday_essentials") return "Everyday Essentials";
  if (type === "get_lean_shred") return "Get Lean / Shred";
  if (type === "fix_sleep_energy") return "Fix Sleep & Energy";
  if (type === "build_project") return "Build a Project";
  if (type === "money_plan") return "Money Plan";
  if (type === "life_reset") return "Life Reset";
  return "Learn / Master Subject";
}

function getPlanTodayTaskRows(plan: ActivePlan): PlanTaskRow[] {
  if (plan.type === "everyday_essentials") {
    return normalizeEverydayEssentialsPlan(plan).dailyTasks
      .filter((item) => !item.disabled)
      .map((item) => ({
        id: item.id,
        title: item.title,
        detail: item.category,
        badge: item.category,
        completed: item.completed
      }));
  }

  if (plan.type === "get_lean_shred") {
    const normalized = normalizeGetLeanPlan(plan);
    return normalized.dailyTasks
      .filter((item) => !item.disabled)
      .map((item) => ({
        id: item.id,
        title: item.title,
        detail: getLeanTaskTargetDetail(item.id, normalized),
        badge: item.category,
        completed: item.completed
      }));
  }

  if (plan.type === "fix_sleep_energy") {
    const normalized = normalizeSleepEnergyPlan(plan);
    return normalized.dailyTasks
      .filter((item) => !item.disabled)
      .map((item) => ({
        id: item.id,
        title: item.title,
        detail: getSleepTaskDetail(item.id, normalized),
        badge: item.category,
        completed: item.completed
      }));
  }

  if (plan.type === "build_project") {
    const normalized = normalizeBuildProjectPlan(plan);
    return normalized.dailyTasks
      .filter((item) => !item.disabled)
      .map((item) => ({
        id: item.id,
        title: item.title,
        detail: `${item.detail} · ${getProjectDailyMinutes(normalized.setup)} min`,
        badge: normalized.setup.currentStage,
        completed: item.completed
      }));
  }

  if (plan.type === "money_plan") {
    const normalized = normalizeMoneyPlan(plan);
    return normalized.dailyTasks
      .filter((item) => !item.disabled)
      .map((item) => ({
        id: item.id,
        title: item.title,
        detail: item.detail,
        badge: item.kind === "income" ? "Income" : "Saving",
        completed: item.completed
      }));
  }

  if (plan.type === "life_reset") {
    const normalized = normalizeLifeResetPlan(plan);
    return normalized.dailyTasks
      .filter((item) => !item.disabled)
      .map((item) => ({
        id: item.id,
        title: item.title,
        detail: item.detail,
        badge: item.category,
        completed: item.completed
      }));
  }

  const normalized = normalizeLearnMasterPlan(plan);
  return normalized.dailyTasks
    .filter((item) => !item.disabled)
    .map((item) => ({
      id: item.id,
      title: item.title,
      detail: item.detail,
      badge: "Study",
      completed: item.completed
    }));
}

function getPlanRecommendedAction(activePlans: ActivePlan[], longStudyEvents: LongStudySession[]): { title: string; detail: string } {
  const active = activePlans.filter((plan) => plan.status === "active");
  if (active.length === 0) return { title: "Choose one preset plan to start.", detail: "Pick a simple system from the Preset Plans Library. Everyday Essentials or Life Reset are good baseline choices." };
  const reviewDue = active.find((plan) => getPlanWeeklyReviews(plan).length === 0);
  if (reviewDue) return { title: "Complete one weekly review.", detail: `${getPlanDisplayName(reviewDue)} has no weekly review yet. Use the Weekly Review button in Active Plan Control Center.` };
  const latestStudy = longStudyEvents[0];
  if (latestStudy) return { title: "Review latest study event.", detail: `${latestStudy.eventName || latestStudy.subject} is saved. Open Special Event Plans when you want to mark blocks or review it.` };
  if (active.some((plan) => plan.type === "money_plan")) return { title: "Log spending or saving today.", detail: "Money Plan is active. A small money log keeps the plan honest." };
  if (active.some((plan) => plan.type === "get_lean_shred")) return { title: "Log today's food.", detail: "Get Lean / Shred is active. Add food or check macro targets in the plan details." };
  return { title: "Keep active plans moving.", detail: "Open one active plan, mark the top task, or save a short weekly review." };
}

function getPrioritizedPlanTaskRows(activePlans: ActivePlan[]): PrioritizedPlanTaskRow[] {
  const rows = activePlans.flatMap((plan) =>
    getPlanTodayTaskRows(plan).map((row) => {
      const filterGroup = getPlanTaskFilterGroup(plan, row);
      return {
        ...row,
        plan,
        source: getPlanTaskSourceLabel(plan),
        filterGroup,
        rank: getPlanTaskRank(plan, row, filterGroup),
        specificity: getPlanTaskSpecificity(row)
      };
    })
  );

  return dedupePlanTaskRows(rows).sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    if (a.rank !== b.rank) return a.rank - b.rank;
    if (a.specificity !== b.specificity) return b.specificity - a.specificity;
    return a.title.localeCompare(b.title);
  });
}

function getPlanTaskFilterGroup(plan: ActivePlan, row: PlanTaskRow): Exclude<PlanTaskFilter, "All"> {
  const text = `${row.title} ${row.detail} ${row.badge}`.toLowerCase();
  if (plan.type === "everyday_essentials") return "Essentials";
  if (plan.type === "learn_master_subject") return "Skill";
  if (plan.type === "get_lean_shred") return "Body";
  if (plan.type === "fix_sleep_energy") return "Body";
  if (plan.type === "build_project") return "Skill";
  if (plan.type === "money_plan") return "Main";
  if (plan.type === "life_reset") {
    if (/sleep|body|food|water|walk|hygiene/.test(text)) return "Body";
    if (/money|spending/.test(text)) return "Main";
    return "Essentials";
  }
  if (text.includes("money") || text.includes("main") || text.includes("mission")) return "Main";
  if (text.includes("skill") || text.includes("study") || text.includes("practice") || text.includes("learn")) return "Skill";
  if (text.includes("health") || text.includes("sleep") || text.includes("water") || text.includes("walk")) return "Body";
  return "Essentials";
}

function getPlanTaskRank(plan: ActivePlan, row: PlanTaskRow, filterGroup: Exclude<PlanTaskFilter, "All">): number {
  const text = `${row.title} ${row.detail} ${row.badge}`.toLowerCase();
  if (text.includes("s-tier") || text.includes("priority s")) return 10;
  if (text.includes("main mission") || text.includes("main task")) return 20;
  if (filterGroup === "Body" && /sleep|energy|caffeine|nap|night|nanno|screen|protein|water|walk|steps|calorie|workout|health/.test(text)) return 30;
  if (plan.type === "money_plan" || /income|money|saving|spending|job|client|application|offer/.test(text)) return 35;
  if (plan.type === "life_reset") return 38;
  if (filterGroup === "Skill" || plan.type === "learn_master_subject" || plan.type === "build_project") return 40;
  if (filterGroup === "Essentials" || plan.type === "everyday_essentials") return 50;
  if (text.includes("weekly") || text.includes("restock")) return 60;
  return 80;
}

function getPlanTaskSpecificity(row: PlanTaskRow): number {
  const text = `${row.title} ${row.detail}`.toLowerCase();
  let score = row.detail.length;
  if (/\d/.test(text)) score += 50;
  if (/target|kcal|protein|steps|liters|water|hours|minutes|min/.test(text)) score += 35;
  return score;
}

function dedupePlanTaskRows(rows: PrioritizedPlanTaskRow[]): PrioritizedPlanTaskRow[] {
  const byKey = new Map<string, PrioritizedPlanTaskRow>();
  rows.forEach((row) => {
    const key = getPlanDuplicateKey(row);
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, row);
      return;
    }
    if (shouldPreferPlanTask(row, existing)) byKey.set(key, row);
  });
  return Array.from(byKey.values());
}

function getPlanDuplicateKey(row: PrioritizedPlanTaskRow): string {
  const text = `${row.title} ${row.detail}`.toLowerCase();
  if (/nanno|soak feet|sleep boost/.test(text)) return "sleep-nanno-boost";
  if (/sleep routine|bedtime|sleep preparation/.test(text)) return "sleep-routine";
  if (/water|drink/.test(text)) return "water";
  if (/walk|steps|sunlight|exercise/.test(text)) return "walk-steps";
  if (/protein/.test(text)) return "protein";
  if (/calorie|kcal/.test(text)) return "calories";
  if (/practice|coding|project|study session/.test(text)) return "skill-practice";
  if (/build|project|milestone|mvp|test|feature/.test(text)) return "project-build";
  if (/hygiene|brush teeth|wash face|shower|clean clothes/.test(text)) return "hygiene";
  return row.title.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function shouldPreferPlanTask(candidate: PrioritizedPlanTaskRow, current: PrioritizedPlanTaskRow): boolean {
  if (candidate.completed !== current.completed) return !candidate.completed;
  if (candidate.specificity !== current.specificity) return candidate.specificity > current.specificity;
  return candidate.rank < current.rank;
}

function getTodayFocusItems(tasks: Task[], mainMission: Task | undefined, planRows: PrioritizedPlanTaskRow[]): TodayFocusItem[] {
  const incompletePlanRows = planRows.filter((row) => !row.completed);
  const incompleteTasks = tasks
    .filter((task) => !task.completed && !task.skipped)
    .sort((a, b) => getManualTaskPriorityRank(a, mainMission) - getManualTaskPriorityRank(b, mainMission) || timeToMinutes(a.time) - timeToMinutes(b.time));
  const focus: TodayFocusItem[] = [];
  const body = incompletePlanRows.find((row) => row.filterGroup === "Body") ?? taskToFocusItemSource(tasks.find(isBodyTask));
  const main = mainMission && !mainMission.completed && !mainMission.skipped
    ? taskToFocusItemSource(mainMission)
    : incompletePlanRows.find((row) => row.filterGroup === "Main" || row.filterGroup === "Skill") ?? taskToFocusItemSource(tasks.find(isMainOrSkillTask));
  const essentials = incompletePlanRows.find((row) => row.filterGroup === "Essentials") ?? taskToFocusItemSource(tasks.find(isEssentialsTask));

  [...[body, main, essentials], ...incompletePlanRows.map((row) => taskToFocusItemSource(row)), ...incompleteTasks.map((task) => taskToFocusItemSource(task))].forEach((item) => {
    if (!item) return;
    const key = `${item.source}-${item.title}`;
    if (focus.length < 3 && !focus.some((existing) => `${existing.source}-${existing.title}` === key)) focus.push(item);
  });
  return focus.slice(0, 3);
}

function taskToFocusItemSource(task: Task | PrioritizedPlanTaskRow | undefined): TodayFocusItem | undefined {
  if (!task) return undefined;
  return {
    title: task.title,
    detail: "detail" in task ? task.detail : `${task.time} - ${task.category}`,
    source: "source" in task ? task.source : getTaskSourceLabel(task)
  };
}

function getManualTaskPriorityRank(task: Task, mainMission?: Task): number {
  if (task.priority === "S") return 10;
  if (mainMission?.id === task.id) return 20;
  if (isBodyTask(task)) return 30;
  if (isMainOrSkillTask(task)) return 40;
  if (isEssentialsTask(task)) return 50;
  return 80;
}

function isBodyTask(task: Task): boolean {
  const text = `${task.title} ${task.category}`.toLowerCase();
  return !task.completed && !task.skipped && /health|sunlight|walk|exercise|water|shower|sleep|bedtime|food|breakfast|lunch|dinner/.test(text);
}

function isMainOrSkillTask(task: Task): boolean {
  const text = `${task.title} ${task.category} ${task.priority}`.toLowerCase();
  return !task.completed && !task.skipped && (task.priority === "S" || /main|work|learn|skill|practice|coding|money|job/.test(text));
}

function isEssentialsTask(task: Task): boolean {
  const text = `${task.title} ${task.category}`.toLowerCase();
  return !task.completed && !task.skipped && /brush|clothes|clean|bed|dishes|toilet|hygiene|room|charger/.test(text);
}

function getPlanCompletion(plan: ActivePlan) {
  const rows = getPlanTodayTaskRows(plan);
  return {
    completed: rows.filter((row) => row.completed).length,
    total: rows.length
  };
}

function getProgressPlanRows(
  plan: ActivePlan,
  todayKey: string,
  dailyFoodLogs: DailyFoodLogs,
  moneySpendingLogs: MoneySpendingLog[],
  moneyIncomeLogs: MoneyIncomeLog[],
  moneySavingLogs: MoneySavingLog[],
  moneyOpportunityLogs: MoneyOpportunityLog[]
): Array<{ label: string; value: string }> {
  if (plan.type === "everyday_essentials") {
    const progress = getEssentialsProgress(normalizeEverydayEssentialsPlan(plan));
    return [
      { label: "Daily essentials", value: `${progress.daily.completed}/${progress.daily.total}` },
      { label: "Weekly restock", value: `${progress.weekly.completed}/${progress.weekly.total}` },
      { label: "Monthly inventory", value: `${progress.monthly.completed}/${progress.monthly.total}` }
    ];
  }
  if (plan.type === "get_lean_shred") {
    const normalized = normalizeGetLeanPlan(plan);
    const targets = getMacroTargets(normalized);
    const totals = getFoodTotals(dailyFoodLogs[todayKey] ?? []);
    const latestWeight = normalized.logs.filter((log) => log.weightKg).at(-1)?.weightKg;
    return [
      { label: "Food logged today", value: totals.calories || totals.protein ? "Yes" : "No" },
      { label: "Calories", value: `${Math.round(totals.calories)}/${targets.calories} kcal` },
      { label: "Protein", value: `${roundMacro(totals.protein)}/${targets.protein}g` },
      { label: "Carbs / fat", value: `${roundMacro(totals.carbs)}/${targets.carbs}g · ${roundMacro(totals.fat)}/${targets.fat}g` },
      { label: "Latest weight log", value: latestWeight ? `${latestWeight} kg` : "No weight log yet" }
    ];
  }
  if (plan.type === "fix_sleep_energy") {
    const normalized = normalizeSleepEnergyPlan(plan);
    const summary = getSleepEnergySummary(normalized);
    return [
      { label: "Average sleep", value: summary.daysLogged ? `${summary.averageSleepHours}h` : "No sleep logs yet" },
      { label: "Average energy", value: summary.daysLogged ? `${summary.averageEnergy}/10` : "No energy logs yet" },
      { label: "Caffeine cutoff", value: `${summary.caffeineCutoffSuccessDays}/${summary.daysLogged || 0} days` },
      { label: "Night routine", value: `${summary.nightRoutineCompletedDays}/${summary.daysLogged || 0} days` }
    ];
  }
  if (plan.type === "learn_master_subject") {
    const normalized = normalizeLearnMasterPlan(plan);
    const recent = normalized.logs.slice(-7);
    const minutes = recent.reduce((total, log) => total + log.minutesStudied, 0);
    const latest = normalized.logs.at(-1);
    return [
      { label: "Study days", value: `${recent.filter((log) => log.studyCompleted).length}/7` },
      { label: "Minutes studied", value: `${minutes} min` },
      { label: "Topic progress", value: latest?.topicStudied || "No topic logged yet" },
      { label: "Recall / practice", value: latest?.studyCompleted ? `Focus ${latest.focusLevel}/10` : "No study log yet" }
    ];
  }
  if (plan.type === "build_project") {
    const normalized = normalizeBuildProjectPlan(plan);
    const summary = getProjectSummary(normalized);
    return [
      { label: "Project minutes", value: `${summary.totalMinutes} min` },
      { label: "Logs completed", value: String(summary.daysWorked) },
      { label: "Current milestone", value: normalized.projectRoadmap.find((task) => !task.completed)?.title || "Milestones clear" },
      { label: "Blocker", value: normalized.logs.at(-1)?.blocker || "No blocker logged" }
    ];
  }
  if (plan.type === "money_plan") {
    const normalized = normalizeMoneyPlan(plan);
    const weekSpending = sumMoneyLogsThisWeek(moneySpendingLogs, todayKey, "amount");
    const weekSaving = sumMoneyLogsThisWeek(moneySavingLogs, todayKey, "amountSaved");
    const monthIncome = moneyIncomeLogs.filter((log) => log.date.slice(0, 7) === todayKey.slice(0, 7)).reduce((total, log) => total + log.amount, 0);
    return [
      { label: "Current savings", value: formatMoney(normalized.setup.currentSavings + moneySavingLogs.reduce((total, log) => total + log.amountSaved, 0), normalized.setup.currency) },
      { label: "Target progress", value: `${normalized.calculations.progressPercent}%` },
      { label: "Spending this week", value: formatMoney(weekSpending, normalized.setup.currency) },
      { label: "Income this month", value: formatMoney(monthIncome, normalized.setup.currency) },
      { label: "Income actions", value: `${moneyOpportunityLogs.length} tracked` },
      { label: "Saved this week", value: formatMoney(weekSaving, normalized.setup.currency) }
    ];
  }
  if (plan.type === "life_reset") {
    const normalized = normalizeLifeResetPlan(plan);
    const summary = getLifeResetSummary(normalized);
    const latest = normalized.logs.at(-1);
    return [
      { label: "Reset days completed", value: String(summary.resetDaysCompleted) },
      { label: "Room score", value: latest ? `${latest.roomCondition}/10` : "No room log yet" },
      { label: "Mood / energy", value: latest ? `${latest.mood}/10 · ${latest.energy}/10` : "No mood log yet" },
      { label: "Current reset focus", value: normalized.setup.mainResetFocus }
    ];
  }
  return [];
}

function getWeeklyProgressSnapshot(history: HistoryEntry[], todayKey: string, tasks: Task[], activePlans: ActivePlan[]) {
  const dateKeys = getLastDateKeys(todayKey, 7);
  const todayEntry: HistoryEntry = {
    date: todayKey,
    totalScore: tasks.filter((task) => task.completed).reduce((sum, task) => sum + task.points, 0),
    dayLevel: getDayLevel(tasks.filter((task) => task.completed).reduce((sum, task) => sum + task.points, 0)),
    completedMissions: tasks.filter((task) => task.completed).length,
    skippedMissions: tasks.filter((task) => task.skipped).length,
    totalMissions: tasks.length,
    mainMission: getMainMissionForDay(tasks)?.title ?? "",
    mainMissionCompleted: Boolean(getMainMissionForDay(tasks)?.completed),
    eveningReview: defaultReview,
    taskSummary: tasks.map((task) => ({
      id: task.id,
      time: task.time,
      title: task.title,
      category: task.category,
      priority: task.priority,
      points: task.points,
      completed: task.completed,
      skipped: task.skipped,
      notes: task.notes
    }))
  };
  const entriesByDate = new Map(history.map((entry) => [entry.date, entry]));
  entriesByDate.set(todayKey, todayEntry);
  const entries = dateKeys
    .map((date) => entriesByDate.get(date))
    .filter((entry): entry is HistoryEntry => entry !== undefined)
    .filter((entry) => entry.totalMissions > 0);
  const totalCompleted = entries.reduce((total, entry) => total + entry.completedMissions, 0);
  const averageCompletion = entries.length ? Math.round(entries.reduce((total, entry) => total + (entry.totalMissions ? (entry.completedMissions / entry.totalMissions) * 100 : 0), 0) / entries.length) : 0;
  const weeklyReviewsCompleted = activePlans.reduce((total, plan) => total + getPlanWeeklyReviews(plan).filter((review) => dateKeys.includes(review.date)).length, 0);
  const best = [...entries].sort((a, b) => b.totalScore - a.totalScore).at(0);
  const weakest = [...entries].sort((a, b) => (a.totalMissions ? a.completedMissions / a.totalMissions : 0) - (b.totalMissions ? b.completedMissions / b.totalMissions : 0)).at(0);
  return {
    daysActive: entries.length,
    totalCompleted,
    averageCompletion,
    weeklyReviewsCompleted,
    bestDay: best ? `${best.date} · ${best.totalScore}` : "No days yet",
    weakestDay: weakest ? `${weakest.date} · ${weakest.totalMissions ? Math.round((weakest.completedMissions / weakest.totalMissions) * 100) : 0}%` : "No days yet"
  };
}

function getProgressReviewReminders(
  activePlans: ActivePlan[],
  dailyFoodLogs: DailyFoodLogs,
  moneySpendingLogs: MoneySpendingLog[],
  moneySavingLogs: MoneySavingLog[],
  longStudySessions: LongStudySession[],
  longStudyReviews: LongStudyReview[],
  todayKey: string
): Array<{ title: string; detail: string; label: string; tone: "gold" | "dark" | "green" | "orange" }> {
  const reminders: Array<{ title: string; detail: string; label: string; tone: "gold" | "dark" | "green" | "orange" }> = [];
  const activeOnly = activePlans.filter((plan) => plan.status === "active");
  activeOnly.filter((plan) => !hasPlanReviewThisWeek(plan, todayKey)).slice(0, 3).forEach((plan) => {
    reminders.push({ title: "Weekly review due", detail: getPlanDisplayName(plan), label: "Review", tone: "orange" });
  });
  if (activeOnly.some((plan) => plan.type === "get_lean_shred") && !(dailyFoodLogs[todayKey] ?? []).length) {
    reminders.push({ title: "Food log missing today", detail: "Get Lean progress needs today's food log.", label: "Food", tone: "orange" });
  }
  const moneyActive = activeOnly.some((plan) => plan.type === "money_plan");
  if (moneyActive && !moneySpendingLogs.some((log) => isDateInLastDateKeys(log.date, todayKey, 7)) && !moneySavingLogs.some((log) => isDateInLastDateKeys(log.date, todayKey, 7))) {
    reminders.push({ title: "Money log missing", detail: "No spending or saving log has been recorded this week.", label: "Money", tone: "orange" });
  }
  const latestStudy = [...longStudySessions].sort((a, b) => b.date.localeCompare(a.date)).at(0);
  if (latestStudy && !longStudyReviews.some((review) => review.sessionId === latestStudy.id)) {
    reminders.push({ title: "Review latest study event", detail: latestStudy.eventName, label: "Study", tone: "gold" });
  }
  activeOnly.filter((plan): plan is BuildProjectPlan => plan.type === "build_project").forEach((plan) => {
    const recentLog = normalizeBuildProjectPlan(plan).logs.some((log) => isDateInLastDateKeys(log.date, todayKey, 3));
    if (!recentLog) reminders.push({ title: "Project log missing", detail: getPlanDisplayName(plan), label: "Project", tone: "orange" });
  });
  return reminders;
}

function hasPlanReviewThisWeek(plan: ActivePlan, todayKey: string): boolean {
  return getPlanWeeklyReviews(plan).some((review) => isDateInLastDateKeys(review.date, todayKey, 7));
}

function getLastDateKeys(todayKey: string, count: number): string[] {
  const today = parseDateKey(todayKey);
  return Array.from({ length: count }, (_, index) => getDateKey(addDays(today, -(count - 1 - index))));
}

function isDateInLastDateKeys(dateKey: string, todayKey: string, count: number): boolean {
  return getLastDateKeys(todayKey, count).includes(dateKey);
}

function sumMoneyLogsThisWeek<T extends { date: string }>(logs: T[], todayKey: string, amountKey: keyof T): number {
  return logs.filter((log) => isDateInLastDateKeys(log.date, todayKey, 7)).reduce((total, log) => total + (Number(log[amountKey]) || 0), 0);
}

function normalizePlanWeeklyReviews(reviews: unknown): PlanWeeklyReview[] {
  if (!Array.isArray(reviews)) return [];
  return reviews.map((item, index) => {
    const review = item as Partial<PlanWeeklyReview>;
    const specifics = review.specifics && typeof review.specifics === "object" && !Array.isArray(review.specifics) ? review.specifics : {};
    const decision = review.decision === "adjust" || review.decision === "pause" ? review.decision : "continue";
    return {
      id: review.id || `weekly-review-${Date.now()}-${index}`,
      date: review.date || getDateKey(new Date()),
      wentWell: review.wentWell ?? "",
      hard: review.hard ?? "",
      completionRating: clampNumber(Number(review.completionRating) || 5, 1, 10),
      decision,
      nextWeekFocus: review.nextWeekFocus ?? "",
      specifics: specifics as Record<string, string | number | boolean>
    };
  });
}

function getPlanWeeklyReviews(plan: ActivePlan): PlanWeeklyReview[] {
  return normalizePlanWeeklyReviews(plan.weeklyReviews);
}

function createDefaultPlanWeeklyReview(plan: ActivePlan): PlanWeeklyReview {
  return {
    id: `weekly-review-${Date.now()}`,
    date: getDateKey(new Date()),
    wentWell: "",
    hard: "",
    completionRating: 5,
    decision: "continue",
    nextWeekFocus: "",
    specifics: getDefaultPlanReviewSpecifics(plan)
  };
}

function getDefaultPlanReviewSpecifics(plan: ActivePlan): Record<string, string | number | boolean> {
  if (plan.type === "get_lean_shred") {
    const normalized = normalizeGetLeanPlan(plan);
    return {
      currentWeight: normalized.setup.currentWeightKg || 0,
      hunger: 5,
      energy: 5,
      caloriesConsistency: "",
      proteinConsistency: ""
    };
  }
  if (plan.type === "fix_sleep_energy") {
    const normalized = normalizeSleepEnergyPlan(plan);
    return {
      averageSleep: getSleepTargetHours(normalized.setup),
      energyAverage: 5,
      caffeineCutoffSuccess: "",
      nightRoutineConsistency: ""
    };
  }
  if (plan.type === "build_project") {
    const summary = getProjectSummary(normalizeBuildProjectPlan(plan));
    return {
      projectMinutes: summary.totalMinutes,
      progressMade: summary.lastProgressNote,
      blocker: "",
      nextMilestone: ""
    };
  }
  if (plan.type === "learn_master_subject") {
    return {
      studyDays: normalizeLearnMasterPlan(plan).logs.slice(-7).filter((log) => log.studyCompleted).length,
      topicLearned: "",
      difficulty: "Medium",
      canExplain: ""
    };
  }
  if (plan.type === "money_plan") {
    return {
      totalIncomeThisWeek: 0,
      totalSpendingThisWeek: 0,
      amountSavedThisWeek: 0,
      moneyActionsCompleted: normalizeMoneyPlan(plan).dailyTasks.filter((task) => task.completed).length,
      whatWorked: "",
      whatWastedMoney: ""
    };
  }
  if (plan.type === "life_reset") {
    return {
      whatBecameBetter: "",
      whatIsStillWeak: "",
      continueReset: "continue",
      switchPlan: "",
      nextFocus: normalizeLifeResetPlan(plan).setup.mainResetFocus
    };
  }
  return {
    missingItems: "",
    restockNeeded: "",
    lifeMaintenanceScore: 5
  };
}

function getPlanWeeklyCompletionText(plan: ActivePlan): string {
  if (plan.type === "everyday_essentials") {
    const stats = getEssentialsProgress(normalizeEverydayEssentialsPlan(plan));
    return `${stats.weekly.completed}/${stats.weekly.total}`;
  }
  if (plan.type === "get_lean_shred") return `${normalizeGetLeanPlan(plan).logs.slice(-7).filter((log) => log.workoutCompleted || log.steps || log.weightKg).length}/7 logs`;
  if (plan.type === "fix_sleep_energy") return `${normalizeSleepEnergyPlan(plan).logs.slice(-7).filter((log) => log.sleepHours || log.energy).length}/7 sleep logs`;
  if (plan.type === "build_project") return `${normalizeBuildProjectPlan(plan).logs.slice(-7).filter((log) => log.minutesWorked || log.workedOn).length}/7 project logs`;
  if (plan.type === "money_plan") return `${normalizeMoneyPlan(plan).dailyTasks.filter((task) => task.completed).length}/${normalizeMoneyPlan(plan).dailyTasks.length} daily`;
  if (plan.type === "life_reset") return `${normalizeLifeResetPlan(plan).dailyTasks.filter((task) => task.completed).length}/${normalizeLifeResetPlan(plan).dailyTasks.length} daily`;
  return `${normalizeLearnMasterPlan(plan).logs.slice(-7).filter((log) => log.studyCompleted).length}/7 study days`;
}

function getPlanLastLogText(plan: ActivePlan): string {
  if (plan.type === "get_lean_shred") return normalizeGetLeanPlan(plan).logs.at(-1)?.date ?? "No log yet";
  if (plan.type === "fix_sleep_energy") return normalizeSleepEnergyPlan(plan).logs.at(-1)?.date ?? "No log yet";
  if (plan.type === "build_project") return normalizeBuildProjectPlan(plan).logs.at(-1)?.date ?? "No log yet";
  if (plan.type === "money_plan") return normalizeMoneyPlan(plan).logs.at(-1)?.date ?? "No opportunity yet";
  if (plan.type === "life_reset") return normalizeLifeResetPlan(plan).logs.at(-1)?.date ?? "No reset log yet";
  if (plan.type === "learn_master_subject") return normalizeLearnMasterPlan(plan).logs.at(-1)?.date ?? "No log yet";
  return "Checklist only";
}

function getPlanLogCount(plan: ActivePlan): number {
  if (plan.type === "get_lean_shred") return normalizeGetLeanPlan(plan).logs.length;
  if (plan.type === "fix_sleep_energy") return normalizeSleepEnergyPlan(plan).logs.length;
  if (plan.type === "build_project") return normalizeBuildProjectPlan(plan).logs.length;
  if (plan.type === "money_plan") return normalizeMoneyPlan(plan).logs.length;
  if (plan.type === "life_reset") return normalizeLifeResetPlan(plan).logs.length;
  if (plan.type === "learn_master_subject") return normalizeLearnMasterPlan(plan).logs.length;
  return 0;
}

function getPlanSetupRows(plan: ActivePlan): Array<{ label: string; value: string | number | boolean }> {
  if (plan.type === "everyday_essentials") {
    const setup = normalizeEverydayEssentialsPlan(plan).setup;
    return [
      { label: "Living situation", value: setup.livingSituation },
      { label: "Budget level", value: setup.budgetLevel },
      { label: "Skin / hair", value: setup.skinHairNeeds },
      { label: "Food style", value: setup.foodStyle },
      { label: "Laundry access", value: setup.laundryAccess },
      { label: "Emergency level", value: setup.emergencyLevel },
      { label: "Restock reminder", value: setup.restockReminder }
    ];
  }
  if (plan.type === "get_lean_shred") {
    const setup = normalizeGetLeanPlan(plan).setup;
    return [
      { label: "Current weight", value: `${setup.currentWeightKg || 0} kg` },
      { label: "Goal weight", value: `${setup.goalWeightKg || 0} kg` },
      { label: "Height", value: `${setup.heightCm || 0} cm` },
      { label: "Sex", value: setup.sex || "Not set" },
      { label: "Activity level", value: setup.activityLevel },
      { label: "Exercise access", value: setup.exerciseAccess },
      { label: "Diet style", value: setup.dietStyle },
      { label: "Speed", value: setup.speed }
    ];
  }
  if (plan.type === "fix_sleep_energy") {
    const setup = normalizeSleepEnergyPlan(plan).setup;
    return [
      { label: "Normal wake time", value: setup.normalWakeTime },
      { label: "Target sleep time", value: setup.targetSleepTime },
      { label: "Target duration", value: `${getSleepTargetHours(setup)}h` },
      { label: "Sleep problem", value: setup.currentSleepProblem },
      { label: "Caffeine habit", value: setup.caffeineHabit },
      { label: "Caffeine cutoff", value: setup.caffeineCutoffTime },
      { label: "Nap preference", value: setup.napPreference },
      { label: "Night routine", value: setup.nightRoutinePreference },
      { label: "Nanno Sleep Boost", value: setup.includeNannoSleepBoost ? "Yes" : "No" }
    ];
  }
  if (plan.type === "build_project") {
    const setup = normalizeBuildProjectPlan(plan).setup;
    return [
      { label: "Project name", value: setup.projectName || "Untitled project" },
      { label: "Project type", value: setup.projectType },
      { label: "Goal", value: setup.projectGoal },
      { label: "Stage", value: setup.currentStage },
      { label: "Daily time", value: `${getProjectDailyMinutes(setup)} min` },
      { label: "Speed", value: setup.projectSpeed },
      { label: "Deadline", value: getProjectDeadlineLabel(setup) },
      { label: "Bottleneck", value: setup.mainBottleneck },
      { label: "Build style", value: setup.buildStyle }
    ];
  }
  if (plan.type === "money_plan") {
    const setup = normalizeMoneyPlan(plan).setup;
    return [
      { label: "Money goal", value: setup.mainMoneyGoal },
      { label: "Target amount", value: formatMoney(setup.targetAmount, setup.currency) },
      { label: "Deadline", value: getMoneyDeadlineLabel(setup) },
      { label: "Monthly income", value: formatMoney(setup.currentMonthlyIncome, setup.currency) },
      { label: "Fixed expenses", value: formatMoney(setup.currentMonthlyFixedExpenses, setup.currency) },
      { label: "Current savings", value: formatMoney(setup.currentSavings, setup.currency) },
      { label: "Income path", value: setup.incomePath },
      { label: "Daily money time", value: `${getMoneyDailyMinutes(setup)} min` },
      { label: "Bottleneck", value: setup.currentBottleneck },
      { label: "Saving style", value: setup.savingStyle }
    ];
  }
  if (plan.type === "life_reset") {
    const setup = normalizeLifeResetPlan(plan).setup;
    return [
      { label: "Reset length", value: setup.resetLength },
      { label: "Intensity", value: setup.resetIntensity },
      { label: "Main problem", value: setup.mainProblem },
      { label: "Wake time", value: setup.wakeTime },
      { label: "Target sleep", value: setup.targetSleepTime },
      { label: "Main focus", value: setup.mainResetFocus },
      { label: "Daily reset time", value: `${getLifeResetDailyMinutes(setup)} min` },
      { label: "Nanno Sleep Boost", value: setup.includeNannoSleepBoost ? "Yes" : "No" }
    ];
  }
  const normalized = normalizeLearnMasterPlan(plan);
  return [
    { label: "Subject", value: normalized.subjectName || "Not set" },
    { label: "Current level", value: normalized.currentLevel },
    { label: "Goal type", value: normalized.goalType },
    { label: "Daily study time", value: `${normalized.dailyMinutes} min` },
    { label: "Speed", value: normalized.speed },
    { label: "Deadline", value: normalized.deadline },
    { label: "Study style", value: normalized.studyStyle },
    { label: "Main resource", value: normalized.mainResource }
  ];
}

function getPlanTargetRows(plan: ActivePlan): Array<{ label: string; value: string | number | boolean }> {
  if (plan.type === "everyday_essentials") {
    const progress = getEssentialsProgress(normalizeEverydayEssentialsPlan(plan));
    return [
      { label: "Daily essentials", value: `${progress.daily.completed}/${progress.daily.total}` },
      { label: "Weekly restock", value: `${progress.weekly.completed}/${progress.weekly.total}` },
      { label: "Monthly inventory", value: `${progress.monthly.completed}/${progress.monthly.total}` }
    ];
  }
  if (plan.type === "get_lean_shred") {
    const calculations = normalizeGetLeanPlan(plan).calculations;
    return [
      { label: "Target calories", value: `${calculations.targetCalories} kcal` },
      { label: "Protein target", value: `${calculations.proteinTarget}g` },
      { label: "Carb target", value: `${calculations.carbTarget}g` },
      { label: "Fat target", value: `${calculations.fatTarget}g` },
      { label: "Step target", value: `${calculations.stepTarget} steps` },
      { label: "Water target", value: `${calculations.waterTarget}L` },
      { label: "Sleep target", value: `${calculations.sleepTarget}h` }
    ];
  }
  if (plan.type === "fix_sleep_energy") {
    const normalized = normalizeSleepEnergyPlan(plan);
    return [
      { label: "Sleep target", value: `${getSleepTargetHours(normalized.setup)}h` },
      { label: "Night shutdown", value: getNightShutdownTime(normalized.setup.targetSleepTime, 720) },
      { label: "Caffeine cutoff", value: normalized.setup.caffeineCutoffTime },
      { label: "Sleep logs", value: normalized.logs.length },
      { label: "Feedback", value: getSleepEnergyFeedback(normalized) }
    ];
  }
  if (plan.type === "build_project") {
    const normalized = normalizeBuildProjectPlan(plan);
    const summary = getProjectSummary(normalized);
    return [
      { label: "Daily project time", value: `${getProjectDailyMinutes(normalized.setup)} min` },
      { label: "Days worked", value: summary.daysWorked },
      { label: "Total minutes", value: summary.totalMinutes },
      { label: "Completed milestones", value: `${summary.completedMilestones}/${normalized.projectRoadmap.length}` },
      { label: "Open blockers", value: summary.openBlockers },
      { label: "Feedback", value: getProjectFeedback(normalized) }
    ];
  }
  if (plan.type === "money_plan") {
    const normalized = normalizeMoneyPlan(plan);
    const calculations = normalized.calculations;
    return [
      { label: "Monthly leftover", value: formatMoney(calculations.monthlyLeftover, normalized.setup.currency) },
      { label: "Remaining saving needed", value: formatMoney(calculations.remainingSavingNeeded, normalized.setup.currency) },
      { label: "Daily saving needed", value: calculations.neededSavingPerDay === null ? "No deadline" : formatMoney(calculations.neededSavingPerDay, normalized.setup.currency) },
      { label: "Weekly saving needed", value: calculations.neededSavingPerWeek === null ? "No deadline" : formatMoney(calculations.neededSavingPerWeek, normalized.setup.currency) },
      { label: "Progress", value: `${calculations.progressPercent}%` },
      { label: "Today income action", value: getTodayMoneyAction(normalized) },
      { label: "Feedback", value: getMoneyFeedback(normalized, [], [], [], normalized.logs) }
    ];
  }
  if (plan.type === "life_reset") {
    const normalized = normalizeLifeResetPlan(plan);
    const summary = getLifeResetSummary(normalized);
    return [
      { label: "Reset days completed", value: summary.resetDaysCompleted },
      { label: "Hygiene days", value: summary.hygieneCompletedDays },
      { label: "Room reset days", value: summary.roomResetDays },
      { label: "Sleep target days", value: summary.sleepTargetDays },
      { label: "Money check days", value: summary.moneyCheckDays },
      { label: "Feedback", value: getLifeResetFeedback(normalized) }
    ];
  }
  const normalized = normalizeLearnMasterPlan(plan);
  return [
    { label: "Study loop", value: normalized.studyLoop.join(" -> ") },
    { label: "Study logs", value: normalized.logs.length },
    { label: "Completed study days", value: normalized.logs.filter((log) => log.studyCompleted).length },
    { label: "Feedback", value: getLearnFeedback(normalized) }
  ];
}

function getPlanWeeklyRows(plan: ActivePlan): Array<{ label: string; value: string }> {
  const rows: Array<{ label: string; value: string }> = [
    { label: "Weekly progress", value: getPlanWeeklyCompletionText(plan) },
    { label: "Last log / review", value: getPlanLastLogText(plan) }
  ];
  if (plan.type === "everyday_essentials") {
    normalizeEverydayEssentialsPlan(plan).weeklyTasks.filter((item) => !item.disabled).slice(0, 5).forEach((item) => {
      rows.push({ label: item.title, value: item.completed ? "Done" : "Open" });
    });
  }
  if (plan.type === "build_project") {
    normalizeBuildProjectPlan(plan).weeklyTasks.filter((item) => !item.disabled).slice(0, 5).forEach((item) => {
      rows.push({ label: item.title, value: item.completed ? "Done" : "Open" });
    });
  }
  if (plan.type === "money_plan") {
    normalizeMoneyPlan(plan).weeklyTasks.filter((item) => !item.disabled).slice(0, 5).forEach((item) => {
      rows.push({ label: item.title, value: item.completed ? "Done" : "Open" });
    });
  }
  if (plan.type === "life_reset") {
    normalizeLifeResetPlan(plan).weeklyTasks.filter((item) => !item.disabled).slice(0, 5).forEach((item) => {
      rows.push({ label: item.title, value: item.completed ? "Done" : "Open" });
    });
  }
  rows.push({ label: "Weekly reviews", value: String(getPlanWeeklyReviews(plan).length) });
  return rows;
}

function togglePlanTask(plan: ActivePlan, taskId: string, updateActivePlan: (planId: string, updater: SetStateAction<ActivePlan | null>) => void) {
  updateActivePlan(plan.id, (current) => {
    const target = current ? normalizeActivePlan(current) : plan;
    if (target.type === "everyday_essentials") {
      return { ...target, dailyTasks: target.dailyTasks.map((item) => (item.id === taskId ? { ...item, completed: !item.completed } : item)) };
    }
    if (target.type === "get_lean_shred") {
      return { ...target, dailyTasks: target.dailyTasks.map((item) => (item.id === taskId ? { ...item, completed: !item.completed } : item)) };
    }
    if (target.type === "fix_sleep_energy") {
      return { ...target, dailyTasks: target.dailyTasks.map((item) => (item.id === taskId ? { ...item, completed: !item.completed } : item)) };
    }
    if (target.type === "build_project") {
      return { ...target, dailyTasks: target.dailyTasks.map((item) => (item.id === taskId ? { ...item, completed: !item.completed } : item)) };
    }
    if (target.type === "money_plan") {
      return { ...target, dailyTasks: target.dailyTasks.map((item) => (item.id === taskId ? { ...item, completed: !item.completed } : item)) };
    }
    if (target.type === "life_reset") {
      return { ...target, dailyTasks: target.dailyTasks.map((item) => (item.id === taskId ? { ...item, completed: !item.completed } : item)) };
    }
    return { ...target, dailyTasks: target.dailyTasks.map((item) => (item.id === taskId ? { ...item, completed: !item.completed } : item)) };
  });
}

function createMoneyPlan(setup: MoneySetup): MoneyPlan {
  const normalizedSetup = normalizeMoneySetup(setup);
  return {
    id: createPlanId("money_plan"),
    type: "money_plan",
    name: "Money Plan",
    status: "active",
    startDate: getDateKey(new Date()),
    setup: normalizedSetup,
    calculations: calculateMoneyPlan(normalizedSetup),
    dailyTasks: createMoneyDailyTasks(normalizedSetup),
    weeklyTasks: createMoneyWeeklyTasks(normalizedSetup),
    logs: [],
    weeklyReviews: []
  };
}

function normalizeMoneyPlan(plan: MoneyPlan): MoneyPlan {
  const setup = normalizeMoneySetup(plan.setup);
  return {
    id: plan.id || createPlanId("money_plan"),
    type: "money_plan",
    name: "Money Plan",
    status: normalizePlanStatus(plan.status),
    startDate: plan.startDate || getDateKey(new Date()),
    setup,
    calculations: calculateMoneyPlan(setup),
    dailyTasks: normalizeMoneyTasks(plan.dailyTasks, createMoneyDailyTasks(setup)),
    weeklyTasks: normalizeMoneyTasks(plan.weeklyTasks, createMoneyWeeklyTasks(setup)),
    logs: normalizeMoneyOpportunityLogs(plan.logs),
    weeklyReviews: normalizePlanWeeklyReviews(plan.weeklyReviews)
  };
}

function normalizeMoneySetup(setup: Partial<MoneySetup>): MoneySetup {
  const targetAmount = Number(setup.targetAmount) || Number(setup.customTargetAmount) || defaultMoneySetup.targetAmount;
  return {
    mainMoneyGoal: moneyGoalOptions.includes(setup.mainMoneyGoal ?? "") ? setup.mainMoneyGoal ?? defaultMoneySetup.mainMoneyGoal : defaultMoneySetup.mainMoneyGoal,
    targetAmount,
    customTargetAmount: Number(setup.customTargetAmount) || targetAmount,
    targetDeadline: moneyDeadlineOptions.includes(setup.targetDeadline ?? "") ? setup.targetDeadline ?? defaultMoneySetup.targetDeadline : defaultMoneySetup.targetDeadline,
    customDeadline: setup.customDeadline ?? "",
    currentMonthlyIncome: Number(setup.currentMonthlyIncome) || 0,
    currentMonthlyFixedExpenses: Number(setup.currentMonthlyFixedExpenses) || 0,
    currentSavings: Number(setup.currentSavings) || 0,
    currency: setup.currency?.trim() || "USD",
    incomePath: moneyIncomePathOptions.includes(setup.incomePath ?? "") ? setup.incomePath ?? defaultMoneySetup.incomePath : defaultMoneySetup.incomePath,
    dailyMoneyTime: moneyDailyTimeOptions.includes(setup.dailyMoneyTime ?? "") ? setup.dailyMoneyTime ?? defaultMoneySetup.dailyMoneyTime : defaultMoneySetup.dailyMoneyTime,
    customDailyMinutes: Number(setup.customDailyMinutes) || 30,
    currentBottleneck: moneyBottleneckOptions.includes(setup.currentBottleneck ?? "") ? setup.currentBottleneck ?? defaultMoneySetup.currentBottleneck : defaultMoneySetup.currentBottleneck,
    savingStyle: moneySavingStyleOptions.includes(setup.savingStyle ?? "") ? setup.savingStyle ?? defaultMoneySetup.savingStyle : defaultMoneySetup.savingStyle,
    spendingCategories: Array.isArray(setup.spendingCategories) && setup.spendingCategories.length ? setup.spendingCategories.filter(Boolean) : defaultMoneySetup.spendingCategories
  };
}

function calculateMoneyPlan(setup: MoneySetup): MoneyCalculations {
  const normalized = normalizeMoneySetup(setup);
  const monthlyLeftover = normalized.currentMonthlyIncome - normalized.currentMonthlyFixedExpenses;
  const remainingSavingNeeded = Math.max(0, normalized.targetAmount - normalized.currentSavings);
  const targetDeadlineDate = getMoneyDeadlineDate(normalized);
  const daysUntilDeadline = targetDeadlineDate ? Math.max(1, daysBetween(getDateKey(new Date()), targetDeadlineDate)) : null;
  const monthsUntilDeadline = daysUntilDeadline ? Math.max(daysUntilDeadline / 30, 1 / 30) : null;
  const neededSavingPerDay = daysUntilDeadline ? remainingSavingNeeded / daysUntilDeadline : null;
  const neededSavingPerWeek = neededSavingPerDay === null ? null : neededSavingPerDay * 7;
  const neededSavingPerMonth = monthsUntilDeadline ? remainingSavingNeeded / monthsUntilDeadline : null;
  const progressPercent = normalized.targetAmount > 0 ? clampNumber(Math.round((normalized.currentSavings / normalized.targetAmount) * 100), 0, 100) : 0;
  return {
    monthlyLeftover,
    remainingSavingNeeded,
    daysUntilDeadline,
    neededSavingPerDay,
    neededSavingPerWeek,
    neededSavingPerMonth,
    progressPercent,
    targetDeadlineDate: targetDeadlineDate || ""
  };
}

function getMoneyDeadlineDate(setup: MoneySetup): string {
  if (setup.targetDeadline === "no deadline") return "";
  if (setup.targetDeadline === "custom date") return setup.customDeadline;
  const days = setup.targetDeadline === "7 days" ? 7 : setup.targetDeadline === "14 days" ? 14 : setup.targetDeadline === "30 days" ? 30 : setup.targetDeadline === "90 days" ? 90 : setup.targetDeadline === "1 year" ? 365 : 0;
  if (!days) return "";
  return getDateKey(addDays(new Date(), days));
}

function getMoneyDeadlineLabel(setup: MoneySetup): string {
  if (setup.targetDeadline === "custom date") return setup.customDeadline || "Custom date";
  return setup.targetDeadline;
}

function getMoneyDailyMinutes(setup: MoneySetup): number {
  if (setup.dailyMoneyTime === "custom") return Number(setup.customDailyMinutes) || 30;
  return Number(setup.dailyMoneyTime.replace(/[^0-9]/g, "")) || 30;
}

function createMoneyDailyTasks(setup: MoneySetup): MoneyTask[] {
  const normalized = normalizeMoneySetup(setup);
  return [...getIncomeTasksForPath(normalized), ...getSavingTasks(normalized)].map((task) => ({ ...task, completed: false, disabled: false }));
}

function createMoneyWeeklyTasks(_setup: MoneySetup): MoneyTask[] {
  return [
    moneyTask("weekly-review-income", "Review weekly income actions", "Count applications, messages, replies, project progress, or offers.", "income"),
    moneyTask("weekly-review-spending", "Review weekly spending", "Find one category to reduce next week.", "saving"),
    moneyTask("weekly-saving-check", "Check savings progress", "Compare target saving vs actual saving.", "saving")
  ];
}

function getIncomeTasksForPath(setup: MoneySetup): MoneyTask[] {
  const minutes = getMoneyDailyMinutes(setup);
  const path = setup.incomePath;
  if (path === "Job") return [
    moneyTask("job-find-posts", "Find 3 job posts", "Save 3 realistic job leads.", "income"),
    moneyTask("job-apply-one", "Apply to 1 job", "Send one application today.", "income"),
    moneyTask("job-improve-cv", "Improve CV/profile", `Work on CV/profile for ${Math.min(minutes, 30)} min.`, "income"),
    moneyTask("job-track-application", "Track application", "Record where you applied and the next follow-up.", "income")
  ];
  if (path === "Freelance") return [
    moneyTask("freelance-skill", "Improve one useful skill", `Practice for ${minutes} min.`, "income"),
    moneyTask("freelance-portfolio", "Improve one portfolio sample", "Make one proof-of-work piece clearer.", "income"),
    moneyTask("freelance-message", "Send 3 client messages/applications", "Reach out to 3 possible clients or gigs.", "income"),
    moneyTask("freelance-follow-up", "Follow up with old lead", "Send one polite follow-up.", "income")
  ];
  if (path === "Online work") return [
    moneyTask("online-search", "Search 3 online work opportunities", "Find realistic online tasks or gigs.", "income"),
    moneyTask("online-apply", "Apply/message 1-3 opportunities", "Send at least one real message.", "income"),
    moneyTask("online-profile", "Improve profile/portfolio", "Make your profile more trustworthy.", "income")
  ];
  if (path === "Sell service") return [
    moneyTask("service-define", "Define one simple service offer", "Make the offer clear enough to explain in one sentence.", "income"),
    moneyTask("service-message", "Message 3 possible customers", "Contact 3 people who may need the service.", "income"),
    moneyTask("service-sample", "Improve service sample", "Make one small proof/example.", "income")
  ];
  if (path === "Build app/project") return [
    moneyTask("project-work", `Work on project ${minutes} min`, "Build one useful piece that could create value.", "income"),
    moneyTask("project-money-feature", "Identify one money/useful feature", "Choose one feature that helps usefulness or earning potential.", "income"),
    moneyTask("project-monetization", "Write one monetization idea", "Record one realistic way this could earn or save money.", "income")
  ];
  if (path === "Content") return [
    moneyTask("content-idea", "Create one small content idea", "Pick one useful post, video, or script idea.", "income"),
    moneyTask("content-draft", "Draft or publish one post/video/script", "Create one small content asset.", "income"),
    moneyTask("content-track", "Track views/responses", "Record what got attention.", "income")
  ];
  if (path === "Small local business") return [
    moneyTask("local-list", "List one item/service to sell", "Choose one small local offer.", "income"),
    moneyTask("local-profit", "Check cost/profit", "Estimate cost, price, and profit.", "income"),
    moneyTask("local-contact", "Contact one buyer/customer", "Reach out to one possible customer.", "income")
  ];
  return [
    moneyTask("unclear-compare", "Compare income options", "Spend 15-30 min comparing realistic income paths.", "income"),
    moneyTask("unclear-experiment", "Pick one tiny money experiment", "Choose one action you can test this week.", "income"),
    moneyTask("unclear-record", "Record what seems realistic", "Write what felt possible and what felt too hard.", "income")
  ];
}

function getSavingTasks(setup: MoneySetup): MoneyTask[] {
  const calculations = calculateMoneyPlan(setup);
  return [
    moneyTask("spending-record", "Record today's spending", "Log food, transport, apps, games, emergency, or other spending.", "saving"),
    moneyTask("spending-limit", "Check daily spending limit", "Notice if spending is higher than planned.", "saving"),
    moneyTask("saving-target", "Save today's target amount if possible", calculations.neededSavingPerDay === null ? "No deadline: choose a small realistic amount." : `Target: ${formatMoney(calculations.neededSavingPerDay, setup.currency)} today.`, "saving"),
    moneyTask("avoid-purchase", "Avoid one unnecessary purchase", "Protect savings by skipping one low-value spend.", "saving"),
    moneyTask("review-remaining", "Review remaining money", "Check what is left and what must be protected.", "saving")
  ];
}

function moneyTask(id: string, title: string, detail: string, kind: "income" | "saving"): MoneyTask {
  return { id, title, detail, kind, completed: false, disabled: false };
}

function normalizeMoneyTasks(savedTasks: MoneyTask[] = [], template: MoneyTask[]): MoneyTask[] {
  const safeTasks = Array.isArray(savedTasks) ? savedTasks : [];
  const savedById = new Map(safeTasks.map((task) => [task.id, task]));
  return template.map((task) => ({ ...task, ...savedById.get(task.id), id: task.id, title: savedById.get(task.id)?.title ?? task.title, detail: savedById.get(task.id)?.detail ?? task.detail, kind: savedById.get(task.id)?.kind ?? task.kind }));
}

function updateMoneyTask(activePlan: MoneyPlan, setActivePlan: Dispatch<SetStateAction<ActivePlan | null>>, list: "dailyTasks" | "weeklyTasks", id: string, patch: Partial<MoneyTask>) {
  setActivePlan({
    ...activePlan,
    [list]: activePlan[list].map((item) => (item.id === id ? { ...item, ...patch } : item))
  });
}

function createLifeResetPlan(setup: LifeResetSetup): LifeResetPlan {
  const normalizedSetup = normalizeLifeResetSetup(setup);
  return {
    id: createPlanId("life_reset"),
    type: "life_reset",
    name: "Life Reset",
    status: "active",
    startDate: getDateKey(new Date()),
    setup: normalizedSetup,
    resetChecklist: createLifeResetChecklist(normalizedSetup),
    dailyTasks: createLifeResetDailyTasks(normalizedSetup),
    weeklyTasks: createLifeResetWeeklyTasks(normalizedSetup),
    logs: [],
    weeklyReviews: []
  };
}

function normalizeLifeResetPlan(plan: LifeResetPlan): LifeResetPlan {
  const setup = normalizeLifeResetSetup(plan.setup);
  return {
    id: plan.id || createPlanId("life_reset"),
    type: "life_reset",
    name: "Life Reset",
    status: normalizePlanStatus(plan.status),
    startDate: plan.startDate || getDateKey(new Date()),
    setup,
    resetChecklist: normalizeLifeResetTasks(plan.resetChecklist, createLifeResetChecklist(setup)),
    dailyTasks: normalizeLifeResetTasks(plan.dailyTasks, createLifeResetDailyTasks(setup)),
    weeklyTasks: normalizeLifeResetTasks(plan.weeklyTasks, createLifeResetWeeklyTasks(setup)),
    logs: Array.isArray(plan.logs) ? plan.logs.map(normalizeLifeResetLog) : [],
    weeklyReviews: normalizePlanWeeklyReviews(plan.weeklyReviews)
  };
}

function normalizeLifeResetSetup(setup: Partial<LifeResetSetup>): LifeResetSetup {
  return {
    resetLength: lifeResetLengthOptions.includes(setup.resetLength ?? "") ? setup.resetLength ?? defaultLifeResetSetup.resetLength : defaultLifeResetSetup.resetLength,
    resetIntensity: lifeResetIntensityOptions.includes(setup.resetIntensity ?? "") ? setup.resetIntensity ?? defaultLifeResetSetup.resetIntensity : defaultLifeResetSetup.resetIntensity,
    mainProblem: lifeResetProblemOptions.includes(setup.mainProblem ?? "") ? setup.mainProblem ?? defaultLifeResetSetup.mainProblem : defaultLifeResetSetup.mainProblem,
    wakeTime: setup.wakeTime || defaultLifeResetSetup.wakeTime,
    targetSleepTime: setup.targetSleepTime || defaultLifeResetSetup.targetSleepTime,
    mainResetFocus: lifeResetFocusOptions.includes(setup.mainResetFocus ?? "") ? setup.mainResetFocus ?? defaultLifeResetSetup.mainResetFocus : defaultLifeResetSetup.mainResetFocus,
    dailyResetTime: lifeResetTimeOptions.includes(setup.dailyResetTime ?? "") ? setup.dailyResetTime ?? defaultLifeResetSetup.dailyResetTime : defaultLifeResetSetup.dailyResetTime,
    customDailyMinutes: Number(setup.customDailyMinutes) || defaultLifeResetSetup.customDailyMinutes,
    includeNannoSleepBoost: setup.includeNannoSleepBoost !== false
  };
}

function createLifeResetChecklist(_setup: LifeResetSetup): LifeResetTask[] {
  return [
    lifeResetTask("body-baseline", "Body baseline", "Drink water, hygiene reset, clean clothes.", "Body"),
    lifeResetTask("sleep-baseline", "Sleep baseline", "Know the target sleep time and protect Night Shutdown.", "Sleep"),
    lifeResetTask("room-baseline", "Room baseline", "Clear one visible mess so the room feels lighter.", "Room"),
    lifeResetTask("money-baseline", "Money baseline", "Check spending or supplies for 5 minutes.", "Money"),
    lifeResetTask("direction-baseline", "Direction baseline", "Choose one thing that matters today.", "Direction")
  ];
}

function createLifeResetDailyTasks(setup: LifeResetSetup): LifeResetTask[] {
  const normalized = normalizeLifeResetSetup(setup);
  const nannoTask = normalized.includeNannoSleepBoost ? [lifeResetTask("nanno-sleep-boost", "Nanno's Sleep Boost", "Soak feet with warm water before the final sleep routine.", "Sleep")] : [];
  if (normalized.resetIntensity === "Gentle") {
    return [
      lifeResetTask("drink-water", "Drink water", "Target: one full cup after waking.", "Body"),
      lifeResetTask("wash-face-brush", "Wash face / brush teeth", "Basic hygiene first, pressure low.", "Body"),
      lifeResetTask("proper-meal", "Eat one proper meal", "Choose simple food that helps your body stabilize.", "Body"),
      lifeResetTask("tiny-clean", "Clean one small area", "Reset one visible surface or one small mess.", "Room"),
      lifeResetTask("walk-stretch", "Walk or stretch 10 minutes", "Small movement, fresh air if possible.", "Body"),
      lifeResetTask("plan-sleep-time", "Plan sleep time", `Aim for sleep by ${normalized.targetSleepTime}.`, "Sleep"),
      ...nannoTask
    ];
  }
  if (normalized.resetIntensity === "Strong") {
    return [
      lifeResetTask("full-hygiene", "Full hygiene reset", "Shower or wipe body, brush teeth, clean clothes.", "Body"),
      lifeResetTask("laundry-check", "Laundry / clothes check", "Find clean clothes or start a clothes reset.", "Room"),
      lifeResetTask("room-reset", "Clean room 30-60 minutes", "Trash, desk, clothes, floor, then stop.", "Room"),
      lifeResetTask("food-water-plan", "Food and water plan", "Prepare water and one simple food plan.", "Body"),
      lifeResetTask("walk-workout", "Walk or workout", "Move your body enough to reset energy.", "Body"),
      lifeResetTask("money-review", "Review money", "Check spending, supplies, and one money risk.", "Money"),
      lifeResetTask("main-life-mission", "Choose one main life mission", "Pick the one action that makes tomorrow better.", "Direction"),
      lifeResetTask("deep-reset-action", "Deep work / project / income action", `Use ${getLifeResetDailyMinutes(normalized)} minutes for the reset focus.`, "Direction"),
      lifeResetTask("night-shutdown", "Night Shutdown", `Begin calming down before ${normalized.targetSleepTime}.`, "Sleep"),
      ...nannoTask
    ];
  }
  return [
    lifeResetTask("hygiene-reset", "Hygiene reset", "Brush teeth, wash face, shower or body reset.", "Body"),
    lifeResetTask("clean-clothes", "Clean clothes", "Wear clean clothes or prepare clean sleep clothes.", "Body"),
    lifeResetTask("drink-water", "Drink water", "Target: keep water nearby today.", "Body"),
    lifeResetTask("protein-meal", "Eat protein-based meal", "Choose a simple meal that supports energy.", "Body"),
    lifeResetTask("room-clean", "Clean room 15-30 minutes", "Trash, desk, bed, or floor. One area is enough.", "Room"),
    lifeResetTask("money-check", "Review money / spending 5 minutes", "Check spending, supplies, or one money reminder.", "Money"),
    lifeResetTask("important-task", "Do one important task", "One useful action for life control.", "Direction"),
    lifeResetTask("night-shutdown", "Night Shutdown", `Start winding down before ${normalized.targetSleepTime}.`, "Sleep"),
    ...nannoTask
  ];
}

function createLifeResetWeeklyTasks(_setup: LifeResetSetup): LifeResetTask[] {
  return [
    lifeResetTask("weekly-review-better", "Review what became better", "Notice the parts of life that improved.", "Mind"),
    lifeResetTask("weekly-review-weak", "Review what is still weak", "Name the remaining weak point without shame.", "Mind"),
    lifeResetTask("weekly-next-focus", "Choose next reset focus", "Decide what needs the next small reset.", "Direction"),
    lifeResetTask("weekly-continue-or-switch", "Continue or switch plan", "Choose continue, adjust, pause, or switch to another plan.", "Direction")
  ];
}

function lifeResetTask(id: string, title: string, detail: string, category: LifeResetTask["category"]): LifeResetTask {
  return { id, title, detail, category, completed: false, disabled: false };
}

function normalizeLifeResetTasks(savedTasks: LifeResetTask[] = [], template: LifeResetTask[]): LifeResetTask[] {
  const safeTasks = Array.isArray(savedTasks) ? savedTasks : [];
  const savedById = new Map(safeTasks.map((task) => [task.id, task]));
  return template.map((task) => {
    const saved = savedById.get(task.id);
    return {
      ...task,
      completed: Boolean(saved?.completed),
      disabled: Boolean(saved?.disabled),
      title: saved?.title || task.title,
      detail: saved?.detail || task.detail,
      category: saved?.category || task.category
    };
  });
}

function getLifeResetDailyMinutes(setup: LifeResetSetup): number {
  const normalized = normalizeLifeResetSetup(setup);
  if (normalized.dailyResetTime === "custom") return Number(normalized.customDailyMinutes) || 60;
  return Number(normalized.dailyResetTime.replace(/[^0-9]/g, "")) || 60;
}

function updateLifeResetTask(activePlan: LifeResetPlan, setActivePlan: Dispatch<SetStateAction<ActivePlan | null>>, list: "dailyTasks" | "weeklyTasks" | "resetChecklist", id: string, patch: Partial<LifeResetTask>) {
  setActivePlan({
    ...activePlan,
    [list]: activePlan[list].map((item) => (item.id === id ? { ...item, ...patch } : item))
  });
}

function createDefaultLifeResetLog(date: string, setup: LifeResetSetup): LifeResetLog {
  return {
    date,
    energy: 5,
    roomCondition: 5,
    mood: 5,
    sleepReadiness: 5,
    moneyStress: 5,
    improvedToday: "",
    stillMessy: "",
    tomorrowResetFocus: normalizeLifeResetSetup(setup).mainResetFocus
  };
}

function normalizeLifeResetLog(log: Partial<LifeResetLog>): LifeResetLog {
  return {
    date: log.date || getDateKey(new Date()),
    energy: clampNumber(Number(log.energy) || 5, 1, 10),
    roomCondition: clampNumber(Number(log.roomCondition) || 5, 1, 10),
    mood: clampNumber(Number(log.mood) || 5, 1, 10),
    sleepReadiness: clampNumber(Number(log.sleepReadiness) || 5, 1, 10),
    moneyStress: clampNumber(Number(log.moneyStress) || 5, 1, 10),
    improvedToday: log.improvedToday ?? "",
    stillMessy: log.stillMessy ?? "",
    tomorrowResetFocus: log.tomorrowResetFocus ?? ""
  };
}

function getLifeResetSummary(activePlan: LifeResetPlan) {
  const normalized = normalizeLifeResetPlan(activePlan);
  const logs = normalized.logs;
  const completedDaily = normalized.dailyTasks.filter((task) => task.completed && !task.disabled).length;
  return {
    resetDaysCompleted: logs.length,
    hygieneCompletedDays: logs.filter((log) => log.energy >= 5).length,
    roomResetDays: logs.filter((log) => log.roomCondition >= 6).length,
    sleepTargetDays: logs.filter((log) => log.sleepReadiness >= 7).length,
    moneyCheckDays: logs.filter((log) => log.moneyStress <= 5).length,
    mainMissionDays: completedDaily,
    todayCompleted: completedDaily,
    todayTotal: normalized.dailyTasks.filter((task) => !task.disabled).length
  };
}

function getLifeResetFeedback(activePlan: LifeResetPlan): string {
  const normalized = normalizeLifeResetPlan(activePlan);
  const recent = normalized.logs.slice(-3);
  if (recent.length === 0) return "Start with body, room, sleep, and one useful action. The reset only needs to be real, not perfect.";
  const averageEnergy = recent.reduce((sum, log) => sum + log.energy, 0) / recent.length;
  const averageSleepReadiness = recent.reduce((sum, log) => sum + log.sleepReadiness, 0) / recent.length;
  const averageMoneyStress = recent.reduce((sum, log) => sum + log.moneyStress, 0) / recent.length;
  if (averageEnergy <= 4) return "Energy is low. Use Gentle reset, protect sleep, and reduce the task load.";
  if (averageSleepReadiness <= 4) return "Sleep readiness is weak. Start Night Shutdown earlier and keep Nanno's Sleep Boost if it helps.";
  if (averageMoneyStress >= 7) return "Money stress is high. Keep the reset simple and do one small money check daily.";
  return "The reset is moving. Keep the routine small enough to repeat tomorrow.";
}

function createSleepEnergyPlan(setup: SleepEnergySetup): SleepEnergyPlan {
  const normalizedSetup = normalizeSleepEnergySetup(setup);
  return {
    id: createPlanId("fix_sleep_energy"),
    type: "fix_sleep_energy",
    name: "Fix Sleep & Energy",
    status: "active",
    startDate: getDateKey(new Date()),
    setup: normalizedSetup,
    dailyTasks: createSleepEnergyTasks(normalizedSetup),
    weeklyTasks: [],
    logs: [],
    weeklyReviews: []
  };
}

function normalizeSleepEnergyPlan(plan: SleepEnergyPlan): SleepEnergyPlan {
  const setup = normalizeSleepEnergySetup(plan.setup);
  return {
    id: plan.id || createPlanId("fix_sleep_energy"),
    type: "fix_sleep_energy",
    name: "Fix Sleep & Energy",
    status: normalizePlanStatus(plan.status),
    startDate: plan.startDate || getDateKey(new Date()),
    setup,
    dailyTasks: normalizeEssentialsItems(plan.dailyTasks, createSleepEnergyTasks(setup).map((item) => [item.id, item.title, item.category])),
    weeklyTasks: normalizeEssentialsItems(plan.weeklyTasks, []),
    logs: Array.isArray(plan.logs) ? plan.logs.map((log) => normalizeSleepEnergyLog(log, setup)) : [],
    weeklyReviews: normalizePlanWeeklyReviews(plan.weeklyReviews)
  };
}

function normalizeSleepEnergySetup(setup: Partial<SleepEnergySetup>): SleepEnergySetup {
  return {
    normalWakeTime: setup.normalWakeTime || defaultSleepEnergySetup.normalWakeTime,
    targetSleepTime: setup.targetSleepTime || defaultSleepEnergySetup.targetSleepTime,
    targetSleepDuration: sleepDurationOptions.includes(setup.targetSleepDuration ?? "") ? setup.targetSleepDuration ?? "8h" : "8h",
    customSleepDuration: Number(setup.customSleepDuration) || 8,
    currentSleepProblem: sleepProblemOptions.includes(setup.currentSleepProblem ?? "") ? setup.currentSleepProblem ?? "Sleep too late" : "Sleep too late",
    caffeineHabit: caffeineHabitOptions.includes(setup.caffeineHabit ?? "") ? setup.caffeineHabit ?? "coffee" : "coffee",
    caffeineCutoffTime: setup.caffeineCutoffTime || defaultSleepEnergySetup.caffeineCutoffTime,
    napPreference: napPreferenceOptions.includes(setup.napPreference ?? "") ? setup.napPreference ?? "no nap" : "no nap",
    nightRoutinePreference: nightRoutineOptions.includes(setup.nightRoutinePreference ?? "") ? setup.nightRoutinePreference ?? "normal" : "normal",
    includeNannoSleepBoost: setup.includeNannoSleepBoost !== false
  };
}

function createSleepEnergyTasks(setup: SleepEnergySetup): EssentialsItem[] {
  const normalized = normalizeSleepEnergySetup(setup);
  const base: EssentialsItem[] = [
    sleepTask("morning-light", "Morning light / fresh air", "Health"),
    sleepTask("wake-water", "Drink water after waking", "Health"),
    sleepTask("caffeine-rule", "Caffeine rule", "Health"),
    sleepTask("energy-check", "Energy check", "Health"),
    sleepTask("night-shutdown", "Start Night Shutdown", "Sleep"),
    sleepTask("reduce-screen", "Reduce screen / stimulation", "Sleep"),
    sleepTask("sleep-target", "Sleep on target time", "Sleep")
  ];
  if (normalized.napPreference !== "no nap") base.splice(4, 0, sleepTask("optional-nap", `Optional nap (${normalized.napPreference})`, "Health"));
  if (normalized.includeNannoSleepBoost) base.splice(base.length - 1, 0, sleepTask("nanno-sleep-boost", "Nanno's Sleep Boost", "Sleep"));
  return base;
}

function sleepTask(id: string, title: string, category: EssentialsCategory): EssentialsItem {
  return { id, title, category, completed: false, disabled: false };
}

function getSleepTargetHours(setup: SleepEnergySetup): number {
  if (setup.targetSleepDuration === "custom") return Number(setup.customSleepDuration) || 8;
  return Number(setup.targetSleepDuration.replace("h", "")) || 8;
}

function getSleepTaskDetail(taskId: string, activePlan: SleepEnergyPlan): string {
  const setup = normalizeSleepEnergySetup(activePlan.setup);
  if (taskId === "morning-light") return `Target: 5-10 minutes after waking at ${setup.normalWakeTime}`;
  if (taskId === "wake-water") return "Target: 300-500ml";
  if (taskId === "caffeine-rule") return `Target: no caffeine after ${setup.caffeineCutoffTime}`;
  if (taskId === "energy-check") return "Target: rate energy 1-10";
  if (taskId === "optional-nap") return `Target: ${setup.napPreference}`;
  if (taskId === "night-shutdown") return `Target: start around ${getNightShutdownTime(setup.targetSleepTime, 720)}`;
  if (taskId === "reduce-screen") return "Target: 30-60 minutes before sleep";
  if (taskId === "nanno-sleep-boost") return "Soak feet with warm water before final sleep routine";
  if (taskId === "sleep-target") return `Target: sleep by ${setup.targetSleepTime}`;
  return "";
}

function updateSleepEnergyTask(activePlan: SleepEnergyPlan, setActivePlan: Dispatch<SetStateAction<ActivePlan | null>>, id: string, patch: Partial<EssentialsItem>) {
  setActivePlan({
    ...activePlan,
    dailyTasks: activePlan.dailyTasks.map((item) => (item.id === id ? { ...item, ...patch } : item))
  });
}

function createBuildProjectPlan(setup: ProjectSetup): BuildProjectPlan {
  const normalizedSetup = normalizeProjectSetup(setup);
  return {
    id: createPlanId("build_project"),
    type: "build_project",
    name: "Build a Project",
    status: "active",
    startDate: getDateKey(new Date()),
    setup: normalizedSetup,
    projectRoadmap: createProjectRoadmap(normalizedSetup),
    dailyTasks: createProjectDailyTasks(normalizedSetup),
    weeklyTasks: createProjectWeeklyTasks(normalizedSetup),
    logs: [],
    weeklyReviews: []
  };
}

function normalizeBuildProjectPlan(plan: BuildProjectPlan): BuildProjectPlan {
  const setup = normalizeProjectSetup(plan.setup);
  return {
    id: plan.id || createPlanId("build_project"),
    type: "build_project",
    name: "Build a Project",
    status: normalizePlanStatus(plan.status),
    startDate: plan.startDate || getDateKey(new Date()),
    setup,
    projectRoadmap: normalizeProjectTasks(plan.projectRoadmap, createProjectRoadmap(setup)),
    dailyTasks: normalizeProjectTasks(plan.dailyTasks, createProjectDailyTasks(setup)),
    weeklyTasks: normalizeProjectTasks(plan.weeklyTasks, createProjectWeeklyTasks(setup)),
    logs: Array.isArray(plan.logs) ? plan.logs.map((log) => normalizeProjectLog(log, plan)) : [],
    weeklyReviews: normalizePlanWeeklyReviews(plan.weeklyReviews)
  };
}

function normalizeProjectSetup(setup: Partial<ProjectSetup>): ProjectSetup {
  return {
    projectName: setup.projectName ?? "",
    projectType: projectTypeOptions.includes(setup.projectType ?? "") ? setup.projectType ?? "App / Website" : "App / Website",
    projectGoal: projectGoalOptions.includes(setup.projectGoal ?? "") ? setup.projectGoal ?? "Finish MVP" : "Finish MVP",
    currentStage: projectStageOptions.includes(setup.currentStage ?? "") ? setup.currentStage ?? "Idea only" : "Idea only",
    dailyProjectTime: projectDailyTimeOptions.includes(setup.dailyProjectTime ?? "") ? setup.dailyProjectTime ?? "60 min" : "60 min",
    customDailyMinutes: Number(setup.customDailyMinutes) || 60,
    projectSpeed: projectSpeedOptions.includes(setup.projectSpeed ?? "") ? setup.projectSpeed ?? "Moderate" : "Moderate",
    deadline: projectDeadlineOptions.includes(setup.deadline ?? "") ? setup.deadline ?? "No deadline" : "No deadline",
    customDeadline: setup.customDeadline ?? "",
    mainBottleneck: projectBottleneckOptions.includes(setup.mainBottleneck ?? "") ? setup.mainBottleneck ?? "I do not know the next step" : "I do not know the next step",
    buildStyle: projectBuildStyleOptions.includes(setup.buildStyle ?? "") ? setup.buildStyle ?? "Small daily progress" : "Small daily progress"
  };
}

function createProjectRoadmap(setup: ProjectSetup): ProjectTask[] {
  const stage = normalizeProjectSetup(setup).currentStage;
  const roadmapByStage: Record<string, string[]> = {
    "Idea only": ["Define project purpose", "List core features", "Choose MVP features", "Create first build plan", "Start first small version"],
    Planning: ["Confirm MVP", "Break into milestones", "Build first feature", "Test first feature", "Improve based on use"],
    "First version started": ["Fix broken parts", "Finish core loop", "Test daily use", "Add missing must-have features", "Prepare stable version"],
    "Working MVP": ["Use app/project daily", "Find friction", "Improve highest-value issue", "Polish core flow", "Backup/export/stability"],
    "Improving existing project": ["Audit current project", "Pick one improvement", "Build it", "Test it", "Record lesson"],
    "Testing / polishing": ["Test core flow", "Fix rough edges", "Polish important screens", "Backup stable version", "Prepare next release"]
  };
  return (roadmapByStage[stage] ?? roadmapByStage["Idea only"]).map((title, index) => projectTask(`roadmap-${index + 1}`, title, "Milestone", "normal-focus"));
}

function createProjectDailyTasks(setup: ProjectSetup): ProjectTask[] {
  const minutes = getProjectDailyMinutes(setup);
  if (minutes <= 30) {
    return [
      projectTask("choose-tiny-task", "Choose one tiny project task", "Keep scope tiny enough to finish today.", "normal-focus"),
      projectTask("build-25", "Build or fix for 25 min", "Use Normal Focus 25/5.", "normal-focus"),
      projectTask("write-changed", "Write what changed", "Record one sentence and next step.", "quick-reset")
    ];
  }
  if (minutes <= 60) {
    return [
      projectTask("review-goal", "Review current project goal", "Reconnect with the purpose before building.", "quick-reset"),
      projectTask("build-45", "Build for 45 min", "Use one Deep Work session.", "deep-work"),
      projectTask("test-10", "Test for 10 min", "Try the thing you changed.", "routine"),
      projectTask("write-next-step", "Write next step", "Make tomorrow easier to start.", "quick-reset")
    ];
  }
  if (minutes <= 90) {
    return [
      projectTask("choose-main-mission", "Choose main project mission", "Pick the highest-value build task.", "quick-reset"),
      projectTask("deep-work-50", "Deep work 50 min", "Build the main mission.", "deep-work"),
      projectTask("test-fix-20", "Test/fix 20 min", "Find friction and repair one issue.", "normal-focus"),
      projectTask("record-progress-10", "Record progress 10 min", "Write what changed.", "routine"),
      projectTask("decide-next-task", "Decide next task 10 min", "Leave a clear starting point.", "routine")
    ];
  }
  return [
    projectTask("plan-mission-10", "Plan project mission 10 min", "Define the build target.", "routine"),
    projectTask("deep-work-50", "Deep work 50 min", "Build without switching tasks.", "deep-work"),
    projectTask("break-10", "Break 10 min", "Step away before the second block.", "routine"),
    projectTask("build-test-40", "Build/test 40 min", "Ship or verify one useful piece.", "deep-work"),
    projectTask("record-progress-10", "Record progress 10 min", "Write next action and lesson.", "routine")
  ];
}

function createProjectWeeklyTasks(_setup: ProjectSetup): ProjectTask[] {
  return [
    projectTask("weekly-review", "Weekly project review", "Review what shipped and what got stuck.", "normal-focus"),
    projectTask("choose-next-milestone", "Choose next milestone", "Pick the next useful outcome.", "routine"),
    projectTask("remove-unnecessary", "Remove unnecessary features", "Protect the MVP from bloat.", "normal-focus"),
    projectTask("backup-notes", "Backup/export project notes", "Save notes, repo, or stable files.", "routine"),
    projectTask("next-week-main", "Decide next week's main project mission", "Make the next week obvious.", "routine")
  ];
}

function projectTask(id: string, title: string, detail: string, timerPreset: FocusPresetId): ProjectTask {
  return { id, title, detail, completed: false, disabled: false, timerPreset };
}

function normalizeProjectTasks(savedTasks: ProjectTask[] = [], template: ProjectTask[]): ProjectTask[] {
  const safeTasks = Array.isArray(savedTasks) ? savedTasks : [];
  const savedById = new Map(safeTasks.map((task) => [task.id, task]));
  return template.map((task) => ({ ...task, ...savedById.get(task.id), id: task.id, title: savedById.get(task.id)?.title ?? task.title, detail: savedById.get(task.id)?.detail ?? task.detail }));
}

function getProjectDailyMinutes(setup: ProjectSetup): number {
  if (setup.dailyProjectTime === "custom") return Number(setup.customDailyMinutes) || 60;
  return Number(setup.dailyProjectTime.replace(/[^0-9]/g, "")) || 60;
}

function getProjectDeadlineLabel(setup: ProjectSetup): string {
  if (setup.deadline === "custom date") return setup.customDeadline || "Custom date";
  return setup.deadline;
}

function getProjectDisplayTitle(activePlan: BuildProjectPlan): string {
  return activePlan.setup.projectName ? `Build Project: ${activePlan.setup.projectName}` : "Build a Project";
}

function updateProjectTask(activePlan: BuildProjectPlan, setActivePlan: Dispatch<SetStateAction<ActivePlan | null>>, list: "projectRoadmap" | "dailyTasks" | "weeklyTasks", id: string, patch: Partial<ProjectTask>) {
  setActivePlan({
    ...activePlan,
    [list]: activePlan[list].map((item) => (item.id === id ? { ...item, ...patch } : item))
  });
}

function createGetLeanPlan(setup: GetLeanSetup, sleepTargetHours = 8): GetLeanPlan {
  const normalizedSetup = normalizeGetLeanSetup(setup);
  return {
    id: createPlanId("get_lean_shred"),
    type: "get_lean_shred",
    name: "Get Lean / Shred",
    status: "active",
    speed: normalizedSetup.speed,
    startDate: getDateKey(new Date()),
    targetDate: "",
    setup: normalizedSetup,
    calculations: calculateGetLean(normalizedSetup, sleepTargetHours),
    dailyTasks: createEssentialsItems(getLeanDailyTaskTemplates),
    weeklyReviewDay: "Sunday",
    logs: [],
    weeklyReviews: []
  };
}

function normalizeGetLeanPlan(plan: GetLeanPlan): GetLeanPlan {
  const setup = normalizeGetLeanSetup(plan.setup);
  return {
    id: plan.id || createPlanId("get_lean_shred"),
    type: "get_lean_shred",
    name: "Get Lean / Shred",
    status: normalizePlanStatus(plan.status),
    speed: setup.speed,
    startDate: plan.startDate || getDateKey(new Date()),
    targetDate: plan.targetDate ?? "",
    setup,
    calculations: { ...plan.calculations, ...calculateGetLean(setup, plan.calculations?.sleepTarget || 8) },
    dailyTasks: normalizeEssentialsItems(plan.dailyTasks, getLeanDailyTaskTemplates),
    weeklyReviewDay: "Sunday",
    logs: Array.isArray(plan.logs) ? plan.logs.map(normalizeFitnessLog) : [],
    weeklyReviews: normalizePlanWeeklyReviews(plan.weeklyReviews)
  };
}

function normalizeGetLeanSetup(setup: Partial<GetLeanSetup>): GetLeanSetup {
  return {
    currentWeightKg: Number(setup.currentWeightKg) || 0,
    goalWeightKg: Number(setup.goalWeightKg) || 0,
    heightCm: Number(setup.heightCm) || 0,
    sex: normalizeGetLeanSex(setup.sex ?? ""),
    dateOfBirth: setup.dateOfBirth ?? "",
    activityLevel: getLeanActivityLevels.includes(setup.activityLevel ?? "") ? setup.activityLevel ?? "" : "Mostly sitting",
    exerciseAccess: getLeanExerciseAccess.includes(setup.exerciseAccess ?? "") ? setup.exerciseAccess ?? "" : "Home",
    dietStyle: getLeanDietStyles.includes(setup.dietStyle ?? "") ? setup.dietStyle ?? "" : "Normal",
    speed: getLeanSpeeds.includes(setup.speed ?? "") ? setup.speed ?? "" : "Lean Moderate"
  };
}

function normalizeGetLeanSex(sex: string): string {
  const lowered = sex.toLowerCase();
  if (lowered.includes("female")) return "Female";
  if (lowered.includes("male")) return "Male";
  return sex === "Female" || sex === "Male" ? sex : "";
}

function normalizeGetLeanActivityLevel(activityLevel: string): string {
  if (getLeanActivityLevels.includes(activityLevel)) return activityLevel;
  const lowered = activityLevel.toLowerCase();
  if (lowered.includes("very")) return "Very active";
  if (lowered.includes("moderate") || lowered.includes("high")) return "Moderate active";
  if (lowered.includes("light")) return "Light active / walking";
  return "Mostly sitting";
}

function calculateGetLean(setup: GetLeanSetup, sleepTargetHours = 8): GetLeanCalculations {
  const normalized = normalizeGetLeanSetup(setup);
  const age = normalized.dateOfBirth ? calculateAge(normalized.dateOfBirth) : 0;
  const weight = normalized.currentWeightKg || 0;
  const height = normalized.heightCm || 0;
  const baseBmr = 10 * weight + 6.25 * height - 5 * age;
  const bmr = normalized.sex === "Female" ? baseBmr - 161 : baseBmr + 5;
  const activityMultiplier = getLeanActivityMultiplier(normalized.activityLevel);
  const maintenanceCalories = Math.max(0, bmr * activityMultiplier);
  const targetCalories = Math.max(0, maintenanceCalories * (1 - getLeanDeficit(normalized.speed)));
  const roundedTargetCalories = Math.round(targetCalories);
  const proteinTarget = Math.round(weight * 1.8);
  const macroTargets = calculateMacroTargets(roundedTargetCalories, proteinTarget);
  return {
    age,
    bmr: Math.round(Math.max(0, bmr)),
    maintenanceCalories: Math.round(maintenanceCalories),
    targetCalories: roundedTargetCalories,
    proteinTarget,
    carbTarget: macroTargets.carbs,
    fatTarget: macroTargets.fat,
    stepTarget: getLeanStepTarget(normalized.activityLevel),
    workoutDaysPerWeek: getLeanWorkoutDays(normalized.exerciseAccess),
    waterTarget: weight ? `${Math.max(2, Math.round(weight * 0.035 * 10) / 10)} L` : "2 L",
    sleepTarget: Number(sleepTargetHours) || 8
  };
}

function getLeanActivityMultiplier(activityLevel: string): number {
  if (activityLevel === "Light active / walking") return 1.35;
  if (activityLevel === "Moderate active") return 1.5;
  if (activityLevel === "Very active") return 1.7;
  return 1.2;
}

function getLeanDeficit(speed: string): number {
  if (speed === "Lean Slow") return 0.1;
  if (speed === "Shred Fast") return 0.2;
  return 0.15;
}

function getLeanStepTarget(activityLevel: string): number {
  if (activityLevel === "Light active / walking") return 8000;
  if (activityLevel === "Moderate active") return 10000;
  if (activityLevel === "Very active") return 12000;
  return 6000;
}

function getLeanWorkoutDays(exerciseAccess: string): string {
  if (exerciseAccess === "Walking only") return "3-5 walking sessions/week";
  if (exerciseAccess === "Gym") return "3-4 gym sessions/week";
  return "3 home workouts/week";
}

function getLeanSpeedDescription(speed: string): string {
  if (speed === "Lean Slow") return "Low stress, easier to maintain.";
  if (speed === "Shred Fast") return "More aggressive. Use short-term only. If energy or sleep gets bad, slow down.";
  return "Recommended default. Realistic and visible progress.";
}

function getLeanTaskTargetDetail(taskId: string, activePlan: GetLeanPlan): string {
  const calculations = activePlan.calculations ?? calculateGetLean(activePlan.setup);
  const setup = normalizeGetLeanSetup(activePlan.setup);

  if (taskId === "protein") {
    return calculations.proteinTarget ? `Target: ${Math.round(calculations.proteinTarget)}g protein today` : "Target protein not set";
  }

  if (taskId === "steps") {
    return calculations.stepTarget ? `Target: ${Math.round(calculations.stepTarget).toLocaleString()} steps today` : "Step target not set";
  }

  if (taskId === "water") {
    const waterTarget = formatWaterTarget(calculations.waterTarget, setup.currentWeightKg);
    return waterTarget ? `Target: ${waterTarget} water today` : "Water target not set";
  }

  if (taskId === "calories") {
    return calculations.targetCalories ? `Target: ${Math.round(calculations.targetCalories)} kcal today` : "Calorie target not set";
  }

  if (taskId === "workout-recovery") {
    if (setup.exerciseAccess === "Walking only") return "Walk 30-45 minutes or hit step target";
    if (setup.exerciseAccess === "Gym") return "Complete gym workout or recovery walk";
    return "Complete home workout or recovery walk";
  }

  if (taskId === "sleep-routine") {
    return `Target: ${calculations.sleepTarget || 8} hours sleep`;
  }

  return "";
}

function formatWaterTarget(waterTarget: string | undefined, currentWeightKg: number): string {
  const cleanTarget = waterTarget?.trim();
  if (cleanTarget) {
    const numeric = Number(cleanTarget.replace(/[^0-9.]/g, ""));
    if (Number.isFinite(numeric) && numeric > 0) return `${numeric}L`;
  }
  if (!currentWeightKg) return "";
  return `${Math.round(currentWeightKg * 0.035 * 10) / 10}L`;
}

function createLearnMasterPlan(setup: LearnMasterSetup): LearnMasterPlan {
  const dailyMinutes = getLearnDailyMinutes(setup);
  return {
    id: createPlanId("learn_master_subject"),
    type: "learn_master_subject",
    name: "Learn / Master Subject",
    status: "active",
    subjectName: setup.subjectName.trim(),
    currentLevel: learnCurrentLevels.includes(setup.currentLevel) ? setup.currentLevel : "Beginner",
    goalType: learnGoalTypes.includes(setup.goalType) ? setup.goalType : "Become useful",
    dailyMinutes,
    speed: learnSpeeds.includes(setup.speed) ? setup.speed : "Moderate",
    startDate: getDateKey(new Date()),
    deadline: getLearnDeadlineValue(setup),
    studyStyle: learnStudyStyles.includes(setup.studyStyle) ? setup.studyStyle : "Mixed",
    mainResource: setup.mainResource === "Custom" ? setup.customResource.trim() || "Custom" : setup.mainResource,
    studyLoop: learnStudyLoop,
    dailyTasks: createStudyTasks(learnDailyTaskTemplates),
    weeklyReviewDay: "Sunday",
    logs: [],
    weeklyReviews: []
  };
}

function normalizeLearnMasterPlan(plan: LearnMasterPlan): LearnMasterPlan {
  return {
    id: plan.id || createPlanId("learn_master_subject"),
    type: "learn_master_subject",
    name: "Learn / Master Subject",
    status: normalizePlanStatus(plan.status),
    subjectName: plan.subjectName ?? "",
    currentLevel: learnCurrentLevels.includes(plan.currentLevel) ? plan.currentLevel : "Beginner",
    goalType: learnGoalTypes.includes(plan.goalType) ? plan.goalType : "Become useful",
    dailyMinutes: Number(plan.dailyMinutes) || 60,
    speed: learnSpeeds.includes(plan.speed) ? plan.speed : "Moderate",
    startDate: plan.startDate || getDateKey(new Date()),
    deadline: plan.deadline ?? "",
    studyStyle: learnStudyStyles.includes(plan.studyStyle) ? plan.studyStyle : "Mixed",
    mainResource: plan.mainResource || "Course",
    studyLoop: Array.isArray(plan.studyLoop) && plan.studyLoop.length ? plan.studyLoop : learnStudyLoop,
    dailyTasks: normalizeStudyTasks(plan.dailyTasks),
    weeklyReviewDay: "Sunday",
    logs: Array.isArray(plan.logs) ? plan.logs.map(normalizeStudyLog) : [],
    weeklyReviews: normalizePlanWeeklyReviews(plan.weeklyReviews)
  };
}

function createStudyTasks(items: Array<[string, string, string]>): StudyTask[] {
  return items.map(([id, title, detail]) => ({
    id,
    title,
    detail,
    completed: false,
    disabled: false
  }));
}

function normalizeStudyTasks(savedItems: StudyTask[] = []): StudyTask[] {
  const safeItems = Array.isArray(savedItems) ? savedItems : [];
  const savedById = new Map(safeItems.map((item) => [item.id, item]));
  return createStudyTasks(learnDailyTaskTemplates).map((item) => ({
    ...item,
    ...savedById.get(item.id),
    id: item.id,
    title: savedById.get(item.id)?.title ?? item.title,
    detail: savedById.get(item.id)?.detail ?? item.detail
  }));
}

function getLearnDailyMinutes(setup: LearnMasterSetup): number {
  if (setup.dailyStudyTime === "Custom") return Math.max(5, Number(setup.customDailyMinutes) || 60);
  const parsed = Number(setup.dailyStudyTime.match(/\d+/)?.[0]);
  return parsed || 60;
}

function getLearnDeadlineValue(setup: LearnMasterSetup): string {
  if (setup.deadline === "Custom date") return setup.customDeadline;
  if (setup.deadline === "No deadline") return "";
  const days = setup.deadline === "30 days" ? 30 : setup.deadline === "90 days" ? 90 : setup.deadline === "1 year" ? 365 : 0;
  if (!days) return "";
  const date = new Date();
  date.setDate(date.getDate() + days);
  return getDateKey(date);
}

function getLearnSpeedTemplate(speed: string): string[] {
  if (speed === "Slow") return ["10 min review", "20 min new lesson", "20 min practice", "10 min notes"];
  if (speed === "Intensive") return ["20 min review", "90 min deep study", "30 min break", "90 min practice", "30 min recall/test", "20 min notes"];
  return ["10 min review", "40 min learn", "40 min practice", "20 min recall", "10 min notes"];
}

function createEverydayEssentialsPlan(setup: EssentialsSetup): EverydayEssentialsPlan {
  return {
    id: createPlanId("everyday_essentials"),
    type: "everyday_essentials",
    name: "Everyday Essentials",
    status: "active",
    startDate: getDateKey(new Date()),
    setup,
    dailyTasks: createEssentialsItems(everydayEssentialsTemplates.dailyTasks),
    weeklyTasks: createEssentialsItems(everydayEssentialsTemplates.weeklyTasks),
    monthlyTasks: createEssentialsItems(everydayEssentialsTemplates.monthlyTasks)
  };
}

function createEssentialsItems(items: readonly (readonly [string, string, EssentialsCategory])[]): EssentialsItem[] {
  return items.map(([id, title, category]) => ({
    id,
    title,
    category,
    completed: false,
    disabled: false
  }));
}

function normalizeEverydayEssentialsPlan(plan: EverydayEssentialsPlan): EverydayEssentialsPlan {
  return {
    id: plan.id || createPlanId("everyday_essentials"),
    type: "everyday_essentials",
    name: "Everyday Essentials",
    status: normalizePlanStatus(plan.status),
    startDate: plan.startDate || getDateKey(new Date()),
    setup: { ...defaultEssentialsSetup, ...plan.setup },
    dailyTasks: normalizeEssentialsItems(plan.dailyTasks, everydayEssentialsTemplates.dailyTasks),
    weeklyTasks: normalizeEssentialsItems(plan.weeklyTasks, everydayEssentialsTemplates.weeklyTasks),
    monthlyTasks: normalizeEssentialsItems(plan.monthlyTasks, everydayEssentialsTemplates.monthlyTasks),
    weeklyReviews: normalizePlanWeeklyReviews(plan.weeklyReviews)
  };
}

function normalizeEssentialsItems(savedItems: EssentialsItem[] = [], template: readonly (readonly [string, string, EssentialsCategory])[]): EssentialsItem[] {
  const safeItems = Array.isArray(savedItems) ? savedItems : [];
  const savedById = new Map(safeItems.map((item) => [item.id, item]));
  const baseItems = createEssentialsItems(template).map((item) => ({ ...item, ...savedById.get(item.id), id: item.id, title: savedById.get(item.id)?.title ?? item.title, category: savedById.get(item.id)?.category ?? item.category }));
  const baseIds = new Set(baseItems.map((item) => item.id));
  const customItems = safeItems.filter((item) => item.custom && !baseIds.has(item.id));
  return [...baseItems, ...customItems];
}

function updateEssentialsItem(
  activePlan: EverydayEssentialsPlan,
  setActivePlan: Dispatch<SetStateAction<ActivePlan | null>>,
  list: "dailyTasks" | "weeklyTasks" | "monthlyTasks",
  id: string,
  patch: Partial<EssentialsItem>
) {
  setActivePlan({
    ...activePlan,
    [list]: activePlan[list].map((item) => (item.id === id ? { ...item, ...patch } : item))
  });
}

function resetEssentialsList(
  activePlan: EverydayEssentialsPlan,
  setActivePlan: Dispatch<SetStateAction<ActivePlan | null>>,
  list: "dailyTasks" | "weeklyTasks" | "monthlyTasks"
) {
  if (!window.confirm(`Reset ${list.replace("Tasks", "").toLowerCase()} checklist completion?`)) return;
  setActivePlan({
    ...activePlan,
    [list]: activePlan[list].map((item) => ({ ...item, completed: false }))
  });
}

function updateGetLeanTask(
  activePlan: GetLeanPlan,
  setActivePlan: Dispatch<SetStateAction<ActivePlan | null>>,
  id: string,
  patch: Partial<EssentialsItem>
) {
  setActivePlan({
    ...activePlan,
    dailyTasks: activePlan.dailyTasks.map((item) => (item.id === id ? { ...item, ...patch } : item))
  });
}

function updateLearnTask(
  activePlan: LearnMasterPlan,
  setActivePlan: Dispatch<SetStateAction<ActivePlan | null>>,
  id: string,
  patch: Partial<StudyTask>
) {
  setActivePlan({
    ...activePlan,
    dailyTasks: activePlan.dailyTasks.map((item) => (item.id === id ? { ...item, ...patch } : item))
  });
}

const mealTypes: MealType[] = ["Breakfast", "Lunch", "Dinner", "Snack / Drinks"];
const measurementTypes: FoodMeasurementType[] = ["per 100g", "per 100ml", "per piece", "per serving", "per egg"];

function calculateMacroTargets(targetCalories: number, proteinGrams: number): Pick<MacroTargets, "calories" | "protein" | "carbs" | "fat"> {
  const calories = Math.round(targetCalories || 0);
  const protein = Math.round(proteinGrams || 0);
  const proteinCalories = protein * 4;
  const fatCalories = calories * 0.25;
  const fat = Math.max(0, Math.round(fatCalories / 9));
  const carbCalories = Math.max(0, calories - proteinCalories - fatCalories);
  const carbs = Math.max(0, Math.round(carbCalories / 4));
  return { calories, protein, carbs, fat };
}

function getMacroTargets(activePlan: GetLeanPlan): MacroTargets {
  const calculations = { ...calculateGetLean(activePlan.setup), ...activePlan.calculations };
  const macroTargets = calculateMacroTargets(calculations.targetCalories, calculations.proteinTarget);
  return {
    ...macroTargets,
    water: formatWaterTarget(calculations.waterTarget, activePlan.setup.currentWeightKg) || "Water target not set",
    steps: calculations.stepTarget || 0,
    sleep: calculations.sleepTarget || 8
  };
}

function createDefaultFoodLibrary(): FoodItem[] {
  return [
    foodItem("rice-white-cooked", "Cooked white rice", "per 100g", "per 100g", 130, 2.7, 28, 0.3),
    foodItem("chicken-thigh-skinless", "Steamed chicken thigh, skinless", "per 100g", "per 100g", 190, 25, 0, 9),
    foodItem("chicken-thigh-skin", "Chicken thigh with skin", "per 100g", "per 100g", 235, 24, 0, 16),
    foodItem("boiled-egg", "Boiled egg", "per piece", "per piece", 75, 6, 0.5, 5),
    foodItem("fried-egg", "Fried egg", "per piece", "per piece", 105, 6, 0.5, 8),
    foodItem("omelette", "Omelette", "per egg", "per egg", 110, 6, 1, 8),
    foodItem("banana", "Banana", "per medium banana", "per piece", 105, 1.3, 27, 0.3),
    foodItem("sweet-potato-cooked", "Cooked sweet potato", "per 100g", "per 100g", 90, 1.6, 21, 0.1),
    foodItem("soy-milk-unsweetened", "Unsweetened soy milk", "per 100ml", "per 100ml", 40, 3.5, 2, 2),
    foodItem("soy-milk-sweetened", "Sweetened soy milk", "per 100ml", "per 100ml", 60, 3, 8, 2),
    foodItem("beef-cooked", "Cooked beef", "per 100g", "per 100g", 240, 26, 0, 15),
    foodItem("pork-cooked", "Cooked pork", "per 100g", "per 100g", 260, 25, 0, 18),
    foodItem("chicken-liver-cooked", "Cooked chicken liver", "per 100g", "per 100g", 175, 25, 1, 6)
  ];
}

function foodItem(id: string, name: string, unit: string, measurementType: FoodMeasurementType, calories: number, protein: number, carbs: number, fat: number): FoodItem {
  return { id, name, unit, measurementType, calories, protein, carbs, fat };
}

function normalizeFoodLibrary(library: FoodItem[]): FoodItem[] {
  const defaultLibrary = createDefaultFoodLibrary();
  const normalized = Array.isArray(library) ? library.map(normalizeFoodItem).filter((food) => food.name.trim()) : [];
  const byId = new Map(defaultLibrary.map((food) => [food.id, food]));
  normalized.forEach((food) => byId.set(food.id, food));
  return Array.from(byId.values()).sort((a, b) => a.name.localeCompare(b.name));
}

function normalizeFoodItem(food: Partial<FoodItem>): FoodItem {
  const measurementType = measurementTypes.includes(food.measurementType as FoodMeasurementType) ? food.measurementType as FoodMeasurementType : "per 100g";
  return {
    id: food.id || `food-${Date.now()}`,
    name: food.name || "",
    unit: food.unit || measurementType,
    measurementType,
    calories: roundMacro(food.calories),
    protein: roundMacro(food.protein),
    carbs: roundMacro(food.carbs),
    fat: roundMacro(food.fat),
    custom: food.custom === true
  };
}

function normalizeDailyFoodLogs(logs: DailyFoodLogs): DailyFoodLogs {
  if (!logs || typeof logs !== "object") return {};
  return Object.entries(logs).reduce<DailyFoodLogs>((nextLogs, [date, entries]) => {
    nextLogs[date] = normalizeFoodEntries(Array.isArray(entries) ? entries : [], createDefaultFoodLibrary());
    return nextLogs;
  }, {});
}

function normalizeFoodEntries(entries: FoodEntry[], library: FoodItem[]): FoodEntry[] {
  return entries.map((entry) => normalizeFoodEntry(entry, library)).filter((entry) => entry.amount > 0);
}

function normalizeFoodEntry(entry: Partial<FoodEntry>, library: FoodItem[]): FoodEntry {
  const food = library.find((item) => item.id === entry.foodId);
  const amount = Number(entry.amount) || 0;
  const nutrition = food ? calculateFoodEntryNutrition(food, amount) : {
    calories: Math.round(Number(entry.calories) || 0),
    protein: roundMacro(entry.protein),
    carbs: roundMacro(entry.carbs),
    fat: roundMacro(entry.fat)
  };
  const meal = mealTypes.includes(entry.meal as MealType) ? entry.meal as MealType : "Breakfast";
  return {
    id: entry.id || `food-entry-${Date.now()}`,
    foodId: entry.foodId || food?.id || "",
    foodName: food?.name || entry.foodName || "Food",
    meal,
    amount,
    unit: food?.unit || entry.unit || "",
    measurementType: food?.measurementType || entry.measurementType || "per 100g",
    ...nutrition,
    note: entry.note || ""
  };
}

function createBlankFoodItem(): FoodItem {
  return { id: `food-${Date.now()}`, name: "", unit: "per 100g", measurementType: "per 100g", calories: 0, protein: 0, carbs: 0, fat: 0, custom: true };
}

function createDefaultFoodEntryDraft(library: FoodItem[]): { foodId: string; meal: MealType; amount: number; note: string } {
  return { foodId: library[0]?.id ?? "", meal: "Breakfast", amount: 100, note: "" };
}

function calculateFoodEntryNutrition(food: FoodItem, amount: number): MacroTotals {
  const multiplier = food.measurementType === "per 100g" || food.measurementType === "per 100ml" ? amount / 100 : amount;
  return {
    calories: Math.round(food.calories * multiplier),
    protein: roundMacro(food.protein * multiplier),
    carbs: roundMacro(food.carbs * multiplier),
    fat: roundMacro(food.fat * multiplier)
  };
}

function getFoodTotals(entries: FoodEntry[]): MacroTotals {
  return entries.reduce<MacroTotals>((totals, entry) => ({
    calories: totals.calories + Math.round(entry.calories || 0),
    protein: roundMacro(totals.protein + (entry.protein || 0)),
    carbs: roundMacro(totals.carbs + (entry.carbs || 0)),
    fat: roundMacro(totals.fat + (entry.fat || 0))
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
}

function getRemainingMacros(targets: MacroTargets, totals: MacroTotals): MacroTotals {
  return {
    calories: targets.calories - totals.calories,
    protein: roundMacro(targets.protein - totals.protein),
    carbs: roundMacro(targets.carbs - totals.carbs),
    fat: roundMacro(targets.fat - totals.fat)
  };
}

function formatRemaining(value: number, unit: string): string {
  return value >= 0 ? `${value}${unit === "g" ? "g" : ` ${unit}`}` : `Over by ${Math.abs(value)}${unit === "g" ? "g" : ` ${unit}`}`;
}

function roundMacro(value: unknown): number {
  return Math.round((Number(value) || 0) * 10) / 10;
}

function getAmountUnitLabel(entry: FoodEntry): string {
  if (entry.measurementType === "per 100g") return "g";
  if (entry.measurementType === "per 100ml") return "ml";
  if (entry.measurementType === "per egg") return entry.amount === 1 ? "egg" : "eggs";
  if (entry.measurementType === "per piece") return entry.amount === 1 ? "piece" : "pieces";
  return "servings";
}

function normalizeMoneySpendingLogs(logs: MoneySpendingLog[]): MoneySpendingLog[] {
  return Array.isArray(logs) ? logs.map(normalizeMoneySpendingLog).filter((log) => log.amount > 0).sort((a, b) => a.date.localeCompare(b.date)) : [];
}

function normalizeMoneyIncomeLogs(logs: MoneyIncomeLog[]): MoneyIncomeLog[] {
  return Array.isArray(logs) ? logs.map(normalizeMoneyIncomeLog).filter((log) => log.amount > 0).sort((a, b) => a.date.localeCompare(b.date)) : [];
}

function normalizeMoneySavingLogs(logs: MoneySavingLog[]): MoneySavingLog[] {
  return Array.isArray(logs) ? logs.map(normalizeMoneySavingLog).filter((log) => log.amountSaved > 0).sort((a, b) => a.date.localeCompare(b.date)) : [];
}

function normalizeMoneyOpportunityLogs(logs: MoneyOpportunityLog[]): MoneyOpportunityLog[] {
  return Array.isArray(logs) ? logs.map(normalizeMoneyOpportunityLog).filter((log) => log.title.trim()).sort((a, b) => a.date.localeCompare(b.date)) : [];
}

function normalizeMoneySpendingLog(log: Partial<MoneySpendingLog>): MoneySpendingLog {
  return {
    id: log.id || `spending-${Date.now()}`,
    date: log.date || getDateKey(new Date()),
    category: log.category || "Other",
    amount: Math.max(0, Number(log.amount) || 0),
    note: log.note ?? "",
    necessary: log.necessary !== false
  };
}

function normalizeMoneyIncomeLog(log: Partial<MoneyIncomeLog>): MoneyIncomeLog {
  return {
    id: log.id || `income-${Date.now()}`,
    date: log.date || getDateKey(new Date()),
    source: log.source || "Income",
    amount: Math.max(0, Number(log.amount) || 0),
    note: log.note ?? ""
  };
}

function normalizeMoneySavingLog(log: Partial<MoneySavingLog>): MoneySavingLog {
  return {
    id: log.id || `saving-${Date.now()}`,
    date: log.date || getDateKey(new Date()),
    amountSaved: Math.max(0, Number(log.amountSaved) || 0),
    note: log.note ?? ""
  };
}

function normalizeMoneyOpportunityLog(log: Partial<MoneyOpportunityLog>): MoneyOpportunityLog {
  return {
    id: log.id || `opportunity-${Date.now()}`,
    type: moneyOpportunityTypes.includes(log.type ?? "") ? log.type ?? "other" : "other",
    title: log.title || "",
    status: moneyOpportunityStatuses.includes(log.status ?? "") ? log.status ?? "planned" : "planned",
    date: log.date || getDateKey(new Date()),
    note: log.note ?? ""
  };
}

function createDefaultSpendingLog(activePlan: MoneyPlan): MoneySpendingLog {
  return { id: `spending-${Date.now()}`, date: getDateKey(new Date()), category: activePlan.setup.spendingCategories[0] ?? "Food", amount: 0, note: "", necessary: true };
}

function createDefaultIncomeLog(): MoneyIncomeLog {
  return { id: `income-${Date.now()}`, date: getDateKey(new Date()), source: "", amount: 0, note: "" };
}

function createDefaultSavingLog(activePlan: MoneyPlan): MoneySavingLog {
  return { id: `saving-${Date.now()}`, date: getDateKey(new Date()), amountSaved: Math.round((activePlan.calculations.neededSavingPerDay ?? 0) * 100) / 100, note: "" };
}

function createDefaultOpportunityLog(activePlan: MoneyPlan): MoneyOpportunityLog {
  return { id: `opportunity-${Date.now()}`, type: getDefaultOpportunityType(activePlan.setup.incomePath), title: getTodayMoneyAction(activePlan), status: "planned", date: getDateKey(new Date()), note: "" };
}

function getDefaultOpportunityType(incomePath: string): string {
  if (incomePath === "Job") return "job application";
  if (incomePath === "Freelance" || incomePath === "Online work" || incomePath === "Sell service") return "freelance message";
  if (incomePath === "Build app/project") return "project task";
  if (incomePath === "Content") return "content";
  if (incomePath === "Small local business") return "local business";
  return "other";
}

function upsertMoneyLog<T extends { id: string; date: string }>(logs: T[], nextLog: T): T[] {
  return [...logs.filter((log) => log.id !== nextLog.id), nextLog].sort((a, b) => a.date.localeCompare(b.date));
}

function getMoneySummary(activePlan: MoneyPlan, spendingLogs: MoneySpendingLog[], incomeLogs: MoneyIncomeLog[], savingLogs: MoneySavingLog[], opportunityLogs: MoneyOpportunityLog[]) {
  const currentSavings = activePlan.setup.currentSavings + savingLogs.reduce((total, log) => total + log.amountSaved, 0);
  const remainingNeeded = Math.max(0, activePlan.setup.targetAmount - currentSavings);
  const progressPercent = activePlan.setup.targetAmount > 0 ? clampNumber(Math.round((currentSavings / activePlan.setup.targetAmount) * 100), 0, 100) : 0;
  const weekSpending = sumMoneyLogs(spendingLogs.filter((log) => isWithinLastDays(log.date, 7)), "amount");
  const monthIncome = sumMoneyLogs(incomeLogs.filter((log) => isSameMonth(log.date, getDateKey(new Date()))), "amount");
  const weekSaving = sumMoneyLogs(savingLogs.filter((log) => isWithinLastDays(log.date, 7)), "amountSaved");
  const incomeActionsCompleted = activePlan.dailyTasks.filter((task) => task.kind === "income" && task.completed).length;
  const sentActions = opportunityLogs.filter((log) => log.status === "sent" || log.status === "replied" || log.status === "won").length;
  const replies = opportunityLogs.filter((log) => log.status === "replied" || log.status === "won").length;
  const unnecessarySpending = spendingLogs.filter((log) => !log.necessary).length;
  return { currentSavings, remainingNeeded, progressPercent, weekSpending, monthIncome, weekSaving, incomeActionsCompleted, sentActions, replies, unnecessarySpending };
}

function sumMoneyLogs<T extends Record<string, unknown>>(logs: T[], key: keyof T): number {
  return logs.reduce((total, log) => total + (Number(log[key]) || 0), 0);
}

function isWithinLastDays(date: string, days: number): boolean {
  const diff = daysBetween(date, getDateKey(new Date()));
  return diff >= 0 && diff < days;
}

function isSameMonth(date: string, today: string): boolean {
  return date.slice(0, 7) === today.slice(0, 7);
}

function getTodayMoneyAction(activePlan: MoneyPlan): string {
  return activePlan.dailyTasks.find((task) => task.kind === "income" && !task.completed && !task.disabled)?.title
    ?? activePlan.dailyTasks.find((task) => task.kind === "income" && !task.disabled)?.title
    ?? "Choose one money action";
}

function formatMoney(amount: number, currency: string): string {
  const rounded = Math.round((Number(amount) || 0) * 100) / 100;
  const symbol = currency.toUpperCase() === "USD" ? "$" : `${currency} `;
  return `${symbol}${rounded.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

function getMoneyFeedback(activePlan: MoneyPlan, spendingLogs: MoneySpendingLog[], incomeLogs: MoneyIncomeLog[], savingLogs: MoneySavingLog[], opportunityLogs: MoneyOpportunityLog[]): string {
  const summary = getMoneySummary(activePlan, spendingLogs, incomeLogs, savingLogs, opportunityLogs);
  if (summary.weekSpending > Math.max(activePlan.calculations.neededSavingPerWeek ?? 0, activePlan.calculations.monthlyLeftover / 4)) return "Spending is higher than planned. Track food, transport, games, and app costs first.";
  if ((activePlan.calculations.neededSavingPerWeek ?? 0) > 0 && summary.weekSaving < (activePlan.calculations.neededSavingPerWeek ?? 0) * 0.5) return "Saving target looks missed. Try a smaller daily target or a longer deadline.";
  if (activePlan.dailyTasks.filter((task) => task.kind === "income" && task.completed).length === 0 && opportunityLogs.filter((log) => isWithinLastDays(log.date, 3)).length === 0) return "No income actions recently. Do one 15-minute money action today.";
  if (summary.sentActions >= 5 && summary.replies === 0) return "Applications/messages are going out but replies are low. Improve your offer, profile, or portfolio proof.";
  if (activePlan.setup.incomePath === "Not sure yet") return "Pick one path for 7 days only. Clarity comes from a tiny experiment, not endless comparing.";
  return "Keep the loop simple: income action, spending log, savings check, and one follow-up.";
}

function MoneyPlanProgressSummary({ activePlans, spendingLogs, incomeLogs, savingLogs, opportunityLogs }: { activePlans: ActivePlan[]; spendingLogs: MoneySpendingLog[]; incomeLogs: MoneyIncomeLog[]; savingLogs: MoneySavingLog[]; opportunityLogs: MoneyOpportunityLog[] }) {
  const moneyPlan = activePlans.find((plan): plan is MoneyPlan => plan.type === "money_plan");
  if (!moneyPlan) return null;
  const activePlan = normalizeMoneyPlan(moneyPlan);
  const summary = getMoneySummary(activePlan, spendingLogs, incomeLogs, savingLogs, opportunityLogs);
  return (
    <Panel>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-amber-200">Money Plan Progress</p>
          <h3 className="mt-2 text-2xl font-black text-white">Income, spending, and savings summary</h3>
        </div>
        <Badge tone="gold">{summary.progressPercent}% saved</Badge>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MiniMetric label="Current Savings" value={formatMoney(summary.currentSavings, activePlan.setup.currency)} />
        <MiniMetric label="Target Progress" value={`${summary.progressPercent}%`} />
        <MiniMetric label="Spending This Week" value={formatMoney(summary.weekSpending, activePlan.setup.currency)} />
        <MiniMetric label="Income This Month" value={formatMoney(summary.monthIncome, activePlan.setup.currency)} />
        <MiniMetric label="Income Actions Done" value={summary.incomeActionsCompleted} />
        <MiniMetric label="Sent / Applied" value={summary.sentActions} />
        <MiniMetric label="Replies / Wins" value={summary.replies} />
        <MiniMetric label="Saved This Week" value={formatMoney(summary.weekSaving, activePlan.setup.currency)} />
        <MiniMetric label="Unnecessary Spending" value={summary.unnecessarySpending} />
      </div>
      <div className="mt-5 rounded-2xl border border-teal-300/20 bg-teal-300/[0.06] p-4 text-sm leading-6 text-slate-300">
        <p className="font-black text-white">Rule-based feedback</p>
        <p className="mt-2">{getMoneyFeedback(activePlan, spendingLogs, incomeLogs, savingLogs, opportunityLogs)}</p>
      </div>
    </Panel>
  );
}

function createDefaultFitnessLog(date: string): FitnessLog {
  return {
    date,
    weightKg: null,
    sleepHours: null,
    energy: 5,
    hunger: 5,
    steps: null,
    workoutCompleted: false,
    notes: ""
  };
}

function createDefaultSleepEnergyLog(date: string, setup: SleepEnergySetup): SleepEnergyLog {
  const normalized = normalizeSleepEnergySetup(setup);
  return {
    date,
    sleepTime: normalized.targetSleepTime,
    wakeTime: normalized.normalWakeTime,
    sleepHours: getSleepTargetHours(normalized),
    wakeUpsCount: 0,
    energy: 5,
    caffeineAfterCutoff: false,
    napTaken: false,
    nightRoutineCompleted: false,
    targetSleepTimeSuccess: false,
    notes: ""
  };
}

function createDefaultProjectLog(date: string, activePlan: BuildProjectPlan): ProjectLog {
  const nextTask = activePlan.dailyTasks.find((task) => !task.completed && !task.disabled) ?? activePlan.dailyTasks.find((task) => !task.disabled);
  return {
    date,
    workedOn: nextTask?.title ?? "",
    minutesWorked: getProjectDailyMinutes(activePlan.setup),
    difficulty: 5,
    focus: 5,
    blocker: "",
    nextStep: "",
    weeklyReviewCompleted: false,
    note: ""
  };
}

function createDefaultStudyLog(date: string, plannedMinutes: number): StudyLog {
  return {
    date,
    studyCompleted: false,
    minutesStudied: plannedMinutes,
    focusLevel: 5,
    difficulty: "Medium",
    topicStudied: "",
    notes: ""
  };
}

function normalizeSleepEnergyLog(log: Partial<SleepEnergyLog>, setup: SleepEnergySetup): SleepEnergyLog {
  const fallback = createDefaultSleepEnergyLog(getDateKey(new Date()), setup);
  return {
    date: log.date || fallback.date,
    sleepTime: log.sleepTime || fallback.sleepTime,
    wakeTime: log.wakeTime || fallback.wakeTime,
    sleepHours: Math.max(0, Number(log.sleepHours) || fallback.sleepHours),
    wakeUpsCount: Math.max(0, Number(log.wakeUpsCount) || 0),
    energy: clampNumber(Number(log.energy) || 5, 1, 10),
    caffeineAfterCutoff: Boolean(log.caffeineAfterCutoff),
    napTaken: Boolean(log.napTaken),
    nightRoutineCompleted: Boolean(log.nightRoutineCompleted),
    targetSleepTimeSuccess: Boolean(log.targetSleepTimeSuccess),
    notes: log.notes ?? ""
  };
}

function normalizeProjectLog(log: Partial<ProjectLog>, activePlan: BuildProjectPlan): ProjectLog {
  const fallback = createDefaultProjectLog(getDateKey(new Date()), activePlan);
  return {
    date: log.date || fallback.date,
    workedOn: log.workedOn ?? fallback.workedOn,
    minutesWorked: Math.max(0, Number(log.minutesWorked) || 0),
    difficulty: clampNumber(Number(log.difficulty) || 5, 1, 10),
    focus: clampNumber(Number(log.focus) || 5, 1, 10),
    blocker: log.blocker ?? "",
    nextStep: log.nextStep ?? "",
    weeklyReviewCompleted: Boolean(log.weeklyReviewCompleted),
    note: log.note ?? ""
  };
}

function normalizeFitnessLog(log: Partial<FitnessLog>): FitnessLog {
  return {
    date: log.date || getDateKey(new Date()),
    weightKg: Number(log.weightKg) || null,
    sleepHours: Number(log.sleepHours) || null,
    energy: clampNumber(Number(log.energy) || 5, 1, 10),
    hunger: clampNumber(Number(log.hunger) || 5, 1, 10),
    steps: Number(log.steps) || null,
    workoutCompleted: Boolean(log.workoutCompleted),
    notes: log.notes ?? ""
  };
}

function getSleepEnergySummary(activePlan: SleepEnergyPlan) {
  const logs = activePlan.logs;
  const daysLogged = logs.length;
  const averageSleepHours = daysLogged ? Math.round((logs.reduce((total, log) => total + log.sleepHours, 0) / daysLogged) * 10) / 10 : 0;
  const averageEnergy = daysLogged ? Math.round((logs.reduce((total, log) => total + log.energy, 0) / daysLogged) * 10) / 10 : 0;
  return {
    daysLogged,
    averageSleepHours,
    averageEnergy,
    caffeineCutoffSuccessDays: logs.filter((log) => !log.caffeineAfterCutoff).length,
    nightRoutineCompletedDays: logs.filter((log) => log.nightRoutineCompleted).length,
    targetSleepTimeSuccessDays: logs.filter((log) => log.targetSleepTimeSuccess).length,
    highWakeUpsDays: logs.filter((log) => log.wakeUpsCount >= 3).length
  };
}

function getSleepEnergyFeedback(activePlan: SleepEnergyPlan): string {
  const summary = getSleepEnergySummary(activePlan);
  const target = getSleepTargetHours(activePlan.setup);
  const recent = activePlan.logs.slice(-7);
  if (summary.daysLogged === 0) return "Log a few nights to unlock useful feedback.";
  if (summary.averageSleepHours && summary.averageSleepHours < target) return "Average sleep is below target. Try starting Night Shutdown earlier or using a lighter task load.";
  if (recent.slice(-3).length >= 3 && recent.slice(-3).every((log) => log.energy <= 4)) return "Energy has been low for 3+ days. Consider Recovery Mode or a lighter day.";
  const caffeineFails = recent.filter((log) => log.caffeineAfterCutoff).length;
  if (caffeineFails >= 3) return "Caffeine cutoff failed several times. Try moving caffeine earlier or reducing the late dose.";
  if (summary.highWakeUpsDays >= 2) return "Wake-ups are high. Try a calmer night routine and avoid phone stimulation before sleep.";
  return "Sleep rhythm is being tracked. Keep the routine simple and consistent.";
}

function getProjectSummary(activePlan: BuildProjectPlan) {
  const logs = activePlan.logs;
  const daysWorked = logs.filter((log) => log.minutesWorked > 0 || log.workedOn.trim()).length;
  const totalMinutes = logs.reduce((total, log) => total + log.minutesWorked, 0);
  return {
    daysWorked,
    totalMinutes,
    completedMilestones: activePlan.projectRoadmap.filter((task) => task.completed).length,
    openBlockers: logs.filter((log) => log.blocker.trim()).length,
    lastProgressNote: logs.at(-1)?.note || logs.at(-1)?.workedOn || "",
    weeklyReviewCount: logs.filter((log) => log.weeklyReviewCompleted).length
  };
}

function getProjectFeedback(activePlan: BuildProjectPlan): string {
  const logs = activePlan.logs;
  if (logs.length === 0) return "Log one project session to unlock useful feedback.";
  const recent = logs.slice(-7);
  const lastThree = logs.slice(-3);
  if (lastThree.length >= 3 && lastThree.every((log) => !log.minutesWorked && !log.workedOn.trim())) return "No work was logged for 3 days. Reduce daily project time or choose a smaller task.";
  if (lastThree.length >= 3 && lastThree.every((log) => log.difficulty >= 8)) return "Difficulty has been high for 3+ logs. Break the project into smaller steps.";
  if (recent.filter((log) => log.blocker.trim()).length >= 3) return "There are several blockers. Focus on one blocker only before adding new work.";
  if (!logs.at(-1)?.nextStep.trim()) return "Project is active but the next step is unclear. Create one tiny next action.";
  return "Project rhythm is active. Keep building, testing, and recording the next step.";
}

function normalizeStudyLog(log: Partial<StudyLog>): StudyLog {
  const difficulty = log.difficulty === "Easy" || log.difficulty === "Hard" ? log.difficulty : "Medium";
  return {
    date: log.date || getDateKey(new Date()),
    studyCompleted: Boolean(log.studyCompleted),
    minutesStudied: Number(log.minutesStudied) || 0,
    focusLevel: clampNumber(Number(log.focusLevel) || 5, 1, 10),
    difficulty,
    topicStudied: log.topicStudied ?? "",
    notes: log.notes ?? ""
  };
}

function getLeanFeedback(activePlan: GetLeanPlan): string {
  const logsWithWeight = activePlan.logs.filter((log) => typeof log.weightKg === "number" && log.weightKg > 0);
  const lastLog = activePlan.logs.at(-1);
  if (lastLog && (lastLog.energy <= 3 || (lastLog.sleepHours !== null && lastLog.sleepHours < 6))) {
    return "Energy or sleep looks low. Keep calories stable and improve sleep first.";
  }
  if (lastLog && lastLog.hunger >= 8) {
    return "Hunger is high. Try more protein, water, vegetables, and filling foods before cutting harder.";
  }
  if (logsWithWeight.length >= 2) {
    const first = logsWithWeight[0];
    const latest = logsWithWeight[logsWithWeight.length - 1];
    const days = Math.max(1, daysBetween(first.date, latest.date));
    const weeklyChange = ((latest.weightKg ?? 0) - (first.weightKg ?? 0)) / days * 7;
    if (weeklyChange < -1) return "Weight is dropping fast. Consider increasing calories slightly or reducing intensity.";
    if (logsWithWeight.length >= 14 && Math.abs(weeklyChange) < 0.1) return "If weight has not changed for about 2 weeks, reduce calories by 100-150 or increase steps.";
  }
  return "Stay consistent this week: protein, steps, water, sleep, and one realistic workout or recovery choice.";
}

function getLearnFeedback(activePlan: LearnMasterPlan): string {
  const recentLogs = activePlan.logs.slice(-7);
  if (!recentLogs.length) return "Log a few study days first. For now, keep the loop simple: learn, practice, recall, review, apply.";
  const completed = recentLogs.filter((log) => log.studyCompleted).length;
  const completionRate = completed / recentLogs.length;
  const averageFocus = recentLogs.reduce((total, log) => total + log.focusLevel, 0) / recentLogs.length;
  const easyCount = recentLogs.filter((log) => log.difficulty === "Easy").length;
  const practiceTasksDone = activePlan.dailyTasks.some((task) => task.id === "practice" && task.completed);
  const passiveStyle = activePlan.studyStyle === "Reading" || activePlan.studyStyle === "Watching videos";

  if (completionRate < 0.5) return "Completed less than 50% recently. Reduce the plan difficulty or daily minutes until it feels repeatable.";
  if (completionRate >= 0.9 && easyCount >= Math.ceil(recentLogs.length / 2)) return "Completion is 90%+ and difficulty feels easy. Consider increasing difficulty or adding a stronger practice task.";
  if (passiveStyle && !practiceTasksDone) return "Watching or reading is useful, but practice is low. Add more practice tasks so the knowledge becomes usable.";
  if (completionRate >= 0.7) return `You completed ${Math.round(completionRate * 100)}% recently. Continue the current plan. Average focus: ${averageFocus.toFixed(1)}/10.`;
  return "Keep going, but make the next study block smaller and easier to start.";
}

function daysBetween(startDate: string, endDate: string): number {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  const diff = end.getTime() - start.getTime();
  return Number.isFinite(diff) ? Math.round(diff / 86400000) : 0;
}

function clampNumber(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function getEssentialsProgress(plan: EverydayEssentialsPlan) {
  const summarize = (items: EssentialsItem[]) => {
    const enabled = items.filter((item) => !item.disabled);
    return {
      completed: enabled.filter((item) => item.completed).length,
      total: enabled.length
    };
  };

  return {
    daily: summarize(plan.dailyTasks),
    weekly: summarize(plan.weeklyTasks),
    monthly: summarize(plan.monthlyTasks)
  };
}

function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();
  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return Number.isFinite(age) ? age : 0;
}

function normalizeDayMeta(meta: Partial<DayMeta>): DayMeta {
  const dayTypes: Array<DayMeta["dayType"]> = ["Default Day", "Normal Day", "Late Wake Day", "Night Shift Day", "Recovery Day", "Appointment / Busy Day", "Custom Day"];
  const dayLengthTypes: DayLengthType[] = ["Normal", "Compact", "Short", "Night Shift"];
  const targetSleepTime = meta.targetSleepTime || "11:00 PM";
  const startTime = meta.startTime || meta.wakeTime || "5:30 AM";
  const dayLengthMinutes = Number.isFinite(meta.dayLengthMinutes) ? Number(meta.dayLengthMinutes) : getAvailableDayMinutes(startTime, targetSleepTime);
  return {
    dayType: meta.dayType && dayTypes.includes(meta.dayType) ? meta.dayType : "Default Day",
    wakeTime: meta.wakeTime || "5:30 AM",
    startTime,
    targetSleepTime,
    dayLengthMinutes,
    dayLengthLabel: meta.dayLengthLabel || formatDayLength(dayLengthMinutes),
    dayLengthType: meta.dayLengthType && dayLengthTypes.includes(meta.dayLengthType) ? meta.dayLengthType : getDayLengthType(startTime, targetSleepTime, dayLengthMinutes, meta.dayType),
    nightShutdownTime: meta.nightShutdownTime || getNightShutdownTime(targetSleepTime, dayLengthMinutes),
    todayMode: meta.todayMode && dailyModes.includes(meta.todayMode) ? meta.todayMode : "Full Day",
    mainMission: meta.mainMission || ""
  };
}

function readMode(key: string, fallback: DailyMode): DailyMode {
  const saved = readStorage<unknown>(key, fallback);
  return typeof saved === "string" && dailyModes.includes(saved as DailyMode) ? (saved as DailyMode) : fallback;
}

function clampRating(value: unknown): number {
  const rating = typeof value === "number" ? value : 5;
  return Math.min(10, Math.max(1, Math.round(rating)));
}

function getCategoryStatsFromTasks(tasks: Array<Pick<Task, "category" | "completed" | "skipped">>): Record<Category, CategoryStats> {
  const stats = createEmptyCategoryStats();
  tasks.forEach((task) => {
    stats[task.category].total += 1;
    if (task.completed) stats[task.category].completed += 1;
    if (task.skipped) stats[task.category].skipped += 1;
  });
  return addCategoryPercentages(stats);
}

function getCategoryStatsFromHistory(days: HistoryEntry[]): Record<Category, CategoryStats> {
  const stats = createEmptyCategoryStats();
  days.forEach((day) => {
    day.taskSummary.forEach((task) => {
      stats[task.category].total += 1;
      if (task.completed) stats[task.category].completed += 1;
      if (task.skipped) stats[task.category].skipped += 1;
    });
  });
  return addCategoryPercentages(stats);
}

function createEmptyCategoryStats(): Record<Category, CategoryStats> {
  return {
    Knowledge: { total: 0, completed: 0, skipped: 0, percent: 0 },
    Plan: { total: 0, completed: 0, skipped: 0, percent: 0 },
    Monitoring: { total: 0, completed: 0, skipped: 0, percent: 0 },
    Sunny: { total: 0, completed: 0, skipped: 0, percent: 0 }
  };
}

function addCategoryPercentages(stats: Record<Category, CategoryStats>): Record<Category, CategoryStats> {
  categories.forEach((category) => {
    const stat = stats[category];
    stat.percent = stat.total ? Math.round((stat.completed / stat.total) * 100) : 0;
  });
  return stats;
}

function topCategoryByPercent(stats: Record<Category, CategoryStats>, mode: "best" | "weakest"): string {
  const withTasks = categories.filter((category) => stats[category].total > 0);
  if (withTasks.length === 0) return "Not enough data";
  return withTasks.reduce((selected, category) => {
    if (mode === "best") return stats[category].percent > stats[selected].percent ? category : selected;
    return stats[category].percent < stats[selected].percent ? category : selected;
  }, withTasks[0]);
}

function useLocalStorage<T>(key: string, initialValue: T): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(initialValue);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(key);
      if (saved) {
        setValue(JSON.parse(saved) as T);
      } else {
        setValue(initialValue);
      }
    } catch (error) {
      console.warn(`KPM Sunny could not parse localStorage key "${key}". Falling back to default data.`, error);
      setValue(initialValue);
    } finally {
      setIsReady(true);
    }
  }, [key]);

  useEffect(() => {
    if (!isReady) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // The app still works in memory if localStorage is unavailable.
    }
  }, [isReady, key, value]);

  return [value, setValue];
}

function createOriginalTemplate(): TemplateTask[] {
  const template = baseSchedule.map(([time, title, category, priority, points], index) => ({
    id: `base-${index}-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    time,
    title,
    category,
    priority,
    points,
    block: getTaskBlock(time),
    enabled: true,
    notes: ""
  }));

  return [...template, createNannoSleepBoostTemplateTask()].sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));
}

function createNannoSleepBoostTemplateTask(): TemplateTask {
  return {
    id: "base-nanno-sleep-boost",
    time: "10:20 PM",
    title: "Soak feet with warm water",
    category: "Sunny",
    priority: "A",
    points: 15,
    block: "Night Shutdown",
    enabled: true,
    notes: "A calm night routine recommended by Nanno.",
    displayLabel: "Nanno’s Sleep Boost",
    subtitle: "A calm night routine recommended by Nanno.",
    flexible: true,
    timerPresetMinutes: 15
  };
}

function normalizeTemplate(template: TemplateTask[]): TemplateTask[] {
  const original = createOriginalTemplate();
  if (!Array.isArray(template) || template.length === 0) return original;

  const normalized: TemplateTask[] = template
    .map((task, index) => ({
      id: task.id || `template-${index}-${Date.now()}`,
      time: task.time || "8:00 AM",
      title: task.title || "Untitled mission",
      category: categories.includes(task.category) ? task.category : "Plan",
      priority: priorities.includes(task.priority) ? task.priority : "A",
      points: Number(task.points) || 0,
      block: blockNames.includes(task.block) ? task.block : getTaskBlock(task.time || "8:00 AM"),
      enabled: task.enabled !== false,
      notes: task.notes || "",
      displayLabel: task.displayLabel,
      subtitle: task.subtitle,
      flexible: task.flexible === true,
      timerPresetMinutes: Number(task.timerPresetMinutes) || undefined
    }));

  const nannoTask = createNannoSleepBoostTemplateTask();
  if (!normalized.some((task) => task.id === nannoTask.id || task.title.toLowerCase() === nannoTask.title.toLowerCase())) {
    normalized.push(nannoTask);
  }

  return normalized.sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));
}

function buildSchedule(template: TemplateTask[], shiftEarlier: boolean): Task[] {
  return normalizeTemplate(template).filter((task) => task.enabled).map((templateTask) => {
    const scheduledTime = shiftEarlier ? shiftTime(templateTask.time, -30) : templateTask.time;
    return {
      id: templateTask.id,
      time: scheduledTime,
      title: templateTask.title,
      category: templateTask.category,
      priority: templateTask.priority,
      points: templateTask.points,
      completed: false,
      skipped: false,
      notes: templateTask.notes,
      block: templateTask.block,
      displayLabel: templateTask.displayLabel,
      subtitle: templateTask.subtitle,
      flexible: templateTask.flexible ?? true,
      timerPresetMinutes: templateTask.timerPresetMinutes
    };
  }).sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));
}

function buildTodayPlan(draft: BuildTodayDraft, defaultTasks: Task[]): BuildTodayPreview {
  const dayType = draft.dayType;
  const startTime = dayType === "Normal Day" ? draft.wakeTime : draft.startTime || draft.wakeTime;
  const targetSleepTime = draft.sleepTime || "11:00 PM";
  const dayLengthMinutes = getAvailableDayMinutes(startTime, targetSleepTime);
  const dayLengthType = getDayLengthType(startTime, targetSleepTime, dayLengthMinutes, dayType);
  const nightShutdownTime = getNightShutdownTime(targetSleepTime, dayLengthMinutes);
  const mainMission = draft.mainMission.trim();
  let todayMode: DailyMode = draft.todayMode;
  let tasks: Task[];

  if (dayType === "Normal Day") {
    const shiftedTasks = applyMainMissionTitle(shiftFlexibleTasks(buildModeSchedule(defaultTasks, todayMode), draft.wakeTime), mainMission);
    tasks = compressTasksForDayLength(shiftedTasks, draft, dayLengthType, dayLengthMinutes);
  } else if (dayType === "Late Wake Day") {
    todayMode = "Low Energy";
    tasks = buildLateWakeSchedule(draft);
  } else if (dayType === "Night Shift Day") {
    todayMode = "Low Energy";
    tasks = buildNightShiftSchedule(draft);
  } else if (dayType === "Recovery Day") {
    todayMode = "Recovery";
    tasks = buildRecoveryDaySchedule(draft);
  } else if (dayType === "Appointment / Busy Day") {
    todayMode = "Full Day";
    tasks = protectFixedEvent(buildAppointmentDaySchedule(draft), draft.fixedEventTime, durationToMinutes(draft.fixedEventDuration));
  } else {
    todayMode = "Full Day";
    tasks = buildCustomDaySchedule(draft);
  }

  tasks = finalizeTasksForSleepWindow(tasks, startTime, targetSleepTime, dayLengthMinutes, dayLengthType);

  return {
    dayType,
    wakeTime: draft.wakeTime || startTime,
    startTime,
    targetSleepTime,
    dayLengthMinutes,
    dayLengthLabel: formatDayLength(dayLengthMinutes),
    dayLengthType,
    nightShutdownTime,
    todayMode,
    mainMission: mainMission || getMainMissionForDay(tasks)?.title || "",
    tasks: sortTasksByDayStart(tasks, startTime)
  };
}

function buildLongStudyPreview(draft: LongStudyDraft, date: string): LongStudyPreview {
  const eventName = draft.eventName.trim() || "Long Study Event";
  const subject = draft.subject.trim() || "Study";
  const targetStudyHours = getLongStudyHours(draft);
  const targetStudyMinutes = targetStudyHours * 60;
  const startTime = draft.startTime || "8:00 AM";
  const pomodoro = getLongStudyPomodoro(draft, targetStudyHours);
  const tasks: Task[] = [];
  const followUpTasks: Task[] = [];
  let offset = 0;
  let studiedMinutes = 0;
  let blockCount = 0;
  let mealCount = 0;
  let showerAdded = false;
  let breakMinutes = 0;
  let mealHygieneMinutes = 0;
  const studyTitles = getLongStudyBlockTitles(subject);

  if (draft.includeHygieneReset) {
    const cleanDuration = targetStudyHours >= 10 ? 35 : 20;
    tasks.push(buildLongStudyTask("clean-reset", startTime, offset, targetStudyHours >= 10 ? "Clean Reset — keep yourself clean, fresh, no smell" : "Clean reset", cleanDuration, "Sunny", "A", 15, "Brush teeth, wash face, clean clothes, water, and prepare a clean study space.", 15));
    offset += cleanDuration;
    mealHygieneMinutes += cleanDuration;
  }
  tasks.push(buildLongStudyTask("water-check", startTime, offset, "Water check", 5, "Sunny", "A", 8, "Refill water before starting.", 5));
  offset += 5;
  mealHygieneMinutes += 5;

  while (studiedMinutes < targetStudyMinutes) {
    const remaining = targetStudyMinutes - studiedMinutes;
    const workMinutes = Math.min(pomodoro.workMinutes, remaining);
    blockCount += 1;
    const title = `Study Block ${blockCount}: ${studyTitles[(blockCount - 1) % studyTitles.length]}`;
    tasks.push(buildLongStudyTask(`study-${blockCount}`, startTime, offset, title, workMinutes, "Knowledge", blockCount === 1 ? "S" : "A", workMinutes >= 50 ? 30 : 20, `${pomodoro.label}. Subject: ${subject}.`, workMinutes));
    offset += workMinutes;
    studiedMinutes += workMinutes;

    if (studiedMinutes >= targetStudyMinutes) break;

    const needsMeal = shouldInsertLongStudyMeal(targetStudyHours, studiedMinutes, mealCount);
    if (needsMeal && draft.mealPlanStyle === "Auto meal breaks") {
      mealCount += 1;
      tasks.push(buildLongStudyTask(`meal-${mealCount}`, startTime, offset, needsMeal.title, needsMeal.duration, "Sunny", "A", 15, "Eat, refill water, and avoid studying while eating.", 15));
      offset += needsMeal.duration;
      mealHygieneMinutes += needsMeal.duration;
      continue;
    }

    if (draft.includeShower && !showerAdded && studiedMinutes >= Math.min(360, targetStudyMinutes / 2)) {
      showerAdded = true;
      tasks.push(buildLongStudyTask("shower-body-clean", startTime, offset, "Shower / body clean", 25, "Sunny", "A", 18, "Keep yourself clean, no smell: shower or body wipe, change shirt if needed, deodorant if available.", 15));
      offset += 25;
      mealHygieneMinutes += 25;
      continue;
    }

    const breakDuration = blockCount % 3 === 0 ? Math.max(20, pomodoro.restMinutes + 15) : pomodoro.restMinutes;
    if (breakDuration > 0) {
      tasks.push(buildLongStudyTask(`break-${blockCount}`, startTime, offset, blockCount % 3 === 0 ? "Reset break: stretch + water" : "Break: stretch + water", breakDuration, "Sunny", "B", 8, "Stand up, stretch, walk 3-5 minutes, and refill water.", breakDuration));
      offset += breakDuration;
      breakMinutes += breakDuration;
    }
  }

  tasks.push(buildLongStudyTask("review-notes", startTime, offset, "Review notes", 20, "Knowledge", "A", 20, "Summarize what you learned, what you practiced, and what confused you.", 20));
  offset += 20;

  const estimatedFinishTime = shiftTime(startTime, offset);
  if (draft.includeSleepFollowUp) {
    followUpTasks.push(...buildLongStudyFollowUpTasks(draft, startTime, offset, targetStudyHours));
  }
  const warningParts = [
    isLateLongStudyFinish(startTime, offset) ? "This study event may end very late. Consider reducing study hours or starting earlier." : "",
    targetStudyHours >= 15 ? "Extreme study events are for rare use. Protect food, hygiene, sleep, and recovery." : ""
  ].filter(Boolean);

  return {
    id: `long-study-${date}-${Date.now()}`,
    date,
    eventName,
    subject,
    targetStudyHours,
    plannedStudyMinutes: studiedMinutes,
    startTime,
    estimatedFinishTime,
    totalEventDurationMinutes: offset,
    studyMinutes: studiedMinutes,
    breakMinutes,
    mealHygieneMinutes,
    pomodoroStyle: pomodoro.label,
    warning: warningParts.join(" "),
    tasks: tasks,
    followUpTasks
  };
}

function getLongStudyHours(draft: LongStudyDraft): number {
  if (draft.targetStudyHours === "custom") return clampNumber(Number(draft.customStudyHours) || 4, 4, 18);
  return clampNumber(Number(draft.targetStudyHours.replace(/[^0-9]/g, "")) || 4, 4, 18);
}

function getLongStudyPomodoro(draft: LongStudyDraft, hours: number): { workMinutes: number; restMinutes: number; label: string } {
  const style = draft.pomodoroStyle === "Auto Recommended"
    ? hours <= 10 ? "Deep Work" : hours <= 14 ? "CEO Block" : "Deep Work"
    : draft.pomodoroStyle;
  if (style === "Standard") return { workMinutes: 25, restMinutes: 5, label: "Standard 25/5" };
  if (style === "CEO Block") return { workMinutes: 90, restMinutes: 20, label: "CEO Block 90/20" };
  return { workMinutes: 50, restMinutes: 10, label: hours >= 15 ? "Deep Work 50/10 with recovery breaks" : "Deep Work 50/10" };
}

function getLongStudyBlockTitles(subject: string): string[] {
  const lowered = subject.toLowerCase();
  if (/coding|code|app|development|programming/.test(lowered)) return ["Watch / read", "Code along", "Build small part", "Debug", "Review what changed", "Summarize notes"];
  return ["Learn", "Practice", "Recall without looking", "Review mistakes", "Apply / build", "Summarize notes"];
}

function shouldInsertLongStudyMeal(hours: number, studiedMinutes: number, mealCount: number): { title: string; duration: number } | null {
  if (hours <= 6) return studiedMinutes >= 150 && mealCount < 1 ? { title: "Meal / snack break", duration: 25 } : null;
  if (hours <= 10) {
    if (studiedMinutes >= 180 && mealCount < 1) return { title: "Main meal break", duration: 50 };
    if (studiedMinutes >= 360 && mealCount < 2) return { title: "Snack / light meal break", duration: 25 };
    return null;
  }
  if (hours <= 14) {
    if (studiedMinutes >= 180 && mealCount < 1) return { title: "Main meal break", duration: 55 };
    if (studiedMinutes >= 420 && mealCount < 2) return { title: "Snack break", duration: 25 };
    if (studiedMinutes >= 600 && mealCount < 3) return { title: "Second meal break", duration: 55 };
    return null;
  }
  if (studiedMinutes >= 180 && mealCount < 1) return { title: "Main meal break", duration: 55 };
  if (studiedMinutes >= 420 && mealCount < 2) return { title: "Recovery meal break", duration: 60 };
  if (studiedMinutes >= 720 && mealCount < 3) return { title: "Late meal / recovery break", duration: 45 };
  return null;
}

function buildLongStudyTask(id: string, startTime: string, offsetMinutes: number, title: string, duration: number, category: Category, priority: Priority, points: number, notes: string, timerPresetMinutes: number): Task {
  const time = shiftTime(startTime, offsetMinutes);
  return {
    id: `long-study-${id}-${timeToMinutes(time)}`,
    time,
    title,
    category,
    priority,
    points,
    completed: false,
    skipped: false,
    notes: `Source: Long Study Mode. Duration: ${duration} min. ${notes}`,
    block: getTaskBlock(time),
    displayLabel: "Long Study Mode",
    subtitle: `${duration} min`,
    flexible: true,
    insertedGoal: true,
    custom: true,
    timerPresetMinutes
  };
}

function buildLongStudyFollowUpTasks(draft: LongStudyDraft, startTime: string, eventEndOffset: number, targetStudyHours: number): Task[] {
  const tasks: Task[] = [];
  let offset = eventEndOffset;
  tasks.push(buildLongStudyTask("follow-up-water-meal", startTime, offset, "After Study Follow-up: water / light meal check", 15, "Sunny", "A", 10, "Refill water and eat something simple if needed. This is after the study event.", 15));
  offset += 15;
  if (targetStudyHours >= 6 || draft.includeShower) {
    tasks.push(buildLongStudyTask("follow-up-shower", startTime, offset, "After Study Follow-up: shower / body clean", 20, "Sunny", "A", 12, "Clean your body after a long study event.", 15));
    offset += 20;
  }
  tasks.push(buildLongStudyTask("follow-up-brush", startTime, offset, "After Study Follow-up: brush teeth / clean clothes", 10, "Sunny", "A", 10, "Brush teeth and prepare clean clothes or clean body.", 10));
  offset += 10;
  if (draft.includeNannoSleepBoost) {
    tasks.push(buildLongStudyTask("follow-up-nanno", startTime, offset, "After Study Follow-up: Nanno's Sleep Boost", 15, "Sunny", "A", 15, "Soak feet with warm water and let your body calm down.", 15));
    offset += 15;
  }
  tasks.push(buildLongStudyTask("follow-up-night-shutdown", startTime, offset, "After Study Follow-up: Night Shutdown / sleep prep", 20, "Sunny", "A", 15, "Reduce stimulation and prepare to sleep or fully stop.", 15));
  return tasks.map((task) => ({ ...task, notes: `${task.notes} Type: follow-up.` }));
}

function isLateLongStudyFinish(startTime: string, durationMinutes: number): boolean {
  const finish = (timeToMinutes(startTime) + durationMinutes) % 1440;
  return finish >= 23 * 60 || finish <= 4 * 60;
}

function normalizeLongStudySessions(sessions: LongStudySession[] = []): LongStudySession[] {
  return Array.isArray(sessions) ? sessions.filter(Boolean).map((session) => ({
    id: session.id || `long-study-${session.date || getDateKey(new Date())}`,
    date: session.date || getDateKey(new Date()),
    eventName: session.eventName || session.subject || "Long Study Event",
    subject: session.subject || "Study",
    targetStudyHours: Number(session.targetStudyHours) || 4,
    plannedStudyMinutes: Number(session.plannedStudyMinutes) || 0,
    startTime: session.startTime || "8:00 AM",
    estimatedFinishTime: session.estimatedFinishTime || shiftTime(session.startTime || "8:00 AM", Number(session.totalEventDurationMinutes) || 0),
    totalEventDurationMinutes: Number(session.totalEventDurationMinutes) || 0,
    studyMinutes: Number(session.studyMinutes) || Number(session.plannedStudyMinutes) || 0,
    breakMinutes: Number(session.breakMinutes) || 0,
    mealHygieneMinutes: Number(session.mealHygieneMinutes) || 0,
    pomodoroStyle: session.pomodoroStyle || "Deep Work 50/10",
    warning: session.warning || "",
    tasks: Array.isArray(session.tasks) ? session.tasks : [],
    followUpTasks: Array.isArray((session as LongStudyPreview).followUpTasks) ? (session as LongStudyPreview).followUpTasks : []
  })) : [];
}

function normalizeLongStudyReviews(reviews: LongStudyReview[] = []): LongStudyReview[] {
  return Array.isArray(reviews) ? reviews.filter(Boolean).map(normalizeLongStudyReview) : [];
}

function normalizeLongStudyReview(review: Partial<LongStudyReview>): LongStudyReview {
  return {
    id: review.id || `long-study-review-${review.sessionId || "session"}-${review.date || getDateKey(new Date())}`,
    sessionId: review.sessionId || "",
    date: review.date || getDateKey(new Date()),
    totalStudyHoursCompleted: Number(review.totalStudyHoursCompleted) || 0,
    focus: clampNumber(Number(review.focus) || 5, 1, 10),
    difficulty: clampNumber(Number(review.difficulty) || 5, 1, 10),
    learned: review.learned ?? "",
    practiced: review.practiced ?? "",
    confused: review.confused ?? "",
    nextStep: review.nextStep ?? "",
    keptClean: Boolean(review.keptClean),
    ateEnough: Boolean(review.ateEnough),
    finishedFollowUp: Boolean(review.finishedFollowUp)
  };
}

function createDefaultLongStudyReview(session: LongStudySession, date: string): LongStudyReview {
  return {
    id: `long-study-review-${session.id}`,
    sessionId: session.id,
    date,
    totalStudyHoursCompleted: Math.round((session.plannedStudyMinutes / 60) * 10) / 10,
    focus: 5,
    difficulty: 5,
    learned: "",
    practiced: "",
    confused: "",
    nextStep: "",
    keptClean: false,
    ateEnough: false,
    finishedFollowUp: false
  };
}

function getLongStudyProgressSummary(session: LongStudySession) {
  const relevantTasks = [...session.tasks, ...((session as LongStudyPreview).followUpTasks ?? [])];
  const studyTasks = relevantTasks.filter((task) => /study block|review notes/i.test(task.title));
  const breakTasks = relevantTasks.filter((task) => /break|stretch|water/i.test(task.title));
  const mealTasks = relevantTasks.filter((task) => /meal|snack/i.test(task.title));
  const hygieneTasks = relevantTasks.filter((task) => /clean reset|hygiene|shower|body clean|brush teeth|wash face/i.test(task.title));
  const completedStudyMinutes = studyTasks.filter((task) => task.completed).reduce((sum, task) => sum + getDurationFromTaskNotes(task), 0);
  return {
    studyHoursCompleted: Math.round((completedStudyMinutes / 60) * 10) / 10,
    blocksCompleted: studyTasks.filter((task) => task.completed).length,
    blocksTotal: studyTasks.length,
    breaksCompleted: breakTasks.filter((task) => task.completed).length,
    breaksTotal: breakTasks.length,
    mealsCompleted: mealTasks.filter((task) => task.completed).length,
    mealsTotal: mealTasks.length,
    hygieneCompleted: hygieneTasks.filter((task) => task.completed).length,
    hygieneTotal: hygieneTasks.length
  };
}

function getLongStudyTaskType(task: Task): string {
  const text = `${task.title} ${task.notes}`.toLowerCase();
  if (text.includes("follow-up")) return "follow-up";
  if (text.includes("study block")) return "study";
  if (text.includes("break")) return "break";
  if (text.includes("meal") || text.includes("snack")) return "meal";
  if (text.includes("clean") || text.includes("shower") || text.includes("hygiene") || text.includes("water")) return "hygiene";
  if (text.includes("review")) return "review";
  return "event";
}

function getLongStudyKeyBlocks(session: LongStudySession): Task[] {
  const studyBlocks = session.tasks.filter((task) => /study block/i.test(task.title));
  const milestoneBlocks = studyBlocks.filter((_, index) => index === 0 || index === Math.floor(studyBlocks.length / 2) || index === studyBlocks.length - 1);
  const supportBlocks = session.tasks.filter((task) => /clean reset|meal|snack|review notes/i.test(task.title));
  const followUpBlocks = session.followUpTasks.filter((task) => /follow-up/i.test(task.title));
  const byId = new Map<string, Task>();
  [...supportBlocks, ...milestoneBlocks, ...followUpBlocks].forEach((task) => byId.set(task.id, task));
  return Array.from(byId.values()).sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));
}

function buildTodayEventModeTasks(todayTasks: Task[], session: LongStudySession): Task[] {
  const essentialTasks = todayTasks.filter(isEssentialTodayTask).map((task) => ({
    ...task,
    skipped: task.skipped || isOptionalLowPriorityTask(task)
  }));
  const eventTasks = [...session.tasks, ...session.followUpTasks].map((task) => ({
    ...task,
    id: `event-${task.id}`,
    completed: false,
    skipped: false
  }));
  return mergeSchedule(essentialTasks, eventTasks).sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));
}

function isEssentialTodayTask(task: Task): boolean {
  const text = `${task.title} ${task.notes} ${task.displayLabel ?? ""}`.toLowerCase();
  return /hygiene|brush|wash face|shower|body clean|water|food|meal|breakfast|lunch|dinner|medicine|medication|health|sleep|night|nanno|deadline|urgent|critical/.test(text)
    || task.category === "Sunny"
    || task.priority === "S";
}

function isOptionalLowPriorityTask(task: Task): boolean {
  return task.priority === "C" || /optional|bonus|extra|checklist|non-urgent/.test(`${task.title} ${task.notes}`.toLowerCase());
}

function getDurationFromTaskNotes(task: Task): number {
  const match = task.notes.match(/Duration:\s*(\d+)\s*min/i);
  return match ? Number(match[1]) || 0 : 0;
}

function addLifeResetTasksToBuildPreview(preview: BuildTodayPreview, activePlans: ActivePlan[]): BuildTodayPreview {
  const resetPlans = activePlans.filter((plan): plan is LifeResetPlan => plan.type === "life_reset").map(normalizeLifeResetPlan);
  if (resetPlans.length === 0) return preview;

  const resetTasks = resetPlans.flatMap((plan) => createLifeResetScheduleTasks(plan, preview));
  if (resetTasks.length === 0) return preview;

  const taskMap = new Map<string, Task>();
  [...preview.tasks, ...resetTasks]
    .filter((task) => isTaskInsideDayWindow(task.time, preview.startTime, preview.dayLengthMinutes))
    .forEach((task) => {
      const key = normalizeScheduleTaskTitle(task.title);
      const existing = taskMap.get(key);
      if (!existing || task.notes.length > existing.notes.length) taskMap.set(key, task);
    });

  return {
    ...preview,
    tasks: sortTasksByDayStart(Array.from(taskMap.values()), preview.startTime)
  };
}

function createLifeResetScheduleTasks(activePlan: LifeResetPlan, preview: BuildTodayPreview): Task[] {
  const normalized = normalizeLifeResetPlan(activePlan);
  const eligible = getLifeResetBuildTasks(normalized, preview.dayLengthType);
  const windowEndBuffer = preview.dayLengthType === "Short" ? 65 : 95;
  const availableWindow = Math.max(40, preview.dayLengthMinutes - windowEndBuffer);
  const spacing = Math.max(20, Math.floor(availableWindow / Math.max(eligible.length + 1, 2)));

  return eligible.map((item, index) => {
    const offset = Math.min(availableWindow, spacing * (index + 1));
    const task = buildDayTask(
      `life-reset-${normalized.id}`,
      preview.startTime,
      offset,
      item.title,
      getLifeResetTaskCategory(item.category),
      item.category === "Direction" ? "S" : item.category === "Sleep" || item.category === "Body" ? "A" : "B",
      item.category === "Direction" ? 25 : item.category === "Sleep" || item.category === "Body" ? 15 : 10,
      item.detail,
      "Life Reset"
    );
    task.insertedGoal = true;
    task.flexible = true;
    return task;
  });
}

function getLifeResetBuildTasks(activePlan: LifeResetPlan, dayLengthType: DayLengthType): LifeResetTask[] {
  const tasks = activePlan.dailyTasks.filter((task) => !task.disabled);
  if (dayLengthType === "Short") {
    const essentialKeywords = ["hygiene", "wash", "brush", "water", "meal", "food", "clean one", "small area", "night shutdown"];
    return tasks.filter((task) => essentialKeywords.some((keyword) => `${task.title} ${task.detail}`.toLowerCase().includes(keyword))).slice(0, 4);
  }
  if (dayLengthType === "Compact") return tasks.slice(0, 5);
  return tasks.slice(0, 6);
}

function getLifeResetTaskCategory(category: LifeResetTask["category"]): Category {
  if (category === "Money") return "Monitoring";
  if (category === "Room") return "Monitoring";
  if (category === "Mind" || category === "Direction") return "Plan";
  return "Sunny";
}

function normalizeScheduleTaskTitle(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function getAvailableDayMinutes(startTime: string, targetSleepTime: string): number {
  const start = timeToMinutes(startTime);
  let end = timeToMinutes(targetSleepTime);
  if (end <= start) end += 1440;
  return Math.max(0, end - start);
}

function getDayLengthType(startTime: string, targetSleepTime: string, dayLengthMinutes: number, dayType?: BuildDayType | "Default Day"): DayLengthType {
  if (dayType === "Night Shift Day" || timeToMinutes(targetSleepTime) <= timeToMinutes(startTime)) return "Night Shift";
  if (dayLengthMinutes >= 720) return "Normal";
  if (dayLengthMinutes >= 480) return "Compact";
  return "Short";
}

function formatDayLength(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

function getNightShutdownTime(targetSleepTime: string, dayLengthMinutes: number): string {
  const offset = dayLengthMinutes < 480 ? -35 : dayLengthMinutes < 720 ? -50 : -70;
  return shiftTime(targetSleepTime, offset);
}

function compressTasksForDayLength(dayTasks: Task[], draft: BuildTodayDraft, dayLengthType: DayLengthType, dayLengthMinutes: number): Task[] {
  if (dayLengthType === "Normal") return dayTasks;
  if (dayLengthType === "Night Shift" && dayLengthMinutes < 720) return buildShortDaySchedule({ ...draft, startTime: draft.startTime || draft.wakeTime });
  if (dayLengthType === "Night Shift") return dayTasks;
  if (dayLengthType === "Short") return buildShortDaySchedule(draft);

  const keepKeywords = [
    "wake",
    "water",
    "toilet",
    "brush",
    "wash face",
    "shower",
    "breakfast",
    "lunch",
    "dinner",
    "meal",
    "main",
    "useful",
    "work",
    "learning",
    "skill",
    "walk",
    "sunlight",
    "clean",
    "money",
    "spending",
    "plan tomorrow",
    "screen",
    "soak feet",
    "sleep"
  ];

  return dayTasks.filter((task) => {
    const title = task.title.toLowerCase();
    if (task.priority === "S") return true;
    if (task.priority === "C") return false;
    return keepKeywords.some((keyword) => title.includes(keyword));
  });
}

function buildShortDaySchedule(draft: BuildTodayDraft): Task[] {
  const start = draft.startTime || draft.wakeTime;
  const main = draft.mainMission.trim() || "Main mission";
  return [
    buildDayTask("short-day", start, 0, "Wake/reset routine", "Sunny", "A", 12),
    buildDayTask("short-day", start, 10, "Drink water", "Sunny", "A", 8),
    buildDayTask("short-day", start, 20, "Brush teeth / wash face", "Sunny", "A", 10),
    buildDayTask("short-day", start, 40, "Food / water reset", "Sunny", "A", 12),
    buildDayTask("short-day", start, 65, main, "Plan", "S", 35, "Short day main mission"),
    buildDayTask("short-day", start, 140, "Essential plan tasks", "Plan", "A", 18),
    buildDayTask("short-day", start, 180, "Night shutdown", "Sunny", "A", 15)
  ];
}

function finalizeTasksForSleepWindow(dayTasks: Task[], startTime: string, targetSleepTime: string, dayLengthMinutes: number, dayLengthType: DayLengthType): Task[] {
  const shutdownTasks = buildTargetSleepShutdownTasks(targetSleepTime, dayLengthMinutes, dayLengthType);
  const withoutOldShutdown = dayTasks.filter((task) => !isReplaceableShutdownTask(task));
  const insideWindow = withoutOldShutdown.filter((task) => isTaskInsideDayWindow(task.time, startTime, dayLengthMinutes));
  const nextTasks = [...insideWindow, ...shutdownTasks].filter((task) => isTaskInsideDayWindow(task.time, startTime, dayLengthMinutes));
  return sortTasksByDayStart(dedupeTasksByTitleAndTime(nextTasks), startTime);
}

function buildTargetSleepShutdownTasks(targetSleepTime: string, dayLengthMinutes: number, dayLengthType: DayLengthType): Task[] {
  const tasks: Task[] = [];
  if (dayLengthMinutes >= 120 && dayLengthType !== "Short") {
    tasks.push(buildDayTask("sleep-window", targetSleepTime, -70, "Reduce screen brightness / calm down", "Sunny", "B", 10));
  }
  if (dayLengthMinutes >= 150) {
    tasks.push(buildDayTask("sleep-window", targetSleepTime, -45, "Soak feet with warm water", "Sunny", "A", 15, "A calm night routine recommended by Nanno.", "Nanno’s Sleep Boost"));
  }
  if (dayLengthMinutes >= 80) {
    tasks.push(buildDayTask("sleep-window", targetSleepTime, -25, "Sleep routine", "Sunny", "A", 15));
  }
  tasks.push(buildDayTask("sleep-window", targetSleepTime, 0, "Sleep", "Sunny", "S", 25));
  return tasks;
}

function isReplaceableShutdownTask(task: Task): boolean {
  const title = `${task.title} ${task.displayLabel ?? ""}`.toLowerCase();
  return title.includes("reduce screen brightness")
    || title.includes("calm down")
    || title.includes("soak feet")
    || title.includes("sleep boost")
    || title.includes("bedtime routine")
    || title.includes("sleep routine")
    || title === "sleep";
}

function isTaskInsideDayWindow(time: string, startTime: string, dayLengthMinutes: number): boolean {
  return relativeTaskMinutes(time, startTime) <= dayLengthMinutes;
}

function relativeTaskMinutes(time: string, startTime: string): number {
  const start = timeToMinutes(startTime);
  let minutes = timeToMinutes(time);
  if (minutes < start) minutes += 1440;
  return minutes - start;
}

function sortTasksByDayStart(dayTasks: Task[], startTime: string): Task[] {
  return [...dayTasks].sort((a, b) => relativeTaskMinutes(a.time, startTime) - relativeTaskMinutes(b.time, startTime));
}

function dedupeTasksByTitleAndTime(dayTasks: Task[]): Task[] {
  const seen = new Set<string>();
  return dayTasks.filter((task) => {
    const key = `${task.time}-${task.title.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function shiftFlexibleTasks(dayTasks: Task[], wakeTime: string): Task[] {
  const wakeTask = dayTasks.find((task) => task.title.toLowerCase().includes("wake up"));
  const baseTime = wakeTask?.time ?? "5:30 AM";
  const offset = timeToMinutes(wakeTime) - timeToMinutes(baseTime);
  if (offset === 0) return resetTaskStatuses(dayTasks);

  return resetTaskStatuses(dayTasks).map((task) => {
    if (task.flexible === false) return task;
    const nextTime = shiftTime(task.time, offset);
    return { ...task, time: nextTime, block: getTaskBlock(nextTime) };
  });
}

function buildLateWakeSchedule(draft: BuildTodayDraft): Task[] {
  const start = draft.wakeTime;
  const main = draft.mainMission.trim() || "One thing that matters today";
  return [
    buildDayTask("late-wake", start, 0, "Wake up", "Sunny", "A", 10),
    buildDayTask("late-wake", start, 5, "Drink water", "Sunny", "A", 8),
    buildDayTask("late-wake", start, 10, "Toilet", "Sunny", "B", 5),
    buildDayTask("late-wake", start, 20, "Brush teeth / wash face", "Sunny", "A", 10),
    buildDayTask("late-wake", start, 35, "Shower or body reset", "Sunny", "A", 12),
    buildDayTask("late-wake", start, 60, "First meal", "Sunny", "A", 12),
    buildDayTask("late-wake", start, 90, "Check main mission", "Plan", "A", 12),
    buildDayTask("late-wake", start, 105, main, "Plan", "S", 35, "Compressed main mission"),
    buildDayTask("late-wake", start, 180, "Walk / sunlight", "Sunny", "A", 20),
    buildDayTask("late-wake", start, 225, "Clean one small area", "Monitoring", "B", 15),
    buildDayTask("late-wake", start, 255, "Money / supplies check", "Monitoring", "A", 18),
    buildDayTask("late-wake", start, 300, "Plan tomorrow", "Plan", "A", 15),
    buildDayTask("late-wake", start, 360, "Brush teeth / wash face", "Sunny", "A", 10),
    buildDayTask("late-wake", start, 375, "Sleep routine", "Sunny", "A", 15)
  ];
}

function buildNightShiftSchedule(draft: BuildTodayDraft): Task[] {
  const start = draft.startTime;
  const main = draft.mainMission.trim() || "Mini main mission before shift";
  return [
    buildDayTask("night-shift", start, 0, "Wake/reset routine", "Sunny", "A", 12),
    buildDayTask("night-shift", start, 30, "First meal", "Sunny", "A", 12),
    buildDayTask("night-shift", start, 60, "Prepare for shift", "Plan", "A", 18),
    buildDayTask("night-shift", start, 90, main, "Plan", "S", 30, "Keep this realistic before work."),
    buildFixedDayTask("night-shift-work", draft.shiftStart, "Work shift block", "Plan", "S", 30, "Fixed-time shift block"),
    buildDayTask("night-shift", draft.shiftStart, 180, "Break / food / water", "Sunny", "A", 12),
    buildFixedDayTask("night-shift-end", draft.shiftEnd, "Shift end", "Plan", "A", 10, "Fixed-time shift end"),
    buildDayTask("night-shift", draft.shiftEnd, 15, "Return home", "Sunny", "B", 8),
    buildDayTask("night-shift", draft.shiftEnd, 35, "Shower / hygiene", "Sunny", "A", 12),
    buildDayTask("night-shift", draft.shiftEnd, 55, "Soak feet with warm water", "Sunny", "A", 15, "A calm night routine recommended by Nanno.", "Nanno’s Sleep Boost"),
    buildDayTask("night-shift", draft.shiftEnd, 75, "Sleep preparation", "Sunny", "A", 15),
    buildDayTask("night-shift", draft.shiftEnd, 95, "Sleep", "Sunny", "S", 25)
  ];
}

function buildRecoveryDaySchedule(draft: BuildTodayDraft): Task[] {
  const start = draft.wakeTime;
  const usefulTask = draft.wantsSmallMainMission ? [buildDayTask("recovery", start, 150, "One useful task for 5-15 minutes", "Plan", "B", 15, "Gentle pressure only.")] : [];
  return [
    buildDayTask("recovery", start, 0, "Drink water", "Sunny", "A", 8),
    buildDayTask("recovery", start, 5, "Toilet", "Sunny", "B", 5),
    buildDayTask("recovery", start, 15, "Brush teeth / wash face", "Sunny", "A", 10),
    buildDayTask("recovery", start, 30, "Shower or wipe body", "Sunny", "A", 12),
    buildDayTask("recovery", start, 60, "Eat simple food", "Sunny", "A", 12),
    buildDayTask("recovery", start, 105, "Sunlight / fresh air", "Sunny", "A", 15),
    buildDayTask("recovery", start, 130, "Clean one tiny area", "Monitoring", "B", 12),
    ...usefulTask,
    buildDayTask("recovery", start, 240, "Prepare food", "Sunny", "A", 12),
    buildDayTask("recovery", start, 420, "Reduce screen brightness", "Sunny", "B", 10),
    buildDayTask("recovery", start, 440, "Soak feet with warm water", "Sunny", "A", 15, "A calm night routine recommended by Nanno.", "Nanno’s Sleep Boost"),
    buildDayTask("recovery", start, 460, "Sleep routine", "Sunny", "A", 15),
    buildDayTask("recovery", start, 485, "Sleep", "Sunny", "S", 25)
  ];
}

function buildAppointmentDaySchedule(draft: BuildTodayDraft): Task[] {
  const start = draft.wakeTime;
  const fixedTitle = draft.fixedEvent.trim() || "Fixed appointment";
  return [
    buildDayTask("appointment", start, 0, "Wake/reset routine", "Sunny", "A", 12),
    buildDayTask("appointment", start, 35, "First meal", "Sunny", "A", 12),
    buildDayTask("appointment", start, 70, "Main mission before busy block", "Plan", "S", 30),
    buildFixedDayTask("appointment-fixed", draft.fixedEventTime, fixedTitle, "Plan", "S", 25, "Fixed-time event. Do not move."),
    buildDayTask("appointment", draft.fixedEventTime, durationToMinutes(draft.fixedEventDuration) + 15, "Food / water reset", "Sunny", "A", 12),
    buildDayTask("appointment", draft.fixedEventTime, durationToMinutes(draft.fixedEventDuration) + 45, "Movement / fresh air", "Sunny", "A", 15),
    buildDayTask("appointment", draft.fixedEventTime, durationToMinutes(draft.fixedEventDuration) + 75, "Small cleaning reset", "Monitoring", "B", 12),
    buildDayTask("appointment", draft.fixedEventTime, durationToMinutes(draft.fixedEventDuration) + 120, "Evening review / plan tomorrow", "Plan", "A", 15),
    buildDayTask("appointment", draft.fixedEventTime, durationToMinutes(draft.fixedEventDuration) + 180, "Sleep routine", "Sunny", "A", 15)
  ];
}

function buildCustomDaySchedule(draft: BuildTodayDraft): Task[] {
  const start = draft.startTime;
  const main = draft.mainMission.trim() || "Main mission";
  return [
    buildDayTask("custom", start, 0, "Start routine", "Sunny", "A", 15),
    buildDayTask("custom", start, 45, main, "Plan", "S", 35),
    buildDayTask("custom", start, 135, "Meal", "Sunny", "A", 12),
    buildDayTask("custom", start, 180, "Movement", "Sunny", "A", 15),
    buildDayTask("custom", start, 225, "Small cleaning", "Monitoring", "B", 12),
    buildDayTask("custom", draft.sleepTime, -60, "Review", "Plan", "A", 15),
    buildDayTask("custom", draft.sleepTime, -30, "Sleep routine", "Sunny", "A", 15)
  ];
}

function buildDayTask(prefix: string, baseTime: string, offsetMinutes: number, title: string, category: Category, priority: Priority, points: number, notes = "", displayLabel?: string): Task {
  const time = shiftTime(baseTime, offsetMinutes);
  return {
    id: `${prefix}-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${timeToMinutes(time)}`,
    time,
    title,
    category,
    priority,
    points,
    completed: false,
    skipped: false,
    notes,
    block: getTaskBlock(time),
    displayLabel,
    subtitle: displayLabel ? notes : undefined,
    flexible: true,
    custom: true,
    timerPresetMinutes: title.toLowerCase().includes("soak feet") ? 15 : undefined
  };
}

function buildFixedDayTask(id: string, time: string, title: string, category: Category, priority: Priority, points: number, notes = ""): Task {
  return {
    id,
    time,
    title,
    category,
    priority,
    points,
    completed: false,
    skipped: false,
    notes,
    block: getTaskBlock(time),
    flexible: false,
    custom: true
  };
}

function protectFixedEvent(dayTasks: Task[], fixedTime: string, durationMinutes: number): Task[] {
  const fixedStart = timeToMinutes(fixedTime);
  const fixedEnd = fixedStart + durationMinutes;
  return dayTasks.map((task) => {
    if (task.flexible === false) return task;
    const minutes = timeToMinutes(task.time);
    if (minutes < fixedStart || minutes >= fixedEnd) return task;
    const nextTime = minutesToTime(fixedEnd + 15);
    return { ...task, time: nextTime, block: getTaskBlock(nextTime), notes: [task.notes, "Moved around fixed event"].filter(Boolean).join(" / ") };
  });
}

function buildModeSchedule(baseTasks: Task[], mode: DailyMode): Task[] {
  const cleanBase = resetTaskStatuses(baseTasks).filter((task) => !task.insertedGoal);
  if (mode === "Full Day") return cleanBase;

  if (mode === "Low Energy") {
    const keep = [
      "wake up",
      "drink water",
      "use toilet",
      "brush teeth",
      "wash face",
      "shower",
      "breakfast",
      "lunch",
      "dinner",
      "walk",
      "sunlight",
      "spending",
      "money",
      "bedtime",
      "sleep"
    ];
    return compactModeTasks(cleanBase, keep, [
      modeTask(cleanBase, mode, "8:00 AM", "One useful task", "Plan", "A", 25, "Main Mission Block"),
      modeTask(cleanBase, mode, "9:30 PM", "Calm down and protect sleep", "Sunny", "A", 15, "Evening Control Block")
    ]);
  }

  if (mode === "Recovery") {
    const keep = ["drink water", "brush teeth", "wash face", "shower", "breakfast", "lunch", "dinner", "stretch", "fresh air", "sunlight", "walk", "clean room", "screen brightness", "soak feet", "warm water", "nanno", "bedtime", "sleep"];
    return compactModeTasks(cleanBase, keep, [
      modeTask(cleanBase, mode, "8:00 AM", "Recovery planning and gentle reset", "Plan", "B", 15, "Main Mission Block"),
      modeTask(cleanBase, mode, "4:15 PM", "Room reset for 10 minutes", "Monitoring", "A", 18, "Afternoon Growth Block")
    ]);
  }

  if (mode === "Money") {
    const keep = ["wake up", "drink water", "brush teeth", "shower", "breakfast", "lunch", "dinner", "spending", "money", "sleep"];
    return compactModeTasks(cleanBase, keep, [
      modeTask(cleanBase, mode, "8:00 AM", "Apply for jobs / serious money work", "Plan", "S", 45, "Main Mission Block"),
      modeTask(cleanBase, mode, "10:15 AM", "Check job sites and find opportunity", "Plan", "S", 40, "Main Mission Block"),
      modeTask(cleanBase, mode, "1:30 PM", "Build income skill", "Knowledge", "A", 35, "Afternoon Growth Block"),
      modeTask(cleanBase, mode, "7:15 PM", "Review spending and money plan", "Monitoring", "A", 22, "Evening Control Block")
    ]);
  }

  if (mode === "Skill") {
    const keep = ["wake up", "drink water", "brush teeth", "shower", "breakfast", "lunch", "dinner", "walk", "sunlight", "bedtime", "sleep"];
    return compactModeTasks(cleanBase, keep, [
      modeTask(cleanBase, mode, "8:00 AM", "Deep skill practice block", "Knowledge", "S", 42, "Main Mission Block"),
      modeTask(cleanBase, mode, "1:30 PM", "Coding / app building practice", "Knowledge", "A", 35, "Afternoon Growth Block"),
      modeTask(cleanBase, mode, "7:30 PM", "Study session and notes", "Knowledge", "A", 28, "Evening Control Block")
    ]);
  }

  return compactModeTasks(cleanBase, [], [
    modeTask(cleanBase, mode, "8:00 AM", "Main Mission", "Plan", "S", 45, "Main Mission Block"),
    modeTask(cleanBase, mode, "10:15 AM", "Deep Work Block 1", "Plan", "S", 45, "Main Mission Block"),
    modeTask(cleanBase, mode, "1:30 PM", "Deep Work Block 2", "Knowledge", "S", 45, "Afternoon Growth Block"),
    modeTask(cleanBase, mode, "4:30 PM", "Strategy Review", "Monitoring", "A", 28, "Afternoon Growth Block"),
    modeTask(cleanBase, mode, "7:15 PM", "Money Check", "Monitoring", "A", 24, "Evening Control Block"),
    modeTask(cleanBase, mode, "7:30 PM", "Learning Block", "Knowledge", "A", 28, "Evening Control Block"),
    modeTask(cleanBase, mode, "10:15 PM", "Evening Review", "Plan", "A", 22, "Night Shutdown")
  ], true);
}

function compactModeTasks(baseTasks: Task[], keywords: string[], additions: Task[], includeFullBase = false): Task[] {
  const selected = includeFullBase ? baseTasks : baseTasks.filter((task) => keywords.some((keyword) => task.title.toLowerCase().includes(keyword)));
  const selectedWithoutConflicts = selected.filter((task) => !additions.some((addition) => addition.time === task.time && addition.block === task.block));
  return [...selectedWithoutConflicts, ...additions].sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));
}

function modeTask(baseTasks: Task[], mode: DailyMode, time: string, title: string, category: Category, priority: Priority, points: number, block: string): Task {
  const wakeTask = baseTasks.find((task) => task.title.toLowerCase().includes("wake up"));
  const offset = wakeTask ? timeToMinutes(wakeTask.time) - timeToMinutes("5:30 AM") : 0;
  const shiftedTime = shiftTime(time, offset);
  return {
    id: `mode-${mode.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    time: shiftedTime,
    title,
    category,
    priority,
    points,
    completed: false,
    skipped: false,
    notes: modeProfiles[mode].note,
    block,
    flexible: true,
    custom: true
  };
}

function mergeSchedule(current: Task[], fresh: Task[]): Task[] {
  const currentById = new Map(current.map((task) => [task.id, task]));
  const insertedGoals = current.filter((task) => task.insertedGoal);
  const customTasks = current.filter((task) => task.custom && !task.insertedGoal);
  const freshIds = new Set(fresh.map((task) => task.id));
  const merged = fresh.map((task) => {
    const saved = currentById.get(task.id);
    return {
      ...task,
      completed: saved?.completed ?? task.completed,
      skipped: saved?.skipped ?? task.skipped,
      notes: saved?.notes ?? task.notes
    };
  });
  return [...merged, ...customTasks.filter((task) => !freshIds.has(task.id)), ...insertedGoals].sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));
}

function chooseSlots(plan: Plan): string[] {
  const category = plan.goalCategory.toLowerCase();
  const title = plan.title.toLowerCase();
  let slots = smartSlotsByCategory.Money;

  if (category === "skill" || title.includes("learn") || title.includes("practice") || title.includes("study")) slots = smartSlotsByCategory.Skill;
  if (category === "health" || title.includes("exercise") || title.includes("walk")) slots = smartSlotsByCategory.Health;
  if (category === "cleaning" || title.includes("clean") || title.includes("room")) slots = smartSlotsByCategory.Cleaning;
  if (category === "admin" || title.includes("message") || title.includes("email")) slots = smartSlotsByCategory.Admin;
  if (category === "personal" || title.includes("planning") || title.includes("reading") || title.includes("review")) slots = smartSlotsByCategory.Personal;
  if (category === "fun" || title.includes("hobby") || title.includes("game")) slots = smartSlotsByCategory.Fun;
  if (category === "money" || title.includes("money") || title.includes("work") || title.includes("job") || title.includes("business") || title.includes("project")) slots = smartSlotsByCategory.Money;
  if (plan.priority === "S") slots = [...slots].sort((a, b) => timeToMinutes(a) - timeToMinutes(b));

  return slots;
}

const smartSlotsByCategory: Record<GoalCategory, string[]> = {
  Money: ["8:00 AM", "10:15 AM", "1:30 PM"],
  Skill: ["8:00 AM", "1:30 PM", "7:30 PM"],
  Health: ["6:05 AM", "3:00 PM", "9:30 PM"],
  Cleaning: ["7:30 AM", "4:15 PM", "9:00 PM"],
  Admin: ["4:30 PM", "7:15 PM"],
  Personal: ["7:45 AM", "7:30 PM", "10:15 PM"],
  Fun: ["5:00 PM", "8:30 PM"]
};

const categoryBreakdownTemplates: Record<GoalCategory, string[]> = {
  Money: ["Check opportunities", "Choose best option", "Prepare materials", "Do main money task", "Record result"],
  Skill: ["Review old lesson", "Learn new concept", "Practice", "Test yourself", "Write lesson learned"],
  Health: ["Water", "Light movement", "Meal check", "Walk/sunlight", "Sleep preparation"],
  Cleaning: ["Trash", "Desk", "Clothes", "Floor", "Bed", "Supplies"],
  Admin: ["Check messages", "Check bills", "Organize notes", "Finish important admin task", "Record follow-up"],
  Personal: ["Clarify goal", "Do one meaningful action", "Reflect", "Plan next step"],
  Fun: ["Choose fun activity", "Set time limit", "Enjoy without guilt", "Stop on time"]
};

const titleBreakdownTemplates: Array<{ keywords: string[]; steps: string[] }> = [
  {
    keywords: ["apply for job", "apply for jobs", "job application", "jobs"],
    steps: ["Check job sites", "Pick 3 suitable jobs", "Edit resume/CV", "Apply to first job", "Apply to second job", "Apply to third job", "Record applications"]
  },
  {
    keywords: ["clean my room", "clean room", "room"],
    steps: ["Throw trash", "Clear desk", "Organize clothes", "Sweep or clean floor", "Reset bed", "Put important items in place"]
  },
  {
    keywords: ["study coding", "coding", "learn code", "programming"],
    steps: ["Review previous lesson", "Watch or read lesson", "Code practice", "Fix one bug", "Write what I learned"]
  },
  {
    keywords: ["build app", "app", "mvp"],
    steps: ["Open project", "Choose one feature", "Code first version", "Test feature", "Fix bugs", "Write next step"]
  }
];

function buildMissionPlanPreview(title: string, plan: Plan, tomorrowTasks: Task[]): MissionPlanPreviewItem[] {
  const slots = chooseSlots(plan);
  const steps = getGoalBreakdownSteps(title, plan);
  const points = getMissionPoints(plan.priority);

  return steps.map((stepTitle, index) => {
    const time = slots[index % slots.length];
    const conflict = tomorrowTasks.find((task) => task.time === time && !task.insertedGoal);
    return {
      id: `preview-${Date.now()}-${index}`,
      title: stepTitle,
      time,
      originalTime: time,
      category: mapGoalCategory(plan.goalCategory),
      goalCategory: plan.goalCategory,
      priority: plan.priority,
      points,
      notes: buildMissionNote(title, plan, index + 1, steps.length),
      hasConflict: Boolean(conflict),
      conflictTaskId: conflict?.id,
      conflictTaskTitle: conflict?.title,
      action: conflict ? "move-next" : "bonus"
    };
  });
}

function getGoalBreakdownSteps(title: string, plan: Plan): string[] {
  if (!plan.isBigGoal) return [title];
  const cleanTitle = title.toLowerCase();
  const titleTemplate = titleBreakdownTemplates.find((template) => template.keywords.some((keyword) => cleanTitle.includes(keyword)));
  return titleTemplate?.steps ?? categoryBreakdownTemplates[plan.goalCategory];
}

function applyMissionPlanPreview(currentTasks: Task[], preview: MissionPlanPreviewItem[]): Task[] {
  let nextTasks = currentTasks.filter((task) => !task.insertedGoal);

  preview.forEach((item) => {
    if (item.action === "skip") return;
    if (item.action === "replace" && item.conflictTaskId) {
      nextTasks = nextTasks.filter((task) => task.id !== item.conflictTaskId);
    }

    const time =
      item.action === "add-after"
        ? findOpenTimeAfter(item.originalTime, nextTasks)
        : item.action === "move-next"
          ? findNextBestOpenSlot(item, nextTasks)
          : item.originalTime;

    nextTasks.push(previewItemToTask(item, time, item.action === "bonus"));
  });

  return nextTasks.sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));
}

function previewItemToTask(item: MissionPlanPreviewItem, time: string, bonus: boolean): Task {
  return {
    id: `goal-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    time,
    title: bonus && item.hasConflict ? `${item.title} (Bonus)` : item.title,
    category: item.category,
    priority: item.priority,
    points: item.points,
    completed: false,
    skipped: false,
    notes: `${item.notes}${bonus && item.hasConflict ? " / Added as bonus mission" : ""}`,
    insertedGoal: true,
    block: getTaskBlock(time)
  };
}

function findNextBestOpenSlot(item: MissionPlanPreviewItem, tasks: Task[]): string {
  const slots = smartSlotsByCategory[item.goalCategory];
  const startIndex = Math.max(0, slots.indexOf(item.originalTime));
  const ordered = [...slots.slice(startIndex + 1), ...slots.slice(0, startIndex + 1)];
  return ordered.find((slot) => !tasks.some((task) => task.time === slot)) ?? findOpenTimeAfter(item.originalTime, tasks);
}

function findOpenTimeAfter(time: string, tasks: Task[]): string {
  let minutes = timeToMinutes(time) + 15;
  for (let attempts = 0; attempts < 12; attempts += 1) {
    const candidate = minutesToTime(minutes);
    if (!tasks.some((task) => task.time === candidate)) return candidate;
    minutes += 15;
  }
  return minutesToTime(timeToMinutes(time) + 15);
}

function getMissionPoints(priority: Priority): number {
  if (priority === "S") return 40;
  if (priority === "A") return 30;
  if (priority === "B") return 20;
  return 10;
}

function buildMissionNote(parentGoal: string, plan: Plan, step: number, totalSteps: number): string {
  const parts = [`Goal: ${parentGoal}`, `Step ${step}/${totalSteps}`, `Energy: ${plan.energy}`];
  if (plan.why.trim()) parts.push(`Why: ${plan.why.trim()}`);
  return parts.join(" / ");
}

function describePreviewAction(item: MissionPlanPreviewItem): string {
  if (!item.hasConflict) return "This mission will be added to an open recommended slot.";
  if (item.action === "replace") return "This will remove the existing task at this time and use the slot for this mission.";
  if (item.action === "add-after") return "This will keep the existing task and place this mission shortly after it.";
  if (item.action === "move-next") return "This will keep the existing task and move this mission to the next best open slot.";
  if (item.action === "bonus") return "This will add the mission at the same time as a bonus mission.";
  return "This generated mission will not be added.";
}

function mapGoalCategory(goalCategory: GoalCategory): Category {
  if (goalCategory === "Skill") return "Knowledge";
  if (goalCategory === "Health" || goalCategory === "Fun" || goalCategory === "Personal") return "Sunny";
  if (goalCategory === "Cleaning" || goalCategory === "Admin") return "Monitoring";
  return "Plan";
}

function getStats(tasks: Task[]): Stats {
  const completedTasks = tasks.filter((task) => task.completed);
  return {
    points: completedTasks.reduce((total, task) => total + task.points, 0),
    completed: completedTasks.length,
    remaining: tasks.filter((task) => !task.completed && !task.skipped).length
  };
}

function getDayLevel(points: number): string {
  if (points <= 50) return "Survival Day";
  if (points <= 120) return "Basic Control Day";
  if (points <= 220) return "Productive Day";
  if (points <= 350) return "Strong Day";
  return "CEO Mode Day";
}

function getTaskBlock(time: string): string {
  const minutes = timeToMinutes(time);
  if (minutes >= timeToMinutes("5:30 AM") && minutes < timeToMinutes("8:00 AM")) return "Morning Reset";
  if (minutes >= timeToMinutes("8:00 AM") && minutes < timeToMinutes("1:30 PM")) return "Main Mission Block";
  if (minutes >= timeToMinutes("1:30 PM") && minutes < timeToMinutes("6:30 PM")) return "Afternoon Growth Block";
  if (minutes >= timeToMinutes("6:30 PM") && minutes < timeToMinutes("10:00 PM")) return "Evening Control Block";
  return "Night Shutdown";
}

function timeNeededToMinutes(value: TimeNeeded): number {
  if (value === "15 min") return 15;
  if (value === "30 min") return 30;
  if (value === "2 hours") return 120;
  if (value === "3 hours") return 180;
  return 60;
}

function durationToMinutes(value: string): number {
  if (value === "30 min") return 30;
  if (value === "2 hours") return 120;
  if (value === "3 hours") return 180;
  return 60;
}

function shiftTime(time: string, offsetMinutes: number): string {
  return minutesToTime(timeToMinutes(time) + offsetMinutes);
}

function timeToInputValue(time: string): string {
  const minutes = timeToMinutes(time);
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function inputValueToTime(value: string): string {
  const [hourRaw, minuteRaw] = value.split(":").map(Number);
  if (Number.isNaN(hourRaw) || Number.isNaN(minuteRaw)) return "5:30 AM";
  return minutesToTime(hourRaw * 60 + minuteRaw);
}

function timeToMinutes(time: string): number {
  const [clock, meridiem] = time.split(" ");
  const [rawHour, rawMinute] = clock.split(":").map(Number);
  const hour = meridiem === "PM" && rawHour !== 12 ? rawHour + 12 : meridiem === "AM" && rawHour === 12 ? 0 : rawHour;
  return hour * 60 + rawMinute;
}

function minutesToTime(totalMinutes: number): string {
  const normalized = (totalMinutes + 1440) % 1440;
  const hour24 = Math.floor(normalized / 60);
  const minute = normalized % 60;
  const meridiem = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 || 12;
  return `${hour12}:${String(minute).padStart(2, "0")} ${meridiem}`;
}

function getCurrentDateKey(): string {
  if (typeof window !== "undefined") {
    const queryDate = new URLSearchParams(window.location.search).get("date");
    if (queryDate && /^\d{4}-\d{2}-\d{2}$/.test(queryDate)) return queryDate;
    const override = safeGetLocalStorageItem(DATE_OVERRIDE_KEY);
    if (override && /^\d{4}-\d{2}-\d{2}$/.test(override)) return override;
  }
  return getDateKey(new Date());
}

function getDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getNextDateKey(dateKey: string): string {
  return getDateKey(addDays(parseDateKey(dateKey), 1));
}

function getPreviousDateKey(dateKey: string): string {
  return getDateKey(addDays(parseDateKey(dateKey), -1));
}

function parseDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function formatLongDate(date: Date): string {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  }).format(date);
}
