'use client'
import { Button } from "@/components/ui/button";
import Loader from "@/components/ui/loader";
import { trpc } from "@/lib/trpc";
import { RouterOutputs } from "@/server";
import { ArrowLeftIcon, CheckIcon, PlusIcon } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import SearchInput from "@/components/ui/SearchInput";
import { useEffect, useState } from "react";
import { searchNormalize } from "@/lib/utils";
import { DataTable } from "@/components/modelos/table/dataTable";
import { generateColumns } from "@/components/eventos/table/columnsEvento";
import RaiseHand from "@/components/icons/RaiseHand";


interface EventoPageProps {
    params: {
        eventoId: string;
    };
}

const EventoPage = ({ params }: EventoPageProps) => {
    const { data: evento, isLoading: isLoadingEvento } = trpc.evento.getById.useQuery({
        id: params.eventoId
    });
    const { data: modelos } = trpc.modelo.getAll.useQuery();
    const { data: etiqueta } = trpc.etiqueta.getById.useQuery(evento ? evento.etiquetaConfirmoId : '', {
        enabled: !!evento
    });
    const editModelo = trpc.modelo.edit.useMutation();
    const useUtils = trpc.useUtils();
    const router = useRouter();
    const [search, setSearch] = useState('');
    const [modelosData, setModelosData] = useState<RouterOutputs["modelo"]["getAll"]>(modelos ?? []);
    useEffect(() => {
        if (!modelos) return;
        setModelosData(modelos.filter((modelo) => {
            if (modelo.idLegible !== null) {
                return searchNormalize(modelo.idLegible.toString(), search) || searchNormalize(modelo.nombreCompleto, search);
            }
            return searchNormalize(modelo.nombreCompleto, search);
        }));
    }, [search, modelos]);
    
    if (isLoadingEvento) return <div className="flex justify-center items-center pt-5"><Loader /></div>;
    return (
        <div className="">
            <div>
                <ArrowLeftIcon className="w-10 h-10 pt-3 hover:cursor-pointer" onClick={() => {
                    window.history.back();
                }} />
            </div>
            <div className="flex justify-center items-center gap-x-3 pb-3">
                <h3 className="sm:text-2xl text-xl p-2 font-bold">{evento?.nombre}</h3>
                <h3 className="sm:text-base text-sm p-2">{format(evento!.fecha, 'yyyy-MM-dd')}</h3>
                <h3 className="sm:text-base text-sm p-2">{evento?.ubicacion}</h3>
            </div>
            <div className="pb-5 flex justify-center items-center gap-x-2 px-2">
                <SearchInput onChange={setSearch} placeholder="Buscar por nombre o id de la modelo"/>
                <Button className="rounded-lg bg-gray-400 px-3 py-1.5 text-xl font-bold text-black hover:bg-gray-500" onClick={() => router.push(`/eventos/${evento?.id}/presentismo`)}>
                    <RaiseHand />
                </Button>
            </div>
            <DataTable columns={generateColumns(evento!.etiquetaConfirmoId)} data={modelosData} />
        </div>
    )
}

export default EventoPage;