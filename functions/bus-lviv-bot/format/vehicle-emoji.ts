import { Vehicle } from '../types/vehicle';
import { logger } from '../logger';

// Record (not Partial<Record>) so adding a Vehicle member without an emoji is a compile error.
const VEHICLE_EMOJI: Record<Vehicle, string> = {
  [Vehicle.BUS]: '\u{1F68C}',
  [Vehicle.TRAM]: '\u{1F68B}',
  [Vehicle.TROLLEYBUS]: '\u{1F68E}',
};

export const convertVehicleTypeToEmoji = (vehicleType: Vehicle): string => {
  // Annotated as possibly undefined on purpose: the API response is not validated at runtime,
  // so an unknown vehicle_type can reach this despite the parameter type.
  const emoji: string | undefined = VEHICLE_EMOJI[vehicleType];
  if (emoji === undefined) {
    logger.warn('Unknown vehicle_type, falling back to no emoji', { vehicleType });
    return '';
  }
  return emoji;
};
