import React, {useEffect, useMemo, useState} from "react";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

import {AppAutocomplete} from "@pages/TestPage/ui/AppAutocomplete";
import {getEmployeeName} from "@shared/lib";
import {AppRangeInput} from "@shared/ui/AppRangeInput/AppRangeInput";
import {AppSkeleton} from "@shared/ui";
import {Employee} from "@entities/Employee";
import {Assignment} from "@entities/Assignment";
import {useCurrentUser} from "@shared/hooks";
import {useUpdateCoExecutor} from "@widgets/AssignmentInfo/model/api/api";

interface CoExecutorPanelProps {
    userList: Employee[] | undefined;
    data: Assignment[] | undefined;
    selectedIds: number[];
    disabled: boolean;
}

export const CoExecutorPanel = (props: CoExecutorPanelProps) => {
    const {data, selectedIds, userList, disabled} = props;

    const {currentUser} = useCurrentUser();

    const [updateCoExecutor, {isLoading}] = useUpdateCoExecutor();

    const [coExecutor, setCoExecutor] = useState<Employee | null>(null);
    const [coExecutorTax, setCoExecutorTax] = useState<number>(0);

    const addCoExecutorDisabled = useMemo(() => {
        const assignmentWithVisa = data?.filter(assignment => !!assignment.inspector).map(item => item.id);
        const assignmentWithNoExecutor = data?.filter(assignment => !assignment.executor).map(item => item.id);
        const hasNoRelevantIds = selectedIds.some(id =>
            [...(assignmentWithVisa || []), ...(assignmentWithNoExecutor || [])].includes(id)
        );
        const selectedIdsIsEmpty = selectedIds.length === 0;
        return selectedIdsIsEmpty || hasNoRelevantIds || !coExecutor;
    }, [coExecutor, data, selectedIds]);


    useEffect(() => {
        if (userList && userList.length > 0 && !coExecutor) {
            setCoExecutor(userList[0]);
        }
    }, [userList, coExecutor]);

    const addCoExecutorClb = () => {
        if (coExecutor) {
            updateCoExecutor({
                assignment_ids: selectedIds,
                action: 'update_or_create',
                data: {
                    amount: coExecutorTax,
                    co_executor__id: coExecutor.id,
                }
            })
        }
    };

    const maxRangeValue = useMemo(() => {
        let result = 0;
        if (data && selectedIds.length > 0 && currentUser.current_department?.piecework_wages) {
            result = Math.max.apply(null,
                data.filter(assignment => selectedIds.includes(assignment.id)).map(
                    item => item.new_tariff?.amount || 0
                )
            )
        }
        return result;
    }, [currentUser.current_department?.piecework_wages, data, selectedIds]);

    return (
        <div className={'fs-7'}>
            Добавить соисполнителя:
            <div className={'p-1 d-flex gap-2 align-items-center'}>
                <button
                    className={'appBtn circleBtn greenBtn fs-7 p-1'}
                    disabled={addCoExecutorDisabled || isLoading || disabled}
                    onClick={addCoExecutorClb}
                >
                    <PersonAddIcon fontSize={'small'}/>
                </button>

                {userList ?
                    <>
                        <AppAutocomplete
                            variant={'select'}
                            value={coExecutor}
                            onChangeClb={(newValue) => setCoExecutor(newValue)}
                            options={userList || []}
                            label={'доп.исп'}
                            width={240}
                            getOptionLabel={option => getEmployeeName(option, 'listNameInitials')}
                        />

                        {currentUser.current_department?.piecework_wages &&
                            <AppRangeInput
                                disabled={maxRangeValue === 0 || disabled}
                                maxValue={maxRangeValue}
                                value={coExecutorTax}
                                setValue={setCoExecutorTax}
                            />
                        }
                    </>
                    :
                    <AppSkeleton className={'w-100'} style={{height: '35px'}}/>
                }
            </div>
        </div>
    );
};
