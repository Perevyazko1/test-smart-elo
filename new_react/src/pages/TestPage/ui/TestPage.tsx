import React, {memo, useState} from "react";
import {AppNavbar} from "@widgets/AppNavbar";
import {QueryContext} from "@features";
import {ModalProvider} from "@app";
import {AppAutocomplete} from "@pages/TestPage/ui/AppAutocomplete";

export const TestPage = memo(() => {
    const [showCanvas, setShowCanvas] = useState<boolean>(false);

    return (
        <QueryContext>
            <ModalProvider>
                <AppNavbar showNav={showCanvas} closeClb={() => setShowCanvas(false)}>
                    <AppAutocomplete variant={'dark'}/>
                </AppNavbar>
                {/*<TestPageBody/>*/}
                <div className={'d-flex'}>
                    <AppAutocomplete variant={'light'}/>
                </div>
            </ModalProvider>
        </QueryContext>
    );
});
