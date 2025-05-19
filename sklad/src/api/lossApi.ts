import {$API} from "@/api/api";
import {ORGANISATION_NAME, POST_AUTH, STORE_NAME} from "@/api/config";
import {IDataList, ILossDoc, TListTypes, IStore, IOrganization} from "@/api/types";


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

export const getStores = async (): Promise<IDataList<IStore>> => {
    const url = `/entity/store`;
    const response = await $API.get(`${url}`);
    return response.data;
};

export const getStore = async (): Promise<IStore | undefined> => {
    const stores = await getStores();
    return stores.rows.find(store => store.name === STORE_NAME);
}

export const getOrganizations = async (): Promise<IDataList<IOrganization>> => {
    const url = `/entity/organization`;
    const response = await $API.get(`${url}`);
    return response.data;
};

export const getOrganization = async (): Promise<IOrganization | undefined> => {
    const organizations = await getOrganizations();
    return organizations.rows.find(organization => organization.name === ORGANISATION_NAME);
}