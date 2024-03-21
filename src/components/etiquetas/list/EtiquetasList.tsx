import { GrupoConMatch } from '@/app/(dashboard)/etiquetas/page';
import EtiquetasContent from '@/components/etiquetas/list/EtiquetasContent';
import GrupoTrigger from '@/components/etiquetas/list/GrupoTrigger';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { getTextColorByBg } from '@/lib/utils';
import React, { useMemo } from 'react';

interface EtiquetasListProps {
  grupos: GrupoConMatch[];
}

const EtiquetasList = ({ grupos }: EtiquetasListProps) => {
  const active = useMemo(() => {
    const active = new Set<string>();
    grupos.forEach((grupo) => {
      grupo.etiquetas.forEach((etiqueta) => {
        if (etiqueta.match) {
          active.add(grupo.id);
        }
      });
      if (grupo.match) {
        active.add(grupo.id);
      }
    });

    return active.size > 0 ? Array.from(active) : undefined;
  }, [grupos]);

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
    <Accordion type='multiple' className='pt-4' defaultValue={active}>
      {grupos.map((grupo) => (
        <AccordionItem
          id={grupo.id}
          defaultValue={grupo.match ? grupo.id : undefined}
          value={grupo.id}
          key={grupo.id}
          title={grupo.nombre}
          className='my-2 border-0'
        >
          <AccordionTrigger
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
