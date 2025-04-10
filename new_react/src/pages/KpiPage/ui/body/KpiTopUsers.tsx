import {KpiTopUser} from "@pages/KpiPage/ui/body/KpiTopUser";
import {IUserReport} from "@pages/KpiPage/model/api/rtk";

interface KpiTopUsersProps {
    data?: IUserReport[];
}

export const KpiTopUsers = (props: KpiTopUsersProps) => {
    const {data} = props;

    if (!data) {
        return null;
    }

    const maxPrice = Math.max(...data.map(user => user.assignments_price)) * 1.1;
    const maxCount = Math.max(...data.map(user => user.count)) * 1.2;

    const sortedData = [...data]
        .sort((a, b) => b.assignments_price - a.assignments_price);

    return (
        <div className={'d-flex flex-column gap-2'}>
            <div className={'d-flex gap-3 align-items-center'}>
                Топ сотрудников
                <button className={'appBtn px-3 py-1 greyBtn'}>Подробнее</button>
            </div>
            <div>
                {sortedData.map((report: IUserReport) => (
                    <KpiTopUser
                        key={report.username}
                        name={report.name}
                        quantity={report.count}
                        quantity_all={maxCount}
                        price={report.assignments_price}
                        price_all={maxPrice}/>
                ))}
            </div>
        </div>
    );
};