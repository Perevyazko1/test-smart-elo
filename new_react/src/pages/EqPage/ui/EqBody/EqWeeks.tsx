import React, {useContext} from "react";
import {IsDesktopContext} from "@app";
import {ConnectDragSource} from "react-dnd";
import {useDoubleTap} from "@shared/hooks";
import {Button} from "react-bootstrap";

interface EqWeeksProps {
    blockWidthPx: number;
    isDragging: boolean;
    showClb: () => void;
    drag: ConnectDragSource;
    resetSize: () => void;
}

export const EqWeeks = (props: EqWeeksProps) => {
    const {blockWidthPx, isDragging, showClb, drag, resetSize} = props;
    const isDesktop = useContext(IsDesktopContext);
    const handleDoubleTap = useDoubleTap(resetSize);

    const getWeekString = () => {
        if (blockWidthPx > 650) {
            return 'Неделя 42 с 23.10 по 30.10 | ЗП: 20 000';
        } else if (blockWidthPx > 550) {
            return 'Нед. 42 с 23.10 по 30.10 | ЗП: 20 000';
        } else if (blockWidthPx > 400) {
            return 'Нед. 42 | ЗП: 20 000';
        } else if (blockWidthPx > 300) {
            return 'Нед. 42';
        } else if (blockWidthPx > 250) {
            return '42';
        } else {
            return '';
        }
    }

    return (
        <div
            className={'d-flex justify-content-between align-items-center px-2 rounded border border-1'}
            style={{
                height: '36px',
                background: '#00969b',
                opacity: isDragging ? 0.5 : 1,
            }}
        >
            {!isDesktop &&
                <div className={'bg-dark rounded d-flex align-items-center justify-content-center me-2'}
                     style={{
                         width: "40px",
                         height: "90%",
                         cursor: 'pointer',
                     }}
                     onClick={showClb}
                >
                    <i className="fas fa-filter text-light fs-6"/>
                </div>
            }

            <div className={'d-flex justify-content-between flex-fill align-items-center'}>
                <Button className={"me-2 p-0 d-flex align-items-center justify-content-center"}
                        variant={'dark'}
                        size={'sm'}
                        style={{width: "50px", height: "29px"}}
                >
                    <i className="fas fa-angle-double-left fs-3"/>
                </Button>

                <div>
                    {getWeekString()}
                </div>


                <Button className={"ms-2 p-0 d-flex align-items-center justify-content-center"}
                        type={"button"}
                        variant={'dark'}
                        size={'sm'}
                        style={{width: "50px", height: "29px"}}
                >
                    <i className="fas fa-angle-double-right fs-3"/>
                </Button>
            </div>

                {!!drag &&
                    <div className={'bg-dark rounded rounded-1 d-flex align-items-center justify-content-center ms-2'}
                         style={{
                             width: "40px",
                             height: "29px",
                             touchAction: 'none',
                             cursor: 'grab',
                         }}
                         ref={drag}
                         onDoubleClick={resetSize}
                         onTouchEnd={handleDoubleTap}
                    >
                        {isDragging ? <i className="far fa-hand-rock fs-5 text-light"/>
                            : <i className="far fa-hand-paper fs-5 text-light"/>
                        }

                    </div>
                }
        </div>
    )
}