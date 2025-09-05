import {PlanRow} from "@/widgets/plan/planTable/PlanRow.tsx";
import {useQuery} from "@tanstack/react-query";
import {planService} from "@/widgets/plan/model/api.ts";
import {usePlanProject} from "@/shared/state/payroll/planProject.ts";


export const PlanPage = () => {
    const planProject = usePlanProject(s => s.planProject);
    const {data, isFetching, isPending} = useQuery({
        queryKey: ['planTable', planProject],
        queryFn: () => {
            return planService.getPlanTable({
                project: planProject,
            });
        },
    });

    const sortedEntries = Object.entries(data?.data || {}).sort((a, b) => {
        if (!a[1].date && !b[1].date) return 0;
        if (!a[1].date) return 1;
        if (!b[1].date) return -1;
        return new Date(a[1].date).getTime() - new Date(b[1].date).getTime();
    });
    const total = sortedEntries.reduce((acc, [key, item]) => acc +
            (((item.assignments["Конструктора"]?.all || 0) - (item.assignments["Конструктора"]?.ready || 0)) *
                item.price *
                item.quantity),
        0);

    const total2 = sortedEntries.reduce((acc, [key, item]) => acc +
            (((item.assignments["Сборка"]?.all || 0) - (item.assignments["Сборка"]?.ready || 0)) *
                item.price),
        0);

    const total3 = sortedEntries.reduce((acc, [key, item]) => acc +
            (((item.assignments["Пошив"]?.all || 0) - (item.assignments["Пошив"]?.ready || 0)) *
                item.price),
        0);

    const total4 = sortedEntries.reduce((acc, [key, item]) => acc +
            (((item.assignments["Малярка"]?.all || 0) - (item.assignments["Малярка"]?.ready || 0)) *
                item.price),
        0);
    const total5 = sortedEntries.reduce((acc, [key, item]) => acc +
            (((item.assignments["Обивка"]?.all || 0) - (item.assignments["Обивка"]?.ready || 0)) *
                item.price),
        0);


    const total6 = sortedEntries.reduce((acc, [key, item]) => acc +
            (item.quantity - item.shipped) * item.price,
        0);

    return (
        <div className={'max-w-dvw bg-white p-4'}>
            <div className={'flex gap-2'}>
                <span>ПЛАН СТРАНИЦА </span>
                {(isFetching || isPending) && (<div className={'animate-pulse size-6'}>🔄️</div>)}
            </div>


            <table className={'w-full'}>
                <thead>
                <tr>
                    <th>#</th>
                    <th rowSpan={2}>ДАТА</th>
                    <th rowSpan={2}>ШТ</th>
                    <th rowSpan={2}>Изделие</th>
                    <th>Констр.</th>
                    <th>Сборка</th>
                    <th>Пошив</th>
                    <th>Малярка</th>
                    <th>Обивка</th>
                    <th>Отгружено</th>
                </tr>
                <tr>
                    <th>#</th>
                    <th className={"px-1"}>{Math.round(total).toLocaleString('ru-RU')}</th>
                    <th className={"px-1"}>{Math.round(total2).toLocaleString('ru-RU')}</th>
                    <th className={"px-1"}>{Math.round(total3).toLocaleString('ru-RU')}</th>
                    <th className={"px-1"}>{Math.round(total4).toLocaleString('ru-RU')}</th>
                    <th className={"px-1"}>{Math.round(total5).toLocaleString('ru-RU')}</th>
                    <th className={"px-1"}>{Math.round(total6).toLocaleString('ru-RU')}</th>
                </tr>
                </thead>

                <tbody>
                {sortedEntries.map(([key, item], index) => (
                    <PlanRow
                        key={key}
                        index={index}
                        data={item}
                    />
                ))}
                </tbody>
            </table>

        </div>
    )
}