import { useFiltro } from '@/components/ui/filtro/Filtro';
import FiltroBasicoEtiqueta from '@/components/ui/filtro/FiltroBasicoEtiqueta';
import ShowEtiqueta from '@/components/ui/ShowEtiqueta';
import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';
import { Switch } from '@/components/ui/switch';

interface FiltroAvanzadoEtiquetasYGruposProps {}

const FiltroAvanzadoEtiquetasYGrupos =
  ({}: FiltroAvanzadoEtiquetasYGruposProps) => {
    const { etiquetas, grupos } = useFiltro();
    const [include, setInclude] = useState(true);
    const [grupoId, setGrupoEtiqueta] = useState<string | undefined>(undefined);
    const [etiquetaId, setEtiquetaId] = useState<string | undefined>(undefined);

    const { data: dataGrupos } = trpc.grupoEtiqueta.getAll.useQuery();
    const { data: dataEtiquetas } = grupoId
      ? trpc.etiqueta.getByGrupoEtiqueta.useQuery(grupoId)
      : trpc.etiqueta.getAll.useQuery();

    const etiquetasAvanzadas = useMemo(() => {
      return etiquetas.length > 1 ? etiquetas.slice(1) : [];
    }, [etiquetas]);

    const gruposAvanzados = useMemo(() => {
      return grupos.length > 1 ? grupos.slice(1) : [];
    }, [grupos]);

    function handleDeleteEtiq(id: string) {
      useFiltro.setState({
        etiquetas: etiquetas.filter((et) => et.etiqueta.id !== id),
      });
    }

    function handleDeleteGrupo(id: string) {
      useFiltro.setState({
        grupos: grupos.filter((gr) => gr.grupo.id !== id),
      });
    }

    function handleAddEtiq(id: string) {
      if (etiquetaId === id) {
        setEtiquetaId(undefined);
        return;
      }
      setEtiquetaId(id);
    }

    function handleAddGrupo(id: string) {
      if (grupoId === id) {
        setGrupoEtiqueta(undefined);
        return;
      }
      setGrupoEtiqueta(id);
    }

    function handleAgregar() {
      if (etiquetaId === undefined && grupoId === undefined) {
        return;
      }

      const etiquetaOGrupo: 'et' | 'gr' =
        etiquetaId !== undefined ? 'et' : 'gr';

      if (etiquetaOGrupo === 'et') {
        const etiquetaAAgregar = dataEtiquetas?.find(
          (et) => et.id === etiquetaId
        )!;
        useFiltro.setState({
          etiquetas: [
            ...etiquetas,
            {
              etiqueta: {
                id: etiquetaAAgregar.id,
                nombre: etiquetaAAgregar.nombre,
              },
              include,
            },
          ],
        });
      } else {
        const grupoAAgregar = dataGrupos?.find((gr) => gr.id === grupoId)!;
        useFiltro.setState({
          grupos: [
            ...grupos,
            {
              grupo: {
                id: grupoAAgregar.id,
                nombre: grupoAAgregar.nombre,
                color: grupoAAgregar.color,
              },
              include,
            },
          ],
        });
      }

      setEtiquetaId(undefined);
      setGrupoEtiqueta(undefined);
    }

    return (
      <div className='flex flex-col gap-y-2'>
        {etiquetasAvanzadas.map((etiqueta, index) => (
          <div key={index} className='flex items-center space-x-2 pb-2'>
            {/* <p>{etiqueta.include ? 'SI' : 'NO'}</p> */}
            <Switch
              className='data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500 disabled:data-[state=checked]:bg-green-800 disabled:data-[state=unchecked]:bg-red-800'
              disabled
              checked={etiqueta.include}
            />
            <ShowEtiqueta etiqueta={etiqueta.etiqueta} />
            <Button onClick={() => handleDeleteEtiq(etiqueta.etiqueta.id)}>
              Eliminar
            </Button>
          </div>
        ))}
        {gruposAvanzados.map((grupo, index) => (
          <div key={index} className='flex items-center space-x-2 pb-2'>
            <p>{grupo.include ? 'SI' : 'NO'}</p>
            <ShowEtiqueta etiqueta={grupo.grupo} />
            <Button onClick={() => handleDeleteGrupo(grupo.grupo.id)}>
              Eliminar
            </Button>
          </div>
        ))}
        <div className='flex items-center gap-x-4'>
          <FiltroBasicoEtiqueta
            switchDisabled={false}
            include={include}
            setInclude={setInclude}
            editarEtiq={handleAddEtiq}
            editarGrupoEtiq={handleAddGrupo}
            grupoId={grupoId}
            etiquetaId={etiquetaId}
          />
          <Button onClick={handleAgregar}>Agregar</Button>
        </div>
      </div>
    );
  };

export default FiltroAvanzadoEtiquetasYGrupos;
