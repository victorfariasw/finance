// Gerador de id simples e suficiente para uso local.
export function makeId(): string {
  return (
    Date.now().toString(36) +
    Math.random().toString(36).slice(2, 8)
  );
}
