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
    async function addPresentismo(modelo: RouterOutputs["modelo"]["getAll"][number]) {
        const etiquetasId = modelo.etiquetas.map((etiqueta) => {
            return {
                id: etiqueta.id,
                grupo: {
                    id: etiqueta.grupoId,
                    esExclusivo: etiqueta.grupo.esExclusivo
                },
                nombre: etiqueta.nombre
            }
        });
        await editModelo.mutateAsync({
            id: modelo.id,
            etiquetas: [...etiquetasId, {
                id: etiqueta!.id,
                grupo: {
                    id: etiqueta!.grupo.id,
                    esExclusivo: etiqueta!.grupo.esExclusivo
                },
                nombre: etiqueta!.nombre
            }]
        });
        toast.success('Se agregó al presentismo');
        useUtils.modelo.getAll.invalidate()
    }
    if (isLoadingEvento) return <div className="flex justify-center items-center pt-5"><Loader /></div>;
    return (
        <div className="mx-3">
            <div>
                <ArrowLeftIcon className="w-10 h-10 pt-3 hover:cursor-pointer" onClick={() => {
                    window.history.back();
                }} />
            </div>
            <div className="flex justify-center items-center gap-x-3 pb-3">
                <h3 className="text-lg p-2 border bg-gray-400 rounded-lg">{evento?.nombre}</h3>
                <h3 className="text-lg p-2 border bg-gray-400 rounded-lg">{format(evento!.fecha, 'yyyy-MM-dd')}</h3>
                <h3 className="text-lg p-2 border bg-gray-400 rounded-lg">{evento?.ubicacion}</h3>
            </div>
            <div className="pb-5 flex justify-start items-center gap-x-2">
                <SearchInput onChange={setSearch} placeholder="Buscar por nombre o id de la modelo"/>
                <Button className="rounded-lg bg-gray-400 px-3 py-1.5 text-xl font-bold text-black hover:bg-gray-500" onClick={() => router.push(`/eventos/${evento?.id}/presentismo`)}>Presentismo</Button>
            </div>
            {modelosData.map((modelo) => {
                const etiquetasId = modelo.etiquetas.map((etiqueta) => etiqueta.id);
                return (
                <div key={modelo.id} className="flex justify-between items-center max-w-[800px] mx-auto mb-1 px-2 py-1 rounded-md bg-gray-400">
                    <h2 className="pr-5">{modelo.nombreCompleto}</h2>                    
                    {(etiquetasId.includes(evento!.etiquetaAsistioId) || etiquetasId.includes(evento!.etiquetaConfirmoId)) ? (
                        <div className="flex justify-center items-center gap-x-2">
                            <span>En presentismo</span>
                            <CheckIcon className="w-6 h-6" />
                        </div>
                    ) : (
                        <>
                            <Button className="ml-5 px-3 py-2 h-fit flex justify-center items-center gap-x-2" onClick={() => addPresentismo(modelo)}>
                                {editModelo.isLoading ?? <Loader />}
                                <PlusIcon className="w-4 h-4" />
                            </Button>
                        </>
                    )}
                </div>
                )
            })}
        </div>
    )
}

export default EventoPage;