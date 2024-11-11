import { useFilter } from '@/components/ui/filtro/Filtro';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import React, { useState } from 'react';

interface FiltroAvanzadoInputsProps {}

const FiltroAvanzadoInputs = ({}: FiltroAvanzadoInputsProps) => {
  const [openSelectGenero, setOpenSelectGenero] = useState(false);
  const { dni, gender, instagram, mail, phoneNumber } = useFilter((s) => ({
    dni: s.dni,
    gender: s.gender,
    instagram: s.instagram,
    mail: s.mail,
    phoneNumber: s.phoneNumber,
  }));

  const inputs: Array<
    {
      placeholder: string;
      value: string | null | undefined;
    } & (
      | {
          type?: never;
          onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
        }
      | {
          type: 'select';
          options: Array<{ value: string; label: string; disabled?: boolean }>;
          open: boolean;
          onOpenChange: (open: boolean) => void;
          onChange: (e: string) => void;
        }
    )
  > = [
    {
      placeholder: 'DNI',
      value: dni,
      onChange: (e) => {
        useFilter.setState({ dni: e.target.value });
      },
    },
    {
      placeholder: 'Género',
      value: gender,
      onChange: (e: string) => {
        if (e === 'N/A') {
          useFilter.setState({ gender: undefined });
          return;
        }
        useFilter.setState({ gender: e });
      },
      type: 'select',
      options: [
        { value: 'Todos', label: 'Todos' },
        { value: 'Masculino', label: 'Masculino' },
        { value: 'Femenino', label: 'Femenino' },
        { value: 'Otro', label: 'Otro' },
      ],
      open: openSelectGenero,
      onOpenChange: setOpenSelectGenero,
    },
    {
      placeholder: 'Instagram',
      value: instagram,
      onChange: (e) => {
        useFilter.setState({ instagram: e.target.value });
      },
    },
    {
      placeholder: 'Mail',
      value: mail,
      onChange: (e) => {
        useFilter.setState({ mail: e.target.value });
      },
    },
    {
      placeholder: 'Teléfono',
      value: phoneNumber,
      onChange: (e) => {
        useFilter.setState({ phoneNumber: e.target.value });
      },
    },
  ];

  return (
    <div className='flex w-full flex-row flex-wrap items-center justify-end gap-2'>
      {inputs.map((input, index) =>
        input.type === 'select' ? (
          <Select
            key={index}
            open={input.open}
            onOpenChange={input.onOpenChange}
            onValueChange={(value) => {
              input.onChange(value);
            }}
            defaultValue={'Todos'}
          >
            <SelectTrigger className='w-full md:max-w-[25%]'>
              <SelectValue placeholder={input.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {input.options.map((option) => (
                <SelectItem
                  key={option.label}
                  value={option.value}
                  disabled={option.disabled}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            key={index}
            placeholder={input.placeholder}
            value={input.value ?? ''}
            onChange={input.onChange}
            className='w-full md:max-w-[25%]'
          />
        )
      )}
    </div>
  );
};

export default FiltroAvanzadoInputs;
