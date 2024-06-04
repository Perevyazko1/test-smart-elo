import React, {useEffect, useState} from "react";

import {useAppQuery, useDebounce} from "@shared/hooks";
import {AppInput} from "@shared/ui";

export const ProductNameInput = () => {
    const {setQueryParam, queryParameters} = useAppQuery();

    const [productNameInput, setProductNameInput] = useState<string>(
        queryParameters.product__name || ''
    );

    const debouncedSetQueryParam = useDebounce(
        (param: string, value: string) => setQueryParam(param, value),
        500
    );

    useEffect(() => {
        debouncedSetQueryParam('product__name', productNameInput)
        //eslint-disable-next-line
    }, [productNameInput]);

    return (
        <AppInput
            placeholder={'Изделие'}
            className={'ms-3'}
            onChange={(event) => setProductNameInput(event.target.value)}
            value={productNameInput}
        />
    );
};
