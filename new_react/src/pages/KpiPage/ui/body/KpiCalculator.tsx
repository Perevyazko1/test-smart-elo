import {AppInput} from "@shared/ui";

import cls from "../KpiPage.module.scss";
import {ChangeEvent, useMemo, useState} from "react";

interface KpiCalculatorProps {
    total_sum: number;
    total_count: number;
}


export const KPI_CLAIM = {
    'claim1': {
        '%': 0.5,
        'K': 0.7,
    },
    'claim2': {
        '%': 0.2,
        'K': 0.9,
    },
    'claim3': {
        '%': 0.1,
        'K': 1,
    },
    'claim4': {
        '%': 0,
        'K': 1.2,
    },
}

export const KPI_PLAN = {
    'plan1': {
        '%': -20,
        'K': 0.7,
    },
    'plan2': {
        '%': 0,
        'K': 0.9,
    },
    'plan3': {
        '%': 10,
        'K': 1,
    },
    'plan4': {
        '%': 100000,
        'K': 1.2,
    },
}


export const KPI_BASE = {
    'percent': 1,
    'fot': 8.5,
}

export const KpiCalculator = (props: KpiCalculatorProps) => {
    const {total_sum, total_count} = props;

    const [baseAmount, setBaseAmount] = useState<string>(localStorage.getItem('baseAmount') || "60000");
    const setBaseAmountHandle = (e: ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/[^0-9]/g, '');
        localStorage.setItem('baseAmount', rawValue);
        setBaseAmount(rawValue);
    };
    const formattedBaseAmount = baseAmount
        ? Number(baseAmount).toLocaleString('ru-RU')
        : '';

    const [basePlan, setBasePlan] = useState(localStorage.getItem('basePlan') || "12000000");
    const setBasePlanHandle = (e: ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/[^0-9]/g, '');
        localStorage.setItem('basePlan', rawValue);
        setBasePlan(rawValue);
    };
    const formattedBasePlan = basePlan
        ? Number(basePlan).toLocaleString('ru-RU')
        : '';

    const [baseClaim, setBaseClaim] = useState(localStorage.getItem('baseClaim') || "2");
    const setBaseClaimHandle = (e: ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/[^0-9]/g, '');
        localStorage.setItem('baseClaim', rawValue);
        setBaseClaim(rawValue);
    };
    const formattedBaseClaim = baseClaim
        ? Number(baseClaim).toLocaleString('ru-RU')
        : '';

    const [baseFot, setBaseFot] = useState(localStorage.getItem('baseClaim') || "800000");
    const setBaseFotHandle = (e: ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/[^0-9]/g, '');
        localStorage.setItem('baseFot', rawValue);
        setBaseFot(rawValue);
    };
    const formattedBaseFot = baseFot
        ? Number(baseFot).toLocaleString('ru-RU')
        : '';


    const percent = Math.round(total_sum / 100);
    const formattedPercent = percent.toLocaleString('ru-RU') || '';

    const percentSum = useMemo(() => {
        return Math.round((total_sum - Number(basePlan)) / Number(basePlan) * 100);
    }, [basePlan, total_sum]);
    const kpiSumK = useMemo(() => {
        if (percentSum < KPI_PLAN['plan1']['%']) {
            return KPI_PLAN['plan1']['K'];
        } else if (percentSum < KPI_PLAN['plan2']['%']) {
            return KPI_PLAN['plan2']['K'];
        } else if (percentSum < KPI_PLAN['plan3']['%']) {
            return KPI_PLAN['plan3']['K'];
        } else {
            return KPI_PLAN['plan4']['K'];
        }
    }, [percentSum]);

    const percentClaim = useMemo(() => {
        return Number((Number(baseClaim) / total_count * 100).toFixed(2));
    }, [baseClaim, total_count])
    const kpiClaimK = useMemo(() => {
        if (percentClaim > KPI_CLAIM['claim1']['%']) {
            return KPI_CLAIM['claim1']['K'];
        } else if (percentClaim > KPI_CLAIM['claim2']['%']) {
            return KPI_CLAIM['claim2']['K'];
        } else if (percentClaim > KPI_CLAIM['claim3']['%']) {
            return KPI_CLAIM['claim3']['K'];
        } else {
            return KPI_CLAIM['claim4']['K'];
        }
    }, [percentClaim]);

    const fotResultPercent = useMemo(() => {
        return Number((Number(baseFot) / total_sum * 100).toFixed(2));
    }, [baseFot, total_sum]);
    const fotDelta = useMemo(() => {
        return Math.round(Number(total_sum * KPI_BASE['fot'] / 100 - total_sum * fotResultPercent / 100) / 1000);
    }, [fotResultPercent, total_sum]);
    const kpiFotK = useMemo(() => {
        return Number((1 + (KPI_BASE['fot'] - fotResultPercent) / 10).toFixed(2));
    }, [fotResultPercent])

    const kpiValue = Math.floor(Number(baseAmount) + percent * kpiSumK * kpiClaimK * kpiFotK);
    const formattedKpiValue = kpiValue.toLocaleString('ru-RU') || '';

    return (
        <div>
            <div className={'d-flex gap-3 align-items-center'}>
                <span className={'fw-bold'}>Ваш KPI:</span>

                <AppInput
                    style={{
                        width: '10rem',
                        fontSize: '1.8rem',
                    }}
                    className="bg-light text-black rounded-0"
                    readOnly={true}
                    value={`${formattedKpiValue} ₽`}
                />
                <div className={'d-flex align-items-center gap-1'}>
                    <b className={cls.calcValue}>{formattedBaseAmount} ₽</b><sup>БО</sup>
                    <b className={cls.calcValue}>+</b>
                    <b className={cls.calcValue}>{formattedPercent} ₽</b><sup>% об.</sup>
                    <b className={cls.calcValue}>*</b>
                    <b className={cls.calcValue}>{kpiClaimK}</b><sup>K.РЕКЛ</sup>
                    <b className={cls.calcValue}>*</b>
                    <b className={cls.calcValue}>{kpiFotK}</b><sup>К.ФОТ</sup>
                    <b className={cls.calcValue}>*</b>
                    <b className={cls.calcValue}>{kpiSumK}</b><sup>К.ПЛАН</sup>
                </div>
            </div>

            <div className={'px-1 pt-3 d-flex gap-4 align-items-center'}>
                <div>
                    <div>Рекламаций <sup>{percentClaim}%</sup></div>
                    <div className={'d-flex align-items-center gap-1'}>
                        <AppInput
                            style={{width: '10rem'}}
                            className="bg-light text-black rounded-0 text-end"
                            value={formattedBaseClaim}
                            onChange={setBaseClaimHandle}
                        /> изд.
                    </div>
                </div>
                <div>
                    <div>План <sup>рез.: {percentSum}%</sup></div>
                    <div className={'d-flex align-items-center gap-1'}>
                        <AppInput
                            style={{width: '10rem'}}
                            className="bg-light text-black rounded-0 text-end"
                            value={formattedBasePlan}
                            onChange={setBasePlanHandle}
                        /> ₽
                    </div>
                </div>
                <div>
                    <div>ФОТ <sup>{fotResultPercent}% {fotDelta.toLocaleString('ru-ru')}т.₽</sup></div>
                    <div className={'d-flex align-items-center gap-1'}>
                        <AppInput
                            style={{width: '10rem'}}
                            className="bg-light text-black rounded-0 text-end"
                            value={formattedBaseFot}
                            onChange={setBaseFotHandle}
                        /> ₽
                    </div>
                </div>
                <div>
                    <div>БО:</div>
                    <div className={'d-flex align-items-center gap-1'}>
                        <AppInput
                            style={{width: '10rem'}}
                            className="bg-light text-black rounded-0 text-end"
                            value={formattedBaseAmount}
                            onChange={setBaseAmountHandle}
                        /> ₽
                    </div>
                </div>
            </div>
        </div>
    );
};