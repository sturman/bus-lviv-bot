import { buildStopMessage } from '../functions/bus-lviv-bot/format/stop-message';
import { Stop } from '../functions/bus-lviv-bot/types/stop';
import { Timetable } from '../functions/bus-lviv-bot/types/timetable';
import { Transfer } from '../functions/bus-lviv-bot/types/transfer';
import { Vehicle } from '../functions/bus-lviv-bot/types/vehicle';

const TRAM = '\u{1F68B}';
const BUS = '\u{1F68C}';
const STOP_SIGN = '\u{1F68F}';
const LOWFLOOR = '\u{267F}';

// Fixtures mirror GET /stops/35 («Саксаганського») field for field.
const arrival = (overrides: Partial<Timetable>): Timetable => ({
  route: 'Т03',
  route_id: '972',
  lowfloor: false,
  arrival_time: 'Mon, 27 Jul 2026 19:51:20 GMT',
  time_left: '3хв',
  vehicle_id: '3304',
  location: [49.82973, 24.02661],
  bearing: 71,
  color: '#50B056',
  vehicle_type: Vehicle.TRAM,
  shape_id: '20199',
  direction: null,
  direction_id: 0,
  end_stop: 'Соборна',
  end_stop_name: 'Соборна',
  end_stop_eng_name: 'Soborna square',
  end_stop_code: 74,
  ...overrides,
});

const transfer = (overrides: Partial<Transfer>): Transfer => ({
  id: '2464',
  color: '#0E4F95',
  route: 'А53',
  vehicle_type: Vehicle.BUS,
  shape_id: '20212',
  direction_id: 0,
  end_stop_name: 'Галицьке перехрестя',
  end_stop_eng_name: 'Avtobudivelnykiv',
  end_stop_code: 741,
  ...overrides,
});

const stop = (overrides: Partial<Stop>): Stop => ({
  code: 35,
  name: 'Саксаганського',
  eng_name: 'Saksahanskoho',
  latitude: 49.834422,
  longitude: 24.034339,
  ...overrides,
});

// The live timetable of stop 35: Т03 and Т08 each arrive twice.
const liveArrivals = (): Timetable[] => [
  arrival({ route: 'Т03', time_left: '3хв' }),
  arrival({ route: 'Т08', time_left: '13хв' }),
  arrival({ route: 'Т03', time_left: '18хв' }),
  arrival({ route: 'Т08', time_left: '20хв' }),
];

// The live transfers of stop 35: three tram routes and one bus route.
const liveTransfers = (): Transfer[] => [
  transfer({ route: 'А53', vehicle_type: Vehicle.BUS, end_stop_code: 741 }),
  transfer({ route: 'Т03', vehicle_type: Vehicle.TRAM, end_stop_name: 'Соборна', end_stop_code: 74 }),
  transfer({ route: 'Т08', vehicle_type: Vehicle.TRAM, end_stop_name: 'Соборна', end_stop_code: 74 }),
  transfer({ route: 'Т09', vehicle_type: Vehicle.TRAM, end_stop_name: 'Торф’яна', end_stop_code: 704 }),
];

const arrivalLines = (text: string): string[] => text.split('\n').filter(line => line.includes(' - '));

