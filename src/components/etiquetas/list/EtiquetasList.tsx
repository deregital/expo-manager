import EtiquetasContent from '@/components/etiquetas/list/EtiquetasContent';
import GrupoTrigger from '@/components/etiquetas/list/GrupoTrigger';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { getTextColorByBg } from '@/lib/utils';
import { RouterOutputs } from '@/server';
import React from 'react';

interface EtiquetasListProps {
  grupos: RouterOutputs['etiqueta']['getByNombre'];
}

const EtiquetasList = ({ grupos }: EtiquetasListProps) => {
  return (
    <Accordion type='multiple' className='pt-4'>
      {grupos.map((grupo) => (
        <AccordionItem
          value={grupo.id}
          key={grupo.id}
          title={grupo.nombre}
          className='my-2 border-0'
        >
          <AccordionTrigger
            className='rounded-xl px-2'
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
