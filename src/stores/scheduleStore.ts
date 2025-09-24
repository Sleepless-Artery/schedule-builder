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
}

export const useScheduleStore = create<ScheduleState>((set, get) => ({
  schedules: [],
  currentSchedule: null,
  currentView: ViewType.WEEK,
  selectedDate: new Date(),

  createSchedule: (name: string) => {
    const newSchedule: Schedule = {
      id: `schedule-${Date.now()}`,
      name,
      timeSlots: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    set((state) => ({
      schedules: [...state.schedules, newSchedule],
      currentSchedule: newSchedule,
    }));
  },

  updateSchedule: (id: string, updates: Partial<Omit<Schedule, 'id'>>) => {
    set((state) => ({
      schedules: state.schedules.map((schedule) =>
        schedule.id === id
          ? {
              ...schedule,
              ...updates,
              updatedAt: new Date().toISOString(),
            }
          : schedule,
      ),
      currentSchedule:
        state.currentSchedule?.id === id
          ? {
              ...state.currentSchedule,
              ...updates,
              updatedAt: new Date().toISOString(),
            }
          : state.currentSchedule,
    }));
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

      return {
        schedules: state.schedules.map((schedule) =>
          schedule.id === updatedSchedule.id ? updatedSchedule : schedule,
        ),
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

      return {
        schedules: state.schedules.map((schedule) =>
          schedule.id === updatedSchedule.id ? updatedSchedule : schedule,
        ),
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

      return {
        schedules: state.schedules.map((schedule) =>
          schedule.id === updatedSchedule.id ? updatedSchedule : schedule,
        ),
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
