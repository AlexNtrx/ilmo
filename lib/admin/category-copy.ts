export function formatIssueReferenceCount(count: number) {
  return count === 1
    ? "1 ilmoitusviite"
    : `${count} ilmoitusviitettä`;
}
