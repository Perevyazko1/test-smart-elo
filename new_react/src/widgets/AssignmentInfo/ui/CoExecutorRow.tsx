import React, {useState} from "react";
import {Spinner} from "react-bootstrap";

import PersonRemoveIcon from "@mui/icons-material/PersonRemove";
import CheckIcon from '@mui/icons-material/Check';
import {AssignmentCoExecutor} from "@entities/Assignment";
import {Employee} from "@entities/Employee";
import {useEmployeeName} from "@shared/hooks";
import {AppRangeInput, AppSelect} from "@shared/ui";


import {useUpdateCoExecutor} from "../model/api/api";


interface CoExecutorRowProps {
    co_executor: AssignmentCoExecutor;
    setValue: (executorId: number, newValue: number) => void;
    setUser: (prevUserId: number, newUserId: number | null) => void;
    maxValue: number;
    userList: Employee[];
    disabled: boolean;
}


export const CoExecutorRow = (props: CoExecutorRowProps) => {
    const {co_executor, maxValue, setValue, setUser, userList, disabled} = props;

    const {getNameById} = useEmployeeName();

    const [updateCoExecutor, {isLoading}] = useUpdateCoExecutor();
    const [isEdited, setIsEdited] = useState(!co_executor.id);

    const setAmount = (value: number) => {
        setValue(co_executor.co_executor, value)
        setIsEdited(true);
    }

    const editClb = () => {
        updateCoExecutor({
            action: 'update_or_create',
            assignment_ids: [co_executor.assignment],
            co_executor_ids: [],
            data: {
                co_executor__id: co_executor.co_executor,
                amount: co_executor.amount,
            }
        }).then(() => setIsEdited(false));
    };

    const deleteClb = () => {
        if (co_executor.id) {
            updateCoExecutor({
                action: 'delete',
                co_executor_ids: [co_executor.id],
            }).then(() => {
                setUser(co_executor.co_executor, null)
            });
        } else {
            setUser(co_executor.co_executor, null)
        }
    }

    return (
        <tr>
            <td colSpan={5} className={'pb-0'}>
                <div className={'d-flex justify-content-end align-items-center gap-3'}>
                    <button
                        className={'appBtn circleBtn greenBtn px-1 fs-7'}
                        style={{height: '25px', width: '25px', opacity: isEdited ? 1 : 0}}
                        disabled={isLoading || !isEdited}
                        onClick={editClb}
                    >
                        {isLoading ? <Spinner size={'sm'}/> :
                            <CheckIcon fontSize={'small'}/>
                        }
                    </button>

                    {!disabled &&
                        <button
                            className={'appBtn circleBtn px-1 fs-7'}
                            style={{height: '25px', width: '25px'}}
                            disabled={isLoading}
                            onClick={deleteClb}
                        >
                            <PersonRemoveIcon fontSize={'small'}/>
                        </button>
                    }


                    <AppSelect
                        variant={'dropdown'}
                        style={{width: 240}}
                        value={co_executor.co_executor}
                        label={'доп.исп'}
                        colorScheme={'lightInput'}
                        readOnly={!!co_executor.id}
                        options={[...userList.map(item => item.id), co_executor.co_executor]}
                        getOptionLabel={option => getNameById(option, 'listNameInitials')}
                        onSelect={(newValue) => setUser(co_executor.co_executor, newValue)}
                    />
                </div>
            </td>
            <td colSpan={8} className={'align-middle fs-7'}>
                {maxValue === 0 ?
                    <> - Без тарифа</>
                    :
                    <AppRangeInput
                        disabled={disabled}
                        maxValue={maxValue}
                        value={co_executor.amount}
                        setValue={setAmount}
                    />
                }
            </td>
        </tr>
    );
};
