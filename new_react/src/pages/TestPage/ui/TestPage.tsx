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
                    <AppAutocomplete
                        colorScheme={'dark'}
                        label={'Сотрудники'}
                        variant={'multiple'}
                        value={['Петров', 'Сидоров', 'Иванов']}
                        options={['Петров', 'Сидоров', 'Иванов']}
                        width={300}
                        limitHeight={true}
                    />
                    <AppAutocomplete
                        colorScheme={'dark'}
                        label={'Сотрудники'}
                        variant={'select'}
                        value={'Петров'}
                        options={['Петров', 'Сидоров', 'Иванов']}
                        width={300}
                    />
                </AppNavbar>

                <AppAutocomplete
                        colorScheme={'light'}
                        label={'Сотрудники'}
                        variant={'multiple'}
                        value={['Петров']}
                        options={['Петров', 'Сидоров', 'Иванов']}
                        width={300}

                    />
                    <AppAutocomplete
                        colorScheme={'light'}
                        label={'Сотрудники'}
                        variant={'select'}
                        value={'Петров'}
                        options={['Петров', 'Сидоров', 'Иванов']}
                        width={300}

                    />
            </ModalProvider>
        </QueryContext>
    );
});
