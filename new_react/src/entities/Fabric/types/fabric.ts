export interface FabricPicture {
    id: number;
    image_filename: string;
    image: string;
    thumbnail: string;
}

export interface Fabric {
    id: number;
    fabric_id: string;
    name: string;
    fabric_pictures: FabricPicture[] | null;
    reserve: number;
    quantity: number;
    intransit: number;
    barcode: string;
    is_actual: boolean;
}