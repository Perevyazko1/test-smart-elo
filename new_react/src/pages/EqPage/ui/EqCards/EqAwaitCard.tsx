import {HTMLAttributes, memo, useState} from "react";
import {useAppDispatch, useAppQuery, useCurrentUser} from "@shared/hooks";

import {createEqNumberLists} from "../../model/lib/createEqNumberLists";
import {EqCardType} from "../../model/types/eqCardType";
import {Actions, fetchEqUpdCard} from "../../model/api/fetchEqUpdCard";

import {EqCardBtn} from "./ui/EqCardBtn";
import {EqCardBody} from "./ui/EqCardBody";
import {CardSlider} from "./ui/CardSlider";
import {CardCounter} from "./ui/CardCounter";
import {CardNameNumbers} from "./ui/CardNameNumbers";
import {CardOrderProject} from "./ui/CardOrderProject";
import {CardDepartmentInfo} from "@pages/EqPage/ui/EqCards/ui/CardDepartmentInfo";

interface EqAwaitCardProps extends HTMLAttributes<HTMLDivElement> {
    card: EqCardType;
}

// Карточка блока ожидания
export const EqAwaitCard = memo((props: EqAwaitCardProps) => {
    const {card, ...otherProps} = props;
    const dispatch = useAppDispatch();

    const {currentUser} = useCurrentUser();
    const {queryParameters} = useAppQuery();

    const [cardDisabled, setCardDisabled] = useState(false);


    const getAction = () => {
        return Actions.AWAIT_TO_IN_WORK;
    }

    const [
        assignmentsLists,
        setAssignmentsLists
    ] = useState(createEqNumberLists(card.assignments, Number(queryParameters.series_size) || 1));

    const getBtnClb = () => {
        setCardDisabled(true)
        dispatch(fetchEqUpdCard({
            series_id: card.series_id,
            numbers: assignmentsLists.primary,
            department_id: currentUser.current_department.id,
            action: getAction(),
            ...queryParameters,
        })).then(() => {
            setCardDisabled(false);
        })
    };


    return (
        <EqCardBody card={card} {...otherProps}>
            {assignmentsLists.primary.length > 0 &&
                <EqCardBtn
                    plane_date={card.plane_date}
                    style={{minWidth: '39px', maxWidth: '39px'}}
                    cardType={"await"}
                    first={true}
                    urgency={card.urgency}
                    onClick={() => getBtnClb()}
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

            {/*Отделы инфо блок*/}
            <CardDepartmentInfo card={card}/>

            {/*Заказ-Проект блок*/}
            <CardOrderProject card={card}/>

        </EqCardBody>
    );
});
