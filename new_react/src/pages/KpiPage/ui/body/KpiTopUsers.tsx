import {KpiTopUser} from "@pages/KpiPage/ui/body/KpiTopUser";

export const KpiTopUsers = () => {

    return (
        <div className={'d-flex flex-column gap-2 opacity-50'}>
            <div className={'d-flex gap-3 align-items-center'}>
                Топ сотрудников
                <button className={'appBtn px-3 py-1 greyBtn'}>Подробнее</button>
            </div>
            <div>
                <KpiTopUser name={"Петров Петр"} quantity={237} quantity_all={300} price={2_034_123} price_all={2_500_500} />
                <KpiTopUser name={"Иванов Иван"} quantity={153} quantity_all={300} price={1_034_123} price_all={2_500_500} />
                <KpiTopUser name={"Сидоров Артем"} quantity={102} quantity_all={300} price={834_123} price_all={2_500_500} />
                <KpiTopUser name={"Василькин Игорь"} quantity={44} quantity_all={300} price={534_123} price_all={2_500_500} />
            </div>
        </div>
    );
};