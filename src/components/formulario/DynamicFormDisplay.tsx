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
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import OptionsDisplay from './OptionsDisplay';

interface DynamicFormDisplayProps {
  form: DynamicFormForStore | null;
}

const DynamicFormDisplay = ({ form }: DynamicFormDisplayProps) => {
  const utils = trpc.useUtils();
  const router = useRouter();

  const editFormMutation = trpc.form.edit.useMutation({
    onSuccess: () => {
      utils.form.getAll.invalidate();
      toast.success('Formulario actualizado correctamente');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const createFormMutation = trpc.form.create.useMutation({
    onSuccess: (data) => {
      utils.form.getAll.invalidate();
      toast.success('Formulario creado correctamente');
      router.push(`/formulario?form=${data.id}`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const { addQuestion } = useDynamicFormStore((state) => ({
    addQuestion: state.addQuestion,
  }));

  async function submitForm() {
    if (!form) return;

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
      await editFormMutation.mutateAsync(body);
    } else {
      const body = {
        name: form.name,
        questions: form.questions.map((q) => ({
          text: q.text,
          required: q.required,
          multipleChoice: q.multipleChoice,
          disabled: q.disabled,
          options: q.options.map((o) => ({
            text: o.text,
          })),
        })),
      };
      await createFormMutation.mutateAsync(body);
    }
  }

  return (
    form && (
      <div className='px-4 pb-4'>
        <div className='flex flex-col gap-2 py-4 md:flex-row'>
          <h1 className='flex-1 text-center text-2xl font-bold'>
            {form?.name}
          </h1>
          <Button
            variant='outline'
            onClick={submitForm}
            disabled={editFormMutation.isLoading}
          >
            {form?.type === 'db' ? 'Confirmar edición' : 'Crear'}
          </Button>
          {form.type === 'db' && <DeleteFormButton formId={form.id} />}
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
  const { editQuestion, deleteQuestion } = useDynamicFormStore((state) => ({
    editQuestion: state.editQuestion,
    deleteQuestion: state.deleteQuestion,
  }));

  return (
    <div className='flex flex-col gap-y-2'>
      <div className='flex flex-col gap-x-2 md:flex-row'>
        <div key={question.id} className='group relative'>
          <p
            id={question.id}
            className='single-line rounded-md bg-gray-300 px-2 py-1 pl-6 text-lg font-bold'
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
      <OptionsDisplay question={question} />
    </div>
  );
};

const DeleteFormButton = ({ formId }: { formId: string }) => {
  const router = useRouter();
  const utils = trpc.useUtils();
  const deleteFormMutation = trpc.form.delete.useMutation({
    onSuccess: () => {
      utils.form.getAll.invalidate();
      toast.success('Formulario eliminado correctamente');
      router.push('/formulario');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const [wantsToDelete, setWantsToDelete] = useState(false);

  return (
    <Button
      variant='destructive'
      onClick={() => {
        if (wantsToDelete) {
          deleteFormMutation.mutate(formId);
        } else {
          setWantsToDelete(true);
        }
      }}
      disabled={deleteFormMutation.isLoading}
      className={cn(wantsToDelete && 'bg-red-700 hover:bg-red-800')}
    >
      {wantsToDelete ? 'Confirmar eliminación' : 'Eliminar formulario'}
    </Button>
  );
};
