import { AccessRules } from '@app/models';

export interface RegistryActionSchema {
  title: string;
  btnLabel: string;
  fields: string[];
}

export const schemas = {
  [AccessRules.CONFIRM_DECISION]: {
    title: 'Заполнение решения по вызову',
    btnLabel: 'Отправить администратору',
    fields: ['documents', 'comment', 'links']
  },
  [AccessRules.REJECT]: {
    icon: {
      color: '#E9371B',
      link: '#disallow'
    },
    title: 'Отклонение вызова',
    btnLabel: 'Отклонить вызов',
    fields: ['reason', 'documents', 'links']
  },
  [AccessRules.CONFIRM_WORK]: {
    title: 'Подтверждение вызова',
    btnLabel: 'Подтвердить вызов',
    fields: ['settings']
  },
  [AccessRules.CONFIRM]: {
    title: 'Подтверждение вызова',
    btnLabel: 'Подтвердить вызов',
    fields: ['settings']
  }
};

export const REJECT_SCHEMA = {
  icon: {
    color: '#E9371B',
    link: '#disallow'
  },
  title: 'Отклонение результата вызова',
  btnLabel: 'Отклонить',
  fields: ['rejectComment']
};
