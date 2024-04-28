import EtiquetasContent from '@/components/etiquetas/list/EtiquetasContent';
import { useEtiquetasSettings } from '@/components/etiquetas/list/ExpandContractEtiquetas';
import GrupoTrigger from '@/components/etiquetas/list/GrupoTrigger';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { getTextColorByBg } from '@/lib/utils';
import { RouterOutputs } from '@/server';
import React, { useEffect, useState } from 'react';

export type GrupoConMatch = Omit<
  RouterOutputs['etiqueta']['getByNombre'][number],
  'etiquetas'
> & {
  match: boolean;
  etiquetas: (RouterOutputs['etiqueta']['getByNombre'][number]['etiquetas'][number] & {
    match: boolean;
  })[];
};

interface EtiquetasListProps {
  grupos: GrupoConMatch[];
}

const EtiquetasList = ({ grupos }: EtiquetasListProps) => {
  const [active, setActive] = useState<string[]>([]);
  const { state, contract: setContract } = useEtiquetasSettings();

  useEffect(() => {
    if (state === 'EXPAND') {
      setActive(grupos.map((grupo) => grupo.id));
    } else if (state === 'NONE') {
      setActive(
        grupos
          .filter((grupo) => grupo.etiquetas.some((e) => e.match))
          .map((g) => g.id)
      );
    } else {
      setActive([]);
    }
  }, [grupos, state]);

  if (grupos.length === 0) {
    return (
      <div className='flex h-96 flex-col items-center justify-center gap-y-2'>
        <h3 className='text-xl text-slate-500'>No hay etiquetas</h3>
        <p className='text-sm text-slate-400'>
          Cambie el filtro o cree un item
        </p>
      </div>
    );
  }

  return (
    <Accordion
      type='multiple'
      className='pt-4'
      defaultValue={active}
      value={active}
    >
      {grupos.map((grupo) => (
        <AccordionItem
          value={grupo.id}
          key={grupo.id}
          title={grupo.nombre}
          className='my-2 border-0'
        >
          <AccordionTrigger
            onClick={() => {
              if (active.includes(grupo.id)) {
                setActive(active.filter((id) => id !== grupo.id));
                if (active.length === 1) {
                  setContract();
                }
              } else {
                setActive([...active, grupo.id]);
              }
            }}
            className='rounded-xl px-2 py-1.5'
            style={{
              backgroundColor: grupo.color,
              color: getTextColorByBg(grupo.color),
            }}
          >
            <GrupoTrigger grupo={grupo} />
          </AccordionTrigger>
          <AccordionContent className='pb-0 pl-2'>
            {grupo.etiquetas.map((etiqueta) => (
              <EtiquetasContent
                key={etiqueta.id}
                etiqueta={etiqueta}
                background={grupo.color}
                grupoId={grupo.id}
              />
            ))}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export default EtiquetasList;
