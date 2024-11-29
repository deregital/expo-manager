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

const templatePrice = {
  MARKETING: 0.0618,
  UTILITY: 0.0408,
  AUTHENTICATION: 0.0367,
} as const;

const SendTemplate = () => {
  const templateData = useTemplateSend((state) => ({
    open: state.open,
    template: state.template,
    tags: state.tags,
  }));
  const { data } = trpc.message.findTemplates.useQuery();
  const { data: tags } = trpc.tag.getAll.useQuery();
  const { data: profiles } = trpc.profile.getByTags.useQuery(
    templateData.tags.map((et) => et.id)
  );
  const { data: template } = trpc.message.findTemplateById.useQuery(
    templateData.template,
    {
      enabled: templateData.template !== '',
    }
  );

  const [openTemplate, setOpenTemplate] = useState(false);
  const [openTag, setOpenTag] = useState(false);

  const currentPrice = useMemo(() => {
    if (templateData.template === '') return 0;
    let category: keyof typeof templatePrice =
      template?.category as keyof typeof templatePrice;

    if (!category) {
      category = 'MARKETING';
    }

    return templatePrice[category] * (profiles ? profiles.length : 0);
  }, [profiles, template, templateData.template]);

  const currentTags = useMemo(() => {
    return tags?.filter(
      (et) => !templateData.tags.find((tag) => tag.id === et.id)
    );
  }, [tags, templateData.tags]);

  async function handleSubmit() {
    if (templateData.template === '') {
      toast.error('Por favor seleccione una plantilla');
      return;
    }
    if (templateData.tags.length === 0) {
      toast.error('Por favor seleccione al menos una etiqueta');
      return;
    }
    useTemplateSend.setState({
      open: true,
      profiles: profiles?.length ?? 0,
      price: currentPrice,
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
            data={data ? data.templates : []}
            id={'name'}
            value={'name'}
            open={openTemplate}
            setOpen={setOpenTemplate}
            triggerChildren={
              <>
                <span className='max-w-[calc(100%-30px)] truncate'>
                  {templateData.template !== ''
                    ? templateData.template
                    : 'Buscar plantilla...'}
                </span>
                <TemplateIcon className='h-5 w-5' />
              </>
            }
            onSelect={(id) => {
              if (templateData.template === id) {
                useTemplateSend.setState({
                  template: '',
                });
                setOpenTemplate(false);
                return;
              }
              useTemplateSend.setState({
                template: id,
              });
              setOpenTemplate(false);
            }}
            selectedIf={templateData.template}
            wFullMobile
          />
        </div>
        <div className='flex flex-col gap-y-3'>
          <ComboBox
            data={
              currentTags
                ? currentTags.sort((a, b) => a.name.localeCompare(b.name))
                : []
            }
            id={'id'}
            value={'name'}
            open={openTag}
            setOpen={setOpenTag}
            triggerChildren={
              <>
                <span className='max-w-[calc(100%-30px)] truncate'>
                  {templateData.tags.length > 0
                    ? 'Buscar etiqueta...'
                    : 'Buscar etiqueta...'}
                </span>
                <EtiquetaFillIcon className='h-5 w-5' />
              </>
            }
            onSelect={(id) => {
              if (templateData.tags.find((et) => et.id === id)) {
                toast.error('La etiqueta ya ha sido seleccionada');
                setOpenTag(false);
                return;
              }
              useTemplateSend.setState({
                tags: [
                  ...templateData.tags,
                  {
                    id,
                    name: tags?.find((tag) => tag.id === id)?.name ?? '',
                    color:
                      tags?.find((tag) => tag.id === id)?.group.color ?? '',
                  },
                ],
              });
              setOpenTag(false);
              toast.success('Etiqueta agregada correctamente');
            }}
            selectedIf={''}
            wFullMobile
          />
          <div className='flex max-h-40 flex-col gap-y-2 overflow-y-auto'>
            {templateData.tags.map((tag) => (
              <div
                key={tag.id}
                className={`flex w-fit items-center justify-between gap-x-2 rounded-full px-2 py-0.5`}
                style={{
                  backgroundColor: tag.color,
                  color: getTextColorByBg(tag.color ?? ''),
                }}
              >
                <span className='text-sm'>{tag.name}</span>
                <CircleXIcon
                  onClick={() => {
                    useTemplateSend.setState({
                      tags: templateData.tags.filter((et) => et.id !== tag.id),
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
          <span>{profiles?.length} participantes encontrados</span>
        </div>
        <div>
          <span>USD${currentPrice.toFixed(3)} precio estimado</span>
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

export default SendTemplate;
