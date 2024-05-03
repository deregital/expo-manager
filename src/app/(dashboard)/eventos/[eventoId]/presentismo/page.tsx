'use client'
import { generateColumnsPresentismo } from "@/components/eventos/table/columnsPresentismo";
import { DataTable } from "@/components/modelos/table/dataTable";
import SearchInput from "@/components/ui/SearchInput";
import Loader from "@/components/ui/loader";
import { trpc } from "@/lib/trpc";
import { searchNormalize } from "@/lib/utils";
import { RouterOutputs } from "@/server";
import { format } from "date-fns";
import { ArrowLeftIcon } from "lucide-react";
import { useEffect, useState } from "react";

interface PresentismoPageProps {
  params: {
    eventoId: string;
  }
}

const PresentismoPage = ({params}: PresentismoPageProps) => {
  const {data: evento, isLoading: isLoadingEvento} = trpc.evento.getById.useQuery({
    id: params.eventoId
  });
  const {data: modelos, isLoading: modelosIsLoading} = trpc.modelo.getByEtiqueta.useQuery(evento ? [evento!.etiquetaConfirmoId] : [], {
    enabled: !!evento
  });

  const [modelosData, setModelosData] = useState<RouterOutputs['modelo']['getByEtiqueta']>(modelos ?? []);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!modelos) return;
    setModelosData(
      modelos.filter((modelo) => {
        if (modelo.idLegible !== null) {
          return (
            searchNormalize(modelo.idLegible.toString(), search) ||
            searchNormalize(modelo.nombreCompleto, search)
          );
        }
        return searchNormalize(modelo.nombreCompleto, search);
      })
    );
  }, [search, modelos]);

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
            window.history.back();
          }}
        />
      </div>
      <div className="flex justify-center items-center pb-3">
        <h1 className="text-3xl font-extrabold">Presentismo</h1>
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
      <div className='flex items-center justify-center gap-x-2 px-2 pb-5'>
        <SearchInput
          onChange={setSearch}
          placeholder='Buscar por nombre o ID legible'
        />
      </div>
      <DataTable columns={generateColumnsPresentismo(evento!.etiquetaAsistioId)} data={modelosData} isLoading={modelosIsLoading}/>
    </div>
  );
};

export default PresentismoPage;
