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
type SectionId = "Dashboard" | "Today Task List" | "Plan Tomorrow" | "Evening Review" | "More" | "Command Center" | "History" | "Analytics" | "Template Editor" | "Settings";
type BuildDayType = "Normal Day" | "Late Wake Day" | "Night Shift Day" | "Recovery Day" | "Appointment / Busy Day" | "Custom Day";
type BuildEnergy = Energy | "Very Low";

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

type DayMeta = {
  dayType: BuildDayType | "Default Day";
  wakeTime?: string;
  startTime?: string;
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
  todayMode: DailyMode;
  mainMission: string;
  tasks: Task[];
};

const TASKS_KEY_PREFIX = "kpm-sunny-tasks";
const TOMORROW_KEY_PREFIX = "kpm-sunny-tomorrow-tasks";
const SETTINGS_KEY = "kpm-sunny-settings";
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
const APP_VERSION = "V1.9";
const APP_LAST_UPDATED = "June 14, 2026";

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
  { id: "Dashboard", label: "Today Command", mobile: "Home", icon: LayoutDashboard },
  { id: "Today Task List", label: "Today's Missions", mobile: "Today", icon: ListChecks },
  { id: "Plan Tomorrow", label: "Plan Tomorrow", mobile: "Tomorrow", icon: Target },
  { id: "Evening Review", label: "Evening Review", mobile: "Review", icon: Moon },
  { id: "More", label: "More", mobile: "More", icon: Settings },
  { id: "Command Center", label: "Command Center", mobile: "Command", icon: BarChart3 },
  { id: "History", label: "History", mobile: "History", icon: History },
  { id: "Analytics", label: "Analytics", mobile: "Stats", icon: BarChart3 },
  { id: "Template Editor", label: "Default Schedule Template", mobile: "Template", icon: Pencil },
  { id: "Settings", label: "Settings", mobile: "Settings", icon: Settings }
];
const mobileNavItems = navItems.filter((item) => ["Dashboard", "Today Task List", "Plan Tomorrow", "Evening Review", "More"].includes(item.id));

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
  const [dailyNotes, setDailyNotes] = useState("");
  const [review, setReview] = useState<Review>(defaultReview);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [todayMode, setTodayMode] = useState<DailyMode>("Full Day");
  const [selectedTodayMode, setSelectedTodayMode] = useState<DailyMode>("Full Day");
  const [tomorrowMode, setTomorrowMode] = useState<DailyMode>("Full Day");
  const [dayMeta, setDayMeta] = useState<DayMeta>(defaultDayMeta);
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
      const loadedHistory = readStorage<HistoryEntry[]>(HISTORY_KEY, []);
      const lastActiveDate = safeGetLocalStorageItem(LAST_ACTIVE_DATE_KEY);
      let nextHistory = loadedHistory;

      if (lastActiveDate && lastActiveDate !== currentDate) {
        const previousTasks = readStorage<Task[]>(`${TASKS_KEY_PREFIX}:${lastActiveDate}`, []);
        const previousReview = normalizeReview(readStorage<Partial<Review>>(`${REVIEW_KEY}:${lastActiveDate}`, defaultReview));
        const previousDailyNotes = readStorage<string>(`${DAILY_NOTES_KEY_PREFIX}:${lastActiveDate}`, "");
        const previousMode = readMode(`${MODE_KEY_PREFIX}:${lastActiveDate}`, "Full Day");
        if (previousTasks.length > 0) {
          nextHistory = upsertHistoryEntry(loadedHistory, createHistoryEntry(lastActiveDate, previousTasks, previousReview, previousMode, previousDailyNotes));
          writeStorage(HISTORY_KEY, nextHistory);
        }
      }

      const carriedTasks = readStorage<Task[]>(`${TOMORROW_KEY_PREFIX}:${currentDate}`, []);
      const carriedMode = readMode(`${TOMORROW_MODE_KEY_PREFIX}:${currentDate}`, loadedTodayMode);
      const storedTodayTasks = readStorage<Task[]>(`${TASKS_KEY_PREFIX}:${currentDate}`, []);
      const loadedDayMeta = normalizeDayMeta(readStorage<Partial<DayMeta>>(`${DAY_META_KEY_PREFIX}:${currentDate}`, { ...defaultDayMeta, todayMode: carriedMode }));
      const nextTodayTasks = storedTodayTasks.length > 0
        ? mergeSchedule(storedTodayTasks, loadedDefaultTasks)
        : carriedTasks.length > 0
          ? resetTaskStatuses(mergeSchedule(carriedTasks, loadedDefaultTasks))
          : buildModeSchedule(loadedDefaultTasks, carriedMode);

      const nextTomorrowKey = getNextDateKey(currentDate);
      const loadedPlan = normalizePlan(readStorage<Partial<Plan>>(`${PLAN_KEY}:${nextTomorrowKey}`, defaultPlan));
      const loadedTomorrowMode = readMode(`${TOMORROW_MODE_KEY_PREFIX}:${nextTomorrowKey}`, loadedPlan.tomorrowMode);
      const storedTomorrowTasks = readStorage<Task[]>(`${TOMORROW_KEY_PREFIX}:${nextTomorrowKey}`, buildModeSchedule(loadedDefaultTasks, loadedTomorrowMode));

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
      setBuildTodayDraft({ ...defaultBuildTodayDraft, todayMode: carriedMode, wakeTime: loadedDayMeta.wakeTime ?? "5:30 AM", startTime: loadedDayMeta.startTime ?? "5:30 AM" });
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
      const carriedTasks = readStorage<Task[]>(`${TOMORROW_KEY_PREFIX}:${currentDate}`, []);
      const carriedMode = readMode(`${TOMORROW_MODE_KEY_PREFIX}:${currentDate}`, "Full Day");
      const nextTodayTasks = carriedTasks.length > 0
        ? resetTaskStatuses(mergeSchedule(carriedTasks, nextDefaultTasks))
        : buildModeSchedule(nextDefaultTasks, carriedMode);
      const nextTomorrowKey = getNextDateKey(currentDate);
      const nextPlan = normalizePlan(readStorage<Partial<Plan>>(`${PLAN_KEY}:${nextTomorrowKey}`, defaultPlan));
      const nextTomorrowMode = readMode(`${TOMORROW_MODE_KEY_PREFIX}:${nextTomorrowKey}`, nextPlan.tomorrowMode);

      writeStorage(HISTORY_KEY, nextHistory);
      writeStorage(`${TASKS_KEY_PREFIX}:${currentDate}`, nextTodayTasks);
      writeStorage(`${MODE_KEY_PREFIX}:${currentDate}`, carriedMode);
      safeSetLocalStorageItem(LAST_ACTIVE_DATE_KEY, currentDate);
      setTodayKey(currentDate);
      setTasks(nextTodayTasks);
      setTomorrowTasks(readStorage<Task[]>(`${TOMORROW_KEY_PREFIX}:${nextTomorrowKey}`, buildModeSchedule(nextDefaultTasks, nextTomorrowMode)));
      setPlan(nextPlan);
      setReview(normalizeReview(readStorage<Partial<Review>>(`${REVIEW_KEY}:${currentDate}`, defaultReview)));
      setDailyNotes(readStorage<string>(`${DAILY_NOTES_KEY_PREFIX}:${currentDate}`, ""));
      setHistory(nextHistory);
      setTodayMode(carriedMode);
      setSelectedTodayMode(carriedMode);
      setTomorrowMode(nextTomorrowMode);
      setDayMeta({ ...defaultDayMeta, todayMode: carriedMode });
      setBuildTodayPreview(null);
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

  const stats = useMemo(() => getStats(tasks), [tasks]);
  const dayLevel = getDayLevel(stats.points);
  const nextTask = useMemo(() => getCurrentMission(tasks), [tasks]);
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
  }

  function clearAllLocalData() {
    if (!window.confirm("This deletes all local data on this device. Clear all KPM Sunny Daily OS data?")) return;
    clearKpmLocalData();
    setSettings(defaultSettings);
    const originalTemplate = createOriginalTemplate();
    setTemplateTasks(originalTemplate);
    setTodayMode("Full Day");
    setSelectedTodayMode("Full Day");
    setTomorrowMode("Full Day");
    setDayMeta(defaultDayMeta);
    setTasks(buildModeSchedule(buildSchedule(originalTemplate, false), "Full Day"));
    setTomorrowTasks(buildModeSchedule(buildSchedule(originalTemplate, false), "Full Day"));
    setPlan(defaultPlan);
    setMissionPreview([]);
    setReview(defaultReview);
    setHistory([]);
    safeSetLocalStorageItem(LAST_ACTIVE_DATE_KEY, getCurrentDateKey());
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
      version: "1.9",
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
    setTasks(buildModeSchedule(defaultTasks, mode));
    setReview(defaultReview);
    setQuickStartMessage("Today's missions are ready.");
  }

  function createBuildTodayPreview(nextDraft: BuildTodayDraft) {
    const preview = buildTodayPlan(nextDraft, defaultTasks);
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
      todayMode: buildTodayPreview.todayMode,
      mainMission: buildTodayPreview.mainMission
    });
    setReview(defaultReview);
    setBuildTodayPreview(null);
    setQuickStartMessage("Today's missions are ready.");
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
    <div className="sunny-mobile-shell min-h-screen overflow-x-hidden bg-[#05070d] text-slate-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(245,158,11,0.18),transparent_28%),radial-gradient(circle_at_82%_18%,rgba(16,185,129,0.13),transparent_24%),linear-gradient(135deg,#05070d_0%,#09111f_48%,#02030a_100%)]" />
      {!isOnline ? <OfflineBanner /> : null}
      <div className={`app-shell relative grid min-h-screen min-w-0 max-w-full lg:grid-cols-[230px_minmax(0,1fr)] ${activeSection === "Dashboard" ? "" : "with-right-panel 2xl:grid-cols-[230px_minmax(0,1fr)_300px]"}`}>
        <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />

        <main className="sunny-main min-w-0 max-w-full overflow-x-hidden px-4 pb-[calc(7rem+env(safe-area-inset-bottom))] pt-[calc(1rem+env(safe-area-inset-top))] sm:px-6 lg:px-5 lg:pb-8 lg:pt-5 xl:px-6">
          <CommandHeader stats={stats} dayLevel={dayLevel} activeSection={activeSection} todayKey={todayKey} />
          {activeSection !== "Dashboard" ? <MobilePriorityPanel stats={stats} dayLevel={dayLevel} mainMission={mainMission} nextTask={nextTask} /> : null}

          <div className="mt-6">
            {activeSection === "Dashboard" && (
              <div className="grid gap-5">
                <BuildToday
                  draft={buildTodayDraft}
                  setDraft={setBuildTodayDraft}
                  preview={buildTodayPreview}
                  createPreview={createBuildTodayPreview}
                  applyPreview={applyBuildTodayPreview}
                  cancelPreview={() => setBuildTodayPreview(null)}
                />
                <TodayCommand
                  stats={stats}
                  currentMission={nextTask}
                  mainMission={mainMission}
                  todayMode={todayMode}
                  dayMeta={dayMeta}
                  tasks={tasks}
                  updateTask={updateTask}
                  snoozeTask={snoozeTask}
                  startMission={(id) => setActiveFocusTaskId(id)}
                  setActiveSection={setActiveSection}
                />
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
    <div className="min-h-screen overflow-hidden bg-[#05070d] text-slate-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(245,158,11,0.18),transparent_28%),radial-gradient(circle_at_82%_18%,rgba(16,185,129,0.13),transparent_24%),linear-gradient(135deg,#05070d_0%,#09111f_48%,#02030a_100%)]" />
      <main className="relative flex min-h-screen items-center justify-center px-5">
        <section className="w-full max-w-md rounded-[1.75rem] border border-amber-300/20 bg-white/[0.06] p-6 text-center shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 to-orange-500 text-slate-950 shadow-[0_0_40px_rgba(245,158,11,0.24)]">
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
    <div className="min-h-screen overflow-hidden bg-[#05070d] text-slate-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(245,158,11,0.18),transparent_28%),radial-gradient(circle_at_82%_18%,rgba(16,185,129,0.13),transparent_24%),linear-gradient(135deg,#05070d_0%,#09111f_48%,#02030a_100%)]" />
      <main className="relative flex min-h-screen items-center justify-center px-5 py-8">
        <section className="w-full max-w-lg rounded-[1.75rem] border border-amber-300/20 bg-white/[0.06] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 to-orange-500 text-slate-950 shadow-[0_0_40px_rgba(245,158,11,0.24)]">
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
    <aside className="sticky top-0 hidden h-screen w-[230px] min-w-0 border-r border-white/10 bg-black/25 p-4 backdrop-blur-xl lg:block">
      <div className="flex h-full flex-col">
        <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4 shadow-[0_0_40px_rgba(245,158,11,0.12)]">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-300 to-orange-500 text-slate-950">
            <Sun size={24} />
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-200">Daily OS</p>
          <h1 className="mt-1 break-words text-xl font-black leading-tight">KPM Sunny Daily OS</h1>
        </div>

        <nav className="mt-7 grid gap-2">
          {navItems.map((item) => (
            <NavButton
              key={item.id}
              item={item}
              active={activeSection === item.id}
              onClick={() => setActiveSection(item.id)}
            />
          ))}
        </nav>

        <div className="mt-auto rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm font-bold text-slate-200">Command posture</p>
          <p className="mt-2 text-sm leading-6 text-slate-400">Clear one mission, then the next. Calm focus beats chaos.</p>
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
      className={`flex min-h-12 items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-bold transition ${
        active
          ? "bg-gradient-to-r from-amber-300 to-orange-500 text-slate-950 shadow-[0_14px_32px_rgba(245,158,11,0.25)]"
          : "bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] hover:text-white"
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
      <div className="grid grid-cols-5 gap-1">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const active = activeSection === item.id || (item.id === "More" && ["Command Center", "History", "Analytics", "Template Editor", "Settings"].includes(activeSection));
          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`sunny-bottom-nav-button flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl text-[11px] font-bold ${
                active ? "bg-amber-300 text-slate-950" : "text-slate-400"
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

function CommandHeader({ stats, dayLevel, activeSection, todayKey }: { stats: Stats; dayLevel: string; activeSection: SectionId; todayKey: string }) {
  const pageTitle = navItems.find((item) => item.id === activeSection)?.label || "Dashboard";
  return (
    <header className="sunny-command-header min-w-0 rounded-[1.5rem] border border-white/10 bg-white/[0.06] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:rounded-[1.75rem] sm:p-5 xl:p-6">
      <div className="flex min-w-0 flex-col gap-4 sm:gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <ArtImage
            src={artPaths.sunnyMascot}
            alt="Sunny mascot"
            className="hidden h-16 w-16 shrink-0 rounded-full object-cover ring-2 ring-amber-300/50 shadow-[0_0_34px_rgba(251,191,36,0.30)] sm:block"
            fallback={<span className="sunny-face hidden shrink-0 sm:inline-flex" aria-hidden="true">☀</span>}
          />
          <div className="min-w-0">
          <div className="sunny-date-row flex flex-wrap items-center gap-2 text-sm font-bold text-amber-200">
            <ArtImage
              src={artPaths.sunnyMascot}
              alt="Sunny mascot"
              className="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-amber-300/50 shadow-[0_0_30px_rgba(251,191,36,0.25)] sm:hidden"
              fallback={<span className="sunny-face shrink-0 sm:hidden" aria-hidden="true">☀</span>}
            />
            <CalendarDays size={17} />
            {formatLongDate(parseDateKey(todayKey))}
          </div>
          <h2 className="sunny-page-title mt-2 break-words text-2xl font-black tracking-tight text-white sm:mt-3 lg:text-4xl 2xl:text-5xl">{pageTitle}</h2>
          <p className="mt-1 text-sm text-slate-400 sm:mt-2 sm:text-lg">Personal life command center for today's missions.</p>
          </div>
        </div>
        <div className="grid min-w-0 gap-3 sm:grid-cols-[auto_minmax(0,1fr)_minmax(0,1fr)] xl:w-auto xl:max-w-[360px]">
          <ArtImage
            src={artPaths.avatar}
            alt="User avatar"
            className="hidden h-20 w-20 rounded-full border border-amber-300/35 object-cover shadow-[0_0_30px_rgba(251,191,36,0.18)] sm:block"
            fallback={<div className="hidden h-20 w-20 items-center justify-center rounded-full border border-amber-300/35 bg-black/30 text-2xl font-black text-amber-100 sm:flex">K</div>}
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
    <div className="min-w-0 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4">
      <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-amber-200">
        <Icon size={15} />
        {label}
      </div>
      <p className="break-words text-xl font-black text-white 2xl:text-2xl">{value}</p>
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
    <div className="min-h-screen overflow-x-hidden bg-[#05070d] px-4 py-6 text-slate-100 sm:px-6">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(245,158,11,0.18),transparent_28%),radial-gradient(circle_at_82%_18%,rgba(16,185,129,0.13),transparent_24%),linear-gradient(135deg,#05070d_0%,#09111f_48%,#02030a_100%)]" />
      <main className="relative mx-auto grid min-h-[calc(100vh-3rem)] max-w-5xl place-items-center">
        <Panel>
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 to-orange-500 text-slate-950 shadow-[0_0_40px_rgba(245,158,11,0.24)]">
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
  cancelPreview
}: {
  draft: BuildTodayDraft;
  setDraft: Dispatch<SetStateAction<BuildTodayDraft>>;
  preview: BuildTodayPreview | null;
  createPreview: (draft: BuildTodayDraft) => void;
  applyPreview: () => void;
  cancelPreview: () => void;
}) {
  const [flow, setFlow] = useState<"Normal" | "Special">(draft.dayType === "Normal Day" ? "Normal" : "Special");
  const fieldClass = "min-h-12 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-semibold text-slate-100 outline-none focus:border-amber-300/60";

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
            className={`rounded-[1.35rem] border p-4 text-left transition ${flow === "Normal" ? "border-amber-300/70 bg-amber-300/[0.14]" : "border-white/10 bg-white/[0.04] hover:border-amber-300/30"}`}
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
            className={`rounded-[1.35rem] border p-4 text-left transition ${flow === "Special" ? "border-teal-300/60 bg-teal-300/[0.10]" : "border-white/10 bg-white/[0.04] hover:border-teal-300/30"}`}
          >
            <p className="text-xl font-black text-white">Special Day</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">Late wake, night shift, recovery, appointment, or custom day.</p>
          </button>
        </div>

        <div className="mt-5 grid gap-4 rounded-[1.35rem] border border-white/10 bg-black/20 p-4">
          {flow === "Normal" ? (
            <div className="grid gap-4 md:grid-cols-3">
              <label className="grid gap-2 text-sm font-bold text-slate-300">
                What time did you wake up today?
                <input type="time" value={timeToInputValue(draft.wakeTime)} onChange={(event) => updateDraft({ wakeTime: inputValueToTime(event.target.value), startTime: inputValueToTime(event.target.value), dayType: "Normal Day" })} className={fieldClass} />
              </label>
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

          <button type="button" onClick={() => createPreview({ ...draft, dayType: flow === "Normal" ? "Normal Day" : draft.dayType })} className="primary-button justify-center">
            Build Today Preview
            <ChevronRight size={18} />
          </button>
        </div>
      </Panel>

      {preview ? (
        <Panel className="border-teal-300/25 bg-teal-300/[0.06]">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-teal-200">Today Plan Preview</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge tone="gold">{preview.dayType}</Badge>
            <Badge tone="dark">Start: {preview.startTime}</Badge>
            <Badge tone="dark">Wake: {preview.wakeTime}</Badge>
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
            <button type="button" onClick={cancelPreview} className="secondary-button justify-center">Edit</button>
            <button type="button" onClick={cancelPreview} className="secondary-button justify-center">Cancel</button>
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
  todayMode,
  dayMeta,
  tasks,
  updateTask,
  snoozeTask,
  startMission,
  setActiveSection
}: {
  stats: Stats;
  currentMission?: Task;
  mainMission?: Task;
  todayMode: DailyMode;
  dayMeta: DayMeta;
  tasks: Task[];
  updateTask: (id: string, patch: Partial<Task>) => void;
  snoozeTask: (id: string) => void;
  startMission: (id: string) => void;
  setActiveSection: Dispatch<SetStateAction<SectionId>>;
}) {
  const nextMissions = tasks
    .filter((task) => !task.completed && !task.skipped && task.id !== currentMission?.id)
    .sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time))
    .slice(0, 3);

  const mainMissionStatus = getMainMissionStatus(mainMission);

  return (
    <section className="grid gap-5">
      <Panel className="border-amber-300/25 bg-[linear-gradient(135deg,rgba(251,191,36,0.12),rgba(255,255,255,0.045))]">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-black uppercase tracking-[0.2em] text-amber-200">Current Mission</p>
              <Badge tone="gold">{todayMode} Mode</Badge>
              <Badge tone="dark">{dayMeta.dayType}</Badge>
              {dayMeta.startTime ? <Badge tone="dark">Start {dayMeta.startTime}</Badge> : null}
              {dayMeta.wakeTime ? <Badge tone="dark">Wake {dayMeta.wakeTime}</Badge> : null}
            </div>
            {currentMission ? (
              <>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Badge tone="gold">{currentMission.time}</Badge>
                  <Badge tone={currentMission.category}>{currentMission.category}</Badge>
                  <Badge tone={currentMission.priority === "S" ? "gold" : "dark"}>{currentMission.priority}-Tier</Badge>
                  <Badge tone="dark">{currentMission.points} KPM</Badge>
                </div>
                <h2 className="mt-4 break-words text-3xl font-black leading-tight text-white sm:text-4xl xl:text-5xl">{currentMission.title}</h2>
                <p className="mt-3 max-w-3xl text-base leading-7 text-slate-300">{getMissionReason(currentMission)}</p>
              </>
            ) : (
              <>
                <h2 className="mt-3 text-3xl font-black leading-tight text-white sm:text-4xl">All missions cleared.</h2>
                <p className="mt-3 text-base leading-7 text-slate-300">Go to Evening Review and close the day cleanly.</p>
              </>
            )}
          </div>

          {currentMission ? (
            <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:w-[360px] xl:grid-cols-1">
              <button type="button" onClick={() => startMission(currentMission.id)} className="primary-button">
                <Target size={18} />
                Start Mission
              </button>
              <button type="button" onClick={() => updateTask(currentMission.id, { completed: true, skipped: false })} className="primary-button">
                <CheckCircle2 size={18} />
                Done
              </button>
              <button type="button" onClick={() => updateTask(currentMission.id, { skipped: true, completed: false })} className="secondary-button border-orange-300/25 text-orange-100">
                <X size={18} />
                Skip
              </button>
              <button type="button" onClick={() => snoozeTask(currentMission.id)} className="secondary-button">
                <Clock3 size={18} />
                Snooze 15 min
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => setActiveSection("Evening Review")} className="primary-button xl:min-w-64">
              Evening Review
              <ChevronRight size={18} />
            </button>
          )}
        </div>
      </Panel>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)]">
        <Panel>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-black uppercase tracking-[0.2em] text-amber-200">Today&apos;s Main Mission</p>
              <h3 className="mt-2 break-words text-2xl font-black leading-tight text-white sm:text-3xl">{mainMission?.title ?? "No main mission set"}</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge tone={mainMissionStatus === "Done" ? "green" : "gold"}>{mainMissionStatus}</Badge>
                {mainMission ? <Badge tone="dark">{mainMission.time}</Badge> : null}
                {mainMission ? <Badge tone={mainMission.category}>{mainMission.category}</Badge> : null}
              </div>
            </div>
            {mainMission ? (
              <button type="button" onClick={() => updateTask(mainMission.id, { completed: true, skipped: false })} className="primary-button sm:min-w-56">
                <Check size={18} />
                Mark main mission done
              </button>
            ) : null}
          </div>
        </Panel>

        <Panel>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-amber-200">Simple Progress</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <MiniMetric label="Completed" value={stats.completed} />
            <MiniMetric label="Remaining" value={stats.remaining} />
            <MiniMetric label="KPM Score" value={stats.points} />
          </div>
        </Panel>
      </div>

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

      <div className="grid gap-3 sm:grid-cols-3">
        <button type="button" onClick={() => setActiveSection("Today Task List")} className="secondary-button">
          View Full Mission List
        </button>
        <button type="button" onClick={() => setActiveSection("Plan Tomorrow")} className="secondary-button">
          Plan Tomorrow
        </button>
        <button type="button" onClick={() => setActiveSection("Evening Review")} className="secondary-button">
          Evening Review
        </button>
      </div>
    </section>
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
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 to-orange-500 text-slate-950 shadow-[0_12px_28px_rgba(245,158,11,0.18)]">
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
    <div className={`sunny-panel min-w-0 max-w-full rounded-[1.5rem] border border-white/10 bg-white/[0.06] shadow-[0_22px_60px_rgba(0,0,0,0.24)] backdrop-blur-xl ${compact ? "p-4" : "p-5 sm:p-6"} ${className}`}>
      {children}
    </div>
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

function MiniMetric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.06] p-4">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <p className="mt-2 break-words text-2xl font-black text-white">{value}</p>
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

function SelectField({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <Field label={label}>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="form-control">
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </Field>
  );
}

function Badge({ children, tone = "dark" }: { children: ReactNode; tone?: Category | "gold" | "dark" | "green" | "orange" }) {
  const tones: Record<Category | "gold" | "dark" | "green" | "orange", string> = {
    Knowledge: "border-sky-300/25 bg-sky-400/10 text-sky-100",
    Plan: "border-amber-300/30 bg-amber-400/10 text-amber-100",
    Monitoring: "border-violet-300/25 bg-violet-400/10 text-violet-100",
    Sunny: "border-emerald-300/25 bg-emerald-400/10 text-emerald-100",
    gold: "border-amber-300/35 bg-amber-300/15 text-amber-100",
    green: "border-emerald-300/30 bg-emerald-400/10 text-emerald-100",
    orange: "border-orange-300/35 bg-orange-400/10 text-orange-100",
    dark: "border-white/10 bg-white/[0.06] text-slate-300"
  };
  return <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-black ${tones[tone]}`}>{children}</span>;
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

function getCurrentMission(dayTasks: Task[]): Task | undefined {
  const incompleteTasks = dayTasks
    .filter((task) => !task.completed && !task.skipped)
    .sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));
  if (incompleteTasks.length === 0) return undefined;

  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  return incompleteTasks.find((task) => timeToMinutes(task.time) >= nowMinutes) ?? incompleteTasks[0];
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

function normalizeDayMeta(meta: Partial<DayMeta>): DayMeta {
  const dayTypes: Array<DayMeta["dayType"]> = ["Default Day", "Normal Day", "Late Wake Day", "Night Shift Day", "Recovery Day", "Appointment / Busy Day", "Custom Day"];
  return {
    dayType: meta.dayType && dayTypes.includes(meta.dayType) ? meta.dayType : "Default Day",
    wakeTime: meta.wakeTime || "5:30 AM",
    startTime: meta.startTime || meta.wakeTime || "5:30 AM",
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
  const mainMission = draft.mainMission.trim();
  let todayMode: DailyMode = draft.todayMode;
  let tasks: Task[];

  if (dayType === "Normal Day") {
    tasks = applyMainMissionTitle(shiftFlexibleTasks(buildModeSchedule(defaultTasks, todayMode), draft.wakeTime), mainMission);
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

  return {
    dayType,
    wakeTime: draft.wakeTime || startTime,
    startTime,
    todayMode,
    mainMission: mainMission || getMainMissionForDay(tasks)?.title || "",
    tasks: tasks.sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time))
  };
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
