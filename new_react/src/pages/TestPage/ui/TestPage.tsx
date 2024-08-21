import React, {memo, useState} from "react";

import {AppNavbar} from "@widgets/AppNavbar";
import {QueryContext} from "@features";
import {ModalProvider} from "@app";
import {AppSelect} from "@shared/ui";
import {AppAutocomplete} from "@pages/TestPage/ui/AppAutocomplete";


interface Option {
    id: number;
    value: string;
}


export const TestPage = memo(() => {
    const [showCanvas, setShowCanvas] = useState<boolean>(false);

    const options: Option[] = [
        {id: 2, value: 'value'},
        {id: 3, value: 'value2'},
        {id: 4, value: 'value3'},
        {id: 5, value: 'value4'},
    ]

    const [selectValue, setSelectValue] = useState<Option | null>(options[0])
    const [dropdownValue, setDropdownValue] = useState<Option>(options[0])


    return (
        <QueryContext>
            <ModalProvider>
                <AppNavbar showNav={showCanvas} closeClb={() => setShowCanvas(false)}>
                </AppNavbar>

                <div className={'d-flex'}>
                    <AppSelect
                        label={'Select'}
                        variant={'select'}
                        value={selectValue}
                        onSelect={(option: Option | null) => setSelectValue(option)}
                        getOptionLabel={(option: Option | null) => option ? option.value : ""}
                        options={options}
                        className={'d-flex m-1'}
                        colorScheme={'lightInput'}
                    />

                    <AppSelect
                        label={'Dropdown'}
                        variant={'dropdown'}
                        value={dropdownValue}
                        onSelect={(option: Option) => setDropdownValue(option)}
                        options={options}
                        getOptionLabel={(option: Option) => option.value}
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
