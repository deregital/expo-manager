'use client';
import CrearTemplate from '@/components/mensajes/CrearTemplate';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface TemplatePageParams {
  params: {
    templateName: string;
  };
}
const TemplatePage = ({ params }: TemplatePageParams) => {
  const router = useRouter();
  return (
    <div className='px-4 pt-4'>
      <div className='flex items-center gap-x-4'>
        <ArrowLeft className='cursor-pointer' onClick={() => router.back()} />
      </div>
      <CrearTemplate typeTemplate='CREATE' />
    </div>
  );
};

export default TemplatePage;
