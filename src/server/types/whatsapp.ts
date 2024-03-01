import { CategoriaPlantilla, EstadoPlantilla } from '@prisma/client';

export type Body = {
  type: 'BODY';
  text: string;
};
export type Buttons = {
  buttons: {
    text: string;
    type: 'QUICK_REPLY';
  }[];
  type: 'BUTTONS';
};

export type Template = {
  name: string;
  category: string;
  allow_category_change: boolean;
  language: string;
  components: Components[];
};

export type TemplateEdit = {
  components: Components[];
};

export type TemplateEditResponse = {
  success: boolean;
};

export type TemplateResponse = {
  id: string;
  status: EstadoPlantilla;
  category: CategoriaPlantilla;
};

export type Components = Body | Buttons;

export type GrupoEtiqueta = {
  Etiqueta: {
    id: string;
    created_at: string;
    updated_at: string;
    nombre: string;
    grupoId: string;
  }[];
  id: string;
  created_at: string;
  updated_at: string;
  nombre: string;
  color: string;
  esExclusivo: boolean;
};
