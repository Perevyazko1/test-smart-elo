import chairPath from "./Chair.jpg";
import fabricPath from "./Fabric.png";
import type {IPlanDataRow} from "@/entities/plan";
import {STATIC_URL} from "@/shared/consts/serverConfig.ts";

interface IProps {
    data: IPlanDataRow;
}

export function PlanCard(props: IProps) {
    const {data} = props;

    return (
        <div className={'print:h-14 h-20 flex flex-row gap-1 flex-nowrap'}>
            <div className={'border-2 border-black h-full w-20 print:w-14 flex justify-center items-center'}>
                <img
                    loading={'lazy'}
                    src={STATIC_URL + data.product_picture}
                    alt="Chair"
                    className={'object-fill max-h-full max-w-full'}
                />
            </div>
            {data.fabric_picture && (
                <div className={'border-2 border-black h-full w-20 print:w-14 flex justify-center items-center relative'}>
                    <img
                        loading={'lazy'}
                        src={STATIC_URL + data.fabric_picture}
                        alt="Chair"
                        className={'object-fill max-h-full max-w-full'}
                    />

                    <span
                        className={'absolute bottom-0 right-0 bg-black text-white text-xs ps-1'}
                    >
                        {data.fabric_stock}
                    </span>
                </div>
            )}

            <div className={'overflow-y-auto flex-1 leading-none print:overflow-x-hidden print:overflow-y-hidden'}>
                <div>
                    <b>{data.project}</b> {data.series_id}
                </div>
                <div>
                    {data.product_name}
                    <br/>
                    {data.fabric_name}
                </div>
            </div>

            <div className={'overflow-y-auto print:overflow-x-hidden leading-none max-w-45 text-[9px] print:text-[9px] text-wrap'}>
                {data.comments.map((comment, index) => (
                    <div key={index}>◉ {comment.text}</div>
                ))}
            </div>
        </div>
    );
}