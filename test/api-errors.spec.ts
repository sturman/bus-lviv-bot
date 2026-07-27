import { AxiosError, AxiosResponse } from 'axios';
import { isNotFoundError } from '../functions/bus-lviv-bot/api/errors';

const axiosErrorWithStatus = (status: number): AxiosError =>
  new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    status,
    statusText: '',
    data: {},
    headers: {},
    config: { headers: {} },
  } as AxiosResponse);

describe('isNotFoundError', () => {
  // GET /stops/999999 answers 404 (verified against api.lad.lviv.ua).
  it('is true for a 404 response', () => {
    expect(isNotFoundError(axiosErrorWithStatus(404))).toBe(true);
  });

  it.each([400, 429, 500, 502, 503])('is false for a %i response', status => {
    expect(isNotFoundError(axiosErrorWithStatus(status))).toBe(false);
  });

  // Timeouts and DNS failures carry no response at all — those must stay retryable.
  it('is false for a network error with no response', () => {
    expect(isNotFoundError(new AxiosError('timeout of 5000ms exceeded', 'ECONNABORTED'))).toBe(false);
  });

  it.each([
    ['a plain Error', new Error('boom')],
    ['a string', 'not found'],
    ['null', null],
    ['undefined', undefined],
    ['an object that only looks like a response', { response: { status: 404 } }],
  ])('is false for %s', (_label, value) => {
    expect(isNotFoundError(value)).toBe(false);
  });
});
