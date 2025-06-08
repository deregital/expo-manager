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
  editQuestion: (
    formId: string,
    questionId: string,
    question: Partial<
      Pick<
        DynamicFormForStore['questions'][number],
        'text' | 'required' | 'multipleChoice' | 'disabled'
      >
    >
  ) => void;
}>((set) => ({
  forms: [],
  setForms: (forms: DynamicFormForStore[]) => set({ forms }),
  addForm: (form: DynamicFormForStore) =>
    set((state) => ({ forms: [...state.forms, form] })),
  editOption: (formId, questionId, optionId, text) =>
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
  editQuestion: (
    formId,
    questionId,
    { text, required, multipleChoice, disabled }
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
                      text: text ?? q.text,
                      required: required ?? q.required,
                      multipleChoice: multipleChoice ?? q.multipleChoice,
                      disabled: disabled ?? q.disabled,
                    }
                  : q
              ),
            }
          : form
      ),
    })),
}));
