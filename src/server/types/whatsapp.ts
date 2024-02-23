export type Body = {
    type: "BODY";
    text: string;
}
export type Buttons = {
    buttons: {
        text: string;
        type: "QUICK_REPLY";
    }[]
    type: "BUTTONS";
}

export type Template = {
    name: string;
    category: string;
    allow_category_change: boolean;
    language:  string;
    components: Components[];
}

export type TemplateEdit = {
    components: Components[];
}

export type TemplateEditResponse = {
    success: boolean;
}

export type TemplateResponse = {
    id: string;
    status: "APROBADA" | "PENDING" | "RECHAZADA";
    category: "MARKETING" | "UTILITY" | "AUTENTICACION";
}

export type Components =  | Body | Buttons; 