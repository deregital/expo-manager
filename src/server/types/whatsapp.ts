export interface Components {
    type?: string;
    text?: string;
    buttons?: [
            {
            text?: string,
            type?: string,
            }
    ];
}

export interface Template {
    name: string;
    category: string;
    allow_category_change: boolean;
    language:  string;
    components: Components[];
}