import React, {memo, useCallback, useEffect, useState} from 'react';
import {useSelector} from "react-redux";
import {Button} from "react-bootstrap";

import {classNames} from "shared/lib/classNames/classNames";
import {useAppDispatch} from "shared/lib/hooks/useAppDispatch/useAppDispatch";
import {eq_card} from "entities/EqPageCard";
import {assignment} from "entities/Assignment";

import cls from "./NumbersBlock.module.scss";
import {createEqNumberLists} from "../../../model/lib/createEqNumberLists/createEqNumberLists";
import {getSeriesSize} from "../../../../../../model/selectors/filtersSelectors/filtersSelectors";
import {setTargetNumber} from "../../../model/lib/setTargetNumber/setTargetNumber";
import {eqFiltersActions} from "../../../../../../model/slice/eqFiltersSlice";
import {Actions, fetchEqUpdateCard} from "../../../../../../model/service/apiDesktop/fetchEqUpdateCard";
import {EmployeePermissions, getEmployeeHasPermissions} from "../../../../../../../../entities/Employee";

interface NumbersBlockProps {
    eqCard: eq_card,
    disabled: boolean;
    assignments: assignment[];
    blockType: 'await' | 'in_work' | 'ready';
    setCardDisabled: (disable: boolean) => void;
    setShowCardInfo?: () => void;
}


