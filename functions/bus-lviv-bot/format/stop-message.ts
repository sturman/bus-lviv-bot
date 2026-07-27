import { bold, fmt, FmtString } from 'telegraf/format';
import { Stop } from '../types/stop';
import { Timetable } from '../types/timetable';
import { Transfer } from '../types/transfer';
import { Vehicle } from '../types/vehicle';
import { convertVehicleTypeToEmoji } from './vehicle-emoji';

const STOP_SIGN = '\u{1F68F}';
const NO_REALTIME_DATA = '\u{23F1} Наразі даних у реальному часі немає.';
const TRANSFERS_HEADER = 'Тут зазвичай ходять:';
const LOWFLOOR_MARK = '\u{267F}';

// Trams, then trolleybuses, then buses.
const VEHICLE_ORDER: Record<Vehicle, number> = {
  [Vehicle.TRAM]: 0,
  [Vehicle.TROLLEYBUS]: 1,
  [Vehicle.BUS]: 2,
};

const vehicleOrder = (vehicleType: Vehicle): number => {
  const order: number | undefined = VEHICLE_ORDER[vehicleType];
  return order ?? Number.MAX_SAFE_INTEGER;
};

// 'time_left' is a display string such as '9хв' or '< 1хв'.
const parseEtaMinutes = (timeLeft: string): number => {
  const digits = /\d+/.exec(timeLeft);
  return digits ? Number(digits[0]) : Number.MAX_SAFE_INTEGER;
};

// One line per arrival, soonest first. Repeat visits of the same route stay separate lines.
const renderArrival = (arrival: Timetable): string => {
  const emoji = convertVehicleTypeToEmoji(arrival.vehicle_type);
  const accessible = arrival.lowfloor ? ` ${LOWFLOOR_MARK}` : '';
  const destination = arrival.end_stop_name || arrival.end_stop;
  const head = `${emoji} ${arrival.route} - ${arrival.time_left}`;

  // Skip the trailing stop sign entirely when the terminus is unknown.
  return destination ? `${head} - ${STOP_SIGN} ${destination}${accessible}` : `${head}${accessible}`;
};

// Static routes serving the stop, used when there is no realtime data to show.
const renderTransfers = (transfers: readonly Transfer[]): string[] => {
  const routesByVehicle = new Map<Vehicle, Set<string>>();
  for (const transfer of transfers) {
    const routes = routesByVehicle.get(transfer.vehicle_type) ?? new Set<string>();
    routes.add(transfer.route);
    routesByVehicle.set(transfer.vehicle_type, routes);
  }

  if (routesByVehicle.size === 0) {
    return [];
  }

  const lines = [...routesByVehicle.entries()]
    .sort(([a], [b]) => vehicleOrder(a) - vehicleOrder(b))
    .map(([vehicleType, routes]) => `  ${convertVehicleTypeToEmoji(vehicleType)} ${[...routes].sort().join(', ')}`);

  return [TRANSFERS_HEADER, ...lines];
};

export const buildStopMessage = (stop: Stop): FmtString => {
  const arrivals = stop.timetable ?? [];
  const body =
    arrivals.length > 0
      ? [...arrivals].sort((a, b) => parseEtaMinutes(a.time_left) - parseEtaMinutes(b.time_left)).map(renderArrival)
      : [NO_REALTIME_DATA, ...renderTransfers(stop.transfers ?? [])];

  return fmt`${bold(`${STOP_SIGN} ${stop.name} · ${stop.code}`)}\n\n${body.join('\n')}\n\n/${stop.code}`;
};
