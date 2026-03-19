export function getTodayString() {
  return new Date().toISOString().split('T')[0];
}
