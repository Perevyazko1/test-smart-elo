import React, {HTMLAttributes, memo, useCallback, useEffect, useMemo, useState} from "react";

import {eqPageActions} from "@pages/EqPage";
import {EqOrderProduct, ListTypes} from "@widgets/EqCardList";

import {useAppDispatch, useAppModal, useAppQuery, useCurrentUser, usePermission} from "@shared/hooks";
import {APP_PERM} from "@shared/consts";

import {createEqNumberLists} from "../model/lib/createEqNumberLists";
import {Actions, fetchEqUpdCard} from "../model/api/fetchEqUpdCard";

import {EqCardBtn} from "./ui/EqCardBtn";
import {EqCardBody} from "./ui/EqCardBody";
import {CardSlider} from "./ui/CardSlider";
import {CardCounter} from "./ui/CardCounter";
import {CardNameNumbers} from "./ui/CardNameNumbers";
import {CardOrderProject} from "./ui/CardOrderProject";
import {CardDepartmentInfo} from "./ui/CardDepartmentInfo";

interface EqInWorkCardProps extends HTMLAttributes<HTMLDivElement> {
    noRelevant?: boolean;
    card: EqOrderProduct;
    expanded: boolean;
    listType: ListTypes;
}

export const EqCard = memo((props: EqInWorkCardProps) => {
    const {card, expanded, listType, noRelevant, ...otherProps} = props;
    const dispatch = useAppDispatch();

    const {handleOpen} = useAppModal();
    const {currentUser} = useCurrentUser();
    const {queryParameters} = useAppQuery();
    const isViewer = usePermission(APP_PERM.ELO_VIEW_ONLY);
    const isBoss = usePermission(APP_PERM.ELO_BOSS_VIEW_MODE);

    const [cardDisabled, setCardDisabled] = useState(false);

    const getAction = useMemo(() => (first: boolean) => {
        if (listType === 'in_work') {
            return first ?
                expanded ? Actions.IN_WORK_TO_IN_WORK_DISTRIBUTE : Actions.IN_WORK_TO_READY :
                Actions.IN_WORK_TO_AWAIT;
        } else if (listType === 'distribute') {
            return Actions.IN_WORK_TO_AWAIT_DISTRIBUTE;
        } else if (listType === 'await') {
            return Actions.AWAIT_TO_IN_WORK;
        } else if (listType === 'ready') {
            return first ? Actions.CONFIRMED : Actions.READY_TO_IN_WORK;
        }
    }, [listType, expanded]);

    const [assignmentsLists, setAssignmentsLists] = useState(createEqNumberLists(card.assignments, Number(queryParameters.series_size) || 1));

    const bossPerm = usePermission(APP_PERM.ELO_BOSS_VIEW_MODE);

    useEffect(() => {
        setAssignmentsLists(createEqNumberLists(card.assignments, Number(queryParameters.series_size) || 1));
    }, [card.assignments, queryParameters.series_size]);

    const getTargetNumbers = useCallback((first: boolean) => {
        if (listType === "await"
            || (listType === "in_work" && !expanded && !first)
            || (listType === "in_work" && expanded)
            || (listType === "distribute")
        ) {
            return [...assignmentsLists.primary, ...assignmentsLists.selectedLocked];
        } else {
            return assignmentsLists.primary;
        }
    }, [assignmentsLists.primary, assignmentsLists.selectedLocked, expanded, listType]);

    const hideFirstBtn = useMemo(() => {
            if (isViewer) return true;
            if (listType === 'await' && card.assignments.length === 0) return true;
            if (listType === 'distribute') return true;
            if (listType === 'ready' && (!isBoss || assignmentsLists.primary.length === 0)) return true;
            if (listType === 'ready' && !card.product.technological_process) return true;
            return false;
        },
        [
            assignmentsLists.primary.length,
            card.assignments.length,
            card.product.technological_process,
            isBoss,
            isViewer,
            listType
        ]
    );

    const hideSecondBtn = useMemo(() => {
        if (isViewer) return true;
        if (listType === 'ready' && assignmentsLists.primary.length === 0) return true;
        return false;
    }, [assignmentsLists.primary.length, isViewer, listType]);

    const firstBtnIsLocked = useMemo(() => {
        if (listType === 'in_work' &&
            !expanded &&
            assignmentsLists.primary.length === 0
        ) {
            return true;
        }
        return false;
    }, [assignmentsLists.primary.length, expanded, listType])

    const returnLocked = useMemo(() => {
        if (listType !== "in_work" || bossPerm) {
            return false;
        }
        const bossAssignments = card.assignments.filter(assignment => assignment.appointed_by_boss);
        const primaryExists = bossAssignments.some(
            assignment => assignmentsLists.primary.includes(assignment.number));
        const lockedExists = bossAssignments.some(
            assignment => assignmentsLists.selectedLocked.includes(assignment.number));
        return lockedExists || primaryExists;
    }, [assignmentsLists.primary, assignmentsLists.selectedLocked, bossPerm, card.assignments, listType]);

    const getBtnClb = useCallback((first: boolean) => {
        if (!currentUser.current_department) {
            return;
        }
        if (getAction(first) === 'in_work_to_await' && returnLocked) {
            handleOpen(
                <h4 className={'mx-4'}>
                    Один или несколько выбранных нарядов назначены бригадиром. <br/>
                    Вернуть в ожидание такие наряды может только бригадир.
                </h4>
            );
        } else if (getAction(first) === 'in_work_to_ready' && assignmentsLists.primary.length === 0) {
            handleOpen(
                <h4 className={'mx-4'}>
                    Выбранный наряд не может быть отмечен готовым по причине:
                    <br/>
                    <br/>
                    Наряды не укомплектованы полуфабрикатами из предыдущих отделов.
                    <br/>
                    Дождитесь готовности изделия в предыдущих отделах.
                </h4>
            )
        } else {
            setCardDisabled(true);
            dispatch(fetchEqUpdCard({
                op_id: card.id,
                department_id: currentUser.current_department.id,
                numbers: getTargetNumbers(first),
                action: getAction(first),
                ...queryParameters,
            })).then(() => {
                dispatch(eqPageActions.addNotRelevantId(card.id));
                setCardDisabled(false);
            });
        }

    }, [
        assignmentsLists.primary.length,
        card.id,
        currentUser.current_department,
        dispatch,
        getAction,
        getTargetNumbers,
        handleOpen,
        queryParameters,
        returnLocked
    ]);

    const getPlaneDate = useCallback((first: boolean) => {
        const targetDate = () => {
            if (card.plane_date) {
                return card.plane_date;
            } else if (card.order.planned_date) {
                return card.order.planned_date;
            }
        }
        if (listType === 'await' && first) {
            return targetDate();
        } else if (listType === 'in_work' && !expanded && !first) {
            return targetDate();
        } else if (listType === 'in_work' && expanded && first) {
            return targetDate();
        } else if (listType === 'distribute' && !first) {
            return targetDate();
        } else {
            return;
        }
    }, [card.order.planned_date, card.plane_date, expanded, listType])


    return (
        <EqCardBody card={card} {...otherProps}>
            {!hideFirstBtn &&
                <EqCardBtn
                    plane_date={getPlaneDate(true)}
                    expanded={expanded}
                    style={{minWidth: '39px', maxWidth: '39px'}}
                    cardType={listType}
                    first={true}
                    urgency={card.urgency}
                    onClick={() => getBtnClb(true)}
                    disabled={cardDisabled || noRelevant}
                    locked={firstBtnIsLocked}
                />
            }

            <CardSlider card={card}/>

            <CardCounter card={card}/>

            <CardNameNumbers
                card={card}
                assignmentsLists={assignmentsLists}
                setAssignmentsLists={setAssignmentsLists}
            />

            <CardOrderProject card={card}/>

            <CardDepartmentInfo card={card}/>

            {!hideSecondBtn &&
                <EqCardBtn
                    style={{minWidth: '39px', maxWidth: '39px'}}
                    plane_date={getPlaneDate(false)}
                    cardType={listType}
                    expanded={expanded}
                    first={false}
                    urgency={card.urgency}
                    onClick={() => getBtnClb(false)}
                    disabled={cardDisabled || noRelevant}
                    locked={returnLocked}
                />
            }
        </EqCardBody>
    );
});
