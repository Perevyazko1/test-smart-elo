import {ModalProvider} from "@app";
import {DynamicComponent, QueryContext, ReducersList} from "@features";

import cls from "./TarifficationPage.module.scss";

import {tarifficationPageReducer} from "../model/slice";

import {TarifficationNav} from "./nav/TarifficationNav";
import {TarifficationBody} from "./body/TarifficationBody";


const initialReducers: ReducersList = {
    tarifficationPage: tarifficationPageReducer,
}

export const TarifficationPage = () => {

    return (
        <DynamicComponent reducers={initialReducers}>
            <QueryContext>
                <ModalProvider>
                    <div className={cls.pageContainer}>
                        <TarifficationNav/>
                        <TarifficationBody/>
                    </div>
                </ModalProvider>
            </QueryContext>
        </DynamicComponent>
    );
};
