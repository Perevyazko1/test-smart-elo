import React, {useState} from 'react';
import {Button} from "react-bootstrap";

import {EmployeePermissions, getEmployeeAuthData, getEmployeeHasPermissions} from "entities/Employee";
import {Slider} from "shared/ui/Slider/Slider";
import {AppInput} from "shared/ui/AppInput/AppInput";
import {useProductPictures} from "shared/lib/hooks/useProductPictures/useProductPictures";
import {useAppDispatch} from "shared/lib/hooks/useAppDispatch/useAppDispatch";
import {useAppSelector} from "shared/lib/hooks/useAppSelector/useAppSelector";
import {getHumansDatetime} from "shared/lib/getHumansDatetime/getHumansDatetime";
import {IndicatorWrapper} from "shared/ui/IndicatorWrapper/IndicatorWrapper";

import {TariffPageCard} from "../../model/types/types";
import {updateTariff} from "../../model/service/updateTariff";


interface TaxElementProps {
    card: TariffPageCard,
}


export const TariffElement = (props: TaxElementProps) => {
    const {
        card,
    } = props;

    const dispatch = useAppDispatch();
    const currentUser = useAppSelector(getEmployeeAuthData);
    const checkPermissions = useAppSelector(getEmployeeHasPermissions);

    const hasApprovedPermission = checkPermissions([
        EmployeePermissions.TARIFICATION_CONFIRM
    ])

    const hasProposedPermission = checkPermissions([
        EmployeePermissions.TARIFICATION_BILLING
    ])

    const [proposedInput, setProposedInput] = useState<number | "">(card.production_step_tariff?.proposed_tariff || "");

    const [showStory, setShowStory] = useState(false);
    const productPictures = useProductPictures(card.product);

    const proposedTariff = () => {
        if (proposedInput) {
            dispatch(updateTariff({
                tariffData: {
                    id: card.production_step_tariff?.id,

                    product_id: card.product.id,
                    department_id: card.department.id,

                    proposed_tariff: proposedInput,
                    proposed_by_id: currentUser?.id
                },
                productionStepId: card.id,
            }))
        }
    }

    const approvedTariff = () => {
        const getProposedById = () => {
            if (card.production_step_tariff?.proposed_tariff !== proposedInput) {
                return currentUser?.id;
            } else if (card.production_step_tariff?.proposed_by?.id) {
                return card.production_step_tariff?.proposed_by?.id;
            } else {
                return currentUser?.id;
            }
        }

        // Логика следующая: есть был предложен тариф, но в итоге его изменили и приняли - создается новая тарификация
        const getTariffDataId = () => {
            if (card.production_step_tariff?.proposed_tariff !== proposedInput && card.production_step_tariff) {
                return undefined;
            } else {
                return card.production_step_tariff?.id;
            }
        }

        if (proposedInput) {
            dispatch(updateTariff({
                tariffData: {
                    id: getTariffDataId(),

                    product_id: card.product.id,
                    department_id: card.department.id,

                    tariff: proposedInput,
                    proposed_tariff: proposedInput,
                    proposed_by_id: getProposedById(),
                    approved_by_id: currentUser?.id,
                },
                productionStepId: card.id,
            }))
        }
    }

    return (
        <>
            <tr>
                <td rowSpan={2}>
                    <IndicatorWrapper
                        indicator={'comment'}
                        className={'bg-danger'}
                        show={!card.production_step_tariff?.tariff}
                        right={'68px'}
                    >
                        <Slider
                            images={productPictures.images}
                            thumbnails={productPictures.thumbnails}
                            width={'70px'}
                            height={'70px'}
                        />
                    </IndicatorWrapper>
                </td>
                <td rowSpan={2}>
                    {card.product.name}
                </td>

                <td style={{background: card.department.color || ''}} rowSpan={2}>
                    <div className={'d-flex flex-column justify-content-between h-100 w-100'}>
                        {card.department.name}

                        <hr className={'m-1'}/>

                        <Button
                            size={'sm'}
                            variant={showStory ? 'warning' : 'secondary'}
                            onClick={() => setShowStory(!showStory)}
                        >
                            История
                        </Button>
                    </div>
                </td>
                <td className={'text-nowrap'}>
                    Утверд.{'->'}
                </td>
                <td>
                    <AppInput
                        // className={card.production_step_tariff?.tariff ? cls.bgSelected : ''}
                        inputSize={'sm'}
                        disabled
                        type={'number'}
                        style={{width: "100px"}}
                        defaultValue={card.production_step_tariff?.tariff || ""}
                    />
                </td>
                <td className={'fs-7'}>
                    {card.production_step_tariff?.confirmation_date &&
                        getHumansDatetime(card.production_step_tariff?.confirmation_date)
                    }
                </td>
                <td className={'text-nowrap fs-7'}>
                    {`${card.production_step_tariff?.approved_by?.first_name || ""} 
                    ${card.production_step_tariff?.approved_by?.last_name || ""}`}

                </td>
                <td>
                    <Button
                        size={'sm'}
                        variant={'success'}
                        onClick={approvedTariff}
                        disabled={!(
                            hasApprovedPermission
                            && proposedInput !== card.production_step_tariff?.tariff
                            && proposedInput
                        )}
                    >
                        Утвердить
                    </Button>
                </td>
            </tr>

            <tr>
                <td className={card.production_step_tariff?.tariff !== card.production_step_tariff?.proposed_tariff ?
                    'bg-danger bg-gradient fw-bold text-nowrap'
                    :
                    'text-nowrap'
                }>
                    Предл.{'->'}
                </td>
                <td>
                    <AppInput
                        inputSize={'sm'}
                        type={'number'}
                        style={{width: "100px"}}
                        value={proposedInput}
                        onChange={(e) => setProposedInput(Number(e.target.value) || "")}
                    />
                </td>
                <td className={'fs-7'}>
                    {card.production_step_tariff?.proposed_date &&
                        getHumansDatetime(card.production_step_tariff?.proposed_date)
                    }
                </td>
                <td className={'text-nowrap fs-7'}>
                    {`${card.production_step_tariff?.proposed_by?.first_name || ""} 
                    ${card.production_step_tariff?.proposed_by?.last_name || ""}`}
                </td>
                <td>
                    <Button
                        size={'sm'}
                        variant={'warning'}
                        onClick={proposedTariff}
                        disabled={!(
                            hasProposedPermission
                            && proposedInput !== card.production_step_tariff?.proposed_tariff
                            && proposedInput
                        )}
                    >
                        Предложить
                    </Button>
                </td>
            </tr>

            {showStory &&
                <tr>
                    <td colSpan={3}>
                        <h5 className={'my-3 ms-2'}>История тарификаций в разработке</h5>
                        {/*<p>08.08.2023 - Назначение тарифа №1 </p>*/}
                        {/*<p>08.08.2023 - Назначение тарифа №1 </p>*/}
                        {/*<p>08.08.2023 - Назначение тарифа №1 </p>*/}
                        {/*<p>08.08.2023 - Назначение тарифа №1 </p>*/}
                    </td>
                    <td colSpan={5}>
                        {/*<p>Харченко Д. Тариф: 500. Предложил Великий Д.</p>*/}
                        {/*<p>Харченко Д. Тариф: 500. Предложил Великий Д.</p>*/}
                        {/*<p>Харченко Д. Тариф: 500. Предложил Великий Д.</p>*/}
                        {/*<p>Харченко Д. Тариф: 500. Предложил Великий Д.</p>*/}
                    </td>
                </tr>
            }
        </>
    );
};
