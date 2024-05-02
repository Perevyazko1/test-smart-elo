import React from "react";

import {TarifficationProduct} from "@widgets/TarifficationWidget";

export const NotificationWidget = () => {

    return (
        <div>
            <div className="d-flex align-items-center">
                <h5 className={'m-0'}>
                    Уведомления
                    {/*{ordersProps.isLoading && <Spinner animation={'grow'} size={'sm'}/>}*/}
                </h5>
            </div>
            <hr className={'m-1 p-0'}/>

            <TarifficationProduct/>
            <TarifficationProduct/>
            <TarifficationProduct/>
            <TarifficationProduct/>
        </div>
    );
};
