import { Input } from '@/components/ui/input';
import React from 'react';

type FiltroBasicoInputProps = {
  editarInput: (input: string) => void;
  inputFiltro: string;
};

const FiltroBasicoInput = ({
  editarInput,
  inputFiltro,
}: FiltroBasicoInputProps) => {
  return (
    <Input
      placeholder='Buscar'
      value={inputFiltro}
      onChange={(e) => {
        editarInput(e.target.value);
      }}
      className='w-full md:max-w-md'
    />
  );
};

export default FiltroBasicoInput;
