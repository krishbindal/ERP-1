export function mapDatabaseError(error: unknown): string {
  if (!error) return 'An unknown error occurred.';

  const code = (error as Record<string, unknown>).code || '';
  const message = (error as Record<string, unknown>).message || '';

  if (code === '23503') {
    return 'Operation failed because this record is referenced by other data.';
  }
  if (code === '23505') {
    return 'A record with this name already exists.';
  }
  if (code === 'P0001') {
    return message as string;
  }
  if (code === '42501') {
    return 'Access Denied: You do not have permission to perform this action.';
  }

  return (message as string) || 'An unknown database error occurred.';
}
