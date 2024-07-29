import React, {memo, useState} from "react";

import {AppNavbar} from "@widgets/AppNavbar";
import {QueryContext} from "@features";
import {ModalProvider} from "@app";

import {TestQueue} from "@pages/TestPage/ui/TestQueue";


export const TestPage = memo(() => {
    const [showCanvas, setShowCanvas] = useState<boolean>(false);

    return (
        <QueryContext>
            <ModalProvider>
                <AppNavbar showNav={showCanvas} closeClb={() => setShowCanvas(false)}>
                </AppNavbar>

                <TestQueue/>

            </ModalProvider>
        </QueryContext>
    );
});
