import { parseAsString, parseAsInteger, parseAsIsoDateTime } from 'nuqs/server';

// --- State Parsers for nuqs ---

// Parser for the selected fund (scheme code)
export const fundParser = parseAsString;

// Parser for individual start/end dates
export const dateParser = parseAsIsoDateTime;

// Parser for the rolling window size (in days)
export const windowParser = parseAsInteger.withDefault(30); // Default 30-day window 