describe('buildStopMessage', () => {
  it('renders the stop name and code in the header', () => {
    const message = buildStopMessage(stop({ timetable: liveArrivals() }));
    expect(message.text).toContain(`${STOP_SIGN} Саксаганського · 35`);
  });

  it('renders one line per arrival in the "route - time - stop" form', () => {
    const message = buildStopMessage(stop({ timetable: [arrival({ route: 'Т03', time_left: '3хв' })] }));
    expect(message.text).toContain(`${TRAM} Т03 - 3хв - ${STOP_SIGN} Соборна`);
  });

  it('lists repeat arrivals of the same route on separate lines', () => {
    const message = buildStopMessage(stop({ timetable: liveArrivals() }));
    expect(arrivalLines(message.text)).toEqual([
      `${TRAM} Т03 - 3хв - ${STOP_SIGN} Соборна`,
      `${TRAM} Т08 - 13хв - ${STOP_SIGN} Соборна`,
      `${TRAM} Т03 - 18хв - ${STOP_SIGN} Соборна`,
      `${TRAM} Т08 - 20хв - ${STOP_SIGN} Соборна`,
    ]);
  });

  it('does not group: no "через" wording and no comma-joined times', () => {
    const message = buildStopMessage(stop({ timetable: liveArrivals() }));
    expect(message.text).not.toContain('через');
    expect(message.text).not.toContain('3, 18');
    expect(message.text).not.toContain('13, 20');
  });

  it('sorts every arrival by soonest, interleaving routes', () => {
    const message = buildStopMessage(
      stop({
        timetable: [
          arrival({ route: 'Т03', time_left: '18хв' }),
          arrival({ route: 'Т08', time_left: '13хв' }),
          arrival({ route: 'Т03', time_left: '3хв' }),
          arrival({ route: 'Т08', time_left: '20хв' }),
        ],
      }),
    );
    expect(arrivalLines(message.text).map(line => /(\d+)хв/.exec(line)?.[1])).toEqual(['3', '13', '18', '20']);
  });

  it('sorts the "< 1хв" form ahead of numbered minutes', () => {
    const message = buildStopMessage(
      stop({ timetable: [arrival({ time_left: '18хв' }), arrival({ time_left: '< 1хв' })] }),
    );
    expect(message.text.indexOf('< 1хв')).toBeLessThan(message.text.indexOf('18хв'));
  });

  it('marks a low-floor vehicle at the end of its own line only', () => {
    const message = buildStopMessage(
      stop({
        timetable: [
          arrival({ route: 'Т03', time_left: '3хв', lowfloor: true }),
          arrival({ route: 'Т08', time_left: '13хв' }),
        ],
      }),
    );
    expect(arrivalLines(message.text)).toEqual([
      `${TRAM} Т03 - 3хв - ${STOP_SIGN} Соборна ${LOWFLOOR}`,
      `${TRAM} Т08 - 13хв - ${STOP_SIGN} Соборна`,
    ]);
  });

  it('falls back to end_stop when end_stop_name is empty', () => {
    const message = buildStopMessage(stop({ timetable: [arrival({ end_stop_name: '', end_stop: 'Соборна' })] }));
    expect(message.text).toContain(`- ${STOP_SIGN} Соборна`);
  });

  it('omits the dangling stop sign when the terminus is unknown', () => {
    const message = buildStopMessage(
      stop({
        timetable: [
          arrival({ route: 'А32', vehicle_type: Vehicle.BUS, time_left: '40хв', end_stop_name: '', end_stop: '' }),
        ],
      }),
    );
    expect(message.text).toContain(`${BUS} А32 - 40хв`);
    expect(message.text).not.toContain(`40хв - ${STOP_SIGN}`);
  });

  it('falls back to the routes serving the stop when there is no realtime data', () => {
    const message = buildStopMessage(stop({ timetable: [], transfers: liveTransfers() }));
    expect(message.text).toContain('Наразі даних у реальному часі немає.');
    expect(message.text).toContain('Тут зазвичай ходять:');
    // trams before buses, routes sorted within each mode
    expect(message.text).toContain(`${TRAM} Т03, Т08, Т09`);
    expect(message.text).toContain(`${BUS} А53`);
    expect(message.text.indexOf('Т03')).toBeLessThan(message.text.indexOf('А53'));
  });

  it('de-duplicates routes that appear in transfers more than once', () => {
    const message = buildStopMessage(
      stop({
        timetable: [],
        transfers: [
          transfer({ route: 'Т03', vehicle_type: Vehicle.TRAM, direction_id: 0 }),
          transfer({ route: 'Т03', vehicle_type: Vehicle.TRAM, direction_id: 1 }),
        ],
      }),
    );
    expect(message.text.match(/Т03/g)).toHaveLength(1);
  });

  it('never leaks a terminus stop code as a tappable number', () => {
    const message = buildStopMessage(stop({ timetable: liveArrivals(), transfers: liveTransfers() }));
    expect(message.text).not.toContain('/74');
    expect(message.text).not.toContain('/741');
    expect(message.text).not.toContain('/704');
    // only the stop's own code is tappable
    expect(message.text).toContain('/35');
  });

  it('handles a stop with neither timetable nor transfers', () => {
    const message = buildStopMessage(stop({}));
    expect(message.text).toContain('Наразі даних у реальному часі немає.');
    expect(message.text).not.toContain('Тут зазвичай ходять:');
  });

  it('bolds the header', () => {
    const message = buildStopMessage(stop({ timetable: liveArrivals() }));
    expect(message.entities).toEqual(expect.arrayContaining([expect.objectContaining({ type: 'bold', offset: 0 })]));
  });
});
