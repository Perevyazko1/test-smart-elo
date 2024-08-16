import React, {memo, useState} from "react";

import {AppNavbar} from "@widgets/AppNavbar";
import {QueryContext} from "@features";
import {ModalProvider} from "@app";
import {AppSelect} from "@shared/ui";
import {AppAutocomplete} from "@pages/TestPage/ui/AppAutocomplete";


export const TestPage = memo(() => {
    const [showCanvas, setShowCanvas] = useState<boolean>(false);

    return (
        <QueryContext>
            <ModalProvider>
                <AppNavbar showNav={showCanvas} closeClb={() => setShowCanvas(false)}>
                </AppNavbar>

                <div>

                    <AppSelect
                        className={'d-flex m-1'}
                        colorScheme={'lightInput'}
                    />

                    <AppSelect
                        className={'d-flex m-1 bg-black'}
                        colorScheme={'darkInput'}
                    />
                </div>

                    <AppAutocomplete
                        width={300}
                        variant={'select'}
                        value={'Значение'}
                        label={'test'}
                    />
            </ModalProvider>
        </QueryContext>
    );
});
