'use client';
import CreateTemplate, {
  useTemplate,
} from '@/components/mensajes/CreateTemplate';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface TemplatePageParams {
  params: {
    templateName: string;
  };
}
const TemplatePage = ({ params }: TemplatePageParams) => {
  const { type } = useTemplate();
  const router = useRouter();
  return (
    <div className='px-4 pt-4'>
      <div className='flex items-center gap-x-4'>
        <ArrowLeft className='cursor-pointer' onClick={() => router.back()} />
      </div>
      <CreateTemplate
        templateName={`${params.templateName}`}
        typeTemplate={type}
      />
    </div>
  );
};

export default TemplatePage;
