import {PageListItem} from "../../model/types";
import {AppInput, AppSlider} from "@shared/ui";
import {useAppDispatch, useAppModal, useAppSelector, useEmployeeName, usePermission} from "@shared/hooks";
import {getHumansDatetime} from "@shared/lib";
import {Button, Spinner} from "react-bootstrap";
import React, {useMemo, useState} from "react";
import {fetchSetProposedTariff} from "@pages/TarifficationPage/model/service/fetchSetProposedTariff";
import {tarifficationPageActions} from "@pages/TarifficationPage/model/slice";
import {PostTarifficationWidget} from "@widgets/PostTarifficationWidget";
import {fetchSetConfirmedTariff} from "@pages/TarifficationPage/model/service/fetchSetConfirmendTariff";
import {getNoRelevantIds} from "@pages/TarifficationPage/model/selectors";
import {TarifficationStoryWidget} from "@widgets/TarifficationStoryWidget";
import {OrderDetailWidget} from "@widgets/OrderDetailWidget";
import {APP_PERM} from "@shared/consts";


interface TableElementProps {
    item: PageListItem;
}

export const TableElement = (props: TableElementProps) => {
    const {item} = props;
    const dispatch = useAppDispatch();
    const noRelevantIds = useAppSelector(getNoRelevantIds);

    const {getNameById} = useEmployeeName();

    const [isLoading, setIsLoading] = useState(false);
    const [tariffInput, setTariffInput] = useState<number | "">(item.proposed_tariff?.amount || "");

    const billingPerm = usePermission(APP_PERM.TARIFFICATION_BILLING);
    const confirmPerm = usePermission(APP_PERM.TARIFFICATION_CONFIRM);

    const {handleOpen, handleClose} = useAppModal();

    const setProposedTariffHandler = () => {
        if (tariffInput !== "") {
            setIsLoading(true);
            dispatch(fetchSetProposedTariff({
                production_step__id: item.id,
                amount: tariffInput,
            })).then(() => {
                dispatch(tarifficationPageActions.addNoRelevantId(item.id));
            });
            setIsLoading(false);
        }
    }

    const setConfirmedTariff = () => {
        if (item.has_assignments) {
            handleOpen(
                <PostTarifficationWidget
                    production_step__id={item.id}
                    onSuccess={() => {
                        handleClose();
                        dispatch(tarifficationPageActions.addNoRelevantId(item.id));
                    }}
                />
            )
        } else if (item.proposed_tariff) {
            setIsLoading(true);

            dispatch(fetchSetConfirmedTariff({
                production_step__id: item.id,
                tariff__id: item.proposed_tariff.id
            })).then(() => {
                dispatch(tarifficationPageActions.addNoRelevantId(item.id));
            });

            setIsLoading(false);
        } else {
            alert("Требуется установить предложенный тариф. ");
        }
    };

    const elementIsLoading = useMemo(() => {
        return isLoading || noRelevantIds?.includes(item.id);
    }, [isLoading, item.id, noRelevantIds]);

    const setTariffClb = (value: string) => {
        if (value === "") {
            setTariffInput("");
        } else {
            setTariffInput(Number(value));
        }
    };

    const proposedIsBlocked = useMemo(() => {
        return !billingPerm
            || item.proposed_tariff?.amount === tariffInput
            || tariffInput === "";
    }, [billingPerm, item.proposed_tariff?.amount, tariffInput])

    const confirmIsBlocked = useMemo(() => {
        return !confirmPerm
            || !item.proposed_tariff?.amount
            || item.proposed_tariff?.amount === item.confirmed_tariff?.amount
    }, [confirmPerm, item.confirmed_tariff?.amount, item.proposed_tariff?.amount]);

    const orderLink = useMemo(() => {
        if (item.last_order_id !== null) {
            return (
                <Button
                    size={'sm'}
                    className={'fs-7 p-0 px-1 m-1'}
                    variant={'outline-dark'}
                    onClick={() => handleOpen(
                        <OrderDetailWidget
                            order_id={item.last_order_id as number}
                        />
                    )}
                >
                    Последняя спецификация
                </Button>
            )
        }
        return ("");
    }, [handleOpen, item.last_order_id])


    return (
        <>
            {/*Первая строка карточки*/}
            <tr>
                <td rowSpan={2} onClick={() => handleOpen(
                    <AppSlider images={item.product_images.images} width={'100%'} height={'100%'}/>
                )}>
                    <AppSlider
                        images={item.product_images.thumbnail}
                        width={'70px'}
                        height={'70px'}
                    />
                </td>

                <td rowSpan={2}>
                    {item.product_name}
                    {orderLink}
                </td>

                <td>
                    {item.department.name}
                </td>

                <td>
                    <div className={'text-nowrap fs-7'}>
                        Предложено
                        {elementIsLoading
                            ? <Spinner size={'sm'} className={'px-1'} animation={'grow'}/>
                            :
                            <i className={`fas fa-arrow-circle-right px-1 ${!proposedIsBlocked && 'text-success'}`}/>
                        }
                    </div>
                </td>

                <td>
                    <AppInput
                        type={'number'}
                        style={{width: "100px"}}
                        value={tariffInput}
                        onChange={(e) => setTariffClb(e.target.value)}
                    />
                </td>

                <td className={'fs-7'}>
                    {getHumansDatetime(item.proposed_tariff?.add_date || "")}
                </td>


                <td className={'fs-7'}>
                    {getNameById(item.proposed_tariff?.created_by, 'nameLastName')}
                </td>

                <td>
                    <Button
                        size={'sm'}
                        variant={proposedIsBlocked ? 'outline-warning' : 'warning'}
                        onClick={setProposedTariffHandler}
                        disabled={isLoading || proposedIsBlocked}
                    >
                        Предложить
                    </Button>
                </td>

            </tr>

            {/*Вторая строка карточки*/}
            <tr>
                <td>
                    <Button
                        size={'sm'}
                        variant={'outline-dark'}
                        disabled={!item.proposed_tariff}
                        onClick={() =>
                            handleOpen(
                                <TarifficationStoryWidget production_step__id={item.id}/>
                            )
                        }
                    >
                        История
                    </Button>
                </td>
                <td>
                    <div className={'text-nowrap fs-7'}>
                        Утверждено
                        {elementIsLoading
                            ? <Spinner size={'sm'} className={'px-1'} animation={'grow'}/>
                            :
                            <i className={`fas fa-arrow-circle-right px-1 ${!confirmIsBlocked && 'text-danger'}`}/>
                        }
                    </div>
                </td>

                <td>
                    <AppInput
                        disabled
                        type={'number'}
                        style={{width: "100px"}}
                        value={item.confirmed_tariff?.amount || ""}
                    />
                </td>

                <td className={'fs-7'}>
                    {getHumansDatetime(item.confirmed_tariff?.add_date || "")}
                </td>

                <td className={'fs-7'}>
                    {getNameById(item.confirmed_tariff?.created_by, 'nameLastName')}
                </td>

                <td>
                    <Button
                        size={'sm'}
                        variant={confirmIsBlocked ? 'outline-dark' : 'dark'}
                        disabled={confirmIsBlocked}
                        onClick={setConfirmedTariff}
                    >
                        Утвердить
                    </Button>
                </td>
            </tr>
        </>
    );
};
