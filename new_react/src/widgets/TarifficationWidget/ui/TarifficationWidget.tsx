import React from "react";

import {TarifficationProduct} from "./TarifficationProduct";
import {useGetTariffCard} from "../model/api";


interface TarifficationWidgetProps {
    production_step__id: number;
}

export const TarifficationWidget = (props: TarifficationWidgetProps) => {
    const {production_step__id} = props;

    const {data} = useGetTariffCard({
        production_step__id: production_step__id,
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
