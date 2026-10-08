import { TransformFnParams } from 'class-transformer';

export function trimString({ value }: TransformFnParams): unknown {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}
