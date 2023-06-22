import React, {useEffect, useState} from "react";
import {useSelector} from "react-redux";
import {Col, Row} from "react-bootstrap";

import {getEqPageCards} from "../../model/selectors/getEqPageCards/getEqPageCards";

import cls from './DesktopDesign.module.scss';
import {useDrag} from "react-dnd";

const DesktopDesign = () => {
    const pageList = useSelector(getEqPageCards.selectAll)

    const [windowHeight, setWindowHeight] = useState<number>(window.innerHeight - 61);
    const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth);

    const [leftBlockWidth, setLeftBlockWidth] = useState<number>(windowWidth / 2);
    const [rightBlockWidth, setRightBlockWidth] = useState<number>(windowWidth / 2);

    const [inWorkHeight, setInWorkHeight] = useState<number>(windowHeight / 2 - 20);
    const [readyHeight, setReadyHeight] = useState<number>(windowHeight / 2 - 20);

    useEffect(() => {
        const handleResize = () => {
            setWindowHeight(window.innerHeight - 56)
            setWindowWidth(window.innerWidth)
            setLeftBlockWidth(windowWidth / 2)
            setRightBlockWidth(windowWidth / 2)
            setInWorkHeight(windowHeight / 2 - 20)
            setReadyHeight(windowHeight / 2 - 20)
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [windowHeight, windowWidth]);

    const adjustHeight = (offset_px: number) => {
        if (offset_px - 60 < 30) {
            setInWorkHeight(20)
            setReadyHeight(windowHeight - 60)
        } else if (offset_px > windowHeight) {
            setInWorkHeight(windowHeight - 60)
            setReadyHeight(20)
        } else {
            setInWorkHeight(offset_px - 60)
            setReadyHeight(windowHeight - offset_px + 20)
        }
    }

    const adjustWidth = (offset_px: number) => {
        if (offset_px < 210) {
            setLeftBlockWidth(210)
            setRightBlockWidth(window.innerWidth - 210)
        } else if (window.innerWidth - offset_px < 210) {
            setLeftBlockWidth(window.innerWidth - 210)
            setRightBlockWidth(210)
        } else {
            setLeftBlockWidth(offset_px)
            setRightBlockWidth(window.innerWidth - offset_px)
        }
    }

    const [{isDragging: isDraggingX}, drag] = useDrag(() => ({
        type: "mainDrag",
        collect: (monitor) => {
            if (monitor.isDragging()) {
                const position = monitor.getClientOffset();
                if (position) {
                    adjustWidth(position.x + 25);
                    adjustHeight(position.y - 20);
                }
            }
            return {
                isDragging: !!monitor.isDragging(),
            }
        }
    }))

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
                        opacity: isDraggingX ? 0.5 : 1,
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

export default DesktopDesign;