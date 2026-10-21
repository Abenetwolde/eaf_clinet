function getDeadlineTime(value?: string | null): number | null {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;

  // Legacy/admin date fields were serialized as midnight UTC. Interpret them
  // as a date-only deadline and keep registration open through that day in EAT.
  if (parsed.getUTCHours() === 0 && parsed.getUTCMinutes() === 0 && parsed.getUTCSeconds() === 0 && parsed.getUTCMilliseconds() === 0) {
    const date = parsed.toISOString().slice(0, 10);
    return new Date(`${date}T23:59:59.999+03:00`).getTime();
  }
  return parsed.getTime();
}

export function isEventRegistrationClosed(event: any, now = Date.now()): boolean {
  if (event?.status === 'CANCELLED' || event?.lifecycleStatus === 'CANCELLED' || event?.lifecycleStatus === 'COMPLETED' || event?.lifecycleStatus === 'REGISTRATION_CLOSED') return true;
  const deadlineTime = getDeadlineTime(event?.registrationDeadline);
  if (deadlineTime !== null && deadlineTime < now) return true;
  const startsAt = event?.schedule?.[0]?.startsAt;
  return Boolean(startsAt && new Date(startsAt).getTime() <= now);
}

export function getEventRegistrationStatus(event: any, now = Date.now()): string {
  if (event?.status === 'CANCELLED' || event?.lifecycleStatus === 'CANCELLED') return 'CANCELLED';
  if (isEventRegistrationClosed(event, now)) {
    if (event?.lifecycleStatus === 'LIVE') return 'LIVE';
    return 'REGISTRATION_CLOSED';
  }
  return event?.status === 'PUBLISHED' || event?.lifecycleStatus === 'REGISTRATION_OPEN'
    ? 'REGISTRATION_OPEN'
    : (event?.lifecycleStatus || event?.status || 'UPCOMING');
}
