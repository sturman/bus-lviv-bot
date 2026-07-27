import axios from 'axios';

// openapi.yaml documents 404 for an unknown stop code and 404 for an unknown vehicle id.
// A 404 means the resource will never exist, so it is a user-facing answer rather than a fault.
export const isNotFoundError = (error: unknown): boolean => axios.isAxiosError(error) && error.response?.status === 404;
