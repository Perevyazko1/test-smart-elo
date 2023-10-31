export interface BaseTechProcess {
    id: number;
    name: string;
    image: string;
    schema: number;
}

export interface TechProcessSchema {
    [key: string]: string[];
}

export interface TechProcess extends Omit<BaseTechProcess, 'schema'> {
    schema: TechProcessSchema;
}

