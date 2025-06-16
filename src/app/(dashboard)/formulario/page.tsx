import { Suspense } from 'react';
import { FormularioPageClient } from './page.client';

interface FormularioPageProps {
  params: {
    form: string;
  };
}

const FormularioPage = ({ params }: FormularioPageProps) => {
  const { form: formId } = params;

  return (
    <div>
      <h1 className='p-3 text-xl font-bold md:p-5 md:text-3xl'>
        Gestor de Formularios
      </h1>
      <Suspense fallback={<div>Cargando...</div>}>
        <FormularioPageClient selectedFormId={formId} />
      </Suspense>
    </div>
  );
};

export default FormularioPage;
