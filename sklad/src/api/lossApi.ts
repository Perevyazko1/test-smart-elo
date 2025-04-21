import {$API} from "@/api/api";
import {POST_AUTH} from "@/api/config";
import {IDataList, ILossDoc, TListTypes} from "@/api/types";


export const createLoss = async (
    props: {
        type: Omit<TListTypes, "inventory">,
        data: ILossDoc,
    }
): Promise<{ id?: string }> => {
    const url = `/entity/${props.type}`;
    const response = await $API.post(url, {...props.data}, {
        headers: POST_AUTH,
    });
    return response.data;
};

export const getLossList = async (): Promise<IDataList<ILossDoc>> => {
    const url = `/entity/loss`;
    const response = await $API.get(url);
    return response.data;
};
