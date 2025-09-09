import chairPath from "./Chair.jpg";
import fabricPath from "./Fabric.png";
import type {PlanDataRow} from "@/entities/plan";
import {STATIC_URL} from "@/shared/consts/serverConfig.ts";

interface IProps {
    data: PlanDataRow;
}

export function PlanCard(props: IProps) {
    const {data} = props;

    return (
        <div className={'border-2 border-purple-500 h-15 flex flex-row gap-1 flex-nowrap'}>

            <div className={'border-2 border-black h-full w-15 flex justify-center items-center'}>
                <img
                    loading={'lazy'}
                    src={STATIC_URL + data.product_picture}
                    alt="Chair"
                    className={'object-fill max-h-full max-w-full'}
                />
            </div>
            {data.fabric_picture && (
                <div className={'border-2 border-black h-full w-15 flex justify-center items-center'}>
                    <img
                        loading={'lazy'}
                        src={STATIC_URL + data.fabric_picture}
                        alt="Chair"
                        className={'object-fill max-h-full max-w-full'}
                    />
                </div>
            )}

            <div className={'overflow-y-auto flex-1'}>
                <div>
                    <b>{data.project}</b> {data.series_id}
                </div>
                <div>
                    {data.product_name}
                    <br/>
                    {data.fabric_name}
                </div>
            </div>
        </div>
    );
}