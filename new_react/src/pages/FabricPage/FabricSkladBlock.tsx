import {useQuery} from '@tanstack/react-query';
import {$axiosAPI} from "@shared/api";
import {IPurchaseResponse} from "@pages/FabricPage/types";
import {FabricCard} from "@pages/FabricPage/FabricCard";
import {getHumansDatetime} from "@shared/lib";


export const FabricSkladBlock = () => {
    const {data, isLoading, error} = useQuery({
        queryKey: ['fabricSklad'],
        queryFn: async () => {
            const response = await $axiosAPI.get<IPurchaseResponse>('/sklad/get_supply/');
            return Object.values(response.data.fabric_cards);
        }
    });

    if (isLoading) return <div className={'p-2'}>Запрос данных...</div>;
    if (error) return <div className={'p-2 text-danger'}>Ошибка: {error.message}</div>;

    return (
        <div className={'d-flex flex-wrap flex-column gap-2 p-2'}>
            {data?.map(item => (
                <FabricCard
                    key={item.product_id}
                    item={item}
                    actionName1={"ПРИНЯТ"}
                    variant={'sklad'}
                    actionName2={getHumansDatetime(item.moment, "DD-MM")}/>
            ))}
        </div>
    );
};