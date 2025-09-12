import {Button} from "react-bootstrap";

import {useAppModal, useAppQuery, useCurrentUser, usePermission} from "@shared/hooks";
import {EqOrderProduct, ListTypes} from "@widgets/EqCardList";
import {TarifficationWidget} from "@widgets/TarifficationWidget";
import {EqAssignment} from "@widgets/EqCardList/model/types";

import cls from "./EqCard.module.scss";

import {EqNumberListTipe} from "../../model/lib/createEqNumberLists";
import {setTargetNumber} from "../../model/lib/setTargetNumber";

import {EqNumbers} from "./EqNumbers";
import {APP_PERM} from "@shared/consts";
import {useMemo} from "react";


interface CardNameNumbersProps {
    targetUserId: number | undefined;
    card: EqOrderProduct;
    assignmentsLists: EqNumberListTipe;
    setAssignmentsLists: (props: EqNumberListTipe) => void;
    listType: ListTypes;
}

export const CardNameNumbers = (props: CardNameNumbersProps) => {
    const {card, targetUserId, listType, assignmentsLists, setAssignmentsLists} = props;
    const {handleOpen} = useAppModal();

    const {queryParameters, setQueryParam} = useAppQuery();
    const {currentUser} = useCurrentUser();
    const bossPerm = usePermission(APP_PERM.ELO_BOSS_VIEW_MODE);
    const kpiPlan = usePermission(APP_PERM.KPI_PAGE);

    const showAmount = useMemo(() => {
        return currentUser.current_department?.piecework_wages && bossPerm;
    }, [bossPerm, currentUser.current_department?.piecework_wages]);

    const showPrice = useMemo(() => {
        const localValue = localStorage.getItem(`${listType}ShowSum`)
        return kpiPlan && !!localValue;
        //eslint-disable-next-line
    }, [kpiPlan, listType, queryParameters.sortUpdated]);


    const setNumber = (assignment: EqAssignment) => {
        setAssignmentsLists(setTargetNumber({
                ...assignmentsLists,
                value: assignment
            })
        );
        setQueryParam('series_size', '');
    }

    const openTarifficationWidget = () => {
        handleOpen(
            <TarifficationWidget
                production_step__id={card.card_info.production_step__id}
            />
        )
    }

    return (
        <div className={cls.nameNumberBlock + ' bg-light rounded'}>
            <div className={cls.productName}>
                {card.card_info.further_packaging && "📦"}
                {showAmount &&
                    <Button
                        size={"sm"}
                        className={'p-0 px-1 me-1 fs-7'}
                        variant={
                            card.card_info.tariff !== null
                                ? 'outline-dark'
                                : card.card_info.proposed_tariff !== null
                                    ? 'outline-warning'
                                    : 'outline-danger'
                        }
                        style={{marginTop: '0.15rem'}}
                        onClick={openTarifficationWidget}
                    >
                        Сделка
                    </Button>
                }
                {card.product.name}
            </div>

            <hr className={'m-0 p-0'}/>

            <div className={cls.numbersBlock}>
                <div className={' fw-bold '} style={{fontSize: '12px', lineHeight: '1.1em'}}>
                    <div>
                        <div>
                            {card.assignments.length}
                            {showPrice && (
                                <sub> {Math.round(card.price).toLocaleString('ru-RU')}</sub>
                            )}
                        </div>

                    </div>
                    {listType === "ready" && (
                        <div>
                            <div>({assignmentsLists.primary.length + assignmentsLists.secondary.length + assignmentsLists.lockedNums.length})</div>
                        </div>
                    )}
                </div>
                :
                <EqNumbers
                    targetUserId={targetUserId}
                    assignmentsLists={assignmentsLists}
                    setNumber={setNumber}
                />
            </div>
        </div>
    );
};
