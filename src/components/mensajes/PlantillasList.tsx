'use client'
import { trpc } from "@/lib/trpc";
import { Edit2Icon, Trash2Icon } from "lucide-react";
import Loader from "../ui/loader";
import { use } from "react";
import { useTemplateDelete } from "@/app/(dashboard)/mensajes/page";
import { RouterOutputs } from "@/server";


const PlantillasList = () => {

    const { data, isLoading } = trpc.whatsapp.getTemplates.useQuery();  
    
    function openModal(plantilla: RouterOutputs['whatsapp']['getTemplateById']) {
        useTemplateDelete.setState({open: true, plantilla: plantilla})
    }

        return (
            <div className="max-w-[600px] bg-gray-300 mt-5 mx-auto border border-black">
                <div className="bg-gray-500 text-white flex justify-center items-center py-2 border-b border-black relative">
                    <h1>Lista de plantillas</h1>
                    <div className="absolute flex justify-center items-center gap-x-2 right-2">
                        <p>Crear plantilla</p>
                        <button className="bg-gray-400 text-white px-2 py-0.5 rounded-md hover:bg-gray-700 hover:ease-in-out hover:transition">+</button>
                    </div>
                </div>
                <div className="overflow-y-auto h-32">
                    {isLoading ? (<div className="mx-auto mt-2 w-fit"><Loader /></div>) :  data ? data.map((plantilla) => (
                        <div key={plantilla.id} className="flex justify-center items-center gap-x-2 pr-2 bg-gray-400">
                            <button className="text-white w-full p-2 hover:bg-gray-700 hover:ease-in-out hover:transition">{plantilla.titulo}</button>
                            <Edit2Icon className="hover:text-white hover:cursor-pointer" />
                            <Trash2Icon onClick={() => openModal(plantilla)} className="hover:text-white hover:cursor-pointer" />
                        </div>
                    )) : 'No hay plantillas'}

                    {/* <button className="bg-gray-400 text-white w-full p-2 hover:bg-gray-700 hover:ease-in-out hover:transition">Plantilla 1</button> */}
                </div>
            </div>
        )
    }

export default PlantillasList;