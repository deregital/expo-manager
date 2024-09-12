import SearchInput from '@/components/ui/SearchInput';
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
    <SearchInput
      placeholder='Buscar por nombre o ID legible'
      value={inputFiltro}
      onChange={editarInput}
      className='w-full md:min-w-[20rem]'
    />
  );
};

export default FiltroBasicoInput;
