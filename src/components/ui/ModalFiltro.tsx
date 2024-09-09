'use client';

import { useEffect, useState } from 'react';
import { Input } from './input';
import { Button } from './button';
import { Label } from './label';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from './dialog';
import { DialogFooter, DialogHeader } from './dialog';
import { useFiltro, useOpenModal } from './FiltroComp';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';
import ComboBox from './ComboBox';
import { trpc } from '@/lib/trpc';

const ModalFiltro = () => {
  const [etiquetasId, setEtiquetasId] = useState<
    { id: string; include: boolean }[]
  >([]);
  const [gruposId, setGruposId] = useState<{ id: string; include: boolean }[]>(
    []
  );
  const [condicionalEtiq, setCondicionalEtiq] = useState<'AND' | 'OR'>('AND');
  const [condicionalGrupo, setCondicionalGrupo] = useState<'AND' | 'OR'>('AND');
  const { data: grupoEtiquetas } = trpc.grupoEtiqueta.getAll.useQuery();
  const [openGrupo, setOpenGrupo] = useState(false);
  const [openEtiqueta, setOpenEtiqueta] = useState(false);
  const [grupoEtiquetaSelected, setGrupoEtiquetaSelected] = useState('');
  const openModal = useOpenModal();
  const filtro = useFiltro();

  useEffect(() => {
    console.log(openModal);
  }, [openModal]);

  const handleFilter = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    // const filtro: Filtro = {
    //   input,
    //   etiquetasId,
    //   gruposId,
    //   condicionalEtiq,
    //   condicionalGrupo,
    //   instagram: instagram || null,
    //   mail: mail || null,
    //   dni: dni || null,
    //   telefono: telefono,
    //   genero: genero || null,
    // };
    openModal.toggle();
    // e.stopPropagation();
    // e.preventDefault();
  };

  const handleCancel = () => {
    if (openModal.isOpen) openModal.toggle();
  };

  const handleLimpiar = () => {
    useFiltro.setState({
      input: '',
      etiquetasId: [],
      gruposId: [],
      condicionalEtiq: 'AND',
      condicionalGrupo: 'AND',
      instagram: null,
      mail: null,
      dni: null,
      telefono: '',
      genero: null,
    });
  };

  return (
    <>
      <Dialog
        open={openModal.isOpen}
        onOpenChange={(open) => useOpenModal.setState({ isOpen: open })}
      >
        <DialogTrigger asChild>
          <Button onClick={openModal.toggle}>Buscador avanzado</Button>
        </DialogTrigger>
        <DialogContent
          className='max-h-[70%] overflow-y-auto'
          onCloseAutoFocus={handleCancel}
        >
          <DialogHeader>
            <DialogTitle>Filtrar Modelos</DialogTitle>
          </DialogHeader>

          <div className='space-y-4'>
            {/* Input */}
            <div>
              <Label htmlFor='input'>Buscar por nombre o ID</Label>
              <Input
                id='input'
                value={filtro.input}
                onChange={(e) => useFiltro.setState({ input: e.target.value })}
                placeholder='Ingresa nombre o ID'
              />
            </div>

            {/* Instagram */}
            <div>
              <Label htmlFor='instagram'>Instagram</Label>
              <Input
                id='instagram'
                value={filtro.instagram !== null ? filtro.instagram : ''}
                onChange={(e) =>
                  useFiltro.setState({ instagram: e.target.value })
                }
                placeholder='Instagram'
              />
            </div>

            {/* Mail */}
            <div>
              <Label htmlFor='mail'>Email</Label>
              <Input
                id='mail'
                value={filtro.mail !== null ? filtro.mail : ''}
                onChange={(e) => useFiltro.setState({ mail: e.target.value })}
                placeholder='Email'
              />
            </div>

            {/* DNI */}
            <div>
              <Label htmlFor='dni'>DNI</Label>
              <Input
                id='dni'
                value={filtro.dni !== null ? filtro.dni : ''}
                onChange={(e) => useFiltro.setState({ dni: e.target.value })}
                placeholder='DNI'
              />
            </div>

            {/* Teléfono */}
            <div>
              <Label htmlFor='telefono'>Teléfono</Label>
              <Input
                id='telefono'
                value={filtro.telefono}
                onChange={(e) =>
                  useFiltro.setState({ telefono: e.target.value })
                }
                placeholder='Teléfono'
              />
            </div>

            {/* Género */}
            <div>
              <Label>Género</Label>
              <Select
                value={filtro.genero !== null ? filtro.genero : undefined}
                onValueChange={(value) =>
                  useFiltro.setState({
                    genero: value as
                      | 'Masculino'
                      | 'Femenino'
                      | 'Otro'
                      | undefined,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='Selecciona un género' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='Masculino'>Masculino</SelectItem>
                  <SelectItem value='Femenino'>Femenino</SelectItem>
                  <SelectItem value='Otro'>Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Etiquetas y Condicional */}
            <div className='flex items-center space-x-2'>
              <Label>Condición Etiquetas (AND/OR)</Label>
              <Select
                value={condicionalEtiq}
                onValueChange={(value) =>
                  setCondicionalEtiq(value as 'AND' | 'OR')
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='Selecciona una condición' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='AND'>AND</SelectItem>
                  <SelectItem value='OR'>OR</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Grupos y Condicional */}
            <div className='flex items-center space-x-2'>
              <Label>Condición Grupos (AND/OR)</Label>
              <Select
                value={condicionalGrupo}
                onValueChange={(value) =>
                  setCondicionalGrupo(value as 'AND' | 'OR')
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='Selecciona una condición' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='AND'>AND</SelectItem>
                  <SelectItem value='OR'>OR</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Etiquetas dinámicas */}
            <div>
              <Label>Etiquetas</Label>
              {filtro.etiquetasId.map((etiqueta, index) => (
                <div key={index} className='flex items-center space-x-2'>
                  <ComboBox
                    data={grupoEtiquetas || []}
                    id='id'
                    value='nombre'
                    onSelect={(id) => {
                      setOpenEtiqueta(false);
                      useFiltro.setState({
                        etiquetasId: [...etiquetasId, { id, include: true }],
                      });
                    }}
                    open={openGrupo}
                    setOpen={setOpenGrupo}
                    selectedIf=''
                    wFullMobile
                    triggerChildren={}
                  />
                  <ComboBox
                    data={grupoEtiquetas || []}
                    id='id'
                    value='nombre'
                    onSelect={(id) => {
                      setOpenEtiqueta(false);
                      useFiltro.setState({
                        gruposId: [...gruposId, { id, include: true }],
                      });
                    }}
                    open={openEtiqueta}
                    setOpen={setOpenEtiqueta}
                    selectedIf=''
                    wFullMobile
                    triggerChildren={<p>{grupoEtiquetaSelected || 'Grupos'}</p>}
                  />
                </div>
              ))}
            </div>

            {/* Grupos dinámicos */}
            <div>
              <Label>Grupos</Label>
              {filtro.gruposId.map((grupo, index) => (
                <div key={index} className='flex items-center space-x-2'>
                  <ComboBox
                    data={grupoEtiquetas || []}
                    id='id'
                    value='nombre'
                    onSelect={(id) => {
                      setOpenEtiqueta(false);
                      useFiltro.setState({
                        etiquetasId: [...etiquetasId, { id, include: true }],
                      });
                    }}
                    open={openGrupo}
                    setOpen={setOpenGrupo}
                    selectedIf=''
                    wFullMobile
                    triggerChildren={}
                  />
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <div className='flex items-center justify-between'>
              <Button variant='default' onClick={handleLimpiar}>
                Limpiar filtros
              </Button>
              <Button variant='default' onClick={(e) => handleFilter(e)}>
                Filtrar
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ModalFiltro;
