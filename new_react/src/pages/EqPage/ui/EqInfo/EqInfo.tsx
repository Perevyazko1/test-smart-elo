import {EqCardType} from "@pages/EqPage/model/types/eqCardType";
import {EqCardTable} from "@pages/EqPage/ui/EqInfo/EqCardTable";
import {EqDepDetails} from "@pages/EqPage/ui/EqInfo/EqDepDetails";
import {EqProdDetails} from "@pages/EqPage/ui/EqInfo/EqProdDetails";
import {TechProcessWidget} from "@widgets/TechProcessWidget/ui/TechProcessWidget";
import {Accordion} from "react-bootstrap";
import {useMemo} from "react";
import {IndicatorWrapper} from "@shared/ui";

interface EqInfoProps {
    card: EqCardType;
    updCallback?: () => void;
}

export const EqInfo = (props: EqInfoProps) => {
    const {card, updCallback} = props;

    const defaultActiveKey = useMemo(() => {
        return !card.product.technological_process ? "0" : "1";
    }, [card.product.technological_process])

    return (
        <div style={{
            minWidth: '90vw',
            minHeight: '90dvh',
            overflowX: 'hidden',
            overflowY: 'auto',
        }}
             data-bs-theme={'light'}
             className={'p-1'}
        >
            <h5 className={'m-0 p-0 fw-bold'}>
                {`Информация по серии производства ${card.series_id} | ${card.product.name}`}
            </h5>
            <hr className={'m-2 p-0'}/>

            <Accordion
                defaultActiveKey={defaultActiveKey}
            >
                <Accordion.Item eventKey="0">
                    <Accordion.Header>
                        <IndicatorWrapper
                            indicator={'tech-process'}
                            show={!card.product.technological_process}
                            color={' bg-danger'}
                            right={"-22px"}
                        >
                            <h5 className={'fw-bold'}>Технологический процесс</h5>
                        </IndicatorWrapper>
                    </Accordion.Header>
                    <Accordion.Body>
                        <TechProcessWidget product={card.product} updCallback={updCallback}/>
                    </Accordion.Body>
                </Accordion.Item>


                <Accordion.Item eventKey="1">
                    <Accordion.Header>
                        <IndicatorWrapper
                            indicator={'comment'}
                            show={!!card.comment_base || !!card.comment_case}
                            color={' bg-warning'}
                            right={"-22px"}
                        >
                            <h5 className={'fw-bold'}>Информация по карточке</h5>
                        </IndicatorWrapper>
                    </Accordion.Header>
                    <Accordion.Body>
                        <EqCardTable card={card}/>
                    </Accordion.Body>
                </Accordion.Item>

                <Accordion.Item eventKey="2">
                    <Accordion.Header><h5 className={'fw-bold'}>Информация по отделу</h5></Accordion.Header>
                    <Accordion.Body>
                        <EqDepDetails seriesId={card.series_id}/>
                    </Accordion.Body>
                </Accordion.Item>

                <Accordion.Item eventKey="3">
                    <Accordion.Header><h5 className={'fw-bold'}>Информация по производству</h5></Accordion.Header>
                    <Accordion.Body>
                        <EqProdDetails seriesId={card.series_id}/>
                    </Accordion.Body>
                </Accordion.Item>
            </Accordion>

        </div>
    );
};
