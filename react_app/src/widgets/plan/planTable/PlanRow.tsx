import {PlanCard} from "@/widgets/plan/planCard/PlanCard.tsx";
import {ProgressiveCell} from "@/widgets/plan/planCard/ProgressiveCell.tsx";
import {Btn} from "@/shared/ui/buttons/Btn.tsx";
import {CrossCircledIcon, CheckCircledIcon} from "@radix-ui/react-icons";
import type {PlanDataRow} from "@/entities/plan";

interface IProps {
    data: PlanDataRow;
    index: number;
}

export function PlanRow(props: IProps) {
    const {data, index} = props;
    const empty = {
        "all": 0,
        "ready": 0,
    }
    const d1 = data.assignments["Конструктора"] || empty;
    const d2 = data.assignments["Сборка"] || empty;
    const d3 = data.assignments["Пошив"] || empty;
    const d4 = data.assignments["Малярка"] || empty;
    const d5 = data.assignments["Обивка"] || empty;

    return (
        <tr>
            <td>{index + 1}</td>
            <td className={'max-w-30'}>
                <input
                    type="date"
                    className={'text-xs border-1 border-black p-1 w-full mb-1'}
                    value={data.date ? new Date(data.date).toISOString().split('T')[0] : ''}
                />
                <div className={'flex justify-evenly gap-1'}>
                    <Btn className={'text-green-700 m-0 p-1 border-1 border-black'}><CheckCircledIcon/></Btn>
                    <Btn className={'text-red-700 m-0 p-1 border-1 border-black'}><CrossCircledIcon/></Btn>
                </div>
            </td>
            <td className={'max-w-15'}>
                <input
                    type="number"
                    defaultValue={data.quantity}
                    className={'text-xl max-w-full'}
                />
            </td>
            <td><PlanCard data={data}/></td>
            <ProgressiveCell left={d1.ready} right={d1.all - d1.ready}/>
            <ProgressiveCell left={d2.ready} right={d2.all - d2.ready}/>
            <ProgressiveCell left={d3.ready} right={d3.all - d3.ready}/>
            <ProgressiveCell left={d4.ready} right={d4.all - d4.ready}/>
            <ProgressiveCell left={d5.ready} right={d5.all - d5.ready}/>

            <ProgressiveCell left={data.shipped} right={data.quantity - data.shipped}/>
        </tr>
    )
        ;
}