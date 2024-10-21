import {useEffect, useState} from "react";
import {Spinner} from "react-bootstrap";

import {Employee} from "@entities/Employee";
import {AppInput, AppTooltip} from "@shared/ui";
import {useDebounce, useFormattedValue, useQueryParams} from "@shared/hooks";

import {StaffInfoRange} from "../../../../model/types";

import {StaffTableWeeks} from "./StaffTableWeeks";


interface StaffTableHeadProps {
    ids: number[];
    userCount: number | undefined;
    isLoading: boolean;
    userHeadInfo: StaffInfoRange | null;
    selectedEmployee: Employee | null;
    totalDebitCredit: number | undefined;
}


export const StaffTableHead = (props: StaffTableHeadProps) => {
    const {
        ids,
        selectedEmployee,
        totalDebitCredit,
        userHeadInfo,
        isLoading,
        userCount,
    } = props;

    const {queryParameters, setQueryParam} = useQueryParams();

    const {formatValue} = useFormattedValue();

    const [findInputValue, setFindInputValue] = useState<string>(queryParameters.find || '');

    const debouncedSetQueryParam = useDebounce(
        (param: string, value: string) => setQueryParam(param, value),
        500
    );

    useEffect(() => {
        debouncedSetQueryParam('find', findInputValue)
        // eslint-disable-next-line
    }, [findInputValue]);

    return (
        <thead
            className={'bg-light'}
            style={{
                "position": "sticky",
                "top": -5,
                "zIndex": "10",
            }}
        >

        <tr>
            <th style={{minHeight: 78, height: 78, maxWidth: 300, width: 300}} className={"align-top px-2"}>
                {(isLoading) ?
                    <Spinner animation={'grow'} size={'sm'}/>
                    :
                    <>ФИО / Поиск {userCount && `(${userCount} сотр.)` }</>
                }
                <AppTooltip title={'Поиск по ФИО или описанию'}>
                    <AppInput
                        className={'mt-2'}
                        placeholder="ФИО / Описание"
                        value={findInputValue}
                        onChange={(event) => setFindInputValue(event.target.value)}
                    />
                </AppTooltip>
            </th>

            {!selectedEmployee &&
                <>
                    <th className={'align-top'}>
                        Отдел
                    </th>
                    <th className={'align-top text-end'}>
                        <span>Деб./Кред. </span>
                        <hr className={'m-1 p-0'}/>
                        <span className={'px-2'} style={{fontSize: 14}}>{formatValue(totalDebitCredit).strValue}</span>

                    </th>

                    <StaffTableWeeks
                        ids={ids}
                        userInfo={userHeadInfo}
                        isLoading={isLoading}
                    />
                </>
            }
        </tr>
        </thead>
    );
};
