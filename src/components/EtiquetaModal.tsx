'use client';
import { trpc } from '@/lib/trpc';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogTrigger,
} from './ui/alert-dialog';
import { Input } from './ui/input';

export default function EtiquetaModal() {
  const { data: getGrupoEtiquetas } = trpc.grupoEtiqueta.getAll.useQuery();
  return (
    <>
      <AlertDialog>
        <AlertDialogTrigger>Open</AlertDialogTrigger>
        <AlertDialogContent className="flex w-full flex-col gap-y-3 rounded-md bg-gray-300 p-10">
          <p className="min-w-fit rounded-lg bg-gray-500 px-3 py-1.5 text-base font-bold">
            Nombre de la etiqueta
          </p>
          <div className="flex gap-x-3">
            <Input
              className="bg-white text-black"
              type="text"
              name="etiqueta"
              id="etiqueta"
              placeholder="Nombre de la etiqueta"
            />
          </div>
          <div className="flex items-center justify-end gap-3">
            <AlertDialogCancel className="py-1">Cancelar</AlertDialogCancel>
            <AlertDialogAction className="m-0 bg-green-300 py-0 text-black/80 hover:bg-green-400">
              Guardar
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
