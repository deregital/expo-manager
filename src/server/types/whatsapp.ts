import { type TemplateCategory, type TemplateStatus } from 'expo-backend-types';

export type Body = {
  type: 'BODY';
  text: string;
};
export type Buttons = {
  buttons: {
    text: string;
    type: 'QUICK_REPLY';
  }[];
  type: 'BUTTONS';
};

export type Template = {
  name: string;
  category: string;
  allow_category_change: boolean;
  language: string;
  components: Components[];
};

export type TemplateEdit = {
  components: Components[];
};

export type TemplateEditResponse = {
  success: boolean;
};

export type TemplateResponse = {
  id: string;
  status: TemplateStatus;
  category: TemplateCategory;
};

export type GetTemplatesResponse = {
  data: GetTemplatesData[];
};

export type GetTemplatesData = {
  name: string;
  id: string;
  status: string;
};

export type GetTemplateResponse = {
  data: {
    name: string;
    components: Components[];
    language: string;
    status: string;
    category: string;
    id: string;
  }[];
};

export type Components = Body | Buttons;

export type MessageJson = {
  id: string;
  timestamp: string;
  to?: string;
  from?: string;
  type: 'text' | 'template';
};

export type TextMessage = MessageJson & {
  type: 'text';
  text: {
    body: string;
  };
};

export type TemplateMessage = MessageJson & {
  type: 'template';
  templateName: string;
};
