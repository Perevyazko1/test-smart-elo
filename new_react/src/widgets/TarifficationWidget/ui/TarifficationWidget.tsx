import React from "react";

import {TarifficationProduct} from "./TarifficationProduct";

export const TarifficationWidget = () => {

    return (
        <div>
            <div className="d-flex align-items-center">
                <h5 className={'m-0'}>
                    Тарификация изделия
                    {/*{ordersProps.isLoading && <Spinner animation={'grow'} size={'sm'}/>}*/}
                </h5>
            </div>
            <hr className={'m-1 p-0'}/>

            <TarifficationProduct/>
        </div>
    );
};
