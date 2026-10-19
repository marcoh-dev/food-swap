import { TransformFnParams } from 'class-transformer';

export function trimString({ value }: TransformFnParams): unknown {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

export function toSlugArray(value: unknown): unknown {
  if (typeof value !== 'string') {
    return value;
  }

  const parts = value.split(',');
  const trimmed = parts.map((part) => part.trim());
  const slug = trimmed.filter((part) => part !== '');

  return slug;
}
