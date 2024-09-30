'use client';
import { useState } from 'react';
import Colorful from '@uiw/react-color-colorful';
import { hsvaToHex, hexToHsva } from '@uiw/color-convert';
import { Button } from './button';
import { cn, getTextColorByBg, randomColor } from '@/lib/utils';

interface ColorPickerProps {
  color: string;
  setColor: (color: string) => void;
}

const ColorPicker = ({ color, setColor }: ColorPickerProps) => {
  const [open, setOpen] = useState(false);

  return (
    <div className='relative'>
      <Button
        style={{
          backgroundColor: `${color}`,
          color: getTextColorByBg(color),
        }}
        onClick={() => setOpen(!open)}
      >
        Elegir Color
      </Button>
      <div className='absolute top-12 flex -translate-x-[45%] flex-col gap-y-2'>
        <Colorful
          color={color.length > 0 ? hexToHsva(color) : randomColor()}
          disableAlpha={true}
          onChange={(color) => {
            setColor(hsvaToHex(color.hsva));
          }}
          className={cn(open ? 'block' : 'hidden')}
        />
      </div>
    </div>
  );
};

export default ColorPicker;
