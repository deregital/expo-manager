import { create } from 'zustand';
import { type RouterOutputs } from '@/server';

export type DynamicFormForStore = RouterOutputs['form']['getAll'][number] & {
  type: 'db' | 'new';
};

export const useDynamicFormStore = create<{
  forms: DynamicFormForStore[];
  setForms: (forms: DynamicFormForStore[]) => void;
  addForm: (form: Pick<DynamicFormForStore, 'name'>) => DynamicFormForStore;
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
  addOption: (
    formId: string,
    questionId: string,
    option: Pick<
      DynamicFormForStore['questions'][number]['options'][number],
      'text'
    >
  ) => DynamicFormForStore['questions'][number]['options'][number] | undefined;
  addQuestion: (
    formId: string
  ) => DynamicFormForStore['questions'][number] | undefined;
  deleteOption: (formId: string, questionId: string, optionId: string) => void;
  deleteQuestion: (formId: string, questionId: string) => void;
}>((set, get) => ({
  forms: [],
  setForms: (forms: DynamicFormForStore[]) => set({ forms }),
  addForm: (form: Pick<DynamicFormForStore, 'name'>) => {
    const newForm = {
      name: form.name,
      id: crypto.randomUUID(),
      type: 'new',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      questions: [],
    } satisfies DynamicFormForStore;
    set((state) => ({
      forms: [...state.forms, newForm],
    }));
    return newForm;
  },
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
  addQuestion: (formId) => {
    const newQuestion = {
      id: `NULL-${crypto.randomUUID()}`,
      text: '',
      options: [],
      required: false,
      multipleChoice: false,
      disabled: false,
      formId,
      tagGroupId: 'NULL-TAG-GROUP',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      tagGroup: {
        id: 'NULL-TAG-GROUP',
        name: 'NULL-TAG-GROUP',
        color: 'NULL-TAG-GROUP',
        isExclusive: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    };
    const form = get().forms.find((f) => f.id === formId);
    if (form?.questions.some((q) => q.text.trim() === '')) {
      return;
    }

    set((state) => ({
      forms: state.forms.map((form) =>
        form.id === formId
          ? { ...form, questions: [...form.questions, newQuestion] }
          : form
      ),
    }));
    return newQuestion;
  },
  addOption: (formId, questionId, option) => {
    const newOption = {
      id: `NULL-${crypto.randomUUID()}`,
      text: option.text,
      tagId: 'NULL-TAG',
      questionId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      tag: {
        id: 'NULL-TAG',
        name: 'NULL-TAG',
        groupId: 'NULL-GROUP',
        type: 'FORM_OPTION',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    } satisfies DynamicFormForStore['questions'][number]['options'][number];

    const question = get()
      .forms.find((f) => f.id === formId)
      ?.questions.find((q) => q.id === questionId);

    if (question?.options.some((o) => o.text.trim() === '')) {
      return;
    }

    set((state) => ({
      forms: state.forms.map((form) =>
        form.id === formId
          ? {
              ...form,
              questions: form.questions.map((q) =>
                q.id === questionId
                  ? { ...q, options: [...q.options, newOption] }
                  : q
              ),
            }
          : form
      ),
    }));
    return newOption;
  },
  deleteOption: (formId, questionId, optionId) =>
    set((state) => ({
      forms: state.forms.map((form) =>
        form.id === formId
          ? {
              ...form,
              questions: form.questions.map((q) =>
                q.id === questionId
                  ? {
                      ...q,
                      options: q.options.filter((o) => o.id !== optionId),
                    }
                  : q
              ),
            }
          : form
      ),
    })),
  deleteQuestion: (formId, questionId) =>
    set((state) => ({
      forms: state.forms.map((form) =>
        form.id === formId
          ? {
              ...form,
              questions: form.questions.filter((q) => q.id !== questionId),
            }
          : form
      ),
    })),
}));
