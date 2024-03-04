'use client';
import { useState } from 'react';
import Colorful from '@uiw/react-color-colorful';
import { hsvaToHex } from '@uiw/color-convert';
import { useGrupoEtiquetaModalData } from './GrupoEtiquetaModal';
import { Button } from '../ui/button';

export default function ColorPicker() {
  const [hsva, setHsva] = useState({ h: 0, s: 0, v: 68, a: 1 });
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        className={`${open ? 'hidden' : 'block'} bg-[${hsvaToHex(hsva)}] hover:bg-[${hsvaToHex(hsva)}]`}
        onClick={() => {
          console.log(hsvaToHex(hsva));
          setOpen(!open);
        }}
      >
        Elegir Color
      </Button>
      <div className='flex flex-col gap-y-2'>
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
        <Button
          className={`${open ? 'block' : 'hidden'}`}
          onClick={() => setOpen(!open)}
        >
          Guardar color
        </Button>
      </div>
    </>
  );
}
