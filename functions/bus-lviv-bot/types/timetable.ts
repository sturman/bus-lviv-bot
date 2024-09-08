import { Vehicle } from './vehicle';

export interface Timetable {
  route: string;
  route_id: string;
  lowfloor: boolean;
  arrival_time: string;
  time_left: string;
  vehicle_id: string;
  location: string[];
  bearing: number;
  color: string;
  vehicle_type: Vehicle;
  shape_id: string;
  direction: number;
  direction_id: number;
  end_stop: string;
  end_stop_name: string;
  end_stop_eng_name: string;
  end_stop_code: number;
}
