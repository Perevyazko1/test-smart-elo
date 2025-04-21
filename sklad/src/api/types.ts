export interface IMeta {
    href: string;
    metadataHref: string;
    type: "store" | "product" | "variant" | "loss" | "organization";
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

interface IStore {
    meta: IMeta;
}

interface IOrganization {
    meta: IMeta;
}

export interface ILossDoc {
    organization: IOrganization;
    store: IStore;
    positions: IDocPosition[];
}

export type TListTypes = 'loss' | 'enter' | 'inventory';