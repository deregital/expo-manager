'use client';
import { useState } from 'react';
import Colorful from '@uiw/react-color-colorful';
import { hsvaToHex, hexToHsva } from '@uiw/color-convert';
import { useGrupoEtiquetaModalData } from '@/components/etiquetas/modal/GrupoEtiquetaModal';
import { Button } from './button';
import { cn, getTextColorByBg, randomColor } from '@/lib/utils';

const ColorPicker = () => {
  const modalData = useGrupoEtiquetaModalData((state) => ({
    tipo: state.tipo,
    color: state.color,
  }));
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        style={{
          backgroundColor: `${useGrupoEtiquetaModalData.getState().color}`,
          color: getTextColorByBg(useGrupoEtiquetaModalData.getState().color),
        }}
        onClick={() => setOpen(!open)}
      >
        Elegir Color
      </Button>
      <div className='absolute top-12 flex -translate-x-[29%] flex-col gap-y-2'>
        <Colorful
          color={
            modalData.color.length > 0
              ? hexToHsva(modalData.color)
              : randomColor()
          }
          disableAlpha={true}
          onChange={(color) => {
            useGrupoEtiquetaModalData.setState({
              color: hsvaToHex(color.hsva),
            });
          }}
          className={cn(open ? 'block' : 'hidden')}
        />
      </div>
    </>
  );
};

export default ColorPicker;
