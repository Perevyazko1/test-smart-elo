import cls from "../KpiPage.module.scss"

import {KpiDatesBlock} from "./KpiDatesBlock";
import {KpiCalculator} from "./KpiCalculator";
import {KpiTotal} from "./KpiTotal";
import {KpiTopUsers} from "./KpiTopUsers";
import {KpiData} from "./KpiData";
import {useKpiData} from "@pages/KpiPage/model/api/rtk";
import {useQueryParams} from "@shared/hooks";


export const KpiBody = () => {
    const {queryParameters} = useQueryParams();

    const [trigger, {data}] = useKpiData({});

    const getDataHandle = () => {
        if (queryParameters.date_from && queryParameters.date_to) {
            trigger({
                date_from: queryParameters.date_from,
                date_to: queryParameters.date_to,
            })
        }
    }


    return (
        <div className={cls.pageContent}>
            <div className={'d-flex gap-2 flex-nowrap px-4 pt-3 justify-content-between'}>
                <div className={'flex-1'}>
                    <div className={"d-flex gap-4 align-items-center"}>
                        <KpiDatesBlock/>

                        <button
                            className={'appBtn px-3 py-1 greenBtn'}
                            onClick={getDataHandle}
                        >
                            Вывести отчет
                        </button>
                    </div>
                    <hr/>
                    <div className={"px-3 p-2"}>
                        <KpiTotal total_count={data?.total_count || 0} total_sum={data?.total_sum || 0}/>
                    </div>

                    <hr/>

                    <div className={"px-3 p-2"}>
                        <KpiCalculator total_count={data?.total_count || 0} total_sum={data?.total_sum || 0}/>
                    </div>
                </div>

                <div style={{width: '25%'}} className={'border border-black p-2'}>
                    <KpiData/>
                </div>

            </div>

            <hr/>
            <div className={'px-5'}>
                <KpiTopUsers data={data?.user_report}/>
            </div>
        </div>
    );
};