export function mapDbError(error: any): string {
  if (!error) return 'An unknown error occurred.';

  const code = error.code || '';
  const message = error.message || '';

  if (code === '23503') {
    return 'Operation failed because this record is referenced by other data.';
  }
  if (code === '23505') {
    return 'A record with this name already exists.';
  }
  if (code === 'P0001') {
    return message;
  }
  if (code === '42501') {
    return 'Access Denied: You do not have permission to perform this action.';
  }

  return message || 'An unknown database error occurred.';
}
