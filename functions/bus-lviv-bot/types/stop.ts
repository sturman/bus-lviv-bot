import { Timetable } from './timetable';
import { Transfer } from './transfer';

export interface Stop {
  code: number;
  name: string;
  longitude: number;
  latitude: number;
  transfers?: Transfer[];
  timetable?: Timetable[];
}
