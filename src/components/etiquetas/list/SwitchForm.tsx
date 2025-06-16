import FormIcon from '@/components/icons/FormIcon';
import FormOffIcon from '@/components/icons/FormOffIcon';
import React from 'react';

interface SwitchFormProps {
  showForm: boolean;
  setShowForm: (_showForm: boolean) => void;
}

const SwitchForm = ({ setShowForm, showForm }: SwitchFormProps) => {
  return showForm ? (
    <FormIcon
      className='h-7 w-7 cursor-pointer'
      onClick={() => setShowForm(false)}
    />
  ) : (
    <FormOffIcon
      className='h-7 w-7 cursor-pointer'
      onClick={() => setShowForm(true)}
    />
  );
};

export default SwitchForm;
