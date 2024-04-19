'use client'
import CrearTemplate from "@/components/mensajes/CrearTemplate";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface PlantillaPageParams {
    params: {
        plantillaName: string;
        plantillaId: string;
    }
}
const PlantillaPage = ({params}: PlantillaPageParams) => {
    const router = useRouter();
    return (
        <div className="pt-4 px-4">
            <div className='flex items-center gap-x-4'>
                <ArrowLeft className='cursor-pointer' onClick={() => router.back()} />
            </div>
            <CrearTemplate plantillaName={`${params.plantillaName}`} plantillaId={`${params.plantillaId}`} />
        </div>
    )
}

export default PlantillaPage;