import React, {HTMLAttributes, memo, useEffect, useMemo, useState} from "react";

import {useAppDispatch, useAppModal, useAppQuery, useCurrentUser, usePermission} from "@shared/hooks";
import {APP_PERM} from "@shared/consts";

import {createEqNumberLists} from "../../model/lib/createEqNumberLists";
import {Actions, fetchEqUpdCard} from "../../model/api/fetchEqUpdCard";

import {EqCardBtn} from "./ui/EqCardBtn";
import {EqCardBody} from "./ui/EqCardBody";
import {CardSlider} from "./ui/CardSlider";
import {CardCounter} from "./ui/CardCounter";
import {CardNameNumbers} from "./ui/CardNameNumbers";
import {CardOrderProject} from "./ui/CardOrderProject";
import {CardDepartmentInfo} from "./ui/CardDepartmentInfo";
import {EqOrderProduct} from "@pages/EqPage/model/types";

interface EqInWorkCardProps extends HTMLAttributes<HTMLDivElement> {
    card: EqOrderProduct;
}

// Карточка блока ожидания
export const EqInWorkCard = memo((props: EqInWorkCardProps) => {
    const {card, ...otherProps} = props;
    const dispatch = useAppDispatch();

    // Поднимаем хук для вызова модалки с контентом
    const {openModal} = useAppModal();
    const {currentUser} = useCurrentUser();
    const {queryParameters} = useAppQuery();
    const isViewer = usePermission(APP_PERM.ELO_VIEW_ONLY);

    const [cardDisabled, setCardDisabled] = useState(false);

    const getAction = (first: boolean) => {
        return first ? Actions.IN_WORK_TO_READY : Actions.IN_WORK_TO_AWAIT
    }

    const [
        assignmentsLists,
        setAssignmentsLists
    ] = useState(createEqNumberLists(card.assignments, Number(queryParameters.series_size) || 1));

    const bossPerm = usePermission(APP_PERM.ELO_BOSS_VIEW_MODE)

    const returnLocked = useMemo(() => {
        if (bossPerm) {
            return false;
        }
        const bossAssignments = card.assignments.filter(assignment => assignment.appointed_by_boss)
        return bossAssignments.some(assignment => {
            return assignmentsLists.primary.includes(assignment.number)
        })
    }, [assignmentsLists.primary, bossPerm, card.assignments])

    useEffect(() => {
        setAssignmentsLists(createEqNumberLists(card.assignments, Number(queryParameters.series_size) || 1))
    }, [card.assignments, queryParameters.series_size])

    const getBtnClb = (first: boolean) => {
        if (!currentUser.current_department) {
            return;
        }
        if (returnLocked && !first) {
            openModal(
                {
                    content: (
                        <h4 className={'mx-4'}>
                            Один или несколько выбранных нарядов назначены бригадиром. <br/>
                            Вернуть в ожидание такие наряды может только бригадир.
                        </h4>
                    )
                }
            )
        } else if (first && assignmentsLists.primary.length === 0) {
            openModal(
                {
                    content: (
                        <h4 className={'mx-4'}>
                            Выбранный наряд не может быть отмечен готовым по причине:
                            <br/>
                            <br/>
                            Наряды не укомплектованы полуфабрикатами из предыдущих отделов.
                            <br/>
                            Дождитесь готовности изделия в предыдущем отделе.
                        </h4>
                    )
                }
            )
        } else {
            setCardDisabled(true)
            dispatch(fetchEqUpdCard({
                series_id: card.series_id,
                department_id: currentUser.current_department.id,
                numbers: first
                    ? assignmentsLists.primary
                    : [...assignmentsLists.primary, ...assignmentsLists.selectedLocked],
                action: getAction(first),
                ...queryParameters,
            })).then(() => {
                setCardDisabled(false);
            })
        }
    };

    return (
        <EqCardBody card={card} {...otherProps}>
            {!isViewer &&
                <EqCardBtn
                    plane_date={card.plane_date}
                    style={{minWidth: '39px', maxWidth: '39px'}}
                    cardType={"in_work"}
                    first={true}
                    urgency={card.urgency}
                    onClick={() => getBtnClb(true)}
                    disabled={cardDisabled}
                    locked={assignmentsLists.primary.length === 0}
                />
            }

            {/*slider*/}
            <CardSlider card={card}/>

            {/*counts*/}
            <CardCounter card={card}/>

            {/*Имя и номера бегунков*/}
            <CardNameNumbers
                card={card}
                assignmentsLists={assignmentsLists}
                setAssignmentsLists={setAssignmentsLists}
            />

            {/*Заказ-Проект блок*/}
            <CardOrderProject card={card}/>

            {/*Отделы инфо блок*/}
            <CardDepartmentInfo card={card}/>

            {!isViewer &&
                <EqCardBtn
                    style={{minWidth: '39px', maxWidth: '39px'}}
                    cardType={"in_work"}
                    first={false}
                    urgency={card.urgency}
                    onClick={() => getBtnClb(false)}
                    disabled={cardDisabled}
                    locked={returnLocked}
                />
            }
        </EqCardBody>
    );
});
