import React, {memo} from "react";

import {AppNavbar} from "@widgets/AppNavbar";
import {QueryContext} from "@features";
import {ModalProvider} from "@app";
import {AttachmentsWidget} from "@widgets/AttachmentsWidget/AttachmentsWidget";
import {AppContent} from "@shared/ui";


export const TestPage = memo(() => {

    return (
        <QueryContext>
            <ModalProvider>
                <AppNavbar>
                </AppNavbar>

                <AppContent>
                    <AttachmentsWidget contentType="product" objectId="test_id" />
                </AppContent>
                {/*<div data-bs-theme={'light'} style={{overflow: 'auto'}}>*/}
                {/*</div>*/}
            </ModalProvider>
        </QueryContext>
    );
});
