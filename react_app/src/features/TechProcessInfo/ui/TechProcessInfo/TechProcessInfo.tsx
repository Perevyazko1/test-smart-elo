import React, {memo, useCallback, useState} from 'react';

import {classNames} from "shared/lib/classNames/classNames";
import {eq_card} from "entities/EqPageCard";
import {tech_process_schema} from "entities/TechnologicalProcess";
import {TechProcessConstructor} from "widgets/TechProcessConstructor";
import {TechProcesWidget} from "widgets/TechProcesWidget";
import {TechProcessList} from "features/TechProcessList";

interface TechProcessInfoProps {
    eqCard: eq_card;
    className?: string;
}


export const TechProcessInfo = memo((props: TechProcessInfoProps) => {
    const {
        eqCard,
        className,
    } = props;

    const techProcessConfirmed = useCallback(() => {
        return !!eqCard?.product?.technological_process_confirmed
    }, [eqCard?.product?.technological_process_confirmed]);

    const techProcessSelected = useCallback(() => {
        return !!eqCard?.product?.technological_process
    }, [eqCard?.product?.technological_process]);

    const [currentSchema, setCurrentSchema] = useState<tech_process_schema>();

    const [showConstructor, setShowConstructor] = useState<boolean>(false);
    const [showSelectedTechProcess, setShowSelectedTechProcess] = useState<boolean>(techProcessSelected());
    const [showTechProcessList, setShowTechProcessList] = useState<boolean>(!techProcessSelected());

    return (
        <div className={classNames('', {}, [className])}>
            {showConstructor &&
                <TechProcessConstructor
                    className={'mb-3'}
                    schema={currentSchema || {}}
                    onSubmitData={(data) => setCurrentSchema(data)}
                    onCancellation={() => console.log('Closed')}
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
                <TechProcessList constructorCallback={(schema) => setShowConstructor(true)}/>
            }
        </div>
    );
});