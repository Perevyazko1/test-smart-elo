import {QueryContext} from "@features";
import {ModalProvider} from "@app";

import {KpiNavbar} from "./nav/KpiNavbar";
import {KpiBody} from "./body/KpiBody";
import {AppContent} from "@shared/ui";


export const KpiPage = () => {

    return (
        <QueryContext>
            <ModalProvider>
                <KpiNavbar/>

                <AppContent>
                    <KpiBody/>
                </AppContent>
            </ModalProvider>
        </QueryContext>
    );
};