import React, {memo, useCallback, useEffect, useState} from 'react';
import {useSelector} from "react-redux";

import {classNames} from "shared/lib/classNames/classNames";
import {eq_card} from "entities/EqPageCard";
import {tech_process_schema} from "entities/TechnologicalProcess";
import {TechProcessConstructor} from "widgets/TechProcessConstructor";
import {TechProcesWidget} from "widgets/TechProcesWidget";
import {TechProcessList} from "features/TechProcessList";
import {getEmployeePinCode} from "entities/Employee";
import {notificationsActions} from "widgets/Notification";
import {useAppDispatch} from "shared/lib/hooks/useAppDispatch/useAppDispatch";

import {useTechProcessMutation} from "../api/api";
import {eqFiltersActions} from "pages/EqPageNew";

interface TechProcessInfoProps {
    eqCard: eq_card;
    className?: string;
}


export const TechProcessInfo = memo((props: TechProcessInfoProps) => {
    const {
        className,
    } = props;

    const [eqCard, setEqCard] = useState<eq_card>(props.eqCard);

    useEffect(() => {
        setEqCard(props.eqCard);
    }, [props.eqCard]);


    const dispatch = useAppDispatch();
    const pinCode = useSelector(getEmployeePinCode);

    const [currentSchema, setCurrentSchema] = useState<tech_process_schema>({});

    const [postTechProcess] = useTechProcessMutation();

    const techProcessSelected = useCallback(() => {
        return !!eqCard?.product?.technological_process;
    }, [eqCard?.product?.technological_process]);


    const [showConstructor, setShowConstructor] = useState<boolean>(false);
    const [showSelectedTechProcess, setShowSelectedTechProcess] = useState<boolean>(techProcessSelected());
    const [showTechProcessList, setShowTechProcessList] = useState<boolean>(!techProcessSelected());

    const techProcessListCallback = (schema: tech_process_schema) => {
        setCurrentSchema(schema);
        setShowConstructor(true);
        setShowTechProcessList(false);
    };

    const constructorCancellationCallback = () => {
        setShowConstructor(false);
        if (!techProcessSelected()) {
            setShowTechProcessList(true);
            setShowSelectedTechProcess(false);
        } else {
            setShowTechProcessList(false);
            setShowSelectedTechProcess(true);
        }
    };

    const setTechProcess = async (schema: tech_process_schema) => {
        if (pinCode) {
            try {
                await postTechProcess({series_id: eqCard.series_id, schema: schema, pin_code: pinCode}).unwrap();
                dispatch(eqFiltersActions.addNotRelevantId(eqCard.series_id));
                setShowSelectedTechProcess(true);
                setShowTechProcessList(false);
                setShowConstructor(false);
            } catch (error) {
                dispatch(notificationsActions.addNotification({
                    date: Date.now(),
                    type: "ошибка",
                    title: "Ошибка сервера",
                    body: "Ошибка обработки запроса",
                    notAutoHide: true
                }))
            }
        }
    }

    return (
        <div className={classNames('', {}, [className])}>
            {showConstructor &&
                <TechProcessConstructor
                    className={'mb-3'}
                    schema={currentSchema}
                    onSubmitData={setTechProcess}
                    onCancellation={constructorCancellationCallback}
                />
            }
            {showSelectedTechProcess &&
                <TechProcesWidget
                    eqCard={eqCard}
                    hasChanged={showTechProcessList}
                    cancelCallback={() => setShowTechProcessList(false)}
                    editCallback={() => setShowTechProcessList(true)}
                />
            }
            {showTechProcessList &&
                <TechProcessList
                    constructorCallback={techProcessListCallback}
                    submitCallback={setTechProcess}
                />
            }
        </div>
    );
});