interface ProfilePhotoSource {
  photoUrl?: string | null;
  picture?: string | null;
  faydaFin?: string | null;
  faydaNin?: string | null;
}

/** Prefer a persisted/Fayda picture; otherwise resolve the verified Fayda portrait by FIN. */
export function getProfilePhotoUrl(source: ProfilePhotoSource): string {
  const direct = source.photoUrl?.trim() || source.picture?.trim();
  const fin = source.faydaFin?.trim() || source.faydaNin?.trim();

  // If a direct photo is provided (base64, remote URL, or local image asset)
  if (direct && !/(?:avatar-placeholder|profile-placeholder)/i.test(direct)) {
    return direct;
  }

  // If FIN / NIN is available, query the Fayda biometric photo endpoint
  if (fin) {
    const apiBase = (import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(/\/$/, '');
    return `${apiBase}/fayda/photo/${encodeURIComponent(fin)}`;
  }

  if (direct) return direct;
  return '/images/fayda_resident_photo.jpg';
}

