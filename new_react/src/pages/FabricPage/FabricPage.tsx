import React from "react";

import {AppNavbar} from "@widgets/AppNavbar";
import {QueryContext} from "@features";
import {ModalProvider} from "@app";
import {AppContent} from "@shared/ui";
import {FabricContent} from "@pages/FabricPage/FabricContent";


export const FabricPage = () => {

    return (
        <QueryContext>
            <ModalProvider>
                <AppNavbar>
                </AppNavbar>

                <AppContent>
                    <FabricContent/>
                </AppContent>
            </ModalProvider>
        </QueryContext>
    );
};
