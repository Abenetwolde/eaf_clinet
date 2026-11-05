import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

type ActiveError = { field: HTMLElement; message: string; top: number; left: number; width: number };
type Field = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

function labelFor(field: Field) {
  return (field.labels?.[0]?.textContent || field.getAttribute('aria-label') || field.getAttribute('placeholder') || field.name || 'This field').trim().replace(/\s+/g, ' ').replace(/[＊*:]+$/, '');
}

function validate(field: Field): string | null {
  const input = field instanceof HTMLInputElement;
  if (field.disabled || (input && field.readOnly) || (field instanceof HTMLTextAreaElement && field.readOnly) || (input && ['hidden', 'submit', 'button', 'reset', 'image'].includes(field.type))) return null;
  const label = labelFor(field);
  const value = field.value.trim();
  if (field.required && (input && field.type === 'checkbox' ? !field.checked : !value)) return label + ' is required.';
  if (!value) return null;
  if (input && field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Enter a valid email address.';
  if (input && field.type === 'url' && !/^https?:\/\/.+\..+/.test(value)) return 'Enter a valid URL beginning with http:// or https://.';
  if (input && field.type === 'tel' && !/^\+?[0-9][0-9\s().-]{6,19}$/.test(value)) return 'Enter a valid phone number.';
  if (input && field.type === 'password' && value.length < Math.max(8, field.minLength || 0)) return 'Use at least ' + Math.max(8, field.minLength || 0) + ' characters.';
  const identity = field.name + ' ' + field.id + ' ' + (field.getAttribute('placeholder') || '') + ' ' + label;
  if (/(confirm|repeat).{0,16}password/i.test(identity) && field.form) {
    const password = field.form.querySelector<HTMLInputElement>('input[type="password"]:not([name*="confirm" i])');
    if (password && value !== password.value) return 'Passwords do not match.';
  }
  if (/(email|e-mail)/i.test(identity) && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Enter a valid email address.';
  if (/(phone|mobile|telephone)/i.test(identity) && !/^\+?[0-9][0-9\s().-]{6,19}$/.test(value)) return 'Enter a valid phone number.';
  if (/(fayda|national.?id|\bfin\b|\bnin\b)/i.test(identity) && input && field.type !== 'password') {
    const digits = value.replace(/\D/g, '');
    if (digits.length < 8 || digits.length > 16) return 'Enter a valid National ID number (8–16 digits).';
  }
  if (field.validity.typeMismatch) return 'Enter a valid value.';
  if (field.validity.patternMismatch) return field.getAttribute('title') || 'Check the format for ' + label.toLowerCase() + '.';
  if (field.validity.tooShort) return 'Enter at least ' + field.getAttribute('minlength') + ' characters.';
  if (field.validity.tooLong) return 'Enter no more than ' + field.getAttribute('maxlength') + ' characters.';
  if (field.validity.rangeUnderflow) return 'Enter a value of at least ' + field.getAttribute('min') + '.';
  if (field.validity.rangeOverflow) return 'Enter a value no greater than ' + field.getAttribute('max') + '.';
  if (field.validity.badInput) return 'Enter a valid ' + (input && field.type === 'number' ? 'number.' : 'value.');
  return null;
}

export default function LiveFieldValidation() {
  const [activeError, setActiveError] = useState<ActiveError | null>(null);
  const activeField = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const clear = (field: HTMLElement) => {
      if (field.dataset.liveValidationInvalid !== 'true') return;
      const oldInvalid = field.dataset.liveValidationOriginalInvalid;
      const oldDescribedBy = field.dataset.liveValidationOriginalDescribedBy;
      if (oldInvalid === '__none__') field.removeAttribute('aria-invalid');
      else field.setAttribute('aria-invalid', oldInvalid || 'false');
      if (oldDescribedBy === '__none__') field.removeAttribute('aria-describedby');
      else field.setAttribute('aria-describedby', oldDescribedBy || '');
      delete field.dataset.liveValidationInvalid;
      delete field.dataset.liveValidationOriginalInvalid;
      delete field.dataset.liveValidationOriginalDescribedBy;
      if (activeField.current === field) { activeField.current = null; setActiveError(null); }
    };
    const show = (field: Field, message: string) => {
      if (activeField.current && activeField.current !== field) clear(activeField.current);
      if (field.dataset.liveValidationInvalid !== 'true') {
        field.dataset.liveValidationOriginalInvalid = field.getAttribute('aria-invalid') ?? '__none__';
        field.dataset.liveValidationOriginalDescribedBy = field.getAttribute('aria-describedby') ?? '__none__';
      }
      field.dataset.liveValidationInvalid = 'true';
      field.setAttribute('aria-invalid', 'true');
      field.setAttribute('aria-describedby', 'eaf-live-field-error');
      const rect = field.getBoundingClientRect();
      activeField.current = field;
      setActiveError({ field, message, top: Math.min(rect.bottom + 4, window.innerHeight - 50), left: Math.max(8, Math.min(rect.left, window.innerWidth - Math.max(rect.width, 220) - 8)), width: Math.max(rect.width, 220) });
    };
    const check = (target: EventTarget | null, onBlur = false) => {
      if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement || target instanceof HTMLTextAreaElement)) return;
      if (!onBlur && !target.value && !target.required) return clear(target);
      const message = validate(target);
      if (message) show(target, message); else clear(target);
    };
    const onSubmit = (event: Event) => {
      if (!(event.target instanceof HTMLFormElement)) return;
      const invalid = Array.from(event.target.querySelectorAll<Field>('input,select,textarea')).find((field) => validate(field));
      if (!invalid) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      const message = validate(invalid);
      if (message) show(invalid, message);
      invalid.focus({ preventScroll: true });
      invalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };
    const reposition = () => {
      const field = activeField.current;
      if (!field?.isConnected) return setActiveError(null);
      const rect = field.getBoundingClientRect();
      setActiveError((current) => current && ({ ...current, top: Math.min(rect.bottom + 4, window.innerHeight - 50), left: Math.max(8, Math.min(rect.left, window.innerWidth - Math.max(rect.width, 220) - 8)), width: Math.max(rect.width, 220) }));
    };
    const onInput = (event: Event) => check(event.target);
    const onBlur = (event: FocusEvent) => check(event.target, true);
    document.addEventListener('input', onInput, true);
    document.addEventListener('change', onInput, true);
    document.addEventListener('focusout', onBlur, true);
    document.addEventListener('submit', onSubmit, true);
    window.addEventListener('scroll', reposition, true);
    window.addEventListener('resize', reposition);
    return () => {
      document.removeEventListener('input', onInput, true);
      document.removeEventListener('change', onInput, true);
      document.removeEventListener('focusout', onBlur, true);
      document.removeEventListener('submit', onSubmit, true);
      window.removeEventListener('scroll', reposition, true);
      window.removeEventListener('resize', reposition);
    };
  }, []);

  if (!activeError || typeof document === 'undefined') return null;
  return createPortal(<div id="eaf-live-field-error" role="alert" aria-live="polite" className="fixed z-[2000] rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-xs font-semibold text-red-800 shadow-lg" style={{ top: activeError.top, left: activeError.left, width: activeError.width }}>{activeError.message}</div>, document.body);
}
