import {$API} from "@/api/api";
import {IAssortment, IDataList} from "@/api/types";

interface IFetchAssortmentProps {
    barcode: string;
}

export const fetchAssortment = async (
    props: IFetchAssortmentProps
): Promise<IDataList<IAssortment>> => {
    const url = `/entity/assortment?filter=barcode=${props.barcode}&expand=uom,images&limit=100`
    const response = await $API.get(
        url, {});
    return response.data;
};


