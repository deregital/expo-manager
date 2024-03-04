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
  const [hsva, setHsva] = useState(
    modalData.tipo === 'EDIT'
      ? hexToHsva(modalData.color)
      : { h: 0, s: 0, v: 68, a: 1 }
  );
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        style={{ backgroundColor: `${hsvaToHex(hsva)}` }}
        onClick={() => {
          console.log(hsvaToHex(hsva));
          setOpen(!open);
        }}
      >
        Elegir Color
      </Button>
      <div className='absolute -right-5 top-12 flex flex-col gap-y-2'>
        <Colorful
          color={hsva}
          disableAlpha={true}
          onChange={(color) => {
            setHsva(color.hsva);
            console.log(hsvaToHex(color.hsva));
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
