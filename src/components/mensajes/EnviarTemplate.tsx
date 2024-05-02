'use client';
import { trpc } from '@/lib/trpc';
import ComboBox from '../ui/ComboBox';
import { useMemo, useState } from 'react';
import TemplateIcon from '../icons/TemplateIcon';
import EtiquetaFillIcon from '../icons/EtiquetaFillIcon';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import CircleXIcon from '../icons/CircleX';
import { getTextColorByBg } from '@/lib/utils';
import { useTemplateSend } from './SendTemplateModal';

const precioTemplate = {
  MARKETING: 0.0618,
  UTILITY: 0.0408,
  AUTHENTICATION: 0.0367,
} as const;

const EnviarTemplate = () => {
  const templateData = useTemplateSend((state) => ({
    open: state.open,
    plantilla: state.plantilla,
    etiquetas: state.etiquetas,
  }));
  const { data } = trpc.whatsapp.getTemplates.useQuery();
  const { data: etiquetas } = trpc.etiqueta.getAll.useQuery();
  const { data: modelos } = trpc.modelo.getByEtiqueta.useQuery(
    templateData.etiquetas.map((et) => et.id)
  );
  const { data: template } = trpc.whatsapp.getTemplateById.useQuery(
    templateData.plantilla,
    {
      enabled: templateData.plantilla !== '',
    }
  );
  // const sendMessage = trpc.whatsapp.sendMessageToEtiqueta.useMutation();

  const [openPlantilla, setOpenPlantilla] = useState(false);
  const [openEtiqueta, setOpenEtiqueta] = useState(false);

  const currentPrecio = useMemo(() => {
    if (templateData.plantilla === '') return 0;
    let categoria: keyof typeof precioTemplate = template?.data[0]
      .category as keyof typeof precioTemplate;

    if (!categoria) {
      categoria = 'MARKETING';
    }

    return precioTemplate[categoria] * (modelos ? modelos.length : 0);
  }, [modelos, template?.data, templateData.plantilla]);

  const currentEtiquetas = useMemo(() => {
    return etiquetas?.filter(
      (et) => !templateData.etiquetas.find((etiqueta) => etiqueta.id === et.id)
    );
  }, [etiquetas, templateData.etiquetas]);

  async function handleSubmit() {
    if (templateData.plantilla === '') {
      toast.error('Por favor seleccione una plantilla');
      return;
    }
    if (templateData.etiquetas.length === 0) {
      toast.error('Por favor seleccione al menos una etiqueta');
      return;
    }
    useTemplateSend.setState({
      open: true,
      modelos: modelos?.length ?? 0,
      precio: currentPrecio,
    });
  }

  return (
    <>
      <div className='flex items-center justify-center pt-3 font-bold'>
        <h1>Envío de plantillas</h1>
      </div>
      <div className='flex items-start justify-around p-5'>
        <div>
          <ComboBox
            data={data?.data ? data.data : []}
            id={'name'}
            value={'name'}
            open={openPlantilla}
            setOpen={setOpenPlantilla}
            triggerChildren={
              <>
                <span className='max-w-[calc(100%-30px)] truncate'>
                  {templateData.plantilla !== ''
                    ? templateData.plantilla
                    : 'Buscar plantilla...'}
                </span>
                <TemplateIcon className='h-5 w-5' />
              </>
            }
            onSelect={(id) => {
              if (templateData.plantilla === id) {
                useTemplateSend.setState({
                  plantilla: '',
                });
                setOpenPlantilla(false);
                return;
              }
              useTemplateSend.setState({
                plantilla: id,
              });
              setOpenPlantilla(false);
            }}
            selectedIf={templateData.plantilla}
            wFullMobile
          />
        </div>
        <div className='flex flex-col gap-y-3'>
          <ComboBox
            data={currentEtiquetas ? currentEtiquetas : []}
            id={'id'}
            value={'nombre'}
            open={openEtiqueta}
            setOpen={setOpenEtiqueta}
            triggerChildren={
              <>
                <span className='max-w-[calc(100%-30px)] truncate'>
                  {templateData.etiquetas.length > 0
                    ? 'Buscar etiqueta...'
                    : 'Buscar etiqueta...'}
                </span>
                <EtiquetaFillIcon className='h-5 w-5' />
              </>
            }
            onSelect={(id) => {
              if (templateData.etiquetas.find((et) => et.id === id)) {
                toast.error('La etiqueta ya ha sido seleccionada');
                setOpenEtiqueta(false);
                return;
              }
              useTemplateSend.setState({
                etiquetas: [
                  ...templateData.etiquetas,
                  {
                    id,
                    name: etiquetas?.find((et) => et.id === id)?.nombre ?? '',
                    color:
                      etiquetas?.find((et) => et.id === id)?.grupo.color ?? '',
                  },
                ],
              });
              setOpenEtiqueta(false);
              toast.success('Etiqueta agregada correctamente');
            }}
            selectedIf={''}
            wFullMobile
          />
          <div className='flex max-h-40 flex-col gap-y-2 overflow-y-auto'>
            {templateData.etiquetas.map((etiqueta) => (
              <div
                key={etiqueta.id}
                className={`flex w-fit items-center justify-between gap-x-2 rounded-full px-2 py-0.5`}
                style={{
                  backgroundColor: etiqueta.color,
                  color: getTextColorByBg(etiqueta.color ?? ''),
                }}
              >
                <span className='text-sm'>{etiqueta.name}</span>
                <CircleXIcon
                  onClick={() => {
                    useTemplateSend.setState({
                      etiquetas: templateData.etiquetas.filter(
                        (et) => et.id !== etiqueta.id
                      ),
                    });
                  }}
                  className='h-4 w-4 text-white hover:cursor-pointer'
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className='flex items-center justify-around'>
        <div className=''>
          <span>{modelos?.length} modelos encontradas</span>
        </div>
        <div>
          <span>USD${currentPrecio.toFixed(3)} precio estimado</span>
        </div>
        <Button
          onClick={handleSubmit}
          className='rounded-md bg-black/70 px-3 py-1.5 text-white'
        >
          Enviar
        </Button>
      </div>
    </>
  );
};

export default EnviarTemplate;
