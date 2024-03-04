'use client';
import { useState } from 'react';
import Colorful from '@uiw/react-color-colorful';
import { hsvaToHex } from '@uiw/color-convert';
import { hexToHsva } from '@uiw/color-convert';
import { useGrupoEtiquetaModalData } from './GrupoEtiquetaModal';
import { Button } from '../ui/button';

export default function ColorPicker() {
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
}
