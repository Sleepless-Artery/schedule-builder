export type TimeSlot = {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  date: string;
  category: Category;
  description?: string;
  location?: string;
  isRecurring?: boolean;
  recurringDays?: number[];
  priority?: Priority;
};

export type Schedule = {
  id: string;
  name: string;
  timeSlots: TimeSlot[];
  createdAt: string;
  updatedAt: string;
  viewType: ViewType;
  targetDate: string;
};

export type ScheduleAnalysis = {
  conflicts: ScheduleConflict[];
  utilization: number;
  gaps: TimeGap[];
  suggestions: Suggestion[];
  _debug?: {
    totalScheduledMinutes: number;
    totalAvailableMinutes: number;
    view: ViewType;
  };
};

export type ScheduleConflict = {
  id: string;
  slotA: TimeSlot;
  slotB: TimeSlot;
  overlapDuration: number;
};

export type TimeGap = {
  id: string;
  startTime: string;
  endTime: string;
  duration: number;
};

export type Suggestion = {
  id: string;
  type: SuggestionType;
  description: string;
  affectedSlots: TimeSlot[];
};

export enum SuggestionType {
  MERGE_SIMILAR = 'merge_similar',
  FILL_GAP = 'fill_gap',
  RESOLVE_CONFLICT = 'resolve_conflict',
  OPTIMIZE_TIME = 'optimize_time',
}

export enum Category {
  WORK = 'work',
  STUDY = 'study',
  PERSONAL = 'personal',
  HEALTH = 'health',
  LEISURE = 'leisure',
  OTHER = 'other',
}

export enum Priority {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

export enum ViewType {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  CUSTOM = 'custom',
}

export type TimeRange = {
  start: Date;
  end: Date;
};

export type User = {
  id: string;
  name: string;
  email: string;
  preferences: UserPreferences;
  schedules: Schedule[];
};

export type UserPreferences = {
  darkMode: boolean;
  defaultView: ViewType;
  startOfWeek: number;
  workingHours: {
    start: string;
    end: string;
  };
};
