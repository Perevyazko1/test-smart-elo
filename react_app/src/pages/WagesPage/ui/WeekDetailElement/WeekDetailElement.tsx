import {Button} from "react-bootstrap";
import React, {useState} from "react";
import {week_info} from "entities/WeekInfo";

import {WagesEarnedPerDay} from "../../model/types/types";
import {DayDetail} from "./DayDetail";
import {Transaction} from "../../../../entities/Transaction";

interface WeekDetailElementProps {
    data: WagesEarnedPerDay;
    weekName: string;
    weekInfo: week_info;
    index: number;
    employeeId: number;
    onClick: (transaction: Transaction) => void;
}


export const WeekDetailElement = (props: WeekDetailElementProps) => {
    const {data, weekName, weekInfo, index, employeeId, onClick} = props;

    const [showDetails, setShowDetails] = useState<boolean>(false);


    return (
        <>
            <tr>
                <td rowSpan={2}><h2>{weekName}</h2></td>
                <td>➕ {Number(data.accruals).toLocaleString('ru-RU')}</td>
                <td rowSpan={2}>
                    <div className={'d-flex justify-content-center'}>
                        <Button
                            variant={'outline-dark'}
                            onClick={() => setShowDetails(!showDetails)}
                        >
                            Подробнее
                        </Button>
                    </div>
                </td>
            </tr>
            <tr>
                <td>➖ {Number(data.debit).toLocaleString('ru-RU')}</td>
            </tr>

            {showDetails &&
                <DayDetail
                    daySrt={weekInfo.dt_dates[index]}
                    employeeId={employeeId}
                    onClick={(transaction) => onClick(transaction)}
                />
            }

        </>
    )
}