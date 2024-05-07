'use client'
import { usePresentismoModal } from "@/app/(dashboard)/eventos/[eventoId]/presentismo/page";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { trpc } from "@/lib/trpc";
import ComboBox from "../ui/ComboBox";
import { useMemo, useState } from "react";
import ModeloIcon from "../icons/ModeloIcon";
import { toast } from "sonner";


const AsistenciaModal = ({open}:{open:boolean}) => {
    const modalPresentismo = usePresentismoModal();
    const [openModelos, setOpenModelos] = useState(false);
    const utils = trpc.useUtils();
    const { data: etiquetas } = trpc.etiqueta.getAll.useQuery();
    // const modeloEtiquetas = etiquetas?.filter((etiqueta) => etiqueta.id !== modalPresentismo.evento?.etiquetaAsistioId).filter((etiqueta) => etiqueta.id !== modalPresentismo.evento?.etiquetaConfirmoId);
    const { data: modelos } = trpc.modelo.getAll.useQuery();

    const editModelo = trpc.modelo.edit.useMutation();
    const { data: EtiquetaAsistencia } = trpc.etiqueta.getById.useQuery(modalPresentismo.evento?.etiquetaAsistioId ?? '', {
        enabled: !!modalPresentismo.evento,
    });

    const modelosData = useMemo(() => {
        if (!modelos) return [];
        return modelos.filter((modelo) => modelo.etiquetas.every((etiqueta) => etiqueta.id !== modalPresentismo.evento?.etiquetaAsistioId && etiqueta.id !== modalPresentismo.evento?.etiquetaConfirmoId))
    }, [modelos]);

    async function handleSubmit() {
        if (modalPresentismo.modeloId === '') {
            toast.error('Debes seleccionar una modelo');
        }
        if (modalPresentismo.evento === null) {
            toast.error('No se ha encontrado el evento');
        }
        const modelo = modelos?.find((modelo) => modelo.id === modalPresentismo.modeloId);
        if (!modelo) {
            toast.error('No se ha encontrado la modelo');
            return;
        }
        const etiquetasModelo = modelo?.etiquetas.map((etiqueta) => ({
            id: etiqueta.id,
            nombre: etiqueta.nombre,
            grupo: {
                id: etiqueta.grupoId,
                esExclusivo: etiqueta.grupo.esExclusivo,
            }
        }));
        const etiquetaAsistio = {
            id: modalPresentismo.evento!.etiquetaAsistioId,
            nombre: EtiquetaAsistencia!.nombre,
            grupo: {
                id: EtiquetaAsistencia!.grupo.id,
                esExclusivo: EtiquetaAsistencia!.grupo.esExclusivo,
            }
        };
        await editModelo.mutateAsync({
            id: modalPresentismo.modeloId,
            etiquetas: [...etiquetasModelo!, etiquetaAsistio]
        });
        toast.success('Modelo añadida correctamente');
        utils.modelo.getByEtiqueta.invalidate();
        usePresentismoModal.setState({isOpen: false, modeloId: ''});
    }
    if (!modalPresentismo.evento || modalPresentismo.evento === null) return;
    return (
        <Dialog open={open} onOpenChange={(value) => usePresentismoModal.setState({isOpen: value})}>
            <DialogTrigger>
                <Button onClick={() => usePresentismoModal.setState({isOpen: !open})}>Agregar persona</Button>
            </DialogTrigger>
            <DialogContent>
                <h3 className="font-semibold text-lg">Añadir asistencia de una modelo</h3>
                <div className="flex justify-around items-center">
                    <ComboBox 
                        data={modelosData} 
                        id={'id'} value="nombreCompleto" 
                        open={openModelos} 
                        setOpen={setOpenModelos} 
                        wFullMobile 
                        triggerChildren={
                            <>
                                <span className='max-w-[calc(100%-30px)] truncate'>
                                {modalPresentismo.modeloId !== ''
                                    ? modelos?.find((modelo) => modelo.id === modalPresentismo.modeloId)?.nombreCompleto
                                    : 'Buscar modelo...'}
                                </span>
                                <ModeloIcon className='h-5 w-5' />
                            </>
                        }
                        onSelect={(id) => {
                            if (modalPresentismo.modeloId === id) {
                                usePresentismoModal.setState({modeloId: ''});
                                setOpenModelos(false);
                                return
                            }
                            usePresentismoModal.setState({modeloId: id});
                            setOpenModelos(false);
                        }} 
                        selectedIf={modalPresentismo.modeloId} />
                        <Button disabled={editModelo.isLoading} onClick={handleSubmit}>Enviar</Button>
                    </div>
            </DialogContent>
        </Dialog>
    )
}

export default AsistenciaModal;