import { ProductionModal } from '@/components/producciones/ProductionModal';
import { ProductionList } from '@/components/producciones/ProductionList';

const ProduccionesPage = async () => {
  return (
    <div className='flex flex-col gap-y-4 p-3 md:p-5'>
      <h1 className='text-xl font-bold md:text-3xl'>Gestor de Producciones</h1>
      <ProductionModal mode='create' />
      <ProductionList />
    </div>
  );
};

export default ProduccionesPage;
