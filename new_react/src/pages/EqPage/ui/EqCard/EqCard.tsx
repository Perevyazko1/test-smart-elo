import React, {HTMLAttributes, memo, useCallback, useContext} from "react";

import cls from "./EqCard.module.scss";

import {AppInCompactMode} from "@app";

import ChairImg from "@shared/assets/images/chair.png";

export const EqCard = memo((props: HTMLAttributes<HTMLDivElement>) => {
    const compactModeContext = useContext(AppInCompactMode);
    if (!compactModeContext) {
        throw new Error("SomeComponent must be used within a AppInCompactMode.Provider");
    }
    const {isCompactMode} = compactModeContext;
    const getSliderWidth = useCallback(() => {
        if (isCompactMode) {
            return '72px';
        } else {
            return '100px';
        }
    }, [isCompactMode])

    return (
        <div className={'mt-1 pb-05'} {...props}>
            <div className={cls.overflowWrapper + ' bg-black rounded rounded-2'}>
                {/*button*/}
                <button className={'appBtn greenBtn p-1 rounded rounded-2 h-100'}>
                    <i className="fas fa-angle-double-left fs-2"/>
                </button>

                {/*slider*/}
                <div className={cls.sliderBlock + ' bg-light rounded'} style={{
                    width: getSliderWidth(),
                    minWidth: getSliderWidth(),
                    maxWidth: getSliderWidth(),
                }}>
                    <div
                        style={{
                            position: "absolute",
                            bottom: "1px",
                            left: "2px",
                            margin: "auto",
                            zIndex: "999",
                            opacity: "0.4",
                            pointerEvents: "none",
                        }}
                    >
                        <div className={"fw-bold text-black bg-light border rounded me-1 fs-7"}
                             style={{padding: "0 0.1rem"}}>
                            1300
                        </div>
                    </div>
                    <img src={ChairImg} alt="Chair" style={{maxWidth: '97%', maxHeight: '97%'}}
                         className={'rounded'}
                    />

                    <div
                        style={{
                            position: "absolute",
                            bottom: "1px",
                            right: "2px",
                            margin: "auto",
                            zIndex: "999",
                            opacity: "0.4",
                            pointerEvents: "none",
                        }}
                    >
                        <div className={"fw-bolder bg-light border rounded fs-7"} style={{padding: "0 0.1rem"}}>
                            30.11
                            {/*{(Math.random() * 100).toFixed()}*/}
                        </div>
                    </div>
                </div>

                {/*counts*/}
                <div
                    className={cls.cardCounts + ' fs-7 fw-bold rounded'}
                >
                    <div>
                        Всего:1300
                    </div>
                    <hr className={cls.contentHr}/>
                    <div>
                        В_раб:12
                    </div>
                    <hr className={cls.contentHr}/>

                    <div>
                        Своб:1288
                    </div>
                    <hr className={cls.contentHr}/>

                    <div className={'text-muted'}>
                        Готов:0
                    </div>
                </div>

                {/*Имя и номера бегунков*/}
                <div className={cls.nameNumberBlock + ' bg-light rounded'}>
                    <div className={cls.productName}>
                        Кресло рабочее Дагестан /FP/ Изделие №694 (01, с колесами)
                    </div>

                    <hr className={'m-0 p-0'}/>

                    <div className={cls.numbersBlock}>
                        <button className={'appBtn blueBtn p-1 rounded h-100 fw-bold'} style={{minWidth: '35px'}}>
                            12
                        </button>
                        <button className={'appBtn greyBtn p-1 rounded h-100 fw-bold'} style={{minWidth: '35px'}}>
                            {(Math.random() * 100).toFixed()}
                        </button>
                        <button className={'appBtn greyBtn p-1 rounded h-100 fw-bold'} style={{minWidth: '35px'}}>
                            {(Math.random() * 100).toFixed()}
                        </button>
                        <button className={'appBtn greyBtn p-1 rounded h-100 fw-bold'} style={{minWidth: '35px'}}>
                            {(Math.random() * 100).toFixed()}
                        </button>
                        <button className={'appBtn greyBtn p-1 rounded h-100 fw-bold'} style={{minWidth: '35px'}}>
                            {(Math.random() * 100).toFixed()}
                        </button>
                        <button className={'appBtn greyBtn p-1 rounded h-100 fw-bold'} style={{minWidth: '35px'}}>
                            {(Math.random() * 100).toFixed()}
                        </button>
                        <button disabled className={'appBtn greenBtn p-1 rounded h-100 fw-bold'}
                                style={{minWidth: '35px'}}>{(Math.random() * 100).toFixed()}
                        </button>
                        <button disabled className={'appBtn greenBtn p-1 rounded h-100 fw-bold'}
                                style={{minWidth: '35px'}}>{(Math.random() * 100).toFixed()}
                        </button>
                        <button disabled className={'appBtn greenBtn p-1 rounded h-100 fw-bold'}
                                style={{minWidth: '35px'}}>{(Math.random() * 100).toFixed()}
                        </button>
                    </div>
                </div>

                {/*Заказ-Проект блок*/}
                <div className={cls.orderProjectBlock + ' bg-light rounded'} style={{fontSize: '14px'}}>
                    <div className={'fs-7 fw-bold text-center'}>
                        Заказ:
                        <br/>
                        1-23141
                        <hr className={'m-0 p-0'}/>
                    </div>
                    <div className={'fs-7 text-center'}>
                        Проект:
                        <br/>
                        Серийная мебель
                    </div>
                </div>

                <div className={cls.depInfoBlock + ' bg-light rounded fs-7 fw-bold'}>
                    БАА: 12 (0)
                    <hr className={'m-0 p-0'}/>
                    ХДВ: 13 (0)
                    <hr className={'m-0 p-0'}/>
                </div>

                <button className={'appBtn greenBtn p-1 rounded rounded-2 h-100'}>
                    <i className="fas fa-angle-double-left fs-2"/>
                </button>
            </div>
        </div>
    );
});
