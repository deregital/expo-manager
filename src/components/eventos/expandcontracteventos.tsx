import ContractIcon from '@/components/icons/ContractIcon';
import ExpandIcon from '@/components/icons/ExpandIcon';
import React from 'react';
import { create } from 'zustand';

export const useExpandEventos = create<{
  state: 'EXPAND' | 'CONTRACT' | 'NONE';
  expand: () => void;
  contract: () => void;
  none: () => void;
}>((set) => ({
  state: 'NONE',
  expand: () => set({ state: 'EXPAND' }),
  contract: () => set({ state: 'CONTRACT' }),
  none: () => set({ state: 'NONE' }),
}));

const ExpandContractEventos = () => {
  const { state, contract, expand } = useExpandEventos((s) => ({
    state: s.state,
    contract: s.contract,
    expand: s.expand,
  }));

  return (
    <div className='cursor-pointer'>
      {state === 'CONTRACT' && (
        <ExpandIcon className='h-5 w-5' onClick={() => expand()} />
      )}
      {state === 'EXPAND' && (
        <ContractIcon className='h-5 w-5' onClick={() => contract()} />
      )}
      {state === 'NONE' && (
        <ExpandIcon className='h-5 w-5' onClick={() => expand()} />
      )}
    </div>
  );
};

export default ExpandContractEventos;