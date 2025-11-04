import { create } from 'zustand';
import {
  Schedule,
  TimeSlot,
  ScheduleAnalysis,
  ViewType,
  SuggestionType,
} from '../types';
import {
  findConflicts,
  findGaps,
  sortTimeSlots,
  calculateDuration,
} from '../utils/time-utils';

interface ScheduleState {
  schedules: Schedule[];
  currentSchedule: Schedule | null;
  currentView: ViewType;
  selectedDate: Date;

  createSchedule: (name: string) => void;
  updateSchedule: (id: string, updates: Partial<Omit<Schedule, 'id'>>) => void;
  deleteSchedule: (id: string) => void;
  setCurrentSchedule: (id: string) => void;

  addTimeSlot: (timeSlot: Omit<TimeSlot, 'id'>) => void;
  updateTimeSlot: (id: string, updates: Partial<Omit<TimeSlot, 'id'>>) => void;
  deleteTimeSlot: (id: string) => void;

  setCurrentView: (view: ViewType) => void;
  setSelectedDate: (date: Date) => void;

  analyzeCurrentSchedule: () => ScheduleAnalysis | null;
  
  // Новые методы для работы с localStorage
  loadFromLocalStorage: () => void;
  clearLocalStorage: () => void;
}

// Ключ для localStorage
const LOCAL_STORAGE_KEY = 'schedule-builder-data';

// Функция для загрузки из localStorage
const loadSchedulesFromLocalStorage = (): Schedule[] => {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      
      // Валидация и преобразование дат
      return data.map((schedule: any) => ({
        ...schedule,
        createdAt: schedule.createdAt || new Date().toISOString(),
        updatedAt: schedule.updatedAt || new Date().toISOString(),
        timeSlots: schedule.timeSlots || [],
      }));
    }
  } catch (error) {
    console.error('Error loading from localStorage:', error);
  }
  return [];
};

// Функция для сохранения в localStorage
const saveSchedulesToLocalStorage = (schedules: Schedule[]) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(schedules));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