export const NumbersBlock = memo((props: NumbersBlockProps) => {
    const {
        eqCard,
        disabled,
        assignments,
        blockType,
        setCardDisabled,
        setShowCardInfo,
    } = props;

    const dispatch = useAppDispatch();
    const seriesSize = useSelector(getSeriesSize);
    const [assignmentsLists, setAssignmentsLists] = useState(createEqNumberLists(assignments, seriesSize));

    useEffect(() => {
        setAssignmentsLists(createEqNumberLists(assignments, seriesSize))
    }, [assignments, seriesSize])

    const setNumber = (assignment_number: number) => {
        setAssignmentsLists(setTargetNumber(
            assignmentsLists.primary,
            assignmentsLists.secondary,
            assignmentsLists.confirmed,
            assignment_number)
        )
        dispatch(eqFiltersActions.setSeriesSize(1))
    }

    const hasConfirmAssignmentPermissions = useSelector(getEmployeeHasPermissions([
        EmployeePermissions.ELO_CONFIRM_ASSIGNMENT
    ]))

    const getTitle = blockType === 'await'
        ? "Номера в ожидании"
        : blockType === 'in_work'
            ? "Номера в работе"
            : "Готовые номера";

    const getAction = useCallback((first: boolean) => {
        if (blockType === 'await') {
            return Actions.AWAIT_TO_IN_WORK
        } else if (blockType === 'in_work' && first) {
            return Actions.IN_WORK_TO_READY
        } else if (blockType === 'in_work' && !first) {
            return Actions.IN_WORK_TO_AWAIT
        } else if (blockType === 'ready' && first) {
            return Actions.CONFIRMED
        } else {
            return Actions.READY_TO_IN_WORK
        }
    }, [blockType])

    const getButtonCallback = (first: boolean) => {
        if (blockType === 'await' && !first && setShowCardInfo) {
            setShowCardInfo();
        } else {
            setCardDisabled(true)
            dispatch(fetchEqUpdateCard({
                series_id: eqCard.series_id,
                numbers: assignmentsLists.primary,
                action: getAction(first),
                variant: 'mobile',
            })).then(() => {
                setCardDisabled(false);
                if (getAction(first) === Actions.CONFIRMED) {
                    dispatch(eqFiltersActions.weekDataHasUpdated())
                }
            })
        }
    };
    const getButtonIcon = (first: boolean) => {
        if (blockType === 'await' && first) {
            return <i className="fas fa-angle-double-down text-center" style={{fontSize: "35px"}}/>
        } else if (blockType === 'await' && !first) {
            return <i className="fas fa-info-circle fs-1"/>
        } else if (blockType === 'in_work' && first) {
            return <i className="fas fa-check fs-3"/>
        } else if (blockType === 'in_work' && !first) {
            return <i className="fas fa-angle-double-up text-center" style={{fontSize: "35px"}}/>
        } else if (blockType === 'ready' && first) {
            return <i className="fas fa-check-double fs-3"/>
        } else if (blockType === 'ready' && !first) {
            return <i className="fas fa-angle-double-up text-center" style={{fontSize: "35px"}}/>
        }
    }

    const getButtonVariant = (first: boolean) => {
        if (blockType === 'await' && first) {
            return 'primary';
        } else if (blockType === 'await' && !first) {
            return 'light';
        } else if (blockType === 'in_work' && first) {
            return 'success';
        } else if (blockType === 'in_work' && !first) {
            return 'secondary';
        } else if (blockType === 'ready' && first) {
            return 'success';
        } else if (blockType === 'ready' && !first) {
            return 'secondary';
        }
    }

    const firstButtonActive = useCallback(() => {
        if (assignmentsLists?.primary?.length > 0) {
            if (blockType === 'in_work' || blockType === 'await') {
                return true;
            }
            if (!eqCard?.product?.technological_process) {
                return false;
            } else if (hasConfirmAssignmentPermissions) {
                return true;
            }
        }
        return false;
    }, [assignmentsLists?.primary?.length, blockType, hasConfirmAssignmentPermissions, eqCard?.product?.technological_process])


    const secondButtonActive = useCallback(() => {
        if (blockType === 'await') {
            return true;
        }
        return assignmentsLists?.primary?.length > 0;

    }, [assignmentsLists?.primary?.length, blockType])

    const showSecondButton = useCallback(() => {
        return !(blockType === 'ready' && !hasConfirmAssignmentPermissions);
    }, [blockType, hasConfirmAssignmentPermissions])

    return (
        <div>
            <hr className="my-1 mb-0"/>
            <p className="text-nowrap fw-bold text-center d-flex justify-content-center align-items-center mb-0 pb-0">
                {getTitle}
            </p>

            <div className={classNames(cls.numberBlockWrapper, {}, ["d-flex flex-nowrap"])}>

                {showSecondButton() &&
                    <Button
                        disabled={disabled || !firstButtonActive()}
                        variant={getButtonVariant(true)}
                        size={'sm'}
                        className={classNames(cls.actionButton, {}, ['px-0 py-1 me-0 mb-0 mx-2'])}
                        type="button"
                        onClick={() => getButtonCallback(true)}
                    >
                        {getButtonIcon(true)}
                    </Button>
                }

                <div className={classNames(
                    cls.numbersWrapper,
                    {},
                    ["border-secondary d-flex mx-1 px-1 ps-0"]
                )}
                >
                    {assignmentsLists.primary?.map((number) => (
                        <Button
                            disabled={disabled}
                            key={number}
                            variant={'primary'}
                            size={'sm'}
                            className={
                                classNames(
                                    cls.numberButton,
                                    {},
                                    ["fs-5 fw-bold flex-shrink-0 m-0 p-0 ms-1"])
                            }
                            type="button"
                        >
                            {number}
                        </Button>
                    ))}
                    {assignmentsLists.secondary?.map((number) => (
                        <Button
                            disabled={disabled}
                            key={number}
                            onClick={() => setNumber(number)}
                            variant={'secondary'}
                            size={'sm'}
                            className={
                                classNames(
                                    cls.numberButton,
                                    {},
                                    ["fs-5 fw-bold flex-shrink-0 m-0 p-0 ms-1"])
                            }
                            type="button"
                        >
                            {number}
                        </Button>
                    ))}
                    {assignmentsLists.confirmed?.map((number) => (
                        <Button
                            disabled={disabled}
                            key={number}
                            variant={'success'}
                            size={'sm'}
                            className={
                                classNames(
                                    cls.numberButton,
                                    {},
                                    ["fs-5 fw-bold flex-shrink-0 m-0 p-0 ms-1"])
                            }
                            type="button"
                        >
                            {number}
                        </Button>
                    ))}

                </div>

                <Button
                    disabled={disabled || !secondButtonActive()}
                    variant={getButtonVariant(false)}
                    size={'sm'}
                    className={classNames(cls.actionButton, {}, ['px-0 py-1 mb-0 mx-2'])}
                    type="button"
                    onClick={() => getButtonCallback(false)}
                >
                    {getButtonIcon(false)}
                </Button>

            </div>
        </div>
    );
});