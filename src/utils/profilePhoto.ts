interface ProfilePhotoSource {
  photoUrl?: string | null;
  picture?: string | null;
  faydaFin?: string | null;
  faydaNin?: string | null;
}

/** Prefer a persisted/Fayda picture; otherwise resolve the verified Fayda portrait by FIN. */
export function getProfilePhotoUrl(source: ProfilePhotoSource): string | null {
  const direct = source.photoUrl?.trim() || source.picture?.trim();
  if (direct) return direct;

  const fin = source.faydaFin || source.faydaNin;
  if (!fin) return null;
  const apiBase = (import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(/\/$/, '');
  return `${apiBase}/fayda/photo/${encodeURIComponent(fin)}`;
}
