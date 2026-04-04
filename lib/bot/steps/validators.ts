import type { Validator } from './step-types';

/**
 * Common validators for step input validation.
 */

export const minLength =
  (min: number): Validator =>
  (value: unknown) => {
    if (typeof value !== 'string') return 'Input must be a string';
    if (value.length < min) return `Minimum ${min} characters required`;
    return undefined;
  };

export const maxLength =
  (max: number): Validator =>
  (value: unknown) => {
    if (typeof value !== 'string') return 'Input must be a string';
    if (value.length > max) return `Maximum ${max} characters allowed`;
    return undefined;
  };

export const required: Validator = (value: unknown) => {
  if (!value) return 'This field is required';
  if (typeof value === 'string' && value.trim() === '')
    return 'This field is required';
  return undefined;
};

export const email: Validator = (value: unknown) => {
  if (typeof value !== 'string') return 'Email must be a string';
  // Simple email validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email format';
  return undefined;
};

export const isGeometryPoint: Validator = (value: unknown) => {
  if (!value || typeof value !== 'object')
    return 'Location must be a valid point';
  const point = value as { type?: unknown; coordinates?: unknown };
  if (point.type !== 'Point') return 'Location must be a GeoJSON Point';
  const coordinates = Array.isArray(point.coordinates) ? point.coordinates : [];
  const [lng, lat] = coordinates;
  if (typeof lng !== 'number' || typeof lat !== 'number') {
    return 'Location coordinates must be valid numbers';
  }
  if (lat < -90 || lat > 90) return 'Latitude must be between -90 and 90';
  if (lng < -180 || lng > 180) return 'Longitude must be between -180 and 180';
  return undefined;
};

export const isOneOf =
  (validValues: string[]): Validator =>
  (value: unknown) => {
    if (typeof value !== 'string' || !validValues.includes(value)) {
      return `Must be one of: ${validValues.join(', ')}`;
    }
    return undefined;
  };

export const pattern =
  (regex: RegExp, message: string): Validator =>
  (value: unknown) => {
    if (typeof value !== 'string') return 'Input must be a string';
    if (!regex.test(value)) return message;
    return undefined;
  };

export const compose =
  (...validators: Validator[]): Validator =>
  (value: unknown) => {
    for (const validator of validators) {
      const error = validator(value);
      if (error) return error;
    }
    return undefined;
  };
