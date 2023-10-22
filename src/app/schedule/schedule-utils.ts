import { setMilliseconds, setSeconds, setMinutes, setHours, addDays, addWeeks, addHours } from "date-fns";
import { SectionSlots } from "../enums/section-slots";
import { ScheduleSection } from "./section";

export namespace ScheduleConst {
  export const WeekLimit = 4; // limit of the weeks available for peeking
}

export function getDateFromDay(dayOfWeek: SectionSlots, week: number = 0) {
  const today = setMilliseconds(setSeconds(setMinutes(setHours(new Date(), 0), 0), 0), 0);
  const thisDay = today.getDay();
  const targetDay = thisDay === 0 ? dayOfWeek - 6 : dayOfWeek + 1;
  let targetDate = addDays(today, targetDay - thisDay);
  if (week > 0) {
    targetDate = addWeeks(targetDate, week);
  }
  return targetDate;
}

export function convertStartTimeToDate(startTime: number, base: Date = null): Date {
  return setMinutes(setHours(base ?? new Date(1992, 0, 1, 0, 0, 0, 0), startTime / 60), startTime % 60);
}

export function convertDateToStartTime(date: Date): number {
  const wrap = new Date(date);
  const startTime = wrap.getHours() * 60 + wrap.getMinutes();
  return startTime;
}

export function  convertDateToSectionSlot(date: Date): SectionSlots {
  const day = new Date(date).getDay();
  return day === 0 ? SectionSlots.Sun : (day - 1) as SectionSlots;
}

export function endTimeAsDate(section: ScheduleSection): Date {
  if (!section.start) {
    section.start = convertStartTimeToDate(section.startTime).toISOString();
  }
  return addHours(new Date(section.start), 4);
}

export function endTime(section: ScheduleSection): number {
  return section.startTime + 240;
}

export function getScheduleRangeLimit(lowerLimit: Date) {
  const firstDayOfWeek = addDays(lowerLimit, -convertDateToSectionSlot(lowerLimit));
  console.log(firstDayOfWeek);
  const upperLimit = addWeeks(addDays(firstDayOfWeek, 6), ScheduleConst.WeekLimit);
  return upperLimit;
}