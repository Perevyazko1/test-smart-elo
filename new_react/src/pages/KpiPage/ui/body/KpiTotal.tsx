import {AppInput} from "@shared/ui";
import {useQueryParams} from "@shared/hooks";

interface Props {
    total_sum?: number;
    total_count?: number;
    total_fot?: number;
}

export const KpiTotal = (props: Props) => {
    const {total_count, total_sum, total_fot} = props;
    const {queryParameters} = useQueryParams();

    const formattedCount = total_count?.toLocaleString('ru-RU') || '';
    const formattedSum = total_sum?.toLocaleString('ru-RU') || '';
    const formattedFot = total_fot?.toLocaleString('ru-RU') || '';

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
            {!queryParameters.showSum && (
                <div className={"d-flex gap-1 align-items-center"}>
                    <AppInput
                        style={{width: "6rem", fontSize: '1.2rem'}}
                        className="bg-light text-black rounded-0"
                        readOnly={true}
                        value={formattedFot}
                    /> ₽ сделка
                </div>
            )}
        </div>
    );
};