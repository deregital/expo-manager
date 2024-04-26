'use client'
import { Button } from "@/components/ui/button";
import Loader from "@/components/ui/loader";
import { trpc } from "@/lib/trpc";
import { RouterOutputs } from "@/server";
import { toast } from "sonner";


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

    async function addPresentismo(modelo: RouterOutputs["modelo"]["getAll"][number], evento: RouterOutputs["evento"]["getById"]) {
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
    if (isLoadingEvento) return <Loader />;
    return (
        <div>
            <h1>Evento {params.eventoId}</h1>
            {modelos?.map((modelo) => {
                const etiquetasId = modelo.etiquetas.map((etiqueta) => etiqueta.id);
                console.log(modelo.nombreCompleto, etiquetasId, evento?.etiquetaConfirmoId);
                return (
                <div key={modelo.id} className="flex justify-center items-center">
                    <h2 className="pr-5">{modelo.nombreCompleto}</h2>                    
                    {(etiquetasId.includes(evento!.etiquetaAsistioId) || etiquetasId.includes(evento!.etiquetaConfirmoId)) ? (
                        <span>Asistió o confirmó</span>
                    ) : (
                        <>
                            <p>No hizo ninguna</p>
                            <Button className="ml-5" onClick={() => addPresentismo(modelo, evento!)}>Asistió</Button>
                        </>
                    )}
                </div>
                )
            })}
        </div>
    )
}

export default EventoPage;