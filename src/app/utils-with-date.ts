import { isDate } from "date-fns";
import { UncapitalizeObjectKeys, isUppercase } from "./utils";
import { format, utcToZonedTime } from "date-fns-tz";

const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

export function lowerCaseKeys<T extends object>(obj: T): UncapitalizeObjectKeys<T> {
    const entries = Object.entries(obj);
    const mappedEntries = entries.map(
        ([k, v]) => { 
          if (typeof k !== 'string') return [k, (v && typeof v === 'object' && !isDate(v) ? lowerCaseKeys(v) : v)] as const
  
          var convertedKey = '';
          for (let i = 0; i < k.length; i++) {
            const char = k[i];
            if (i == 0) {
              convertedKey += char.toLowerCase();
              continue;
            }
            const prevChar = k[i-1];
            if (i === (k.length - 1)) {
              if (isUppercase(prevChar)) convertedKey += char.toLowerCase();
              else convertedKey += char;
              continue;
            }
            const nextChar = k[i+1];
            if (i === 0 || isUppercase(nextChar)) {
              convertedKey += char.toLowerCase();
            }
            else {
              convertedKey += char;
            }
          }
          return [convertedKey, (v && typeof v === 'object' && !isDate(v) ? lowerCaseKeys(v) : v)] as const
        }
    );
  
    return Object.fromEntries(mappedEntries) as UncapitalizeObjectKeys<T>;
  };
  
  export function normalizeDateFromMsgPack<T extends object>(obj: T): T {
    if (!obj) {
      return null;
    }
    if (Array.isArray(obj) && obj.length === 2 && isDate(obj[0])) {
      return new Date(obj[0]) as T;
    }
    const entries = Object.entries(obj);
    const mappedEntries = entries.map(
      ([k, v]) => { 
        if (Array.isArray(v)) {
          if (v.length === 2 && isDate(v[0])) {
            return [k, new Date(v[0])] as const;
          }
        }
        return [k, v] as const;
      }
    );
    
    return Object.fromEntries(mappedEntries) as T;
  }
  
  export function toLocal(date: string | Date): Date {
    const zoned = utcToZonedTime(date, userTimezone);
    return zoned;
  }
  
  export function formatLocalDateString(date: Date): string {
    return format(date, 'yyyy-MM-dd\'T\'HH:mm:ssXXX', { timeZone: userTimezone });
  }