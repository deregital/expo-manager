import ContractIcon from '@/components/icons/ContractIcon';
import ExpandIcon from '@/components/icons/ExpandIcon';
import React from 'react';
import { create } from 'zustand';

export const useTagsSettings = create<{
  state: 'EXPAND' | 'CONTRACT' | 'NONE';
  showEventos: boolean;
  expand: () => void;
  contract: () => void;
  none: () => void;
}>((set) => ({
  state: 'NONE',
  showEventos: false,
  expand: () => set({ state: 'EXPAND' }),
  contract: () => set({ state: 'CONTRACT' }),
  none: () => set({ state: 'NONE' }),
}));

const ExpandContractTags = () => {
  const { state, contract, expand } = useTagsSettings((s) => ({
    state: s.state,
    contract: s.contract,
    expand: s.expand,
  }));
  return (
    <div className='cursor-pointer'>
      {(() => {
        switch (state) {
          case 'CONTRACT':
            return <ExpandIcon className='h-5 w-5' onClick={() => expand()} />;
          case 'EXPAND':
            return (
              <ContractIcon className='h-5 w-5' onClick={() => contract()} />
            );
          case 'NONE':
            return <ExpandIcon className='h-5 w-5' onClick={() => expand()} />;
        }
      })()}
    </div>
  );
};

export default ExpandContractTags;
