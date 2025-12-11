import { TAG_TO_KEY_MAP } from '@shared/constants/ethical-tags';
import type { EthicalTag } from '@shared/types/job';
import type { TFunction } from 'i18next';

const sanitizeTagKey = (tag: string) => tag.toLowerCase().replace(/[^a-zA-Z0-9]/g, '');

export const getEthicalTagKey = (tag: string): string =>
  TAG_TO_KEY_MAP[tag as EthicalTag] || sanitizeTagKey(tag);

export const translateEthicalTag = (t: TFunction, tag: string): string =>
  t(`jobs.tags.tags.${getEthicalTagKey(tag)}`, { defaultValue: tag });

