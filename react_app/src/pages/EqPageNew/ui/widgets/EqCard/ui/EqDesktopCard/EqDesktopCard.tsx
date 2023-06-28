import React, {memo, useState} from 'react';
import {Button, Col} from "react-bootstrap";

import {eq_card} from "entities/EqPageCard";
import {classNames, Mods} from "shared/lib/classNames/classNames";

import cls from "./EqDesktopCard.module.scss";
import {createEqImageUrls} from "../../model/lib/createEqImageUrls/createEqImageUrls";
import {Slider} from "shared/ui/Slider/Slider";
import {createEqNumberLists} from "../../model/lib/createEqNumberLists/createEqNumberLists";

interface EqCardProps {
    blockWidth: number;
    eqCard: eq_card;
    cardType: 'await' | 'in_work' | 'ready';
}


export const EqDesktopCard = memo((props: EqCardProps) => {
    const {
        blockWidth,
        eqCard,
        cardType
    } = props

    const sliderImages = createEqImageUrls(eqCard)
    const [assignmentsLists, setAssignmentsLists] = useState(createEqNumberLists(eqCard, 1))
    const mods: Mods = {
        'border border-secondary border-1 rounded h-100': true
    };

    return (
        <Col sm={blockWidth > 2000 ? 6 : 12} className={cls.cardCol}>
            <div className={classNames(cls.card, {}, ['bg-dark rounded'])}>
                <div className={classNames(cls.overflowWrapper, {}, ['bg-dark rounded'])}>
                    {blockWidth > 600 &&
                        <Button
                            className={classNames(cls.cardBtn, mods, [])}
                            type="button"
                            variant={'warning'}
                        >
                            <i className="fas fa-angle-double-left fs-2"/>
                        </Button>
                    }
                    <div
                        className={classNames(cls.sliderBlock, mods, [])}
                    >
                        <Slider price={eqCard.card_info.tariff} images={sliderImages} width={'100%'} height={'100%'}/>
                    </div>

                    <div
                        className={classNames(cls.countBlock, mods, [cls.margined, 'fs-7'])}
                    >
                        <div className={eqCard.card_info.count_all === 0 ? 'text-muted' : ''}>
                            Всего:{eqCard.card_info.count_all}
                        </div>
                        <hr className={cls.contentHr}/>
                        <div className={eqCard.card_info.count_in_work === 0 ? 'text-muted' : ''}>
                            В_раб:{eqCard.card_info.count_in_work}
                        </div>
                        <hr className={cls.contentHr}/>

                        <div className={eqCard.card_info.count_await === 0 ? 'text-muted' : ''}>
                            Своб:{eqCard.card_info.count_await}
                        </div>
                        <hr className={cls.contentHr}/>

                        <div className={eqCard.card_info.count_ready === 0 ? 'text-muted' : ''}>
                            Готов:{eqCard.card_info.count_ready}
                        </div>
                    </div>

                    <div
                        className={classNames(cls.nameNumberBlock, mods, [])}
                        // className={'h-100 rounded bg-light border border-dark border-3'}
                    >
                        <div className={classNames(cls.productName, {}, [])}>
                            {eqCard.product.name}
                        </div>

                        <hr className={cls.contentHr}/>

                        <div className={cls.numbers}>
                            {assignmentsLists.primary?.map((number) => (
                                <Button
                                    key={number}
                                    className={classNames(cls.number, {}, ["fs-5 fw-bold"])}
                                    variant={'primary'}
                                >
                                    {number}
                                </Button>
                            ))}
                            {assignmentsLists.secondary?.map((number) => (
                                <Button
                                    key={number}
                                    className={classNames(cls.number, {}, ["fs-5 fw-bold"])}
                                    variant={'secondary'}
                                >
                                    {number}
                                </Button>
                            ))}
                            {assignmentsLists.confirmed?.map((number) => (
                                <Button
                                    key={number}
                                    className={classNames(cls.number, {}, ["fs-5 fw-bold"])}
                                    variant={'success'}
                                >
                                    {number}
                                </Button>
                            ))}
                        </div>
                    </div>


                    {blockWidth > 600 &&
                        <div className={classNames(cls.orderProjectBlock, mods, ['fs-7'])}>
                            <div>
                                Заказ:
                                <br/>
                                {eqCard.series_id}
                                <hr className={cls.contentHr}/>
                            </div>
                            <div>
                                Проект:
                                <br/>
                                {eqCard.order.project}
                            </div>
                        </div>
                    }

                    {blockWidth > 900 &&
                        <div className={classNames(cls.departmentInfoBlock, mods, ['fs-7'])}>
                            {eqCard.department_info.map((info) => (
                                <div
                                    className={classNames(cls.countInfo, {}, [`${info.count_in_work === 0 ? 'text-muted' : ''}`])}
                                    key={info.full_name}
                                >
                                    {info.full_name}: {info.count_in_work}
                                    <hr className={cls.contentHr}/>
                                </div>
                            ))}
                        </div>
                    }


                    {blockWidth > 600 && cardType !== 'await' &&
                        <Button
                            className={classNames(cls.cardBtn, mods, [])}
                            type="button"
                            variant={'warning'}
                        >
                            <i className="fas fa-angle-double-left fs-2"/>
                        </Button>
                    }
                </div>
            </div>
        </Col>
    );
});
