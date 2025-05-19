export interface IMeta {
    href: string;
    metadataHref: string;
    type: "store" | "product" | "variant" | "loss" | "organization" | "attributemetadata";
    mediaType: "application/json";
}

export interface IMetaList extends IMeta {
    size: number;
    offset: number;
    limit: number;
}


export interface IBarcodes {
    [key: string]: string;
}

export interface IUom {
    name: string;
}

export interface IImage {
    miniature: {
        downloadHref: string;
    }
}

export interface IAssortment {
    meta: IMeta;
    id: string;
    name: string;
    quantity: number;
    stock: number;
    barcodes: IBarcodes[];
    attributes?: IAttribute[];
    uom: IUom;
    images: IDataList<IImage>;
}

export interface IDataList<T> {
    meta: IMetaList;
    rows: T[];
}


interface IDocPosition {
    quantity: number;
    assortment: { meta: IMeta };
}

export interface IStore {
    meta: IMeta;
    name: string;
}

export interface IOrganization {
    meta: IMeta;
    name: string;
}

export interface ILossDoc {
    organization: IOrganization;
    store: IStore;
    positions: IDocPosition[];
}

export type TListTypes = 'loss' | 'enter' | 'inventory';


export interface IAttribute {
    meta: IMeta;
    id: string;
    name: string;
    value: boolean;
    type: string;
    required: boolean;
    description?: string;
}
