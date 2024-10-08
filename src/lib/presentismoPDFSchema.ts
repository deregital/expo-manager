import { type Template } from '@pdfme/common';

export type PDFData = [
  {
    qr: string;
    ubicacion: string;
    nombre: string;
    fecha: string;
    datos: Array<[string, string, string, string, string]>; // [nombre, ID, telefono, dni, si/no]
  },
];

export const presentismoPDFSchema: Template = {
  schemas: [
    {
      field1: {
        type: 'readOnlyText',
        content: 'Nombre del evento:',
        position: { x: 9, y: 9.3 },
        width: 64.05,
        height: 10,
        rotate: 0,
        alignment: 'left',
        verticalAlignment: 'top',
        fontSize: 18,
        lineHeight: 1,
        characterSpacing: 0,
        fontColor: '#000000',
        backgroundColor: '',
        opacity: 1,
        strikethrough: false,
        underline: true,
        readOnly: true,
        required: false,
        fontName: 'NotoSansJP-Regular',
      },
      field2: {
        type: 'readOnlyText',
        content: 'Fecha:',
        position: { x: 9, y: 24.9 },
        width: 15.63,
        height: 10,
        rotate: 0,
        alignment: 'left',
        verticalAlignment: 'middle',
        fontSize: 13,
        lineHeight: 1,
        characterSpacing: 0,
        fontColor: '#000000',
        backgroundColor: '',
        opacity: 1,
        strikethrough: false,
        underline: true,
        readOnly: true,
        required: false,
        fontName: 'NotoSansJP-Regular',
      },
      'field2 copy': {
        type: 'readOnlyText',
        content: 'Ubicación:',
        position: { x: 8.94, y: 35.7 },
        width: 24.1,
        height: 10,
        rotate: 0,
        alignment: 'left',
        verticalAlignment: 'middle',
        fontSize: 13,
        lineHeight: 1,
        characterSpacing: 0,
        fontColor: '#000000',
        backgroundColor: '',
        opacity: 1,
        strikethrough: false,
        underline: true,
        readOnly: true,
        required: false,
        fontName: 'NotoSansJP-Regular',
      },
      ubicacion: {
        type: 'text',
        position: { x: 33.6, y: 36.03 },
        required: true,
        content: 'Juan B. Justo 1579',
        width: 118.55,
        height: 10,
        rotate: 0,
        alignment: 'left',
        verticalAlignment: 'middle',
        fontSize: 13,
        lineHeight: 1,
        characterSpacing: 0,
        fontColor: '#000000',
        backgroundColor: '',
        opacity: 1,
        strikethrough: false,
        underline: false,
        fontName: 'NotoSansJP-Regular',
      },
      nombre: {
        type: 'text',
        position: { x: 69.33, y: 8.61 },
        required: true,
        content: 'Entrenamiento 1 - New Face 1 - T17',
        width: 88.66,
        height: 9.99,
        rotate: 0,
        alignment: 'left',
        verticalAlignment: 'middle',
        fontSize: 14,
        lineHeight: 1,
        characterSpacing: 0,
        fontColor: '#000000',
        backgroundColor: '',
        opacity: 1,
        strikethrough: false,
        underline: false,
        fontName: 'NotoSansJP-Regular',
      },
      fecha: {
        type: 'text',
        position: { x: 25.14, y: 24.9 },
        required: true,
        content: '11/08/2024',
        width: 127.29,
        height: 10,
        rotate: 0,
        alignment: 'left',
        verticalAlignment: 'middle',
        fontSize: 13,
        lineHeight: 1,
        characterSpacing: 0,
        fontColor: '#000000',
        backgroundColor: '',
        opacity: 1,
        strikethrough: false,
        underline: false,
        fontName: 'NotoSansJP-Regular',
      },
      field7: {
        type: 'line',
        position: { x: 0, y: 50.65 },
        width: 210,
        height: 0.73,
        rotate: 0,
        opacity: 1,
        readOnly: true,
        color: '#303030',
        required: false,
      },
      datos: {
        type: 'table',
        position: { x: 3.38, y: 55.96 },
        width: 202.65,
        height: 52.932,
        content:
          '[["Aylen Katherine Naiquen Alegre Fanelli","99999","54 9 11 6534 4651 980","46581349","Sí"],["Ariel Colton","1948","1136005044","46501954",""]]',
        showHead: true,
        head: ['Nombre', 'ID', 'Núm. de teléfono', 'DNI', '¿Asistió?'],
        headWidthPercentages: [
          22.13974216629657, 12.103719467061442, 29.901924500370086,
          21.21800723743734, 14.63660662883455,
        ],
        tableStyles: { borderWidth: 0.3, borderColor: '#000000' },
        headStyles: {
          fontName: 'NotoSansJP-Regular',
          fontSize: 13,
          characterSpacing: 0,
          alignment: 'left',
          verticalAlignment: 'middle',
          lineHeight: 1,
          fontColor: '#ffffff',
          borderColor: '',
          backgroundColor: '#2980ba',
          borderWidth: { top: 0, right: 0, bottom: 0, left: 0 },
          padding: { top: 5, right: 5, bottom: 5, left: 5 },
        },
        bodyStyles: {
          fontName: 'NotoSansJP-Regular',
          fontSize: 13,
          characterSpacing: 0,
          alignment: 'left',
          verticalAlignment: 'middle',
          lineHeight: 1,
          fontColor: '#000000',
          borderColor: '#888888',
          backgroundColor: '',
          alternateBackgroundColor: '#f5f5f5',
          borderWidth: { top: 0.1, right: 0.1, bottom: 0.1, left: 0.1 },
          padding: { top: 5, right: 5, bottom: 5, left: 5 },
        },
        columnStyles: {},
        required: true,
      },
      qr: {
        type: 'qrcode',
        content: 'https://pdfme.com/',
        position: { x: 163.27, y: 5.11 },
        backgroundColor: '#ffffff',
        barColor: '#000000',
        width: 41.9,
        height: 41.9,
        rotate: 0,
        opacity: 1,
        required: true,
      },
    },
  ],
  basePdf: { width: 210, height: 297, padding: [0, 0, 0, 0] },
  pdfmeVersion: '4.0.0',
};
