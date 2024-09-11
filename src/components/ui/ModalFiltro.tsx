'use client';

import { useState } from 'react';
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
import ShowEtiqueta from './ShowEtiqueta';

const ModalFiltro = () => {
  const [condicionalEtiq, setCondicionalEtiq] = useState<'AND' | 'OR'>('AND');
  const [condicionalGrupo, setCondicionalGrupo] = useState<'AND' | 'OR'>('AND');
  // Filtrado de etiquetas
  const [openGrupo, setOpenGrupo] = useState(false);
  const [openEtiqueta, setOpenEtiqueta] = useState(false);
  const [grupoEtiquetaSelected, setGrupoEtiquetaSelected] = useState('');
  const [etiquetaSelected, setEtiquetaSelected] = useState('');
  // Filtrado de grupos
  const [grupoSelected, setGrupoSelected] = useState('');
  const [etiquetaInclude, setEtiquetaInclude] = useState(true);
  const [grupoInclude, setGrupoInclude] = useState(true);
  const [open, setOpen] = useState(false);

  // const { data: etiqueta } = trpc.etiqueta.getById.useQuery(etiquetaSelected, {
  //   enabled: !!etiquetaSelected,
  // });
  const { data: grupoEtiquetas } = trpc.grupoEtiqueta.getAll.useQuery();
  const { data: etiquetas } =
    grupoEtiquetaSelected === ''
      ? trpc.etiqueta.getAll.useQuery()
      : trpc.etiqueta.getByGrupoEtiqueta.useQuery(grupoEtiquetaSelected);

  const openModal = useOpenModal();
  const filtro = useFiltro();

  const handleFilter = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    openModal.toggle();
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
      genero: 'Masculino',
    });
  };

  const handleUploadEtiq = () => {
    if (etiquetaSelected === '' && grupoEtiquetaSelected === '') return;
    if (etiquetaSelected === '') {
      useFiltro.setState({
        gruposId: [
          ...filtro.gruposId,
          {
            grupo: grupoEtiquetas?.find(
              (g) => g.id === grupoEtiquetaSelected
            ) ?? {
              id: '',
              created_at: '',
              updated_at: '',
              etiquetas: [],
              nombre: '',
              esExclusivo: false,
              color: '',
            },
            include: etiquetaInclude,
          },
        ],
      });
      setGrupoEtiquetaSelected('');
      setEtiquetaInclude(true);
      return;
    }
    const etiqueta = etiquetas?.find((et) => et.id === etiquetaSelected);
    if (!etiqueta) return;
    useFiltro.setState({
      etiquetasId: [
        ...filtro.etiquetasId,
        { etiqueta: etiqueta, include: true },
      ],
    });
    setGrupoEtiquetaSelected('');
    setEtiquetaSelected('');
    setEtiquetaInclude(true);
  };

  const handleDeleteEtiq = (index: number) => () => {
    useFiltro.setState({
      etiquetasId: filtro.etiquetasId.filter((_, i) => i !== index),
    });
  };

  const handleDeleteGrupo = (index: number) => () => {
    useFiltro.setState({
      gruposId: filtro.gruposId.filter((_, i) => i !== index),
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
              <Label>Etiquetas y grupos</Label>
              {filtro.etiquetasId.map((etiqueta, index) => (
                <div key={index} className='flex items-center space-x-2 pb-2'>
                  <p>{etiqueta.include ? 'SI' : 'NO'}</p>
                  <ShowEtiqueta etiqueta={etiqueta.etiqueta} />
                  <Button onClick={handleDeleteEtiq(index)}>Eliminar</Button>
                </div>
              ))}
              {filtro.gruposId.map((grupo, index) => (
                <div key={index} className='flex items-center space-x-2 pb-2'>
                  <p>{grupo.include ? 'SI' : 'NO'}</p>
                  <ShowEtiqueta etiqueta={grupo.grupo} />
                  <Button onClick={handleDeleteGrupo(index)}>Eliminar</Button>
                </div>
              ))}
              <div className='flex items-center justify-start gap-x-2'>
                <Select
                  value={etiquetaInclude ? 'true' : 'false'}
                  onValueChange={(value) =>
                    setEtiquetaInclude(value === 'true')
                  }
                >
                  <SelectTrigger className='w-24'>
                    <SelectValue placeholder='¿Está?' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='true'>SI</SelectItem>
                    <SelectItem value='false'>NO</SelectItem>
                  </SelectContent>
                </Select>
                <ComboBox
                  data={grupoEtiquetas || []}
                  id='id'
                  value='nombre'
                  onSelect={(id) => {
                    setOpenGrupo(false);
                    setGrupoEtiquetaSelected(id);
                  }}
                  open={openGrupo}
                  setOpen={setOpenGrupo}
                  selectedIf={grupoEtiquetaSelected || ''}
                  wFullMobile
                  triggerChildren={
                    <p>
                      {grupoEtiquetaSelected
                        ? grupoEtiquetas?.find(
                            (et) => et.id === grupoEtiquetaSelected
                          )?.nombre
                        : 'Grupos'}
                    </p>
                  }
                />
                <ComboBox
                  data={etiquetas || []}
                  id='id'
                  value='nombre'
                  onSelect={(id) => {
                    setOpenEtiqueta(false);
                    setEtiquetaSelected(id);
                  }}
                  open={openEtiqueta}
                  setOpen={setOpenEtiqueta}
                  selectedIf={etiquetaSelected || ''}
                  wFullMobile
                  triggerChildren={
                    <p>
                      {etiquetaSelected
                        ? etiquetas?.find((et) => et.id === etiquetaSelected)
                            ?.nombre
                        : 'Etiqueta'}
                    </p>
                  }
                />
                <Button onClick={handleUploadEtiq}>Add</Button>
              </div>
            </div>

            {/* Grupos dinámicos
            <div>
              <Label>Grupos</Label>
              {filtro.gruposId.map((grupo, index) => (
                <div key={index} className='flex items-center space-x-2'>
                  <p>{grupo.include ? 'SI' : 'NO'}</p>
                  <ShowEtiqueta etiqueta={grupo.grupo} />
                  <Button onClick={handleDeleteGrupo(index)}>Eliminar</Button>
                </div>
              ))}
              <div className='flex justify-start items-center gap-x-2'>
              <Select>
                <SelectTrigger className='w-24'>
                  <SelectValue placeholder='¿Está?' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='true'>SI</SelectItem>
                  <SelectItem value='false'>NO</SelectItem>
                </SelectContent>
              </Select>
                <ComboBox 
                  data={grupoEtiquetas || []}
                  id='id'
                  value='nombre'
                  onSelect={(id) => {
                    setOpen(false);
                    setGrupoSelected(id);
                  }}
                  open={open}
                  setOpen={setOpen}
                  selectedIf={grupoSelected || ''}
                  wFullMobile
                  triggerChildren={<p>{grupoSelected ? grupoEtiquetas?.find((g) => g.id === grupoSelected)?.nombre : 'Grupos'}</p>}
                />
                <Button onClick={handleUploadGrupo}>Add</Button>
              </div>
            </div> */}
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
