export interface TarifficationComment {
    id: number;
    author: number | null;
    production_step: number;
    comment: string;
    add_date: string;
}

export interface NewTarifficationComment extends Omit<TarifficationComment, 'id' | 'add_date'> {

}
