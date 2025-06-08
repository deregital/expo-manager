import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  useDynamicFormStore,
  type DynamicFormForStore,
} from '@/components/formulario/dynamicFormStore';
import EditFillIcon from '@/components/icons/EditFillIcon';

interface DynamicFormDisplayProps {
  form: DynamicFormForStore | null;
}

const DynamicFormDisplay = ({ form }: DynamicFormDisplayProps) => {
  return (
    form && (
      <div className='px-4 pt-4'>
        <div className='flex'>
          <h1 className='flex-1 text-center text-2xl font-bold'>
            {form?.name}
          </h1>
          <Button variant='outline'>
            {form?.type === 'db' ? 'Editar' : 'Guardar'}
          </Button>
        </div>
        <div className='flex w-full flex-col gap-y-4'>
          {form?.questions.map((question, idx) => (
            <QuestionDisplay key={question.id} question={question} />
          ))}
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
  const { editOption, editQuestion } = useDynamicFormStore((state) => ({
    editOption: state.editOption,
    editQuestion: state.editQuestion,
  }));

  return (
    <div className='flex flex-col gap-y-2'>
      <div className='flex flex-col gap-x-2 md:flex-row'>
        <div key={question.id} className='group relative'>
          <p
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
        </div>
      </div>
      {question.options.map((option) => (
        <div key={option.id} className='group relative w-full'>
          <div
            className='single-line block w-full cursor-pointer rounded px-2 py-1 pl-6 hover:bg-gray-100'
            contentEditable
            suppressContentEditableWarning
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
        </div>
      ))}
    </div>
  );
};
