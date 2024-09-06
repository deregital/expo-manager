'use client';

import { useState } from 'react';
import { Input } from './input';
import { Button } from './button';
import { Checkbox } from './checkbox';
import { Label } from './label';
import { filterModelos, Filtro } from '@/lib/filter';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './alert-dialog';
import { AlertDialogFooter, AlertDialogHeader } from './alert-dialog';

const ModalFiltro = ({
  modelos,
  onFilter,
  isOpen,
}: {
  modelos: any[];
  onFilter: (filteredModelos: any[]) => void;
  isOpen: boolean;
}) => {
  const [input, setInput] = useState('');
  const [instagram, setInstagram] = useState('');
  const [mail, setMail] = useState('');
  const [dni, setDni] = useState('');
  const [telefono, setTelefono] = useState('');
  const [genero, setGenero] = useState('');
  const [etiquetasId, setEtiquetasId] = useState<
    { id: string; include: boolean }[]
  >([]);
  const [gruposId, setGruposId] = useState<{ id: string; include: boolean }[]>(
    []
  );
  const [condicionalEtiq, setCondicionalEtiq] = useState<'AND' | 'OR'>('AND');
  const [condicionalGrupo, setCondicionalGrupo] = useState<'AND' | 'OR'>('AND');

  const handleFilter = () => {
    const filtro: Filtro = {
      input,
      etiquetasId,
      gruposId,
      condicionalEtiq,
      condicionalGrupo,
      instagram: instagram || null,
      mail: mail || null,
      dni: dni || null,
      telefono: telefono,
      genero: genero || null,
    };
    const filteredModelos = filterModelos(modelos, filtro);
    onFilter(filteredModelos);
    setOpen(false);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  const [open, setOpen] = useState(isOpen);

  return (
    <>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger></AlertDialogTrigger>
        <AlertDialogContent onCloseAutoFocus={handleCancel}>
          <AlertDialogHeader>
            <AlertDialogTitle>Filtrar Modelos</AlertDialogTitle>
          </AlertDialogHeader>

          <div className='space-y-4 overflow-y-auto'>
            {/* Input */}
            <div>
              <Label htmlFor='input'>Buscar por nombre o ID</Label>
              <Input
                id='input'
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder='Ingresa nombre o ID'
              />
            </div>

            {/* Instagram */}
            <div>
              <Label htmlFor='instagram'>Instagram</Label>
              <Input
                id='instagram'
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder='Instagram'
              />
            </div>

            {/* Mail */}
            <div>
              <Label htmlFor='mail'>Email</Label>
              <Input
                id='mail'
                value={mail}
                onChange={(e) => setMail(e.target.value)}
                placeholder='Email'
              />
            </div>

            {/* DNI */}
            <div>
              <Label htmlFor='dni'>DNI</Label>
              <Input
                id='dni'
                value={dni}
                onChange={(e) => setDni(e.target.value)}
                placeholder='DNI'
              />
            </div>

            {/* Teléfono */}
            <div>
              <Label htmlFor='telefono'>Teléfono</Label>
              <Input
                id='telefono'
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder='Teléfono'
              />
            </div>

            {/* Etiquetas y Condicional */}
            <div className='flex items-center space-x-2'>
              <Checkbox
                checked={condicionalEtiq === 'AND'}
                onCheckedChange={(checked: boolean) =>
                  setCondicionalEtiq(checked ? 'AND' : 'OR')
                }
              />
              <Label>Condición Etiquetas (AND/OR)</Label>
            </div>

            {/* Grupos y Condicional */}
            <div className='flex items-center space-x-2'>
              <Checkbox
                checked={condicionalGrupo === 'AND'}
                onCheckedChange={(checked: boolean) =>
                  setCondicionalGrupo(checked ? 'AND' : 'OR')
                }
              />
              <Label>Condición Grupos (AND/OR)</Label>
            </div>

            {/* Etiquetas dinámicas */}
            <div>
              <Label>Etiquetas</Label>
              {etiquetasId.map((etiqueta, index) => (
                <div key={index} className='flex items-center space-x-2'>
                  <Checkbox
                    checked={etiqueta.include}
                    onCheckedChange={(checked: boolean) =>
                      setEtiquetasId((prev) =>
                        prev.map((et, i) =>
                          i === index ? { ...et, include: checked } : et
                        )
                      )
                    }
                  />
                  <Label>{etiqueta.id}</Label>
                </div>
              ))}
            </div>

            {/* Grupos dinámicos */}
            <div>
              <Label>Grupos</Label>
              {gruposId.map((grupo, index) => (
                <div key={index} className='flex items-center space-x-2'>
                  <Checkbox
                    checked={grupo.include}
                    onCheckedChange={(checked: boolean) =>
                      setGruposId((prev) =>
                        prev.map((gr, i) =>
                          i === index ? { ...gr, include: checked } : gr
                        )
                      )
                    }
                  />
                  <Label>{grupo.id}</Label>
                </div>
              ))}
            </div>
          </div>

          <AlertDialogFooter>
            <Button variant='default' onClick={handleFilter}>
              Filtrar
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ModalFiltro;
