import {KpiDataOneValue} from "./KpiDataOneValue";
import {KpiDataTwoValues} from "@pages/KpiPage/ui/body/Data/KpiDataTwoValues";

export const KpiData = () => {

    return (
        <div style={{fontSize: 10}}>
            <div style={{fontSize: 12}}>
                <b>Базовые данные:</b>
            </div>

            <KpiDataOneValue value={1} name={"% бригадира от оборота:"}/>
            <KpiDataOneValue value={8.5} name={"План ФОТ %:"}/>

            <KpiDataTwoValues name={"KPI рекламаций 1:"} value1={0.5} value2={0.7}/>
            <KpiDataTwoValues name={"KPI рекламаций 2:"} value1={0.2} value2={0.9}/>
            <KpiDataTwoValues name={"KPI рекламаций 3:"} value1={0.1} value2={1}/>
            <KpiDataTwoValues name={"KPI рекламаций 4:"} value1={0} value2={1.2}/>
            <KpiDataTwoValues name={"KPI вып. плана 1:"} value1={-20} value2={0.7}/>
            <KpiDataTwoValues name={"KPI вып. плана 2:"} value1={0} value2={0.9}/>
            <KpiDataTwoValues name={"KPI вып. плана 3:"} value1={10} value2={1}/>
            <KpiDataTwoValues name={"KPI вып. плана 4:"} value1={10000} value2={1.2}/>

        </div>
    );
};