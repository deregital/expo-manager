'use client';

import EtiquetasComboYList from '@/components/etiquetas/asignacion/EtiquetasComboYList';
import ModelosComboYList, {
  asignacionSelectedData,
} from '@/components/etiquetas/asignacion/ModelosComboYList';
import { Button } from '@/components/ui/button';
import Loader from '@/components/ui/loader';
import { trpc } from '@/lib/trpc';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';
import { toast } from 'sonner';

interface AsignacionPageProps {}

const AsignacionPage = ({}: AsignacionPageProps) => {
  const utils = trpc.useUtils();
  const asignar = trpc.etiqueta.setMasivo.useMutation();
  const desasignar = trpc.etiqueta.unsetMasivo.useMutation();
  const router = useRouter();

  const {
    etiquetas: etiquetasList,
    modelos: modelosList,
    clearEtiquetas,
    clearModelos,
    clearGrupo,
  } = asignacionSelectedData();

  async function asignarEtiquetas() {
    const etiquetaIds = etiquetasList.map((e) => e.id);
    const modeloIds = modelosList.map((m) => m.id);

    // chequeo para no agregar etiquetas bloqueantes a modelos que ya tengan etiquetas bloqueantes
    for (const modelo of modelosList) {
      const etiquetasNuevas = etiquetasList.filter(
        (e) => !modelo.etiquetas.find((et) => et.id === e.id)
      );

      if (etiquetasNuevas.length === 0) continue;

      const etiquetasConMismoGrupo = etiquetasNuevas.filter((e) =>
        modelo.etiquetas.map((et) => et.grupoId).includes(e.grupoId)
      );

      const etiquetasCoincidentes = [
        ...etiquetasConMismoGrupo.filter((e) => e.grupo.esExclusivo),
        ...modelo.etiquetas.filter(
          (et) =>
            etiquetasConMismoGrupo.map((e) => e.grupoId).includes(et.grupoId) &&
            et.grupo.esExclusivo
        ),
      ];

      if (etiquetasCoincidentes.filter((e) => e.grupo.esExclusivo).length > 0) {
        toast.error(
          `La modelo ${modelo.nombreCompleto} ya tiene asignadas etiquetas exclusivas del mismo grupo: ` +
            etiquetasCoincidentes
              .filter((e) => e.grupo.esExclusivo)
              .map((e) => e.nombre)
              .join(', ')
        );
        return;
      }
    }

    await asignar
      .mutateAsync({
        etiquetaIds,
        modeloIds,
      })
      .then(() => {
        toast.success('Etiquetas asignadas correctamente');
        clearModelos();
        clearEtiquetas();
        clearGrupo();
        utils.modelo.getAll.invalidate();
      });
  }

  async function desasignarEtiquetas() {
    const etiquetaIds = etiquetasList.map((e) => e.id);
    const modeloIds = modelosList.map((m) => m.id);

    await desasignar
      .mutateAsync({
        etiquetaIds,
        modeloIds,
      })
      .then(() => {
        toast.success('Etiquetas desasignadas correctamente');
        clearModelos();
        clearEtiquetas();
        clearGrupo();
        utils.modelo.getAll.invalidate();
      });
  }

  return (
    <div className='p-3 md:p-5'>
      <div className='flex items-center gap-x-4 pb-3'>
        <ArrowLeft
          className='cursor-pointer md:h-8 md:w-8'
          onClick={() => router.back()}
        />
        <h1 className='text-xl font-bold md:text-3xl'>
          Asignación masiva de etiquetas
        </h1>
      </div>
      <div className='flex h-auto gap-x-2'>
        <div className='flex-1'>
          <ModelosComboYList />
          {modelosList.length === 0 && (
            <p className='mt-2'>
              Seleccione las modelos a las que quiere asignarle o desasignarle
              etiquetas
            </p>
          )}
        </div>
        <div className='flex-1'>
          <EtiquetasComboYList />
          {etiquetasList.length === 0 && (
            <p className='mt-2'>
              Seleccione las etiquetas que quiere asignar o desasignar de las
              modelos
            </p>
          )}
        </div>
      </div>
      <div className='flex gap-x-4'>
        <Button
          className='mt-4'
          onClick={() => asignarEtiquetas()}
          disabled={
            etiquetasList.length === 0 ||
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
            etiquetasList.length === 0 ||
            modelosList.length === 0 ||
            desasignar.isLoading ||
            asignar.isLoading
          }
        >
          {desasignar.isLoading || asignar.isLoading ? <Loader /> : 'Desasignar'}
        </Button>
      </div>
    </div>
  );
};

export default AsignacionPage;
