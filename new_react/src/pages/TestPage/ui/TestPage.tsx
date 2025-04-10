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

    const options: Option[] = [
        {id: 2, value: 'value'},
        {id: 3, value: 'value2'},
        {id: 4, value: 'value3'},
        {id: 5, value: 'some value with big length text range'},
    ]

    const [selectValue, setSelectValue] = useState<Option | null>(options[0]);
    const [dropdownValue, setDropdownValue] = useState<Option>(options[0]);
    const [multipleValue, setMultipleValue] = useState<Option[]>([]);


    return (
        <QueryContext>
            <ModalProvider>
                <AppNavbar>
                    <AppSelect
                        label={'Dropdown'}
                        isLoading
                        variant={'dropdown'}
                        value={dropdownValue}
                        onSelect={(option: Option) => setDropdownValue(option)}
                        options={options}
                        getOptionLabel={(option: Option) => option.value}
                        className={'d-flex bg-black align-self-end'}
                        colorScheme={'darkInput'}
                    />
                </AppNavbar>

                <div className={'d-flex gap-1 m-1'} style={{paddingTop: "70dvh"}}>
                    <AppSelect
                        style={{width: 150}}
                        label={'Select'}
                        isLoading
                        variant={'select'}
                        value={selectValue}
                        onSelect={(option: Option | null) => setSelectValue(option)}
                        getOptionLabel={(option: Option | null) => option ? option.value : ""}
                        options={options}
                        className={'d-flex'}
                        colorScheme={'lightInput'}
                    />

                    <AppSelect
                        label={'Dropdown'}
                        variant={'dropdown'}
                        isLoading
                        value={dropdownValue}
                        onSelect={(option: Option) => setDropdownValue(option)}
                        options={options}
                        getOptionLabel={(option: Option) => option.value}
                        className={'d-flex bg-black'}
                        colorScheme={'darkInput'}
                    />

                    <AppSelect
                        label={'Multiple'}
                        variant={'multiple'}
                        value={multipleValue}
                        options={options}
                        getOptionLabel={(option: Option) => option.value}
                        onSelect={(options: Option[]) => setMultipleValue(options)}
                        className={'d-flex bg-black'}
                        colorScheme={'darkInput'}
                    />
                </div>

                <AppAutocomplete
                    width={300}
                    variant={'select'}
                    value={''}
                    label={'test'}
                />
            </ModalProvider>
        </QueryContext>
    );
});
