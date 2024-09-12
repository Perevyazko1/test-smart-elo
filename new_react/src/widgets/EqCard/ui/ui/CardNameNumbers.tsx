import {Button} from "react-bootstrap";

import {useAppModal, useAppQuery, useCurrentUser} from "@shared/hooks";
import {EqOrderProduct} from "@widgets/EqCardList";
import {TarifficationWidget} from "@widgets/TarifficationWidget";
import {EqAssignment} from "@widgets/EqCardList/model/types";

import cls from "./EqCard.module.scss";

import {EqNumberListTipe} from "../../model/lib/createEqNumberLists";
import {setTargetNumber} from "../../model/lib/setTargetNumber";

import {EqNumbers} from "./EqNumbers";

interface CardNameNumbersProps {
    card: EqOrderProduct;
    assignmentsLists: EqNumberListTipe;
    setAssignmentsLists: (props: EqNumberListTipe) => void;
}

export const CardNameNumbers = (props: CardNameNumbersProps) => {
    const {card, assignmentsLists, setAssignmentsLists} = props;
    const {handleOpen} = useAppModal();

    const {setQueryParam} = useAppQuery();
    const {currentUser} = useCurrentUser();

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
                {currentUser.current_department?.piecework_wages &&
                    <Button
                        size={"sm"}
                        className={'p-0 px-1 me-1 fs-7'}
                        variant={
                            card.card_info.tariff
                                ? 'outline-dark'
                                : card.card_info.proposed_tariff
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
                {card.assignments.length > 1 &&
                    <div className={'d-flex h-100 align-items-center fw-bold fs-7'}>
                        {card.assignments.length}:
                    </div>
                }
                <EqNumbers
                    assignmentsLists={assignmentsLists}
                    setNumber={setNumber}
                />
            </div>
        </div>
    );
};
