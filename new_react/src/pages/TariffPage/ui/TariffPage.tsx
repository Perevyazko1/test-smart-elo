import {useState} from "react";

import cls from './TariffPage.module.scss';

import {ModalProvider} from "@app";
import {DynamicComponent, QueryContext, ReducersList} from "@features";
import {AppNavbar} from "@widgets/AppNavbar";

import {TariffPageNav} from "./TariffPageNav";
import {TariffPageContent} from "./TariffPageContent";
import {tariffPageSliceReducer} from "../model/slice/TariffPageSlice";


const initialReducers: ReducersList = {
    tariffs: tariffPageSliceReducer,
}

export const TariffPage = () => {
    const [showCanvas, setShowCanvas] = useState<boolean>(false);

    return (
        <DynamicComponent reducers={initialReducers} removeAfterUnmount={false}>
            <QueryContext>
                <ModalProvider>
                    <div className={cls.pageContainer}>
                        <AppNavbar showNav={showCanvas} closeClb={() => setShowCanvas(false)}>
                            <TariffPageNav/>
                        </AppNavbar>

                        <TariffPageContent/>
                    </div>
                </ModalProvider>
            </QueryContext>
        </DynamicComponent>
    );
};
