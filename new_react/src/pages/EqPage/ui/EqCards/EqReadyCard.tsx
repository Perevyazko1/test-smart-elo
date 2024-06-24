import React, {HTMLAttributes, memo, useEffect, useMemo, useState} from "react";

import {useAppDispatch, useAppQuery, useCurrentUser, usePermission} from "@shared/hooks";
import {APP_PERM} from "@shared/consts";

import {createEqNumberLists} from "../../model/lib/createEqNumberLists";
import {Actions, fetchEqUpdCard} from "../../model/api/fetchEqUpdCard";
import {eqPageActions} from "../../model/slice/eqPageSlice";

import {EqCardBtn} from "./ui/EqCardBtn";
import {EqCardBody} from "./ui/EqCardBody";
import {CardSlider} from "./ui/CardSlider";
import {CardCounter} from "./ui/CardCounter";
import {CardNameNumbers} from "./ui/CardNameNumbers";
import {CardOrderProject} from "./ui/CardOrderProject";
import {CardDepartmentInfo} from "./ui/CardDepartmentInfo";
import {EqOrderProduct} from "@pages/EqPage/model/types";

interface EqReadyCardProps extends HTMLAttributes<HTMLDivElement> {
    card: EqOrderProduct;
}

// Карточка блока ожидания
export const EqReadyCard = memo((props: EqReadyCardProps) => {
    const {card} = props;
    const dispatch = useAppDispatch();

    // Поднимаем хук для вызова модалки с контентом
    const {currentUser} = useCurrentUser();
    const {queryParameters} = useAppQuery();

    const visaPerm = usePermission(APP_PERM.ELO_CONFIRM_ASSIGNMENT);
    const isViewer = usePermission(APP_PERM.ELO_VIEW_ONLY);

    const [cardDisabled, setCardDisabled] = useState(false);

    const getAction = (first: boolean) => {
        return first ? Actions.CONFIRMED : Actions.READY_TO_IN_WORK
    }

    const [
        assignmentsLists,
        setAssignmentsLists
    ] = useState(createEqNumberLists(card.assignments, Number(queryParameters.series_size) || 1));

    useEffect(() => {
        setAssignmentsLists(createEqNumberLists(card.assignments, Number(queryParameters.series_size) || 1))
    }, [card.assignments, queryParameters.series_size])


    const confirmClb = (first: boolean) => {
        if (!currentUser.current_department) {
            return;
        }
        setCardDisabled(true)
        dispatch(fetchEqUpdCard({
            series_id: card.series_id,
            department_id: currentUser.current_department.id,
            numbers: assignmentsLists.primary,
            action: getAction(first),
            ...queryParameters,
        })).then(() => {
            setCardDisabled(false);
            if (currentUser.current_department?.piecework_wages) {
                dispatch(eqPageActions.weekDataHasUpdated());
            }
        })
    }

    const getBtnClb = (first: boolean) => {
        confirmClb(first);
    };

    const showFirstBtn = useMemo(() => {
        return assignmentsLists.primary.length > 0
            && !!card.product.technological_process
            && visaPerm
            && !isViewer;
    }, [assignmentsLists.primary.length, card.product.technological_process, isViewer, visaPerm]);

    const showSecondBtn = useMemo(() => {
        return assignmentsLists.primary.length > 0
            && !isViewer
    }, [assignmentsLists.primary.length, isViewer])

    return (
        <EqCardBody card={card}>
            {showFirstBtn &&
                <EqCardBtn
                    style={{minWidth: '39px', maxWidth: '39px'}}
                    cardType={"ready"}
                    first={true}
                    urgency={card.urgency}
                    onClick={() => getBtnClb(true)}
                    disabled={cardDisabled}
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

            {showSecondBtn &&
                <EqCardBtn
                    style={{minWidth: '39px', maxWidth: '39px'}}
                    cardType={"ready"}
                    first={false}
                    urgency={card.urgency}
                    onClick={() => getBtnClb(false)}
                    disabled={cardDisabled}
                />
            }
        </EqCardBody>
    );
});
