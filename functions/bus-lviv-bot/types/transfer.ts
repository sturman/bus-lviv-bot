import { Vehicle } from './vehicle';

export interface Transfer {
  id: string;
  color: string;
  route: string;
  vehicle_type: Vehicle;
  shape_id: string;
  direction_id: number;
  end_stop_name: string;
  end_stop_eng_name: string;
  end_stop_code: number;
}
