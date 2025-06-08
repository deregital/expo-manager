import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  useDynamicFormStore,
  type DynamicFormForStore,
} from '@/components/formulario/dynamicFormStore';
import EditFillIcon from '@/components/icons/EditFillIcon';
import { PlusIcon, TrashIcon } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

interface DynamicFormDisplayProps {
  form: DynamicFormForStore | null;
  refetch: () => void;
}

const DynamicFormDisplay = ({ form, refetch }: DynamicFormDisplayProps) => {
  const utils = trpc.useUtils();
  const editQuestionMutation = trpc.form.edit.useMutation({
    onSuccess: () => {
      utils.form.getAll.invalidate();
      refetch();
      toast.success('Formulario actualizado correctamente');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const { addQuestion } = useDynamicFormStore((state) => ({
    addQuestion: state.addQuestion,
  }));

  async function submitForm() {
    if (form?.type === 'db') {
      const body = {
        id: form.id,
        name: form.name,
        questions: form.questions.map((q) => ({
          ...q,
          id: q.id!.startsWith('NULL') ? null : q.id,
          options: q.options.map((o) => ({
            ...o,
            id: o.id!.startsWith('NULL') ? null : o.id,
          })),
        })),
      };

      await editQuestionMutation.mutateAsync(body);
    }
  }

  return (
    form && (
      <div className='px-4 pb-4'>
        <div className='flex py-4'>
          <h1 className='flex-1 text-center text-2xl font-bold'>
            {form?.name}
          </h1>
          <Button
            variant='outline'
            onClick={submitForm}
            disabled={editQuestionMutation.isLoading}
          >
            {form?.type === 'db' ? 'Confirmar edición' : 'Crear'}
          </Button>
        </div>
        <div className='flex w-full flex-col gap-y-4'>
          {form?.questions.map((question, idx) => (
            <QuestionDisplay key={question.id} question={question} />
          ))}
          <Button
            variant='outline'
            onClick={async () => {
              const newQuestion = addQuestion(form.id);
              if (!newQuestion) return;
              await new Promise((resolve) => setTimeout(resolve, 50));
              const newQuestionElement = document.getElementById(
                newQuestion.id
              );
              if (newQuestionElement) {
                (newQuestionElement as HTMLElement).contentEditable = 'true';
                (newQuestionElement as HTMLElement).focus();
              }
            }}
          >
            <PlusIcon className='size-4' />
            Agregar pregunta
          </Button>
        </div>
      </div>
    )
  );
};

export default DynamicFormDisplay;

const QuestionDisplay = ({
  question,
}: {
  question: DynamicFormForStore['questions'][number];
}) => {
  const { editOption, editQuestion, addOption, deleteOption, deleteQuestion } =
    useDynamicFormStore((state) => ({
      editOption: state.editOption,
      editQuestion: state.editQuestion,
      addOption: state.addOption,
      deleteOption: state.deleteOption,
      deleteQuestion: state.deleteQuestion,
    }));

  return (
    <div className='flex flex-col gap-y-2'>
      <div className='flex flex-col gap-x-2 md:flex-row'>
        <div key={question.id} className='group relative'>
          <p
            id={question.id}
            className='rounded-md bg-gray-300 px-2 py-1 pl-6 text-lg font-bold'
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => {
              const newText = e.currentTarget.textContent;
              const oldText = question.text;
              if (!newText) {
                e.currentTarget.textContent = oldText;
                return;
              }

              if (newText && newText !== oldText) {
                editQuestion(question.formId, question.id, {
                  text: newText,
                });
              }
            }}
          >
            {question.text}
          </p>

          <EditFillIcon className='absolute left-1 top-1/2 hidden h-4 w-4 -translate-y-1/2 group-hover:block group-active:block' />
        </div>
        <div className='flex flex-wrap items-center divide-x-2 divide-gray-300'>
          <span className='flex items-center gap-x-0.5 px-2 first:pl-0'>
            <Checkbox
              className='self-center'
              checked={question.required}
              onCheckedChange={(checked) => {
                editQuestion(question.formId, question.id, {
                  required: checked === 'indeterminate' ? false : checked,
                });
              }}
            />
            Obligatorio
          </span>
          <span className='flex items-center gap-x-0.5 px-2 first:pl-0'>
            <Checkbox
              className='self-center'
              checked={question.multipleChoice}
              onCheckedChange={(checked) => {
                editQuestion(question.formId, question.id, {
                  multipleChoice: checked === 'indeterminate' ? false : checked,
                });
              }}
            />
            Múltiple
          </span>
          <span className='flex items-center gap-x-0.5 px-2 first:pr-0'>
            <Checkbox
              className='self-center'
              checked={question.disabled}
              onCheckedChange={(checked) => {
                editQuestion(question.formId, question.id, {
                  disabled: checked === 'indeterminate' ? false : checked,
                });
              }}
            />
            Deshabilitada
          </span>
          <Button
            variant='destructive'
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              deleteQuestion(question.formId, question.id);
            }}
            className=''
          >
            <TrashIcon className='size-4' />
          </Button>
        </div>
      </div>
      <div className='flex flex-col divide-y-2 divide-gray-300 '>
        {question.options.map((option) => (
          <div
            key={option.id}
            className='group relative w-full py-1 first:pt-0 last:pb-0'
          >
            <div
              className='single-line block w-full cursor-pointer rounded pl-6 hover:bg-gray-100'
              contentEditable
              suppressContentEditableWarning
              id={option.id}
              onChange={(e) => {
                const newText = e.currentTarget.textContent;
                if (!newText) {
                  e.currentTarget.contentEditable = 'false';
                }
              }}
              onBlur={(e) => {
                const newText = e.currentTarget.textContent;
                const oldText = option.text;
                if (!newText) {
                  e.currentTarget.textContent = oldText;
                  return;
                }

                if (newText && newText !== oldText) {
                  editOption(question.formId, question.id, option.id, newText);
                }
              }}
            >
              {option.text}
            </div>
            <EditFillIcon className='absolute left-1 top-1/2 hidden h-4 w-4 -translate-y-1/2 group-hover:block group-active:block' />
            <Button
              variant='destructive'
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                deleteOption(question.formId, question.id, option.id);
              }}
              className='absolute right-1 top-1/2 hidden aspect-square h-full -translate-y-1/2 items-center p-2 group-hover:flex group-active:block'
            >
              <TrashIcon className='size-4' />
            </Button>
          </div>
        ))}
      </div>
      <Button
        variant='outline'
        size='sm'
        className='w-fit'
        onClick={async () => {
          const newOption = addOption(question.formId, question.id, {
            text: '',
          });
          if (!newOption) return;
          // wait for the option to be added to the DOM
          await new Promise((resolve) => setTimeout(resolve, 50));
          const newOptionElement = document.getElementById(newOption.id);
          if (newOptionElement) {
            (newOptionElement as HTMLElement).contentEditable = 'true';
            (newOptionElement as HTMLElement).focus();
          }
        }}
      >
        <PlusIcon className='h-4 w-4' />
        Agregar opción
      </Button>
    </div>
  );
};
