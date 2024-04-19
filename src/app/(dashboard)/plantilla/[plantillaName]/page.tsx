'use client'
import CrearTemplate, { useTemplate } from "@/components/mensajes/CrearTemplate";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface PlantillaPageParams {
    params: {
        plantillaName: string;
    }
}
const PlantillaPage = ({params}: PlantillaPageParams) => {
    const { type } = useTemplate();
    const router = useRouter();
    return (
        <div className="pt-4 px-4">
            <div className='flex items-center gap-x-4'>
                <ArrowLeft className='cursor-pointer' onClick={() => router.back()} />
            </div>
            <CrearTemplate plantillaName={`${params.plantillaName}`} typeTemplate={type} />
        </div>
    )
}

export default PlantillaPage;