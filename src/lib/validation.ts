import type { Dictionary } from '../i18n/en';

export interface ContactValues {
  name: string;
  email: string;
  company: string;
  message: string;
}

export type ContactErrors = Partial<Record<keyof ContactValues, string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateContact(values: ContactValues, errors: Dictionary['contact']['errors']): ContactErrors {
  const result: ContactErrors = {};
  const name = values.name.trim();
  const email = values.email.trim();
  const message = values.message.trim();

  if (!name) result.name = errors.nameRequired;
  else if (name.length > 80) result.name = errors.nameLength;

  if (!email) result.email = errors.emailRequired;
  else if (!EMAIL.test(email)) result.email = errors.emailInvalid;

  if (!message) result.message = errors.messageRequired;
  else if (message.length < 20) result.message = errors.messageShort;
  else if (message.length > 4000) result.message = errors.messageLong;

  return result;
}
