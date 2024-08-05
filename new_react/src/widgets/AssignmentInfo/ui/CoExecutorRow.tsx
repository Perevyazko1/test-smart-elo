import PersonRemoveIcon from "@mui/icons-material/PersonRemove";
import {AppAutocomplete} from "@pages/TestPage/ui/AppAutocomplete";
import {getEmployeeName} from "@shared/lib";
import React, {useState} from "react";
import {AssignmentCoExecutor, AssignmentCoExecutorWrite} from "@entities/Assignment";
import {AppRangeInput} from "@shared/ui/AppRangeInput";
import {Employee} from "@entities/Employee";


interface CoExecutorRowProps {
    co_executor?: AssignmentCoExecutor;
    maxValue: number;
    new_co_executor?: AssignmentCoExecutorWrite;
    setCoExecutor?: (value: AssignmentCoExecutorWrite) => void;
    userList?: Employee[];
}


export const CoExecutorRow = (props: CoExecutorRowProps) => {
    const {co_executor, maxValue, new_co_executor, userList, setCoExecutor} = props;

    const [value, setValue] = useState(co_executor?.amount || new_co_executor?.amount || 0);

    const setAmount = (value: number) => {
        if (co_executor) {
            setValue(value)
        } else if (setCoExecutor && new_co_executor) {
            setCoExecutor({
                ...new_co_executor,
                amount: value,
            })
        }
    }

    return (
        <tr>
            <td colSpan={5} className={'pb-0'}>
                <div className={'d-flex justify-content-end align-items-center gap-4'}>
                    <button
                        className={'appBtn px-1 fs-7'}
                        style={{height: '25px'}}
                    >
                        Добавить
                    </button>

                    <button
                        className={'appBtn circleBtn redBtn px-1 fs-7'}
                        style={{height: '25px', width: '25px'}}
                    >
                        <PersonRemoveIcon fontSize={'small'}/>
                    </button>

                    <AppAutocomplete
                        variant={'select'}
                        value={co_executor?.co_executor
                            || userList?.find(user => user.id === new_co_executor?.co_executor_id)
                            || null
                        }
                        options={userList || []}
                        label={'доп.исп'}
                        width={240}
                        getOptionLabel={option => getEmployeeName(option, 'listNameInitials')}
                    />
                </div>
            </td>
            <td colSpan={7} className={'align-middle'}>
                <AppRangeInput
                    maxValue={maxValue}
                    value={new_co_executor?.amount || value}
                    setValue={setAmount}
                />
            </td>
        </tr>
    );
};
