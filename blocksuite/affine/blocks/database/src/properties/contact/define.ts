import { propertyType, t } from '@blocksuite/data-view';
import zod from 'zod';

const contactModelConfig = <Type extends string>(type: Type, name: string) =>
  propertyType(type).modelConfig({
    name,
    propertyData: {
      schema: zod.object({}),
      default: () => ({}),
    },
    jsonValue: {
      schema: zod.string(),
      type: () => t.string.instance(),
      isEmpty: ({ value }) => !value,
    },
    rawValue: {
      schema: zod.string(),
      default: () => '',
      toString: ({ value }) => value,
      fromString: ({ value }) => ({ value: value.trim() }),
      toJson: ({ value }) => value,
      fromJson: ({ value }) => value,
    },
  });

export const emailPropertyModelConfig = contactModelConfig('email', 'Email');
export const phonePropertyModelConfig = contactModelConfig('phone', 'Phone');

/** Link opened by a click on the value, undefined when it cannot be one */
export const contactHref = (kind: 'email' | 'phone', value: string) => {
  const text = value.trim();
  if (!text) {
    return;
  }
  if (kind === 'email') {
    return /^[^\s@]+@[^\s@]+$/.test(text) ? `mailto:${text}` : undefined;
  }
  // keep the leading + and the digits: "+33 6 12-34.56.78" -> tel:+33612345678
  const number = text.replace(/(?!^\+)[^\d]/g, '');
  return number.replace('+', '').length >= 3 ? `tel:${number}` : undefined;
};
