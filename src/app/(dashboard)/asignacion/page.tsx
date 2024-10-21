'use client';

import EtiquetasComboYList from '@/components/etiquetas/asignacion/EtiquetasComboYList';
import ModelosComboYList, {
  asignacionSelectedData,
} from '@/components/etiquetas/asignacion/ModelosComboYList';
import Filtro from '@/components/ui/filtro/Filtro';
import { Button } from '@/components/ui/button';
import Loader from '@/components/ui/loader';
import { FuncionFiltrar, filterModelos } from '@/lib/filter';
import { trpc } from '@/lib/trpc';
import { RouterOutputs } from '@/server';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { toast } from 'sonner';

interface AsignacionPageProps {}

const AsignacionPage = ({}: AsignacionPageProps) => {
  const utils = trpc.useUtils();
  const asignar = trpc.tag.massiveAllocation.useMutation();
  const desasignar = trpc.tag.masiveDeallocation.useMutation();
  const router = useRouter();

  const { data: modelos, isLoading: modelosLoading } =
    trpc.modelo.getAll.useQuery();

  const [modelosFiltradas, setModelosFiltradas] = useState<
    RouterOutputs['modelo']['getAll']
  >(modelos ?? []);

  const {
    tagsList,
    modelos: modelosList,
    clearTags,
    clearModelos,
    clearGroup,
  } = asignacionSelectedData();

  const filtrarModelos: FuncionFiltrar = (filter) => {
    if (!modelos) return;
    setModelosFiltradas(filterModelos(modelos, filter));
  };

  async function allocateTags() {
    const tagIds = tagsList.map((t) => t.id);
    const modeloIds = modelosList.map((m) => m.id);

    // chequeo para no agregar etiquetas bloqueantes a modelos que ya tengan etiquetas bloqueantes
    for (const modelo of modelosList) {
      const newTags = tagsList.filter(
        (t) => !modelo.etiquetas.find((et) => et.id === t.id)
      );

      if (newTags.length === 0) continue;

      const tagsSameGroup = newTags.filter((t) =>
        modelo.etiquetas.map((tag) => tag.grupoId).includes(t.groupId)
      );

      const sameTags = [
        ...tagsSameGroup.filter((e) => e.group.isExclusive),
        ...(modelo.etiquetas.filter(
          (et) =>
            tagsSameGroup.map((e) => e.groupId).includes(et.grupoId) &&
            et.grupo.esExclusivo
          // TODO: This is a bug, the type of RouterOutputs['tag']['getAll'] is not the same as the type of modelo.etiquetas
        ) as unknown as RouterOutputs['tag']['getAll']),
      ];

      if (sameTags.filter((t) => t.group.isExclusive).length > 0) {
        toast.error(
          `El participante ${modelo.nombreCompleto} ya tiene asignadas etiquetas exclusivas del mismo grupo: ` +
            sameTags
              .filter((e) => e.group.isExclusive)
              .map((e) => e.name)
              .join(', ')
        );
        return;
      }
    }

    await asignar
      .mutateAsync({
        tagIds,
        profileIds: modeloIds,
      })
      .then(() => {
        toast.success('Etiquetas asignadas correctamente');
        clearModelos();
        clearTags();
        clearGroup();
        utils.modelo.getAll.invalidate();
      });
  }

  async function desasignarEtiquetas() {
    const tagIds = tagsList.map((e) => e.id);
    const modeloIds = modelosList.map((m) => m.id);

    await desasignar
      .mutateAsync({
        tagIds,
        profileIds: modeloIds,
      })
      .then(() => {
        toast.success('Etiquetas desasignadas correctamente');
        clearModelos();
        clearTags();
        clearGroup();
        utils.modelo.getAll.invalidate();
      });
  }

  return (
    <div className='flex flex-col gap-y-3'>
      <div className='flex items-center gap-x-4 pb-3'>
        <ArrowLeft
          className='cursor-pointer md:h-8 md:w-8'
          onClick={() => router.back()}
        />
        <h1 className='text-xl font-bold md:text-3xl'>
          Asignación masiva de etiquetas
        </h1>
      </div>
      <Filtro
        className='py-1'
        funcionFiltrado={filtrarModelos}
        showTag
        mostrarInput
      />
      <div className='flex h-auto gap-x-2 border-t-[1px] border-t-black/20 p-3 md:p-5 '>
        <div className='flex-1'>
          <ModelosComboYList
            modelos={modelosFiltradas}
            modelosLoading={modelosLoading}
          />
          {modelosList.length === 0 && (
            <p className='mt-2'>
              Seleccione los participantes a los que quiere asignarle o
              desasignarle etiquetas
            </p>
          )}
        </div>
        <div className='flex-1'>
          <EtiquetasComboYList />
          {tagsList.length === 0 && (
            <p className='mt-2'>
              Seleccione las etiquetas que quiere asignar o desasignar de los
              participantes
            </p>
          )}
        </div>
      </div>
      <div className='ml-4 flex gap-x-4'>
        <Button
          className='mt-4'
          onClick={() => allocateTags()}
          disabled={
            tagsList.length === 0 ||
            modelosList.length === 0 ||
            desasignar.isLoading ||
            asignar.isLoading
          }
        >
          {asignar.isLoading ? <Loader /> : 'Asignar'}
        </Button>
        <Button
          className='mt-4'
          onClick={() => desasignarEtiquetas()}
          disabled={
            tagsList.length === 0 ||
            modelosList.length === 0 ||
            desasignar.isLoading ||
            asignar.isLoading
          }
        >
          {desasignar.isLoading || asignar.isLoading ? (
            <Loader />
          ) : (
            'Desasignar'
          )}
        </Button>
      </div>
    </div>
  );
};

export default AsignacionPage;
