'use client'
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { RouterOutputs } from "@/server";
import { Row } from "@tanstack/react-table";
import { CheckIcon, PlusIcon } from "lucide-react";
import { toast } from "sonner";


export const CellComponent = ({row, confirmoAsistenciaId}:{row: Row<RouterOutputs["modelo"]["getAll"][number]>, confirmoAsistenciaId: string}) => {
    const etiquetasId = row.original.etiquetas.map((etiqueta: any) => etiqueta.id);
    const { data: etiqueta } = trpc.etiqueta.getById.useQuery(confirmoAsistenciaId, {
        enabled: !!row.original
    });
    const editModelo = trpc.modelo.edit.useMutation();
    const useUtils = trpc.useUtils();
    
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


    return (
        <div className='flex flex-wrap gap-1'>
            {etiquetasId.includes(confirmoAsistenciaId) ? (
                <div className="flex justify-center items-center gap-x-2">
                    <span>En presentismo</span>
                    <CheckIcon className="w-6 h-6" />
                </div>
            ) : (
                <>
                    <Button
                        variant='ghost'
                        className='px-1'
                        onClick={() => addPresentismo(row.original)}
                    >
                        Agregar al presentismo
                        <PlusIcon className='w-6 h-6' />
                    </Button>
                </>
            )}
        </div>
    );
}

export default CellComponent;