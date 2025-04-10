import {AppInput} from "@shared/ui";

interface Props {
    total_sum?: number;
    total_count?: number;
}

export const KpiTotal = (props: Props) => {
    const {total_count, total_sum} = props;

    const formattedCount = total_count?.toLocaleString('ru-RU') || '';
    const formattedSum = total_sum?.toLocaleString('ru-RU') || '';

    return (
        <div className={'d-flex gap-3 align-items-center'}>
            Всего (продукции произведено):
            <div className={"d-flex gap-1 align-items-center"}>
                <AppInput
                    style={{width: "8rem", fontSize: '1.2rem'}}
                    className="bg-light text-black fw-bold rounded-0"
                    readOnly={true}
                    value={formattedCount}
                /> изд.
            </div>

            <div className={"d-flex gap-1 align-items-center"}>
                <AppInput
                    style={{width: "8rem", fontSize: '1.2rem'}}
                    className="bg-light text-black fw-bold rounded-0"
                    readOnly={true}
                    value={formattedSum}
                /> ₽
            </div>

            <button className={'appBtn px-3 py-1 greyBtn'}>Подробнее</button>
        </div>
    );
};