import React, {useMemo, useState} from "react";
import {Button, Table} from "react-bootstrap";

import {TariffPageCard} from "@pages/TariffPage";

import {AppInput, AppSlider} from "@shared/ui";
import {usePermission, useProductPictures} from "@shared/hooks";
import {getHumansDatetime} from "@shared/lib";

import {useSetTariffCard} from "../model/api";
import {APP_PERM} from "@shared/consts";

interface TarifficationProductProps {
    tariffCard: TariffPageCard
}


export const TarifficationProduct = (props: TarifficationProductProps) => {
    const {tariffCard} = props;

    const [proposedInput, setProposedInput] = useState<string>(
        String(tariffCard.production_step_tariff?.proposed_tariff) || ""
    );

    const billingPerm = usePermission(APP_PERM.TARIFFICATION_BILLING);
    const confirmPerm = usePermission(APP_PERM.TARIFFICATION_CONFIRM);

    const [postTariff, {isLoading}] = useSetTariffCard();

    const getDisabledProposedState = useMemo(() => {
        if (isLoading) {
            return true;
        }
        if (tariffCard.production_step_tariff) {
            if (proposedInput === String(tariffCard.production_step_tariff.proposed_tariff)) {
                return true;
            }
        }
        return false;
    }, [isLoading, proposedInput, tariffCard.production_step_tariff])

    const getDisabledConfirmState = useMemo(() => {
        if (isLoading) {
            return true;
        }
        if (tariffCard.production_step_tariff) {
            if (proposedInput === String(tariffCard.production_step_tariff.tariff)) {
                return true;
            }
        }
        return false;
    }, [isLoading, proposedInput, tariffCard.production_step_tariff])

    const productPictures = useProductPictures(tariffCard.product);


    const setTariffHandler = (action: 'confirm' | 'proposed') => {
        postTariff({
            action: action,
            product_id: tariffCard.product.id,
            department_id: tariffCard.department.id,
            tariff_sum: Number(proposedInput),
        })
    }

    return (

        <div className={'d-flex'}>
            <div className={'m-1 bg-light border border-1 rounded p-1'}>
                <AppSlider
                    images={productPictures.images}
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
                            {tariffCard.product.name}
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
                                        onClick={() => setTariffHandler('proposed')}
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
                                        onClick={() => setTariffHandler('confirm')}
                                        disabled={getDisabledConfirmState}
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
                            {tariffCard.production_step_tariff?.proposed_date &&
                                getHumansDatetime(tariffCard.production_step_tariff?.proposed_date)
                            } {`${tariffCard.production_step_tariff?.proposed_by?.first_name || ""} 
                    ${tariffCard.production_step_tariff?.proposed_by?.last_name || ""}`}
                        </td>
                    </tr>

                    <tr>
                        <td>Утвержденный тариф</td>
                        <td>
                            <AppInput
                                disabled
                                type={'number'}
                                style={{width: "100px"}}
                                value={tariffCard.production_step_tariff?.tariff || ""}
                            />
                        </td>
                    </tr>

                    <tr>
                        <td>Тариф утвердил:</td>
                        <td>
                            {tariffCard.production_step_tariff?.confirmation_date &&
                                getHumansDatetime(tariffCard.production_step_tariff?.confirmation_date)
                            } {`${tariffCard.production_step_tariff?.approved_by?.first_name || ""} 
                    ${tariffCard.production_step_tariff?.approved_by?.last_name || ""}`}
                        </td>
                    </tr>

                    </tbody>
                </Table>
            </div>
        </div>
    );
};
