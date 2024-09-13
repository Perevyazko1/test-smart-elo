import React, {useMemo, useState} from "react";
import {Button, Table} from "react-bootstrap";

import {PageListItem} from "@pages/TarifficationPage";
import {PostTarifficationWidget} from "@widgets/PostTarifficationWidget";
import {useSetConfirmedTariff, useSetProposedTariff} from "@widgets/TarifficationWidget/model/api";
import {AppInput, AppSlider} from "@shared/ui";
import {useAppModal, usePermission} from "@shared/hooks";
import {getEmployeeName, getHumansDatetime} from "@shared/lib";
import {APP_PERM} from "@shared/consts";

interface TarifficationProductProps {
    tariffCard: PageListItem;
}


export const TarifficationProduct = (props: TarifficationProductProps) => {
    const {tariffCard} = props;

    const {handleOpen, handleClose} = useAppModal();

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
    }, [
        confirmIsLoading,
        proposedInput,
        proposedIsLoading,
        tariffCard.confirmed_tariff,
        tariffCard.proposed_tariff
    ]);


    const setProposedTariff = () => {
        proposedTariff({
            production_step__id: tariffCard.id,
            amount: Number(proposedInput),
        })
    }

    const setConfirmedTariff = () => {
        if (tariffCard.has_assignments) {
            handleOpen(
                <PostTarifficationWidget
                    production_step__id={tariffCard.id}
                    onSuccess={() => {
                        handleClose();
                    }}
                />
            )
        } else if (tariffCard.proposed_tariff) {
            if (tariffCard.confirmed_tariff) {
                const confirmText = 'Внимание❗ При установлении нового тарифа все установленные ставки ' +
                    'соисполнителей нарядов в рамках данного изделия БЕЗ ВИЗЫ будут обнулены. Продолжить?';
                if (window.confirm(confirmText)) {
                    confirmTariff({
                        production_step__id: tariffCard.id,
                        tariff__id: tariffCard.proposed_tariff.id
                    });
                }
            } else {
                confirmTariff({
                    production_step__id: tariffCard.id,
                    tariff__id: tariffCard.proposed_tariff.id
                });
            }
        }
    };

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
                            <td> ❗По изделию имеются завизированные наряды без тарифа. </td>
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
