'use client'
import CrearTemplate from "@/components/mensajes/CrearTemplate";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";


const PlantillaPage = () => {
    const router = useRouter();
    return (
        <div className="pt-4 px-4">
            <div className='flex items-center gap-x-4'>
                <ArrowLeft className='cursor-pointer' onClick={() => router.back()} />
            </div>
            <CrearTemplate />
        </div>
    )
}

export default PlantillaPage;