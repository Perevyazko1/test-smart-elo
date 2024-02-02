import {TariffPageCard} from "../model/types/types";
import {useAppDispatch, useAppModal, useCurrentUser, usePermission, useProductPictures} from "@shared/hooks";
import {APP_PERM} from "@shared/consts";
import {useState} from "react";
import {updateTariff} from "../model/service/updateTariff";
import {AppInput, AppSlider, IndicatorWrapper} from "@shared/ui";
import {Button, ButtonGroup} from "react-bootstrap";
import {getHumansDatetime} from "@shared/lib";
import {RetarifficationWidget} from "@pages/TariffPage/ui/RetarifficationWidget";

interface TariffElementProps {
    card: TariffPageCard,
}


export const TariffElement = (props: TariffElementProps) => {
    const {card} = props;

    const dispatch = useAppDispatch();
    const {currentUser} = useCurrentUser();
    const {openModal} = useAppModal();

    const hasApprovedPermission = usePermission(APP_PERM.TARIFFICATION_CONFIRM);
    const hasProposedPermission = usePermission(APP_PERM.TARIFFICATION_BILLING);

    const [proposedInput, setProposedInput] = useState<number | "">(
        card.production_step_tariff?.proposed_tariff || ""
    );

    const [showStory, setShowStory] = useState(false);

    const productPictures = useProductPictures(card.product);

    const showAssignmentsClb = () => {
        openModal(
            <RetarifficationWidget card={card}/>
        )
    }

    // Функционал предложить тариф
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

    // Функционал утвердить тариф
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

        // Логика следующая: если был предложен тариф, но в итоге его изменили и приняли - создается новая тарификация
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
                        color={' bg-danger'}
                        show={!card.production_step_tariff?.tariff}
                        right={'68px'}
                    >
                        <AppSlider
                            images={productPictures.images}
                            width={'70px'}
                            height={'70px'}
                        />
                    </IndicatorWrapper>
                </td>
                <td rowSpan={2}>
                    {card.product.name}
                </td>

                <td style={{background: card.department.color || ''}} rowSpan={2} className={'fs-7'}>
                    <div className={'d-flex flex-column justify-content-between h-100 w-100'}>
                        {card.department.name}

                        <hr className={'m-1'}/>
                        <ButtonGroup vertical>
                            <Button
                                size={'sm'}
                                variant={showStory ? 'primary' : 'outline-dark'}
                                onClick={() => setShowStory(!showStory)}
                            >
                                История
                            </Button>
                            {!!card.production_step_tariff?.tariff && hasApprovedPermission &&
                                <Button
                                    size={'sm'}
                                    variant={'outline-dark'}
                                    onClick={showAssignmentsClb}
                                >
                                    Хвосты
                                </Button>
                            }
                        </ButtonGroup>
                    </div>
                </td>
                <td className={'text-nowrap'}>
                    Утверд.{'->'}
                </td>
                <td>
                    <AppInput
                        disabled
                        type={'number'}
                        style={{width: "100px"}}
                        value={card.production_step_tariff?.tariff || ""}
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
                <>
                    <tr>
                        <td colSpan={3}>
                            <h6 className={'my-5 ms-2'}>История тарификаций в разработке</h6>
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

                </>
            }
        </>
    );
};
