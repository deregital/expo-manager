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
import type { Plugin } from '@pdfme/common';
import { barcodes, text, line, tableBeta, readOnlyText } from '@pdfme/schemas';
import { PDFData, presentismoPDFSchema } from '@/lib/presentismoPDFSchema';
import { useProgress } from '@/hooks/eventos/presentismo/useProgress';
import PDFIcon from '@/components/icons/PDFIcon';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface PresentismoPageProps {
  eventoId: string;
  baseUrl: string;
}

const PresentismoPage = ({ baseUrl, eventoId }: PresentismoPageProps) => {
  const { data: evento, isLoading: isLoadingEvento } =
    trpc.evento.getById.useQuery({
      id: eventoId,
    });

  const { data: modelos, isLoading: modelosIsLoading } =
    trpc.modelo.getByEtiqueta.useQuery(
      evento ? [evento.etiquetaConfirmoId, evento.etiquetaAsistioId] : [],
      {
        enabled: !!evento,
      }
    );

  const modalPresentismo = usePresentismoModal();
  const searchParams = useSearchParams();
  const urlSearchParams = useMemo(
    () => new URLSearchParams(searchParams),
    [searchParams]
  );

  const [search, setSearch] = useState('');
  const router = useRouter();

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
    urlSearchParams.delete('persona');
    router.push(`/eventos/${eventoId}/presentismo`);
  }, [eventoId, router, urlSearchParams]);

  const progress = useProgress(modelos ?? [], evento?.etiquetaAsistioId ?? '');

  const handleGeneratePDF = async () => {
    const modelosConfirmados = modelosData
      .filter((modelo) =>
        modelo.etiquetas.find(
          (etiqueta) =>
            etiqueta.id === evento?.etiquetaConfirmoId ||
            etiqueta.id === evento?.etiquetaAsistioId
        )
      )
      .sort((a, b) => a.nombreCompleto.localeCompare(b.nombreCompleto));

    const tableContent = modelosConfirmados.map(
      (modelo) =>
        [
          modelo.nombreCompleto,
          modelo.idLegible ? modelo.idLegible.toString() : '',
          modelo.telefono,
          modelo.dni ?? '',
          (modelo.etiquetas.some(
            (etiqueta) => etiqueta.id === evento?.etiquetaAsistioId
          )
            ? 'SI'
            : '') as string,
        ] as PDFData[0]['datos'][number]
    );

    const plugins: {
      [key: string]: Plugin<any>;
    } = {
      qrcode: barcodes.qrcode,
      text,
      line,
      Table: tableBeta,
      readOnlyText,
    };

    const inputs: PDFData = [
      {
        nombre: `Nombre: ${evento?.nombre}`,
        fecha: `${format(evento!.fecha, 'dd/MM/yyyy')}`,
        ubicacion: `${evento?.ubicacion}`,
        datos: tableContent,
        qr: `${baseUrl}/eventos/${eventoId}/presentismo`,
      },
    ];

    const pdf = await generate({
      template: presentismoPDFSchema,
      inputs,
      plugins,
    });

    const blob = new Blob([pdf.buffer], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Evento_${evento?.nombre}.pdf`;

    toast.success('PDF generado con éxito');
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
            router.replace(`/eventos/${eventoId}`);
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
      <div className='mt-5 flex h-fit items-center justify-end'>
        <AsistenciaModal open={modalPresentismo.isOpen} />
        <div className='m-5 flex justify-end'>
          <Button
            onClick={handleGeneratePDF}
            className='rounded-lg bg-gray-400 text-2xl font-bold text-black hover:bg-gray-500'
          >
            <PDFIcon />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PresentismoPage;
