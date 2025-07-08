import {ModalProvider} from "@app";
import {DynamicComponent, QueryContext, ReducersList} from "@features";

import {tarifficationPageReducer} from "../model/slice";

import {TarifficationNav} from "./nav/TarifficationNav";
import {TarifficationBody} from "./body/TarifficationBody";
import {AppContent} from "@shared/ui";


const initialReducers: ReducersList = {
    tarifficationPage: tarifficationPageReducer,
}

export const TarifficationPage = () => {

    return (
        <DynamicComponent reducers={initialReducers}>
            <QueryContext>
                <ModalProvider>
                    <TarifficationNav/>
                    <AppContent>
                        <TarifficationBody/>
                    </AppContent>
                </ModalProvider>
            </QueryContext>
        </DynamicComponent>
    );
};
