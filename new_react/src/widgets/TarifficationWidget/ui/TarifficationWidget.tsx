import React from "react";

import {TarifficationProduct} from "./TarifficationProduct";
import {useGetTariffCard} from "../model/api";


interface TarifficationWidgetProps {
    productId: number;
    departmentId: number;
}

export const TarifficationWidget = (props: TarifficationWidgetProps) => {
    const {productId, departmentId} = props;

    const {data} = useGetTariffCard({
        product__id: productId,
        department__id: departmentId,
    });

    return (
        <div>
            <div className="d-flex align-items-center">
                <h5 className={'m-0'}>
                    Тарификация изделия
                </h5>
            </div>
            <hr className={'m-1 p-0'}/>

            {data ?
                <TarifficationProduct tariffCard={data}/>
                :
                <>Загрузка...</>
            }

        </div>
    );
};
