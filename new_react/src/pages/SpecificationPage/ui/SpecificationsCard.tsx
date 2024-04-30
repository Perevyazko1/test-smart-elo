import React from "react";

import {useAppModal} from "@shared/hooks";

import {SpecificationWidget} from "./SpecificationWidget";

export const SpecificationsCard = () => {
    const {openModal} = useAppModal();

    const onClickHandler = () => {
        openModal(
            <SpecificationWidget/>
        )
    }

    return (
        <tr onClick={onClickHandler}>
            <td>23456</td>
            <td>с-1364</td>
            <td>1</td>
            <td>COMO</td>
            <td>ВЫПОЛНЕН</td>
            <td>31.05.2024 09:04</td>
        </tr>
    );
};
