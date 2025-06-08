import {
  format,
  parse,
  differenceInMinutes,
  addMinutes,
  isWithinInterval,
} from 'date-fns';
import { TimeSlot, ScheduleConflict, TimeGap } from '../types';

export const formatTimeForDisplay = (timeString: string): string => {
  try {
    const date = parse(timeString, 'HH:mm', new Date());
    return format(date, 'h:mm a');
  } catch (error) {
    console.error('Error parsing time:', error);
    return timeString;
  }
};

export const calculateDuration = (
  startTime: string,
  endTime: string,
): number => {
  try {
    const today = new Date();
    const start = parse(startTime, 'HH:mm', today);
    let end = parse(endTime, 'HH:mm', today);

    if (end < start) {
      end = addMinutes(end, 24 * 60);
    }

    return differenceInMinutes(end, start);
  } catch (error) {
    console.error('Error calculating duration:', error);
    return 0;
  }
};

export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  }

  return `${hours} ${hours === 1 ? 'hour' : 'hours'} ${remainingMinutes} min`;
};

export const doSlotsOverlap = (slotA: TimeSlot, slotB: TimeSlot): boolean => {
  const today = new Date();
  const startA = parse(slotA.startTime, 'HH:mm', today);
  let endA = parse(slotA.endTime, 'HH:mm', today);
  const startB = parse(slotB.startTime, 'HH:mm', today);
  let endB = parse(slotB.endTime, 'HH:mm', today);

  if (endA < startA) endA = addMinutes(endA, 24 * 60);
  if (endB < startB) endB = addMinutes(endB, 24 * 60);

  return (
    isWithinInterval(startA, { start: startB, end: endB }) ||
    isWithinInterval(endA, { start: startB, end: endB }) ||
    isWithinInterval(startB, { start: startA, end: endA }) ||
    isWithinInterval(endB, { start: startA, end: endA })
  );
};

export const calculateOverlap = (slotA: TimeSlot, slotB: TimeSlot): number => {
  if (!doSlotsOverlap(slotA, slotB)) return 0;

  const today = new Date();
  const startA = parse(slotA.startTime, 'HH:mm', today);
  let endA = parse(slotA.endTime, 'HH:mm', today);
  const startB = parse(slotB.startTime, 'HH:mm', today);
  let endB = parse(slotB.endTime, 'HH:mm', today);

  if (endA < startA) endA = addMinutes(endA, 24 * 60);
  if (endB < startB) endB = addMinutes(endB, 24 * 60);

  const overlapStart = startA > startB ? startA : startB;
  const overlapEnd = endA < endB ? endA : endB;

  return differenceInMinutes(overlapEnd, overlapStart);
};

export const findConflicts = (timeSlots: TimeSlot[]): ScheduleConflict[] => {
  const conflicts: ScheduleConflict[] = [];

  for (let i = 0; i < timeSlots.length; i++) {
    for (let j = i + 1; j < timeSlots.length; j++) {
      const slotA = timeSlots[i];
      const slotB = timeSlots[j];

      const overlapDuration = calculateOverlap(slotA, slotB);

      if (overlapDuration > 0) {
        conflicts.push({
          id: `conflict-${slotA.id}-${slotB.id}`,
          slotA,
          slotB,
          overlapDuration,
        });
      }
    }
  }

  return conflicts;
};

export const findGaps = (sortedTimeSlots: TimeSlot[]): TimeGap[] => {
  const gaps: TimeGap[] = [];

  if (sortedTimeSlots.length <= 1) return gaps;

  for (let i = 0; i < sortedTimeSlots.length - 1; i++) {
    const currentEnd = sortedTimeSlots[i].endTime;
    const nextStart = sortedTimeSlots[i + 1].startTime;

    const gapDuration = calculateDuration(currentEnd, nextStart);

    if (gapDuration > 0) {
      gaps.push({
        id: `gap-${i}`,
        startTime: currentEnd,
        endTime: nextStart,
        duration: gapDuration,
      });
    }
  }

  return gaps;
};

export const sortTimeSlots = (timeSlots: TimeSlot[]): TimeSlot[] => {
  return [...timeSlots].sort((a, b) => {
    const today = new Date();
    const startA = parse(a.startTime, 'HH:mm', today);
    const startB = parse(b.startTime, 'HH:mm', today);
    return startA.getTime() - startB.getTime();
  });
};
