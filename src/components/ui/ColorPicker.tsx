'use client';
import { useState } from 'react';
import Colorful from '@uiw/react-color-colorful';
import { hsvaToHex, hexToHsva } from '@uiw/color-convert';
import { useGrupoEtiquetaModalData } from '@/components/etiquetas/modal/GrupoEtiquetaModal';
import { Button } from './button';
import { getTextColorByBg } from '@/lib/utils';

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
      <div className='absolute -right-5 top-12 flex flex-col gap-y-2'>
        <Colorful
          color={
            hexToHsva(modalData.color)
              ? hexToHsva(modalData.color)
              : { h: 0, s: 0, v: 68, a: 1 }
          }
          disableAlpha={true}
          onChange={(color) => {
            useGrupoEtiquetaModalData.setState({
              color: hsvaToHex(color.hsva),
            });
          }}
          className={`${open ? 'block' : 'hidden'}`}
        />
      </div>
    </>
  );
};

export default ColorPicker;
