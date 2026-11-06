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

function getEventStartTime(startsAt?: string | null): number | null {
  if (!startsAt) return null;
  const parsed = new Date(startsAt);
  if (Number.isNaN(parsed.getTime())) return null;

  // If start was saved as date-only midnight UTC, keep registration open through that date in EAT
  if (parsed.getUTCHours() === 0 && parsed.getUTCMinutes() === 0 && parsed.getUTCSeconds() === 0 && parsed.getUTCMilliseconds() === 0) {
    const date = parsed.toISOString().slice(0, 10);
    return new Date(`${date}T23:59:59.999+03:00`).getTime();
  }
  return parsed.getTime();
}

export function isEventRegistrationClosed(event: any, now = Date.now()): boolean {
  const statusUpper = String(event?.status || '').toUpperCase();
  const lifecycleUpper = String(event?.lifecycleStatus || '').toUpperCase();

  if (
    statusUpper === 'CANCELLED' ||
    lifecycleUpper === 'CANCELLED' ||
    statusUpper === 'COMPLETED' ||
    lifecycleUpper === 'COMPLETED' ||
    statusUpper === 'REGISTRATION_CLOSED' ||
    lifecycleUpper === 'REGISTRATION_CLOSED'
  ) {
    return true;
  }

  // If explicit registration deadline is configured, it is the authoritative rule
  const deadlineTime = getDeadlineTime(event?.registrationDeadline);
  if (deadlineTime !== null) {
    return deadlineTime < now;
  }

  // If no registration deadline was specified, check if event start day has passed
  const startsAt = event?.schedule?.[0]?.startsAt || event?.startDate;
  const startTime = getEventStartTime(startsAt);
  if (startTime !== null) {
    return startTime < now;
  }

  return false;
}

export function getEventRegistrationStatus(event: any, now = Date.now()): string {
  const statusUpper = String(event?.status || '').toUpperCase();
  const lifecycleUpper = String(event?.lifecycleStatus || '').toUpperCase();

  if (statusUpper === 'CANCELLED' || lifecycleUpper === 'CANCELLED') return 'CANCELLED';

  if (isEventRegistrationClosed(event, now)) {
    if (lifecycleUpper === 'LIVE') return 'LIVE';
    return 'REGISTRATION_CLOSED';
  }

  if (
    statusUpper === 'PUBLISHED' ||
    statusUpper === 'REGISTRATION_OPEN' ||
    lifecycleUpper === 'REGISTRATION_OPEN'
  ) {
    return 'REGISTRATION_OPEN';
  }

  return lifecycleUpper || statusUpper || 'UPCOMING';
}
