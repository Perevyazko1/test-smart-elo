import {IUserReport} from "@pages/KpiPage/model/api/rtk";
import {ProgresBar} from "./ProgresBar";
import {useQueryParams} from "@shared/hooks";


interface KpiTopUserProps {
    report: IUserReport;
    quantity_all: number;
    price_all: number;
    amount_all: number;
    maxPercent: number;
}

export const KpiTopUser = (props: KpiTopUserProps) => {
    const {report, quantity_all, price_all, amount_all, maxPercent} = props;
    const {queryParameters} = useQueryParams();

    function getGradientColor(value: number) {
        // Нормализуем значение в диапазоне [0, 1]
        const min = 0;
        const ratio = (value - min) / (maxPercent - min);

        // Определяем цвета (RGB)
        const startColor = {r: 0, g: 255, b: 0}; // Зеленый
        const endColor = {r: 255, g: 0, b: 0};   // Красный

        // Линейная интерполяция для каждого канала
        const r = Math.round(startColor.r + (endColor.r - startColor.r) * ratio);
        const g = Math.round(startColor.g + (endColor.g - startColor.g) * ratio);
        const b = Math.round(startColor.b + (endColor.b - startColor.b) * ratio);

        // Возвращаем цвет в формате HEX или RGB
        return `rgba(${r}, ${g}, ${b}, .75)`;
    }

    const percent = Number(
        (
            (report.co_executors_amount + report.assignments_amount) /
            report.assignments_price * 100
        ).toFixed(2)
    );


    return (
        <div className={'w-100 d-flex outlineBox'}>
            <div style={{width: "18rem"}}
                 className={'border border-black px-3'}>
                {report.name}
            </div>
            <div className={'w-100'}>

                <div className={'d-flex'}>
                    <ProgresBar
                        width={`${report.count / quantity_all * 100}%`}
                        bg={`#FFD966`}
                        value={report.count}
                        unit={' изд.'}
                        title={'Всего изделий штук сделано за отчетный период'}
                    />
                    {report.co_executor_count ? (
                        <ProgresBar
                            width={`fit-content`}
                            bg={`#d38edb`}
                            value={report.co_executor_count}
                            unit={' пом.'}
                            title={'Помощь в исполнении нарядов'}
                        />
                    ) : null}

                </div>


                <ProgresBar
                    width={`${report.assignments_price / price_all * 100}%`}
                    bg={`#8EA9DB`}
                    value={report.assignments_price}
                    unit={'₽'}
                    title={'Стоимость изделия умноженная на количество нарядов'}
                />

                {(report.assignments_amount + report.co_executors_amount + report.task_amount > 0 && !queryParameters.showSum) ? (
                    <div className={'d-flex'}>
                        <ProgresBar
                            width={`${(report.assignments_amount + report.co_executors_amount) / amount_all * 100}%`}
                            bg={`#bfdb8e`}
                            value={(report.assignments_amount + report.co_executors_amount)}
                            unit={'₽'}
                            title={'Сделка за исполнителя и соисполнителя в нарядах'}
                        />
                        {report.task_amount ? (
                            <ProgresBar
                                width={`${report.task_amount / amount_all * 100}%`}
                                bg={`#b38edb`}
                                value={report.task_amount}
                                unit={'₽'}
                                title={'Сделка за допики'}
                            />
                        ) : null}
                        <ProgresBar
                            width={`fit-content`}
                            bg={getGradientColor(percent)}
                            value={percent}
                            unit={'%'}
                            formatValue={false}
                            title={'Отношение сделки к сумме произведенной продукции. Наибольшее красный наименьшее зеленый'}
                        />
                    </div>
                ) : null}
            </div>
        </div>
    );
};