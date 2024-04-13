'use client'
import { RouterOutputs } from "@/server";
import { AlertDialog, AlertDialogContent, AlertDialogTrigger } from "../ui/alert-dialog"
import { trpc } from "@/lib/trpc";
import { useTemplateDelete } from "@/app/(dashboard)/mensajes/page";


const DeleteTemplateModal = ({ open, plantilla } : {open: boolean, plantilla: RouterOutputs['whatsapp']['getTemplateById'] | null}) => {
    const deleteTemplate = trpc.whatsapp.deleteTemplate.useMutation();
    async function handleDelete() {
        await deleteTemplate.mutateAsync(plantilla ? plantilla.titulo : '');
    }
    function close() {
        // useTemplateDelete.setState({open: false, plantilla: null})
        useTemplateDelete.setState({open: false, plantilla: null})
    }
    return (
        <AlertDialog open={open}>
            <AlertDialogTrigger></AlertDialogTrigger>
            <AlertDialogContent>
                <h1>Eliminar plantilla</h1>
                <p>¿Estás seguro de que deseas eliminar la plantilla {plantilla ? plantilla.titulo : '-'}?</p>
                <div className="flex justify-center items-center gap-x-2">
                    <button onClick={close}>Cancelar</button>
                    <button onClick={handleDelete}>Eliminar</button>
                </div>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default DeleteTemplateModal;