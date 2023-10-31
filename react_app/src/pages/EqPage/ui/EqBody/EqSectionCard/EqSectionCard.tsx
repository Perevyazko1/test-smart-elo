import {Container, Row} from "react-bootstrap";
import {classNames} from "../../../../../shared/lib/classNames/classNames";
import React, {ReactNode} from "react";
import {FixedSizeList as List, ListChildComponentProps} from 'react-window';

interface EqSectionCardProps {
    listType: 'await' | 'in_work' | 'ready';
    widthPx: number;
    heightPx: number;
    cls: string;
}

export const EqSectionCard = (props: EqSectionCardProps) => {
    const {
        widthPx,
        heightPx,
        cls,
    } = props;

    const skeleton = () => <Container fluid className={'w-100 bg-secondary rounded'} style={{
        height: '100px',
    }}/>

    const skeletons: ReactNode[] = Array(150).fill(skeleton())

    const Item = (props: ListChildComponentProps<any>) => {
        return (
            <div style={props.style}>
                {skeletons[props.index]}
            </div>
        )
    }

    return (
        <Row
            className={classNames(cls, {}, [''])}
            style={{
                width: `${widthPx}px`,
                height: `${heightPx}px`,
                overflowY: 'hidden',
                overflowX: 'hidden',
            }}
        >
            <Container fluid className={'p-1'}>

                <List itemSize={104} height={heightPx} itemCount={150} width={'100%'}>
                    {Item}
                </List>

            </Container>
        </Row>
    )
}