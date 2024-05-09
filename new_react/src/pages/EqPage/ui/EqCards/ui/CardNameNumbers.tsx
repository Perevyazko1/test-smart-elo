import {useEffect} from "react";
import {Button} from "react-bootstrap";

import {TarifficationWidget} from "@widgets/TarifficationWidget";
import {useAppModal, useAppQuery, useCurrentUser} from "@shared/hooks";

import cls from "./EqCard.module.scss";

import {EqCardType} from "../../../model/types/eqCardType";
import {setTargetNumber} from "../../../model/lib/setTargetNumber";
import {createEqNumberLists} from "../../../model/lib/createEqNumberLists";

import {EqNumbers} from "./EqNumbers";

interface CardNameNumbersProps {
    card: EqCardType;
    assignmentsLists: {
        primary: number[];
        secondary: number[];
        confirmed: number[];
    };
    setAssignmentsLists: (props: {
        primary: number[];
        secondary: number[];
        confirmed: number[];
    }) => void;
}

export const CardNameNumbers = (props: CardNameNumbersProps) => {
    const {card, assignmentsLists, setAssignmentsLists} = props;
    const {openModal} = useAppModal();

    const {queryParameters, setQueryParam} = useAppQuery();
    const {currentUser} = useCurrentUser();


    const setNumber = (assignment_number: number) => {
        setAssignmentsLists(setTargetNumber(
            assignmentsLists.primary,
            assignmentsLists.secondary,
            assignmentsLists.confirmed,
            assignment_number),
        );
        setQueryParam('series_size', '');
    }

    useEffect(() => {
        setAssignmentsLists(createEqNumberLists(card.assignments, Number(queryParameters.series_size) || 1));
        //eslint-disable-next-line
    }, [card.assignments, queryParameters.series_size]);

    const openTarifficationWidget = () => {
        openModal(
            <TarifficationWidget
                productId={card.product.id}
                departmentId={currentUser.current_department.id}
            />
        )
    }

    return (
        <div className={cls.nameNumberBlock + ' bg-light rounded'}>
            <div className={cls.productName}>
                {card.further_packaging && "📦"}
                {!card.card_info.tariff &&
                    currentUser.current_department.piecework_wages &&
                    !card.card_info.proposed_tariff &&
                    <Button size={"sm"}
                            className={'p-0 px-1 me-1 fs-7'}
                            variant={'outline-danger'}
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
                <EqNumbers assignmentsLists={assignmentsLists} setNumber={setNumber}/>
            </div>
        </div>
    );
};
