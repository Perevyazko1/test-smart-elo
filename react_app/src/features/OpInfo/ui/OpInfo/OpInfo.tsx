import React, {memo, useCallback, useEffect, useState} from 'react';
import {Accordion} from "react-bootstrap";

import {eq_card} from "entities/EqPageCard";
import {OpCardDetails} from "widgets/OrderProduct/OpCardDetails";
import {OpDepDetails} from "widgets/OrderProduct/OpDepDetails";
import {OpProdDetails} from "widgets/OrderProduct/OpProdDetails";
import {useAppDispatch} from "shared/lib/hooks/useAppDispatch/useAppDispatch";
import {eqFiltersActions} from "pages/EqPageNew";

import {TechProcessInfo} from "../../../TechProcessInfo/ui/TechProcessInfo";


interface OpInfoProps {
    className?: string;
    eqCard: eq_card;
}


export const OpInfo = memo((props: OpInfoProps) => {
    const {
        className,
    } = props;

    const dispatch = useAppDispatch();

    const [eqCard, setEqCard] = useState<eq_card>(props.eqCard);

    useEffect(() => {
        setEqCard(props.eqCard);
    }, [props.eqCard]);


    const techProcessSelected = useCallback(() => {
        return !!eqCard?.product?.technological_process
    }, [eqCard?.product?.technological_process])

    return (
        <Accordion className={className} defaultActiveKey={techProcessSelected() ? "0" : "3"}>

            <Accordion.Item eventKey="0">
                <Accordion.Header>Просмотреть детализацию по изделию</Accordion.Header>
                <Accordion.Body>
                    <OpCardDetails eqCard={eqCard}/>
                </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey="1">
                <Accordion.Header>Просмотреть информацию по отделу</Accordion.Header>
                <Accordion.Body>
                    <OpDepDetails seriesId={eqCard.series_id}/>
                </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey="2">
                <Accordion.Header>Просмотреть информацию по другим цехам</Accordion.Header>
                <Accordion.Body>
                    <OpProdDetails seriesId={eqCard.series_id}/>
                </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey="3">
                <Accordion.Header>
                    {techProcessSelected()
                        ? "Просмотреть информацию по технологическому процессу"
                        : "Технологический процесс не выбран!"
                    }
                </Accordion.Header>

                <Accordion.Body>
                    <TechProcessInfo
                        product={eqCard.product}
                        updCallback={() => dispatch(eqFiltersActions.addNotRelevantId(eqCard.series_id))}
                    />
                </Accordion.Body>

            </Accordion.Item>

        </Accordion>
    );
});