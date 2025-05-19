import {$API} from "@/api/api";
import {IAssortment, IAttribute, IDataList} from "@/api/types";
import {INVENT_ATTRIBUTE_NAME, POST_AUTH} from "@/api/config";

interface IGetAttributeProps {
    name: string;
}

export const fetchAttributes = async (): Promise<IDataList<IAttribute>> => {
    const url = `/entity/product/metadata/attributes`
    const response = await $API.get(
        url, {});
    return response.data;
};

export const getAttribute = async (props: IGetAttributeProps) => {
    const attributes = await fetchAttributes();
    console.log(attributes)

    return attributes.rows.find(attr => attr.name === props.name);
}

interface IEditProduct {
    product: IAssortment;
}

export const editProduct = async (
    props: IEditProduct,
): Promise<{ id?: string }> => {
    const attribute = await getAttribute({name: INVENT_ATTRIBUTE_NAME})

    if (!attribute || !attribute.id) {
        alert("Ошибка API. Не удалось загрузить аттрибут.")
    }


    const url = `/entity/product/${props.product.id}`;

    const newProduct = {
        ...props.product,
        attributes: [
            ...(props.product.attributes?.filter(attr => attr.id !== attribute?.id) || []),
            {
                ...attribute,
                value: true
            }
        ]
    };

    const response = await $API.put(url, newProduct, {
        headers: POST_AUTH,
    });
    return response.data;
};

