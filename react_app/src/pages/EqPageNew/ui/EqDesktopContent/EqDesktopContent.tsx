import React from "react";
import {Col, Row} from "react-bootstrap";

import useWindowDimensions from "shared/lib/hooks/useWindowDimensions/useWindowDimensions";
import useResizableBlocks from "shared/lib/hooks/useResizableBlocks/useResizableBlocks";

import cls from "./EqDesktopContent.module.scss";

const EqDesktopContent = () => {
    const {windowWidth, windowHeight} = useWindowDimensions(-62);
    const {
        leftBlockWidth,
        rightBlockWidth,
        inWorkHeight,
        readyHeight,
        isDragging,
        drag
    } = useResizableBlocks(windowWidth, windowHeight);

    return (
        <div className={'d-flex'}>
            <div
                style={{
                    width: `${leftBlockWidth}px`,
                    height: `${windowHeight}`
                }}
            >
                <Row
                    className={cls.inWorkBlock}
                    style={{
                        height: `${inWorkHeight}px`
                    }}
                >
                    <Col sm={leftBlockWidth > 2000 ? 6 : 12} className={cls.cardWrapper}>Карточка</Col>
                    <Col sm={leftBlockWidth > 2000 ? 6 : 12} className={cls.cardWrapper}>Карточка</Col>
                    <Col sm={leftBlockWidth > 2000 ? 6 : 12} className={cls.cardWrapper}>Карточка</Col>
                    <Col sm={leftBlockWidth > 2000 ? 6 : 12} className={cls.cardWrapper}>Карточка</Col>
                </Row>

                <div
                    className={cls.weekBlock}
                    style={{
                        opacity: isDragging ? 0.5 : 1,
                    }}
                >

                    Блок недель

                    <div className={'bg-dark rounded d-flex align-items-center justify-content-center'}
                         style={{
                             width: "40px",
                             height: "90%",
                             touchAction: 'none',
                             cursor: 'grab',
                         }}
                         ref={drag}
                    >
                        <i className="fas fa-compress-alt text-light fs-3"/>
                    </div>
                </div>

                <Row
                    className={cls.readyBlock}
                    style={{
                        height: `${readyHeight}px`,
                    }}
                >
                    <Col sm={leftBlockWidth > 2000 ? 6 : 12} className={cls.cardWrapper}>Карточка</Col>
                    <Col sm={leftBlockWidth > 2000 ? 6 : 12} className={cls.cardWrapper}>Карточка</Col>
                    <Col sm={leftBlockWidth > 2000 ? 6 : 12} className={cls.cardWrapper}>Карточка</Col>
                    <Col sm={leftBlockWidth > 2000 ? 6 : 12} className={cls.cardWrapper}>Карточка</Col>

                </Row>

            </div>


            <Row
                className={cls.awaitBlock}
                style={{
                    width: `${rightBlockWidth}px`,
                    height: `${windowHeight}px`,
                }}
            >
                <Col sm={rightBlockWidth > 2000 ? 6 : 12} className={cls.cardWrapper}>Карточка</Col>
                <Col sm={rightBlockWidth > 2000 ? 6 : 12} className={cls.cardWrapper}>Карточка</Col>
                <Col sm={rightBlockWidth > 2000 ? 6 : 12} className={cls.cardWrapper}>Карточка</Col>
                <Col sm={rightBlockWidth > 2000 ? 6 : 12} className={cls.cardWrapper}>Карточка</Col>
            </Row>
        </div>
    );
};

export default EqDesktopContent;