export interface tech_process_schema {
    [key: string]: string[];
}

export interface technological_process {
    id: number;
    name: string;
    image: string;
    schema: tech_process_schema;
}