export const useScheduleStore = create<ScheduleState>((set, get) => ({
  schedules: [],
  currentSchedule: null,
  currentView: ViewType.WEEK,
  selectedDate: new Date(),

  // Загрузка данных при инициализации store
  loadFromLocalStorage: () => {
    const schedules = loadSchedulesFromLocalStorage();
    set({
      schedules,
      currentSchedule: schedules.length > 0 ? schedules[0] : null,
    });
  },

  clearLocalStorage: () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    set({
      schedules: [],
      currentSchedule: null,
    });
  },

  createSchedule: (name: string) => {
    const newSchedule: Schedule = {
      id: `schedule-${Date.now()}`,
      name,
      timeSlots: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    set((state) => {
      const newSchedules = [...state.schedules, newSchedule];
      // Сохраняем в localStorage после обновления состояния
      saveSchedulesToLocalStorage(newSchedules);
      return {
        schedules: newSchedules,
        currentSchedule: newSchedule,
      };
    });
  },

  updateSchedule: (id: string, updates: Partial<Omit<Schedule, 'id'>>) => {
    set((state) => {
      const newSchedules = state.schedules.map((schedule) =>
        schedule.id === id
          ? {
              ...schedule,
              ...updates,
              updatedAt: new Date().toISOString(),
            }
          : schedule,
      );

      const newCurrentSchedule =
        state.currentSchedule?.id === id
          ? {
              ...state.currentSchedule,
              ...updates,
              updatedAt: new Date().toISOString(),
            }
          : state.currentSchedule;

      // Сохраняем в localStorage после обновления состояния
      saveSchedulesToLocalStorage(newSchedules);

      return {
        schedules: newSchedules,
        currentSchedule: newCurrentSchedule,
      };
    });
  },

  deleteSchedule: (id: string) => {
    set((state) => {
      const newSchedules = state.schedules.filter(
        (schedule) => schedule.id !== id,
      );
      let newCurrentSchedule = state.currentSchedule;

      if (state.currentSchedule?.id === id) {
        newCurrentSchedule = newSchedules.length > 0 ? newSchedules[0] : null;
      }

      // Сохраняем в localStorage после обновления состояния
      saveSchedulesToLocalStorage(newSchedules);

      return {
        schedules: newSchedules,
        currentSchedule: newCurrentSchedule,
      };
    });
  },

  setCurrentSchedule: (id: string) => {
    set((state) => ({
      currentSchedule:
        state.schedules.find((schedule) => schedule.id === id) || null,
    }));
  },

  addTimeSlot: (timeSlot: Omit<TimeSlot, 'id'>) => {
    const newTimeSlot: TimeSlot = {
      id: `time-slot-${Date.now()}`,
      ...timeSlot,
    };

    set((state) => {
      if (!state.currentSchedule) return state;

      const updatedSchedule = {
        ...state.currentSchedule,
        timeSlots: [...state.currentSchedule.timeSlots, newTimeSlot],
        updatedAt: new Date().toISOString(),
      };

      const newSchedules = state.schedules.map((schedule) =>
        schedule.id === updatedSchedule.id ? updatedSchedule : schedule,
      );

      // Сохраняем в localStorage после обновления состояния
      saveSchedulesToLocalStorage(newSchedules);

      return {
        schedules: newSchedules,
        currentSchedule: updatedSchedule,
      };
    });
  },

  updateTimeSlot: (id: string, updates: Partial<Omit<TimeSlot, 'id'>>) => {
    set((state) => {
      if (!state.currentSchedule) return state;

      const updatedTimeSlots = state.currentSchedule.timeSlots.map((slot) =>
        slot.id === id ? { ...slot, ...updates } : slot,
      );

      const updatedSchedule = {
        ...state.currentSchedule,
        timeSlots: updatedTimeSlots,
        updatedAt: new Date().toISOString(),
      };

      const newSchedules = state.schedules.map((schedule) =>
        schedule.id === updatedSchedule.id ? updatedSchedule : schedule,
      );

      // Сохраняем в localStorage после обновления состояния
      saveSchedulesToLocalStorage(newSchedules);

      return {
        schedules: newSchedules,
        currentSchedule: updatedSchedule,
      };
    });
  },

  deleteTimeSlot: (id: string) => {
    set((state) => {
      if (!state.currentSchedule) return state;

      const updatedTimeSlots = state.currentSchedule.timeSlots.filter(
        (slot) => slot.id !== id,
      );

      const updatedSchedule = {
        ...state.currentSchedule,
        timeSlots: updatedTimeSlots,
        updatedAt: new Date().toISOString(),
      };

      const newSchedules = state.schedules.map((schedule) =>
        schedule.id === updatedSchedule.id ? updatedSchedule : schedule,
      );

      // Сохраняем в localStorage после обновления состояния
      saveSchedulesToLocalStorage(newSchedules);

      return {
        schedules: newSchedules,
        currentSchedule: updatedSchedule,
      };
    });
  },

  setCurrentView: (view: ViewType) => {
    set({ currentView: view });
  },

  setSelectedDate: (date: Date) => {
    set({ selectedDate: date });
  },

  analyzeCurrentSchedule: () => {
    const { currentSchedule } = get();

    if (!currentSchedule) return null;

    const sortedTimeSlots = sortTimeSlots(currentSchedule.timeSlots);

    const conflicts = findConflicts(currentSchedule.timeSlots);
    const gaps = findGaps(sortedTimeSlots);

    let totalScheduledTime = 0;
    for (const slot of currentSchedule.timeSlots) {
      totalScheduledTime += calculateDuration(slot.startTime, slot.endTime);
    }

    const totalAvailableTime = 24 * 60;
    const utilization =
      totalScheduledTime > 0
        ? Math.min(100, (totalScheduledTime / totalAvailableTime) * 100)
        : 0;

    const suggestions = [
      ...gaps
        .filter((gap) => gap.duration >= 30)
        .map((gap) => ({
          id: `suggestion-fill-${gap.id}`,
          type: SuggestionType.FILL_GAP,
          description: `You have free time between ${gap.startTime} and ${gap.endTime}. What are you planning to do?`,
          affectedSlots: [],
        })),

      ...conflicts.map((conflict) => ({
        id: `suggestion-conflict-${conflict.id}`,
        type: SuggestionType.RESOLVE_CONFLICT,
        description: `Conflict between "${conflict.slotA.title}" and "${conflict.slotB.title}" for ${conflict.overlapDuration} minutes.`,
        affectedSlots: [conflict.slotA, conflict.slotB],
      })),

      ...(currentSchedule.timeSlots.length > 10
        ? [
            {
              id: 'suggestion-too-many',
              type: SuggestionType.OPTIMIZE_TIME,
              description:
                'Your schedule may be too packed. Consider consolidating similar activities.',
              affectedSlots: [],
            },
          ]
        : []),

      ...(currentSchedule.timeSlots.length < 3 &&
      currentSchedule.timeSlots.length > 0
        ? [
            {
              id: 'suggestion-too-few',
              type: SuggestionType.OPTIMIZE_TIME,
              description:
                'You have plenty of free time. Maybe it\'s time to fill it with something?',
              affectedSlots: [],
            },
          ]
        : []),
    ];

    return {
      conflicts,
      utilization,
      gaps,
      suggestions,
    };
  },
}));
