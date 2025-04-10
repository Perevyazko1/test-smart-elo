import {useAppQuery} from "@shared/hooks";
import {ChangeEvent} from "react";


export const KpiDatesBlock = () => {
    const {queryParameters, setQueryParam} = useAppQuery();

    const setDateFromHandle = (e: ChangeEvent<HTMLInputElement>) => {
        setQueryParam("date_from", e.target.value);
    }

    const setDateToHandle = (e: ChangeEvent<HTMLInputElement>) => {
        setQueryParam("date_to", e.target.value);
    }

    return (
        <div className={'d-flex gap-3'}>
            <div className={'d-flex gap-3 align-items-center'}>
                <div>Дата с</div>
                <input type="date" onChange={setDateFromHandle} value={queryParameters["date_from"]}/>
            </div>

            <div className={'d-flex gap-3 align-items-center'}>
                <div>Дата по</div>
                <input type="date" onChange={setDateToHandle} value={queryParameters["date_to"]}/>
            </div>
        </div>
    );
};