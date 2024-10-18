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
    const { etiquetas, groups } = useFiltro();
    const [include, setInclude] = useState(true);
    const [tagGroupId, setTagGroupId] = useState<string | undefined>(undefined);
    const [etiquetaId, setEtiquetaId] = useState<string | undefined>(undefined);

    const { data: tagGroupsData } = trpc.tagGroup.getAll.useQuery();
    const { data: dataEtiquetas } = tagGroupId
      ? trpc.etiqueta.getByGrupoEtiqueta.useQuery(tagGroupId)
      : trpc.etiqueta.getAll.useQuery();

    const etiquetasAvanzadas = useMemo(() => {
      return etiquetas.length > 1 ? etiquetas.slice(1) : [];
    }, [etiquetas]);

    const advancedGroups = useMemo(() => {
      return groups.length > 1 ? groups.slice(1) : [];
    }, [groups]);

    function handleDeleteEtiq(id: string) {
      useFiltro.setState({
        etiquetas: etiquetas.filter((et) => et.etiqueta.id !== id),
      });
    }

    function handleDeleteGroup(id: string) {
      useFiltro.setState({
        groups: groups.filter((gr) => gr.group.id !== id),
      });
    }

    function handleAddEtiq(id: string) {
      if (etiquetaId === id) {
        setEtiquetaId(undefined);
        return;
      }
      setEtiquetaId(id);
    }

    function handleAddGroup(id: string) {
      if (tagGroupId === id) {
        setEtiquetaId(undefined);
        setTagGroupId(undefined);
        return;
      }
      setTagGroupId(id);
    }

    function handleAgregar() {
      if (etiquetaId === undefined && tagGroupId === undefined) {
        return;
      }

      const tagOrGroup: 'et' | 'gr' = etiquetaId !== undefined ? 'et' : 'gr';

      if (tagOrGroup === 'et') {
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
        const groupToAdd = tagGroupsData?.find((gr) => gr.id === tagGroupId)!;
        useFiltro.setState({
          groups: [
            ...groups,
            {
              group: {
                id: groupToAdd.id,
                name: groupToAdd.name,
                color: groupToAdd.color,
              },
              include,
            },
          ],
        });
      }

      setEtiquetaId(undefined);
      setTagGroupId(undefined);
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
        {advancedGroups.map((group, index) => (
          <div key={index} className='flex items-center space-x-2 pb-2'>
            <p>{group.include ? 'SI' : 'NO'}</p>
            <ShowEtiqueta etiqueta={group.group} />
            <Button onClick={() => handleDeleteGroup(group.group.id)}>
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
            editTagGroup={handleAddGroup}
            groupId={tagGroupId}
            etiquetaId={etiquetaId}
          />
          <Button onClick={handleAgregar}>Agregar</Button>
        </div>
      </div>
    );
  };

export default FiltroAvanzadoEtiquetasYGrupos;
