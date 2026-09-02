/** Display a Fayda ID number grouped in fours (e.g. 9840-3920-1124-5566),
 *  the way it is printed on the Fayda national ID card. */
export const formatFaydaId = (id?: string | null): string => {
  const digits = (id || '').replace(/\D/g, '');
  if (!digits) return '';
  return digits.replace(/(.{4})/g, '$1-').replace(/-$/, '');
};
