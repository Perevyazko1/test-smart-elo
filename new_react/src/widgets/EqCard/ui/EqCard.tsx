import React, {HTMLAttributes, memo, useCallback, useEffect, useMemo, useState} from "react";

import {eqPageActions} from "@pages/EqPage";
import {EqOrderProduct, ListTypes} from "@widgets/EqCardList";

import {useAppDispatch, useAppModal, useAppQuery, useCurrentUser, usePermission} from "@shared/hooks";
import {APP_PERM} from "@shared/consts";

import {createEqNumberLists, EqNumberListTipe} from "../model/lib/createEqNumberLists";
import {Actions, fetchEqUpdCard} from "../model/api/fetchEqUpdCard";

import {EqCardBtn} from "./ui/EqCardBtn";
import {EqCardBody} from "./ui/EqCardBody";
import {CardSlider} from "./ui/CardSlider";
import {CardCounter} from "./ui/CardCounter";
import {CardNameNumbers} from "./ui/CardNameNumbers";
import {CardOrderProject} from "./ui/CardOrderProject";
import {CardDepartmentInfo} from "./ui/CardDepartmentInfo";

import {CardPlanDate} from "@widgets/EqCard/ui/ui/CardPlanDate";


interface EqInWorkCardProps extends HTMLAttributes<HTMLDivElement> {
    targetUserId: number | undefined;
    noRelevant?: boolean;
    card: EqOrderProduct;
    expanded: boolean;
    listType: ListTypes;
}

export const EqCard = memo((props: EqInWorkCardProps) => {
    const {card, expanded, targetUserId, listType, noRelevant, ...otherProps} = props;
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

    const [assignmentsLists, setAssignmentsLists] = useState<EqNumberListTipe>(
        createEqNumberLists(
            card.assignments,
            Number(queryParameters.series_size) || 1,
            targetUserId,
        )
    );

    const bossPerm = usePermission(APP_PERM.ELO_BOSS_VIEW_MODE);

    useEffect(() => {
        setAssignmentsLists(
            createEqNumberLists(
                card.assignments,
                Number(queryParameters.series_size) || 1,
                targetUserId,
            ),
        );
    }, [card.assignments, queryParameters.series_size, targetUserId]);

    const targetNumbers = useMemo(() => {
        return [...assignmentsLists.primary, ...assignmentsLists.selectedLocked];
    }, [
        assignmentsLists.primary,
        assignmentsLists.selectedLocked,
    ]);

    const hideFirstBtn = useMemo(() => {
            if (isViewer) return true;
            if (listType === 'await' && targetNumbers.length === 0) return true;
            if (listType === 'distribute') return true;
            if (listType === 'in_work' && targetNumbers.length === 0) return true;
            if (listType === 'ready' && (!isBoss || targetNumbers.length === 0)) return true;
            return listType === 'ready' && !card.product.technological_process;
        },
        [
            targetNumbers,
            card.product.technological_process,
            isBoss,
            isViewer,
            listType
        ]
    );

    const hideSecondBtn = useMemo(() => {
        if (isViewer) return true;
        if (listType === 'await') return true;
        return listType === 'ready' && targetNumbers.length === 0;
    }, [
        targetNumbers,
        isViewer,
        listType
    ]);

    const firstBtnIsLocked = useMemo(() => {
        if (listType === 'await') {
            if (bossPerm) {
                return card.assignments.some(assignment => assignment.appointed_by_boss);
            }
            return card.assignments.some(assignment => assignment.appointed_by_boss) ||
                targetNumbers.some(assignment => !assignment.assembled);
        }
        return false;
    }, [bossPerm, card.assignments, listType, targetNumbers])

    const returnLocked = useMemo(() => {
        if (listType !== "in_work" || bossPerm) {
            return false;
        }
        const bossAssignments = card.assignments.filter(assignment => assignment.appointed_by_boss);
        const primaryExists = bossAssignments.some(
            assignment => assignmentsLists.primary.includes(assignment));
        const lockedExists = bossAssignments.some(
            assignment => assignmentsLists.selectedLocked.includes(assignment));
        return lockedExists || primaryExists;
    }, [assignmentsLists.primary, assignmentsLists.selectedLocked, bossPerm, card.assignments, listType]);

    const getBtnClb = useCallback((first: boolean) => {
        if (!currentUser.current_department) {
            return;
        }
        if (listType === 'await' && firstBtnIsLocked) {
            handleOpen(
                <h4 className={'mx-4'}>
                    Наряды заблокированы для взятия в работу. <br/>

                    Проверьте наличие комплектации у выбранных нарядов или статус блокировки карточки.
                </h4>
            );
        } else if (getAction(first) === 'in_work_to_await' && returnLocked) {
            handleOpen(
                <h4 className={'mx-4'}>
                    Один или несколько выбранных нарядов назначены бригадиром. <br/>
                    Вернуть в ожидание такие наряды может только бригадир.
                </h4>
            );
        } else {
            setCardDisabled(true);
            dispatch(fetchEqUpdCard({
                op_id: card.id,
                department_id: currentUser.current_department.id,
                assignment_ids: targetNumbers.map(item => item.id),
                action: getAction(first),
                ...queryParameters,
            })).then(() => {
                dispatch(eqPageActions.addNotRelevantId(card.id));
                setCardDisabled(false);
            });
        }

    }, [currentUser.current_department, listType, firstBtnIsLocked, getAction, returnLocked, handleOpen, dispatch, card.id, targetNumbers, queryParameters]);

    const getPlaneDate = useCallback((first: boolean) => {
        const targetDate = () => {
            const assignment_dates = card.assignments
                .map(item => item.plane_date ? new Date(item.plane_date) : null)
                .filter(date => date !== null) as Date[];

            const minDate = assignment_dates.reduce((min, current) => current < min ? current : min, assignment_dates[0]);
            const minDateString = minDate ? minDate.toISOString() : null;
            return minDateString || card.order.planned_date;
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
    }, [card.assignments, card.order.planned_date, expanded, listType]);

    const showPlanDate = useMemo(() => {
        if (listType === "ready") return false;
        return !!localStorage.getItem(listType);
        //eslint-disable-next-line
    }, [queryParameters.sortUpdated, listType])

    return (
        <EqCardBody card={card} {...otherProps}>
            {showPlanDate && (
                <CardPlanDate card={card} assignmentsLists={card.assignments}/>
            )}

            {!hideFirstBtn &&
                <EqCardBtn
                    card={card}
                    planDate={getPlaneDate(true)}
                    assignmentsLists={assignmentsLists}
                    showDrug={showPlanDate}
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

            <CardSlider
                card={card}
                cardType={listType}
                targetUserId={targetUserId}
            />

            <CardCounter card={card}/>

            <CardNameNumbers
                card={card}
                listType={listType}
                assignmentsLists={assignmentsLists}
                setAssignmentsLists={setAssignmentsLists}
                targetUserId={targetUserId}
            />

            <CardOrderProject card={card}/>

            <CardDepartmentInfo
                card={card}
                listType={listType}
            />

            {!hideSecondBtn &&
                <EqCardBtn
                    card={card}
                    planDate={getPlaneDate(false)}
                    assignmentsLists={assignmentsLists}
                    style={{minWidth: '39px', maxWidth: '39px'}}
                    showDrug={false}
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
