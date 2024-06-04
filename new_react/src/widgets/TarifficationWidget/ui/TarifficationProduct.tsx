import React, {useMemo, useState} from "react";
import {Button, Table} from "react-bootstrap";


import {AppInput, AppSlider} from "@shared/ui";
import {usePermission} from "@shared/hooks";
import {getEmployeeName, getHumansDatetime} from "@shared/lib";

import {APP_PERM} from "@shared/consts";
import {useSetConfirmedTariff, useSetProposedTariff} from "@widgets/TarifficationWidget/model/api";
import {PageListItem} from "@pages/TarifficationPage";
import {Link} from "react-router-dom";

interface TarifficationProductProps {
    tariffCard: PageListItem;
}


export const TarifficationProduct = (props: TarifficationProductProps) => {
    const {tariffCard} = props;

    const [proposedInput, setProposedInput] = useState<string>(
        String(tariffCard.proposed_tariff?.amount) || ""
    );

    const billingPerm = usePermission(APP_PERM.TARIFFICATION_BILLING);
    const confirmPerm = usePermission(APP_PERM.TARIFFICATION_CONFIRM);

    const [proposedTariff, {isLoading: proposedIsLoading}] = useSetProposedTariff();
    const [confirmTariff, {isLoading: confirmIsLoading}] = useSetConfirmedTariff();

    const getDisabledProposedState = useMemo(() => {
        if (proposedIsLoading || confirmIsLoading) {
            return true;
        }
        if (tariffCard.proposed_tariff) {
            if (proposedInput === String(tariffCard.proposed_tariff.amount)) {
                return true;
            }
        }
        return false;
    }, [confirmIsLoading, proposedInput, proposedIsLoading, tariffCard.proposed_tariff])

    const getDisabledConfirmState = useMemo(() => {
        if (proposedIsLoading || confirmIsLoading) {
            return true;
        }
        if (tariffCard.has_assignments) {
            return true;
        }
        if (!tariffCard.proposed_tariff) {
            return true;
        }
        if (tariffCard.proposed_tariff.amount === tariffCard.confirmed_tariff?.amount) {
            return true;
        }
        if (tariffCard.confirmed_tariff) {
            if (proposedInput === String(tariffCard.confirmed_tariff.amount)) {
                return true;
            }
        }
        return false;
    }, [confirmIsLoading, proposedInput, proposedIsLoading, tariffCard.confirmed_tariff, tariffCard.has_assignments, tariffCard.proposed_tariff])


    const setProposedTariff = () => {
        proposedTariff({
            production_step__id: tariffCard.id,
            amount: Number(proposedInput),
        })
    }

    const setConfirmedTariff = () => {
        if (tariffCard.proposed_tariff) {
            confirmTariff({
                production_step__id: tariffCard.id,
                tariff__id: tariffCard.proposed_tariff.id
            })
        }
    }

    return (

        <div className={'d-flex'}>
            <div className={'m-1 bg-light border border-1 rounded p-1'}>
                <AppSlider
                    images={tariffCard.product_images.images}
                    width={'150px'}
                    height={'150px'}
                />
            </div>

            <div className={'m-1 bg-light border border-1 rounded p-1'}>
                <Table data-bs-theme={'light'} striped bordered hover size="sm" className={'fs-7'}>
                    <tbody>
                    <tr>
                        <td>Изделие</td>
                        <td>
                            {tariffCard.product_name}
                        </td>
                    </tr>

                    <tr>
                        <td>Отдел</td>
                        <td className={'fw-bold text-uppercase'}>{tariffCard.department.name}</td>
                    </tr>

                    <tr>
                        <td>Предложенный тариф</td>
                        <td>
                            <div className={'d-flex gap-2'}>
                                <AppInput
                                    type={'number'}
                                    style={{width: "100px"}}
                                    value={proposedInput}
                                    onChange={(e) => setProposedInput(e.target.value || "")}
                                />

                                {billingPerm &&
                                    <Button
                                        size={'sm'}
                                        variant={'secondary'}
                                        className={'fs-7 p-1'}
                                        onClick={setProposedTariff}
                                        disabled={getDisabledProposedState}
                                    >
                                        Предложить
                                    </Button>
                                }

                                {confirmPerm &&
                                    <Button
                                        size={'sm'}
                                        variant={'success'}
                                        className={'fs-7 p-1'}
                                        disabled={getDisabledConfirmState}
                                        onClick={setConfirmedTariff}
                                    >
                                        Утвердить
                                    </Button>
                                }
                            </div>

                        </td>
                    </tr>

                    <tr>
                        <td>Тариф предложил:</td>
                        <td>
                            {tariffCard.proposed_tariff?.add_date &&
                                getHumansDatetime(tariffCard.proposed_tariff?.add_date)
                            } {getEmployeeName(tariffCard.proposed_tariff?.created_by)}
                        </td>
                    </tr>

                    <tr>
                        <td>Утвержденный тариф</td>
                        <td>
                            <AppInput
                                disabled
                                type={'number'}
                                style={{width: "100px"}}
                                value={tariffCard.confirmed_tariff?.amount || ""}
                            />
                        </td>
                    </tr>

                    <tr>
                        <td>Тариф утвердил:</td>
                        {tariffCard.has_assignments ?
                            <td>
                                ❗По изделию имеются завизированные наряды без тарифа. Закрыть такие наряды можно
                                через страницу Cделка.
                                {confirmPerm &&
                                    <Link
                                        className={'fw-bold text-info text-uppercase ms-1 rounded border border-1 border-secondary p-1'}
                                        to={`/tariffication?product__name=${tariffCard.product_name}&department__name=${tariffCard.department.name}`}
                                    >
                                        Перейти.
                                    </Link>
                                }
                            </td>
                            :
                            <td>
                                {tariffCard.confirmed_tariff?.add_date &&
                                    getHumansDatetime(tariffCard.confirmed_tariff?.add_date)
                                } {getEmployeeName(tariffCard.confirmed_tariff?.created_by)}
                            </td>
                        }
                    </tr>

                    </tbody>
                </Table>
            </div>
        </div>
    );
};
