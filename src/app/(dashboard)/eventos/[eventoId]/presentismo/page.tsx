'use client'
import { generateColumnsPresentismo } from "@/components/eventos/table/columnsPresentismo";
import { DataTable } from "@/components/modelos/table/dataTable";
import SearchInput from "@/components/ui/SearchInput";
import Loader from "@/components/ui/loader";
import { Progress } from "@/components/ui/progress";
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
  const {data: modelos, isLoading: modelosIsLoading} = trpc.modelo.getByEtiqueta.useQuery(evento ? [evento.etiquetaConfirmoId, evento.etiquetaAsistioId] : [], {
    enabled: !!evento
  });

  const [modelosData, setModelosData] = useState<RouterOutputs['modelo']['getByEtiqueta']>(modelos ?? []);
  const [search, setSearch] = useState('');
  const [countModelos, setCountModelos] = useState(0);
  const [progress, setProgress] = useState<number>(0);

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

  useEffect(() => {
    if (!modelos) return;
    if (!evento) return;
    setCountModelos(modelos.filter((modelo) => modelo.etiquetas.find((etiqueta) => etiqueta.id === evento?.etiquetaAsistioId)).length);
  }, [modelos, evento]);

  useEffect(() => {
    if (!modelos) return;
    const confirmaronAsistencia = modelos.filter((modelo) => modelo.etiquetas.find((etiqueta) => etiqueta.id === evento?.etiquetaConfirmoId)).length;
    setProgress((modelos.filter((modelo) => modelo.etiquetas.find((etiqueta) => etiqueta.id === evento?.etiquetaAsistioId)).length / confirmaronAsistencia) * 100);
  }, [modelos]);

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
      <div className="pb-5 flex flex-col sm:flex-row justify-around items-center gap-x-5">
          <div className="sm:w-[30%] w-[80%] pb-2 sm:pb-0">
            <h3 className="sm:text-lg text-sm">Progreso: {progress}%</h3>
            <Progress value={progress} className="bg-gray-300 rounded-full"/>
          </div>
          <div>
            <h3 className="sm:text-lg text-sm">Confirmaron: {countModelos}{' '}{countModelos === 1 ? 'modelo' : 'modelos'}</h3>
          </div>
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
