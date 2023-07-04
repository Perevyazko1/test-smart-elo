import React, {memo, useEffect, useState} from "react";

import {eq_card} from "entities/EqPageCard";
import {AppModal} from "shared/ui/AppModal/AppModal";
import {OpCardDetails} from "../../../../widgets/OrderProduct/OpCardDetails/ui/OpCardDetails";
import {OpInfo} from "../OpInfo/OpInfo";

export interface OpModalProps {
    onHide: () => void,
    eqCard: eq_card,
}

export const OpModal = memo((props: OpModalProps) => {
    const {onHide} = props;

    const [eqCard, setEqCard] = useState<eq_card>(props.eqCard);

    useEffect(() => {
        setEqCard(props.eqCard);
    }, [props.eqCard]);

    return (
        <AppModal onHide={onHide}
                  className={'d-flex flex-column'}
                  title={`Информация по изделию ${eqCard.product.name}`}
        >
            <OpInfo eqCard={eqCard}/>
        </AppModal>
    )

});