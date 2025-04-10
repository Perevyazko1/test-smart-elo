import {QueryContext} from "@features";
import {ModalProvider} from "@app";

import cls from "./KpiPage.module.scss";

import {KpiNavbar} from "./nav/KpiNavbar";
import {KpiBody} from "./body/KpiBody";


export const KpiPage = () => {

    return (
        <QueryContext>
            <ModalProvider>
                <div className={cls.pageContainer}>
                    <KpiNavbar/>

                    <KpiBody/>
                </div>
            </ModalProvider>
        </QueryContext>
    );
};