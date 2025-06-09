import { PlusIcon, TrashIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  useDynamicFormStore,
  type DynamicFormForStore,
} from '@/components/formulario/dynamicFormStore';
import EditFillIcon from '@/components/icons/EditFillIcon';

const OptionsDisplay = ({
  question,
}: {
  question: DynamicFormForStore['questions'][number];
}) => {
  const { editOption, addOption, deleteOption } = useDynamicFormStore(
    (state) => ({
      editOption: state.editOption,
      addOption: state.addOption,
      deleteOption: state.deleteOption,
    })
  );

  return (
    <>
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
    </>
  );
};

export default OptionsDisplay;
