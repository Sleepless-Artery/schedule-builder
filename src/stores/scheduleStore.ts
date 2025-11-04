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
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, differenceInDays } from 'date-fns';


interface ScheduleState {
  schedules: Schedule[];
  currentSchedule: Schedule | null;
  currentView: ViewType;
  selectedDate: Date;

  createSchedule: (name: string, viewType?: ViewType, targetDate?: Date) => void;
  updateSchedule: (id: string, updates: Partial<Omit<Schedule, 'id'>>) => void;
  deleteSchedule: (id: string) => void;
  setCurrentSchedule: (id: string) => void;

  addTimeSlot: (timeSlot: Omit<TimeSlot, 'id'>) => void;
  updateTimeSlot: (id: string, updates: Partial<Omit<TimeSlot, 'id'>>) => void;
  deleteTimeSlot: (id: string) => void;

  setCurrentView: (view: ViewType) => void;
  setSelectedDate: (date: Date) => void;

  analyzeCurrentSchedule: () => ScheduleAnalysis | null;
  
  loadFromLocalStorage: () => void;
  clearLocalStorage: () => void;
}

const LOCAL_STORAGE_KEY = 'schedule-builder-data';

const loadSchedulesFromLocalStorage = (): Schedule[] => {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      
      return data.map((schedule: any) => ({
        ...schedule,
        createdAt: schedule.createdAt || new Date().toISOString(),
        updatedAt: schedule.updatedAt || new Date().toISOString(),
        timeSlots: schedule.timeSlots || [],
        viewType: schedule.viewType || ViewType.DAY,
        targetDate: schedule.targetDate || new Date().toISOString().split('T')[0],
      }));
    }
  } catch (error) {
    console.error('Error loading from localStorage:', error);
  }
  return [];
};

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

  createSchedule: (name: string, viewType?: ViewType, targetDate?: Date) => {
    const state = get();
    const currentView = viewType || state.currentView;
    const currentDate = targetDate || state.selectedDate;
    
    let scheduleTargetDate = currentDate.toISOString().split('T')[0];

    if (currentView === ViewType.WEEK) {

      scheduleTargetDate = currentDate.toISOString().split('T')[0];
    } else if (currentView === ViewType.MONTH) {
      scheduleTargetDate = currentDate.toISOString().split('T')[0];
    }

    const newSchedule: Schedule = {
      id: `schedule-${Date.now()}`,
      name,
      timeSlots: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      viewType: currentView,
      targetDate: scheduleTargetDate,
    };

    set((state) => {
      const newSchedules = [...state.schedules, newSchedule];
      saveSchedulesToLocalStorage(newSchedules);
      return {
        schedules: newSchedules,
        currentSchedule: newSchedule,
        currentView: currentView,
        selectedDate: currentDate,
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

      saveSchedulesToLocalStorage(newSchedules);

      return {
        schedules: newSchedules,
        currentSchedule: newCurrentSchedule,
      };
    });
  },

  setCurrentSchedule: (id: string) => {
    set((state) => {
      const schedule = state.schedules.find((schedule) => schedule.id === id);
      if (schedule) {
        const targetDate = new Date(schedule.targetDate);

        return {
          currentSchedule: schedule,
          currentView: schedule.viewType,
          selectedDate: targetDate,
        };
      }
      return {
        currentSchedule: null,
      };
    });
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
    const { currentSchedule, currentView, selectedDate } = get();

    if (!currentSchedule) return null;

    const sortedTimeSlots = sortTimeSlots(currentSchedule.timeSlots);

    const conflicts = findConflicts(currentSchedule.timeSlots);
    const gaps = findGaps(sortedTimeSlots);

    let totalScheduledTime = 0;
    let totalAvailableTime = 0;

    switch (currentView) {
      case ViewType.DAY:
        totalAvailableTime = 24 * 60;
        for (const slot of currentSchedule.timeSlots) {
          const slotDate = new Date(slot.date).toISOString().split('T')[0];
          const selectedDateStr = selectedDate.toISOString().split('T')[0];
          if (slotDate === selectedDateStr) {
            totalScheduledTime += calculateDuration(slot.startTime, slot.endTime);
          }
        }
        break;

      case ViewType.WEEK:
        totalAvailableTime = 7 * 24 * 60;
        for (const slot of currentSchedule.timeSlots) {
          const slotDate = new Date(slot.date);
          const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
          const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
          
          if (slotDate >= weekStart && slotDate <= weekEnd) {
            totalScheduledTime += calculateDuration(slot.startTime, slot.endTime);
          }
        }
        break;

      case ViewType.MONTH:
        const monthStart = startOfMonth(selectedDate);
        const monthEnd = endOfMonth(selectedDate);
        const daysInMonth = differenceInDays(monthEnd, monthStart) + 1;
        totalAvailableTime = daysInMonth * 24 * 60;
        
        for (const slot of currentSchedule.timeSlots) {
          const slotDate = new Date(slot.date);
          if (slotDate >= monthStart && slotDate <= monthEnd) {
            totalScheduledTime += calculateDuration(slot.startTime, slot.endTime);
          }
        }
        break;

      default:
        totalAvailableTime = 24 * 60;
        for (const slot of currentSchedule.timeSlots) {
          totalScheduledTime += calculateDuration(slot.startTime, slot.endTime);
        }
    }

    const utilization =
      totalScheduledTime > 0 && totalAvailableTime > 0
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

      ...(utilization > 80
        ? [
            {
              id: 'suggestion-high-utilization',
              type: SuggestionType.OPTIMIZE_TIME,
              description: 'Your schedule utilization is high. Consider adding breaks or reducing workload.',
              affectedSlots: [],
            },
          ]
        : []),

      ...(utilization < 20 && currentSchedule.timeSlots.length > 0
        ? [
            {
              id: 'suggestion-low-utilization',
              type: SuggestionType.OPTIMIZE_TIME,
              description: 'Your schedule has low utilization. Consider adding more activities.',
              affectedSlots: [],
            },
          ]
        : []),
    ];

    return {
      conflicts,
      utilization: Math.round(utilization * 10) / 10,
      gaps,
      suggestions,
      _debug: {
        totalScheduledMinutes: totalScheduledTime,
        totalAvailableMinutes: totalAvailableTime,
        view: currentView,
      },
    };
  },
}));
