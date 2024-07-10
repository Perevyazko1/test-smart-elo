import React, {memo, useState} from "react";
import {AppNavbar} from "@widgets/AppNavbar";
import {QueryContext} from "@features";
import {ModalProvider} from "@app";

export const TestPage = memo(() => {
    const [showCanvas, setShowCanvas] = useState<boolean>(false);

    return (
        <QueryContext>
            <ModalProvider>
                <AppNavbar showNav={showCanvas} closeClb={() => setShowCanvas(false)}>
                    <div className={'d-flex align-items-end pb-1 align-self-stretch'}>
                    </div>
                </AppNavbar>
                {/*<TestPageBody/>*/}
                <div className={'d-flex'}>
                </div>
            </ModalProvider>
        </QueryContext>
    );
});
