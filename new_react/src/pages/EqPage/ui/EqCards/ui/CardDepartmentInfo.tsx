import {AssignmentInfo} from "@widgets/AssignmentInfo";
import {useAppModal} from "@shared/hooks";

import cls from "./EqCard.module.scss";

import {EqCardType} from "../../../model/types/eqCardType";

interface CardDepartmentInfoProps {
    card: EqCardType;
}

export const CardDepartmentInfo = (props: CardDepartmentInfoProps) => {
    const {card} = props;
    const {openModal} = useAppModal();

    return (
        <div
            className={cls.depInfoBlock + ' bg-light rounded fs-7 fw-bold'}
            onClick={() => openModal(
                <AssignmentInfo seriesId={card.series_id} title={card.product.name}/>
            )}
        >
            {card.department_info.map((info, index) => (
                <div key={index}>
                    {info.full_name} {info.count_in_work} ({info.count_all})
                    <hr className={'m-0 p-0'}/>
                </div>
            ))}
        </div>
    );
};
