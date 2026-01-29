import {TariffRow} from "@/pages/tariffing/TariffRow.tsx";
import {useQuery} from "@tanstack/react-query";
import {$axios} from "@/shared/api";
import type {TariffRowsResponse} from "@/pages/tariffing/types.ts";
import {useProject} from "@/pages/tariffing/TariffingNav.tsx";

interface Props {

}

export const TariffingPage = (props: Props) => {
    const {} = props;
    const project = useProject(s => s.project);
    const unconfirmed = useProject(s => s.unconfirmed);
    const showAll = useProject(s => s.showAll);
    const product = useProject(s => s.product);

    const {data} = useQuery({
        queryKey: ['tariffData', project, product, showAll],
        queryFn: async () => {
            const res = await $axios.get<TariffRowsResponse>(
                '/tariffs/get_tariff_rows', {
                    params: {
                        'project': project,
                        'product': product,
                        'showAll': showAll,
                    }
                }
            )
            return res.data
        },
    });

    const rows = data?.result ?? [];
    const departments = data?.departments ?? [];

    const filteredRows = () => {
        if (unconfirmed) {
            return rows.filter(row => !row.confirmed);
        } else {
            return rows;
        }
    }

    const totalAmount = filteredRows().reduce((acc, row) => acc + row.amount, 0)
    const totalWages = filteredRows().reduce(
        (acc, row) => acc + (row.steps ? Object.values(row.steps).reduce(
            (stepAcc, step) => stepAcc + (step?.amount || 0), 0) : 0), 0)

    return (
        <div className={'p-5 bg-white'}>
            <div>
                <span>Итого средний % </span>
                <span>{totalAmount ? totalWages / totalAmount * 100 : 100}</span>
            </div>

            <table className={'w-full bg-yellow-50 border-collapse border border-slate-400'}>
                <thead className={'sticky top-10 bg-yellow-50 z-10'}>
                <tr className={'[&>th]:border [&>th]:border-slate-300 [&>th]:bg-yellow-50'}>
                    <th>Заказ</th>
                    <th>ШТ</th>
                    <th>Изобр.</th>
                    <th>Изделие / Ткань / Комментарий</th>
                    {departments.map((name) => (
                        <th key={name}
                            className={'max-w-[72px] min-w-[72px] overflow-hidden'}
                        >
                            {name}
                        </th>
                    ))}
                    <th className={'max-w-[80px] min-w-[80px] overflow-hidden'}>Итого</th>
                </tr>
                </thead>

                <tbody>
                {filteredRows()?.map((row) => (
                    <TariffRow
                        row={row}
                        departments={departments}
                        key={row.id}
                    />
                ))}
                </tbody>
            </table>
        </div>
    );
};
