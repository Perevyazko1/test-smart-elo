import cls from "../KpiPage.module.scss"

import {KpiDatesBlock} from "./KpiDatesBlock";
import {KpiTopUsers} from "./TopUsers/KpiTopUsers";
import {useKpiData} from "@pages/KpiPage/model/api/rtk";
import {useQueryParams} from "@shared/hooks";
import {Spinner} from "react-bootstrap";
import {SERVER_HTTP_ADDRESS} from "@shared/consts";


export const KpiBody = () => {
    const {queryParameters} = useQueryParams();

    const [trigger, {data, isLoading, isFetching}] = useKpiData({});

    const getDataHandle = () => {
        if (queryParameters.date_from && queryParameters.date_to) {
            trigger({
                date_from: queryParameters.date_from,
                date_to: queryParameters.date_to,
                department__id: queryParameters.department__id,
            })
        }
    }

    const url = SERVER_HTTP_ADDRESS + `/api/v1/staff/kpi/get_report?date_from=${queryParameters.date_from}&date_to=${queryParameters.date_to}&department__id=${queryParameters.department__id}`;


    return (
        <div className={cls.pageContent}>
            <div className={'d-flex gap-2 flex-nowrap px-4 pt-3 justify-content-between'}>
                <div className={'flex-1'}>
                    <div className={"d-flex gap-4 align-items-center"}>
                        <KpiDatesBlock/>

                        <button
                            className={'appBtn px-3 py-1 greenBtn'}
                            onClick={getDataHandle}
                            disabled={(isFetching || isLoading)}
                        >
                            Вывести отчет
                        </button>

                        <button
                            className={'appBtn px-3 py-1 greenBtn'}
                            disabled={
                                !queryParameters.date_from || !queryParameters.date_to || !queryParameters.department__id
                            }
                            onClick={() => {
                                window.location.href = url;
                            }}
                        >
                            Скачать
                        </button>

                        {(isFetching || isLoading) && <Spinner animation="grow" size="sm"/>}
                    </div>
                    <hr/>
                </div>

            </div>

            <hr/>
            <div className={'px-5'}>
                <KpiTopUsers data={data?.user_report}/>
            </div>
        </div>
    );
};