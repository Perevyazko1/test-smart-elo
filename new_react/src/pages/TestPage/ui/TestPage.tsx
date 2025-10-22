import React, {memo} from "react";

import {AppNavbar} from "@widgets/AppNavbar";
import {QueryContext} from "@features";
import {ModalProvider} from "@app";


export const TestPage = memo(() => {

    return (
        <QueryContext>
            <ModalProvider>
                <AppNavbar>
                </AppNavbar>
            </ModalProvider>
        </QueryContext>
    );
});
