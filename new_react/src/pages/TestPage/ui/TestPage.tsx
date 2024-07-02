import React, {memo, useState} from "react";
import {AppNavbar} from "@widgets/AppNavbar";
import {QueryContext} from "@features";
import {ModalProvider} from "@app";
import {TestPageBody} from "@pages/TestPage/ui/TestPageBody";

export const TestPage = memo(() => {
    const [showCanvas, setShowCanvas] = useState<boolean>(false);


    return (
        <QueryContext>
            <ModalProvider>
                    <div data-bs-theme={'light'}>
                        <AppNavbar showNav={showCanvas} closeClb={() => setShowCanvas(false)}/>
                        <TestPageBody/>
                    </div>
            </ModalProvider>
        </QueryContext>
    );
});
