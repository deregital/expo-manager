import PDFIcon from '@/components/icons/PDFIcon';
import { Button } from '@/components/ui/button';
import { generate } from '@pdfme/generator';
import type { Plugin } from '@pdfme/common';
import { barcodes, text, line, tableBeta, readOnlyText } from '@pdfme/schemas';
import { toast } from 'sonner';
import { type PDFData, presentismoPDFSchema } from '@/lib/presentismoPDFSchema';
import { format } from 'date-fns';
import { type RouterOutputs } from '@/server';
import React, { type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface GeneratePDFButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  event: {
    id: string;
    name: string;
    date: string;
    location: string;
    tagAssistedId: string;
    tagConfirmedId: string;
  };
  baseUrl: string;
  profilesData: RouterOutputs['profile']['getByTags'];
}

const GeneratePDFButton = ({
  event,
  baseUrl,
  profilesData,
  className,
  ...props
}: GeneratePDFButtonProps) => {
  async function handleGeneratePDF() {
    const confirmedProfiles = profilesData
      .filter((profile) =>
        profile.tags.find(
          (tag) =>
            tag.id === event?.tagConfirmedId || tag.id === event?.tagAssistedId
        )
      )
      .sort((a, b) => a.fullName.localeCompare(b.fullName));

    const tableContent = confirmedProfiles.map(
      (profile) =>
        [
          profile.fullName,
          profile.shortId ? profile.shortId.toString() : '',
          profile.phoneNumber,
          profile.dni ?? '',
          (profile.tags.some((tag) => tag.id === event?.tagAssistedId)
            ? 'SI'
            : '') as string,
        ] as PDFData[0]['datos'][number]
    );

    const plugins: {
      [key: string]: Plugin<any>;
    } = {
      qrcode: barcodes.qrcode,
      text,
      line,
      Table: tableBeta,
      readOnlyText,
    };

    const inputs: PDFData = [
      {
        nombre: `${event.name}`,
        fecha: `${format(event!.date, 'dd/MM/yyyy')}`,
        ubicacion: `${event?.location}`,
        datos: tableContent,
        qr: `${baseUrl}/eventos/${event.id}/presentismo`,
      },
    ];

    const pdf = await generate({
      template: presentismoPDFSchema,
      inputs,
      plugins,
    });

    const blob = new Blob([pdf.buffer], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Evento_${event?.name}.pdf`;

    toast.success('PDF generado con éxito');
    link.click();
  }

  return (
    <Button
      onClick={handleGeneratePDF}
      className={cn(
        'rounded-lg bg-gray-400 text-2xl font-bold text-black hover:bg-gray-500',
        className
      )}
      {...props}
    >
      <PDFIcon />
    </Button>
  );
};

export default GeneratePDFButton;
