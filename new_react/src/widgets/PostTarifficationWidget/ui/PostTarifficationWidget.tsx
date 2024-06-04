import {Button, Table} from "react-bootstrap";

import {DynamicComponent, ReducersList} from "@features";
import {AppSkeleton, AppSlider} from "@shared/ui";

import {postTarifficationWidgetReducer} from "../model/slice";

import {PostTarifficationRow} from "./PostTarifficationRow";
import {useAppDispatch, useAppSelector} from "@shared/hooks";
import {useEffect, useMemo, useState} from "react";
import {fetchPostTarifficationData} from "../model/api/fetchPostTarifficationData";
import {
    getPostTarifficationData,
    getPostTarifficationHasUpdated,
    getPostTarifficationIsLoading
} from "@widgets/PostTarifficationWidget/model/selectors";
import {fetchSetPostTariffication} from "@widgets/PostTarifficationWidget/model/api/fetchSetPostTariffication";


const initialReducers: ReducersList = {
    postTariffication: postTarifficationWidgetReducer,
}

interface PostTarifficationWidgetProps {
    production_step__id: number;
    onSuccess: () => void;
}

export const PostTarifficationWidget = (props: PostTarifficationWidgetProps) => {
    const dispatch = useAppDispatch();
    const data = useAppSelector(getPostTarifficationData);
    const isLoading = useAppSelector(getPostTarifficationIsLoading);
    const hasUpdated = useAppSelector(getPostTarifficationHasUpdated);
    const [isDisabled, setIsDisabled] = useState<boolean>(false);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [needConfirm, setNeedConfirm] = useState<boolean>(false);

    useEffect(() => {
        setIsDisabled(true);

        dispatch(fetchPostTarifficationData(
            {production_step__id: props.production_step__id}
        ))

        setIsDisabled(false);
    }, [dispatch, props.production_step__id, hasUpdated]);

    const onCheckClb = (assignmentId: number) => {
        if (selectedIds.includes(assignmentId)) {
            setSelectedIds([...selectedIds.filter(item => item !== assignmentId)])
        } else {
            setSelectedIds([...selectedIds, assignmentId])
        }
    }

    const getLastMonday = () => {
        const today = new Date();
        const dayOfWeek = today.getDay();
        const lastMonday = new Date(today);

        // В JavaScript воскресенье = 0, понедельник = 1, и т.д.
        // Если сегодня понедельник, берем предыдущий понедельник
        if (dayOfWeek === 0) {
            lastMonday.setDate(today.getDate() - 6);
        } else {
            lastMonday.setDate(today.getDate() - dayOfWeek - 6);
        }

        // Обнулить время для точного сравнения
        lastMonday.setHours(0, 0, 0, 0);

        return lastMonday;
    }

    const selectLastWeekItems = () => {
        if (data) {
            setSelectedIds(data.assignments
                .filter(obj => new Date(obj.date_completion) >= getLastMonday())
                .map(obj => obj.id)
            )
        }
    }

    const selectAllItems = () => {
        if (data) {
            if (selectedIds.length) {
                setSelectedIds([])
            } else {
                const result = data.assignments.map(assignment => assignment.id)
                setSelectedIds(result)
            }
        }
    }

    const allCheckedIndicator = useMemo(() => {
        if (data && data.assignments.length === 0) {
            return false;
        } else {
            if (data && data.assignments.length === selectedIds.length) {
                return true
            }
        }
        return false
    }, [data, selectedIds.length])

    const getSum = useMemo(() => {
        if (data) {
            const sum = selectedIds.length * data.proposed_tariff.amount
            return sum.toLocaleString('ru-RU')
        } else {
            return "0"
        }
    }, [data, selectedIds.length]);

    const getTotalCount = useMemo(() => {
        if (data) {
            const getAssignmentString = (len: number) => {
                if (len === 0 || len >= 5) {
                    return "нарядов"
                } else if (len === 1) {
                    return "наряд"
                } else if (len > 1 && len < 5) {
                    return "наряда"
                }
            }
            const allCount = data.assignments.length
            const selectedCount = selectedIds.length

            return (
                <p className={'fs-7'}>
                    ({selectedCount} {getAssignmentString(selectedCount)} по
                    <b> {data.proposed_tariff.amount.toLocaleString('ru-RU')} </b>
                    и {allCount - selectedCount} {getAssignmentString(allCount - selectedCount)} с
                    <b> 0</b>
                    )
                </p>
            )
        } else {
            return (<AppSkeleton/>)
        }
    }, [data, selectedIds.length]);

    const confirmTariffClb = () => {
        if (data) {
            setIsDisabled(true);

            const zeroTariffIds = data.assignments.filter(
                assignment => !selectedIds.includes(assignment.id)
            ).map(assignment => assignment.id);

            dispatch(fetchSetPostTariffication({
                production_step__id: data.id,
                target__ids: selectedIds,
                tariff__id: data.proposed_tariff.id,
                zero_tariff__ids: zeroTariffIds,
            })).then(() => {
                alert('Наряды успешно тарифицированы! ');
                props.onSuccess();
            });
        }
    }

    return (
        <DynamicComponent reducers={initialReducers}>
            <div data-bs-theme={'light'}>
                <h4 className={'ms-2 me-5'}>Необходимо тарифицировать уже произведенные и завизированные бегуны: </h4>
                <hr className={'p-1 m-1'}/>

                <div className={'d-flex gap-2 mb-2'}>
                    <div className={'border border-1 border-black p-1'}>
                        {isLoading
                            ?
                            <AppSkeleton style={{width: "100px", height: "100px"}}/>
                            :
                            <AppSlider
                                images={data?.product_thumbnails}
                            />
                        }
                    </div>
                    <div>
                        <h6>
                            {isLoading
                                ? <AppSkeleton/>
                                : <>{data?.product_name}</>
                            }

                        </h6>
                        <h6>
                            {isLoading
                                ? <AppSkeleton/>
                                : <>Отдел: <b>{data?.department.name}</b></>
                            }
                        </h6>
                        <h6>
                            {isLoading
                                ? <AppSkeleton/>
                                : <>Предложенный тариф: <b>{data?.proposed_tariff.amount}</b></>
                            }
                        </h6>

                    </div>
                </div>

                <hr className={'p-1 m-1'}/>

                <div className={'d-flex gap-2 pb-2 align-items-center'}>
                    Выбрать:
                    <Button
                        size={'sm'}
                        variant={'dark'}
                        disabled={isLoading || isDisabled}
                        onClick={selectAllItems}
                    >
                        Все
                    </Button>
                    <Button
                        size={'sm'}
                        variant={'dark'}
                        disabled={isLoading || isDisabled}
                        onClick={selectLastWeekItems}
                    >
                        За последнюю неделю
                    </Button>
                </div>


                <Table size={'sm'} striped hover bordered>
                    <thead>

                    <tr>
                        <td className={'fs-7'}>
                            <input
                                className="form-check-input"
                                type="checkbox"
                                checked={allCheckedIndicator}
                                onChange={selectAllItems}
                            />
                        </td>
                        <td className={'fs-7'}><b>№ Бегунка</b></td>
                        <td className={'fs-7'}><b>Отдел</b></td>
                        <td className={'fs-7'}><b>Сумма</b></td>
                        <td className={'fs-7'}><b>Заказ</b></td>
                        <td className={'fs-7'}><b>Проект</b></td>
                        <td className={'fs-7'}><b>Исполнитель</b></td>
                        <td className={'fs-7'}><b>Статус</b></td>
                        <td className={'fs-7'}><b>Взят в работу</b></td>
                        <td className={'fs-7'}><b>Дата готовности</b></td>
                        <td className={'fs-7'}><b>Проверяющий</b></td>
                        <td className={'fs-7'}><b>Завизирован</b></td>
                    </tr>
                    </thead>

                    <tbody>

                    {isLoading ?
                        <>
                            <tr>
                                <td colSpan={12}><AppSkeleton/></td>
                            </tr>
                            <tr>
                                <td colSpan={12}><AppSkeleton/></td>
                            </tr>
                            <tr>
                                <td colSpan={12}><AppSkeleton/></td>
                            </tr>
                        </>
                        :
                        <>
                            {data?.assignments.map(assignment => (
                                <PostTarifficationRow
                                    disabled={isDisabled}
                                    proposedTariff={data.proposed_tariff.amount}
                                    key={assignment.id}
                                    assignment={assignment}
                                    onCheck={onCheckClb}
                                    checked={selectedIds.includes(assignment.id)}
                                />
                            ))}
                        </>
                    }
                    </tbody>
                </Table>


                <div className={'m-2'}>
                    Будет начислено: <b className={'text-danger'}>
                    {getSum}
                </b>
                    {getTotalCount}
                </div>
                <div className={'d-flex gap-2'}>
                    <Button
                        variant={'dark'}
                        disabled={needConfirm}
                        onClick={() => setNeedConfirm(true)}
                    >
                        Подтвердить тарификацию и начислить ЗП
                    </Button>

                    {needConfirm &&
                        <>
                            <Button
                                variant={'outline-dark'}
                                disabled={isDisabled}
                                onClick={confirmTariffClb}
                            >
                                Подтвердить
                            </Button>

                            <Button
                                variant={'outline-danger'}
                                onClick={() => setNeedConfirm(false)}
                            >
                                Отмена
                            </Button>
                        </>
                    }
                </div>
            </div>

        </DynamicComponent>
    )
        ;
};
