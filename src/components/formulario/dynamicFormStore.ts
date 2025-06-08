import { create } from 'zustand';
import { type RouterOutputs } from '@/server';

export type DynamicFormForStore = RouterOutputs['form']['getAll'][number] & {
  type: 'db' | 'new';
};

export const useDynamicFormStore = create<{
  forms: DynamicFormForStore[];
  setForms: (forms: DynamicFormForStore[]) => void;
  addForm: (form: DynamicFormForStore) => void;
  editOption: (
    formId: string,
    questionId: string,
    optionId: string,
    text: string
  ) => void;
}>((set) => ({
  forms: [],
  setForms: (forms: DynamicFormForStore[]) => set({ forms }),
  addForm: (form: DynamicFormForStore) =>
    set((state) => ({ forms: [...state.forms, form] })),
  editOption: (
    formId: string,
    questionId: string,
    optionId: string,
    text: string
  ) =>
    set((state) => ({
      forms: state.forms.map((form) =>
        form.id === formId
          ? {
              ...form,
              questions: form.questions.map((q) =>
                q.id === questionId
                  ? {
                      ...q,
                      options: q.options.map((o) =>
                        o.id === optionId ? { ...o, text } : o
                      ),
                    }
                  : q
              ),
            }
          : form
      ),
    })),
}));
