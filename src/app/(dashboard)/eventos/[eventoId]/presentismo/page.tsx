'use client';
import AsistenciaModal, {
  usePresentismoModal,
} from '@/components/eventos/AsistenciaModal';
import { generateColumnsPresentismo } from '@/components/eventos/table/columnsPresentismo';
import { DataTable } from '@/components/modelos/table/dataTable';
import SearchInput from '@/components/ui/SearchInput';
import Loader from '@/components/ui/loader';
import { Progress } from '@/components/ui/progress';
import { trpc } from '@/lib/trpc';
import { searchNormalize } from '@/lib/utils';
import { format } from 'date-fns';
import { ArrowLeftIcon } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { generate } from '@pdfme/generator';
import { Template, BLANK_PDF } from '@pdfme/common';

interface PresentismoPageProps {
  params: {
    eventoId: string;
  };
}

const PresentismoPage = ({ params }: PresentismoPageProps) => {
  const { data: evento, isLoading: isLoadingEvento } =
    trpc.evento.getById.useQuery({
      id: params.eventoId,
    });
  const modalPresentismo = usePresentismoModal();
  const searchParams = new URLSearchParams(useSearchParams());
  const router = useRouter();
  const { data: modelos, isLoading: modelosIsLoading } =
    trpc.modelo.getByEtiqueta.useQuery(
      evento ? [evento.etiquetaConfirmoId, evento.etiquetaAsistioId] : [],
      {
        enabled: !!evento,
      }
    );

  const [search, setSearch] = useState('');

  const modelosData = useMemo(() => {
    if (!modelos) return [];
    return modelos.filter((modelo) => {
      if (modelo.idLegible !== null) {
        return (
          searchNormalize(modelo.idLegible.toString(), search) ||
          searchNormalize(modelo.nombreCompleto, search)
        );
      }
      return searchNormalize(modelo.nombreCompleto, search);
    });
  }, [search, modelos]);

  const countModelos = useMemo(() => {
    if (!modelos || !evento) return 0;
    return modelos.filter((modelo) =>
      modelo.etiquetas.find(
        (etiqueta) => etiqueta.id === evento.etiquetaAsistioId
      )
    ).length;
  }, [evento, modelos]);

  useEffect(() => {
    if (!evento) return;
    usePresentismoModal.setState({ evento: evento });
  }, [evento]);

  useEffect(() => {
    usePresentismoModal.setState({ isOpen: false });
    searchParams.delete('persona');
    router.push(`/eventos/${params.eventoId}/presentismo`);
  }, [searchParams.get('persona') === 'creada']);

  const progress = useMemo(() => {
    if (!modelos) return 0;
    const asistieron = modelos.filter((modelo) =>
      modelo.etiquetas.find(
        (etiqueta) => etiqueta.id === evento?.etiquetaAsistioId
      )
    ).length;

    const porcentaje = (asistieron / modelos.length) * 100;

    if (isNaN(porcentaje)) return 0;
    return porcentaje % 1 === 0 ? porcentaje : Number(porcentaje.toFixed(2));
  }, [evento?.etiquetaAsistioId, modelos]);

  const handleGeneratePDF = async () => {
    const modelosConfirmados = modelosData
      .filter((modelo) =>
        modelo.etiquetas.find(
          (etiqueta) => etiqueta.id === evento?.etiquetaConfirmoId
        )
      )
      .sort((a, b) => a.nombreCompleto.localeCompare(b.nombreCompleto));

    const participantes = modelosConfirmados
      .map((modelo) => `- ${modelo.nombreCompleto} (${modelo.dni})`)
      .join('\n\n');

    const template: Template = {
      basePdf: BLANK_PDF,
      schemas: [
        {
          name: {
            type: 'text',
            position: { x: 10, y: 20 },
            width: 200,
            height: 10,
            fontSize: 12,
          },
          date: {
            type: 'text',
            position: { x: 10, y: 30 },
            width: 200,
            height: 10,
            fontSize: 12,
          },
          location: {
            type: 'text',
            position: { x: 10, y: 40 },
            width: 200,
            height: 10,
            fontSize: 12,
          },
          participants: {
            type: 'text',
            position: { x: 10, y: 60 },
            width: 500,
            height: 500,
            fontSize: 12,
            lineHeight: 1.5,
          },
        },
      ],
    };

    const inputs = [
      {
        name: `Nombre: ${evento?.nombre}`,
        date: `Fecha: ${format(evento!.fecha, 'yyyy-MM-dd')}`,
        location: `Ubicación: ${evento?.ubicacion}`,
        participants: participantes,
      },
    ];

    const pdf = await generate({ template, inputs });
    const blob = new Blob([pdf.buffer], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Evento_${evento?.nombre}.pdf`;
    link.click();
  };

  if (isLoadingEvento)
    return (
      <div className='flex items-center justify-center pt-5'>
        <Loader />
      </div>
    );

  return (
    <div>
      <div>
        <ArrowLeftIcon
          className='h-10 w-10 pt-3 hover:cursor-pointer'
          onClick={() => {
            router.replace(`/eventos/${params.eventoId}`);
          }}
        />
      </div>
      <div className='flex items-center justify-center pb-3'>
        <h1 className='text-3xl font-extrabold'>Presentismo</h1>
      </div>
      <div className='grid auto-rows-auto grid-cols-2 items-center justify-center gap-x-3 pb-3 sm:flex'>
        <h3 className='col-span-2 p-2 text-center text-2xl font-semibold'>
          {evento?.nombre}
        </h3>
        <h3 className='p-2 text-center text-sm sm:text-base'>
          {format(evento!.fecha, 'yyyy-MM-dd')}
        </h3>
        <h3 className='p-2 text-center text-sm sm:text-base'>
          {evento?.ubicacion}
        </h3>
      </div>
      <div className='flex flex-col items-center justify-around gap-x-5 pb-5 sm:flex-row'>
        <div className='w-[80%] pb-3 sm:w-[30%] sm:pb-0'>
          <h3 className='text-sm sm:text-lg'>Progreso: {progress}%</h3>
          <Progress value={progress} className='rounded-full bg-gray-300' />
        </div>
        <div>
          <h3 className='text-sm sm:text-lg'>
            Confirmaron: {countModelos}{' '}
            {countModelos === 1 ? 'participante' : 'participantes'}
          </h3>
        </div>
      </div>
      <div className='flex items-center justify-center gap-x-2 px-2 pb-5'>
        <SearchInput
          onChange={setSearch}
          placeholder='Buscar por nombre o ID legible'
        />
      </div>
      <DataTable
        columns={generateColumnsPresentismo({
          asistenciaId: evento!.etiquetaAsistioId,
          confirmoId: evento!.etiquetaConfirmoId,
        })}
        data={modelosData}
        isLoading={modelosIsLoading}
        initialSortingColumn={{
          id: '¿Vino?' as keyof (typeof modelosData)[number],
          desc: false,
        }}
      />
      <div className='m-5 flex items-center justify-end'>
        <AsistenciaModal open={modalPresentismo.isOpen} />
      </div>
      <div className='m-5 flex justify-end'>
        <button
          onClick={handleGeneratePDF}
          className='rounded-lg bg-gray-400 px-3 py-1.5 text-xl font-bold text-black hover:bg-gray-500'
        >
          PDF
        </button>
      </div>
    </div>
  );
};

export default PresentismoPage;
