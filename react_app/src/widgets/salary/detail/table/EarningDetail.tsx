import type {IEarning} from "@/entities/salary";
import {getUserName} from "@/shared/utils/getUserName.ts";
import {NiceNum} from "@/shared/ui/text/NiceNum.tsx";
import {toRuDate} from "@/shared/utils/date.ts";


interface EarningDetailProps {
    earning: IEarning;
}


export const EarningDetail = (props: EarningDetailProps) => {
    const {earning} = props;

    return (
        <div className={'flex flex-col gap-3 bg-white p-2 px-5'}>
            <div>
                <div>Сумма:</div>
                <div><NiceNum value={earning.amount}/></div>
            </div>
            <div>
                <div>Кому начислен:</div>
                <div>{getUserName(earning.user)}</div>
            </div>
            <div>
                <div>Тип:</div>
                <div>{earning.earning_type}</div>
            </div>
            <div>
                <div>Дата закрепления:</div>
                <div>{toRuDate(earning.target_date, false)}</div>
            </div>

            <hr/>
            <div>
                <div>Дата создания:</div>
                <div>{toRuDate(earning.created_at, false)}</div>
            </div>
            <div>
                <div>Комментарий зарплатный:</div>
                <div>{earning.earning_comment}</div>
            </div>
            <div>
                <div>Комментарий:</div>
                <div>{earning.comment}</div>
            </div>
            <div>
                <div>Кто создал:</div>
                <div>{earning.created_by_name}</div>
            </div>
            <div>
                <div>Завизировал:</div>
                <div>{earning.approval_by_name}</div>
            </div>
        </div>
    );
};