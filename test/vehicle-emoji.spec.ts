import { convertVehicleTypeToEmoji } from '../functions/bus-lviv-bot/format/vehicle-emoji';
import { Vehicle } from '../functions/bus-lviv-bot/types/vehicle';

// vehicle_type values observed in live GET /stops/{id} responses:
//   'bus'        -> А05, А09, А16, ...
//   'tram'       -> Т02, Т03, Т04, ...
//   'trolleybus' -> Т22, Т23, Т25, ... (named Тр22/Тр23 in routes.json)
const LIVE_API_VEHICLE_TYPES = ['bus', 'tram', 'trolleybus'];

describe('convertVehicleTypeToEmoji', () => {
  it.each([
    [Vehicle.BUS, '\u{1F68C}'],
    [Vehicle.TRAM, '\u{1F68B}'],
    [Vehicle.TROLLEYBUS, '\u{1F68E}'],
  ])('maps %s to %s', (vehicleType, expected) => {
    expect(convertVehicleTypeToEmoji(vehicleType)).toBe(expected);
  });

  // Regression: the enum used 'trol' while the API sends 'trolleybus', so every
  // trolleybus arrival rendered without an emoji.
  it('renders an emoji for the trolleybus value the API actually sends', () => {
    expect(convertVehicleTypeToEmoji('trolleybus' as Vehicle)).toBe('\u{1F68E}');
  });

  it('covers every vehicle_type the live API returns', () => {
    expect(Object.values<string>(Vehicle).sort()).toEqual(LIVE_API_VEHICLE_TYPES.sort());
  });

  it('returns an emoji for every Vehicle member', () => {
    for (const vehicleType of Object.values(Vehicle)) {
      expect(convertVehicleTypeToEmoji(vehicleType)).not.toBe('');
    }
  });

  it('falls back to an empty string for an unknown vehicle type', () => {
    expect(convertVehicleTypeToEmoji('funicular' as Vehicle)).toBe('');
  });
});
