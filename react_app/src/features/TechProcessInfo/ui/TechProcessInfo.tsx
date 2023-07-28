import React, {memo, useEffect, useState} from 'react';

import {classNames} from "shared/lib/classNames/classNames";
import {product} from "entities/Product";
import {tech_process_schema, technological_process} from "entities/TechnologicalProcess";
import {TechProcesWidget} from "widgets/TechProcesWidget";

import {TechProcessList} from "../../TechProcessList";

interface TechProcessInfoProps {
    product: product;
    className?: string;
    updCallback?: () => void;
}

export const TechProcessInfo = memo((props: TechProcessInfoProps) => {
    const {
        updCallback,
        className,
    } = props;

    const [product, setProduct] = useState<product>(props.product);

    const initialShowTechProcessList = () => {
        return !product.technological_process;
    }

    const initialCurrentSchema = () => {
        if (product.technological_process && !product.technological_process.image) {
            return product.technological_process.schema
        } else {
            return {}
        }
    }

    const initialCurrentTechProcess = () => {
        if (product.technological_process && product.technological_process.image) {
            return product.technological_process
        } else {
            return null
        }
    }

    const [showTechProcessWidget, setShowTechProcessWidget] = useState<boolean>(false);
    const [showTechProcessList, setShowTechProcessList] = useState<boolean>(initialShowTechProcessList());
    const [currentSchema, setCurrentSchema] = useState<tech_process_schema>(initialCurrentSchema());
    const [currentTechProcess, setCurrentTechProcess] = useState<technological_process | null>(initialCurrentTechProcess());

    useEffect(() => {
        setProduct(props.product);
    }, [props.product]);

    const setConstructorClb = (schema: tech_process_schema) => {
        setCurrentSchema(schema)
        setShowTechProcessList(false)
        setShowTechProcessWidget(true)
    }

    const setTechProcessClb = (techProcess: technological_process) => {
        setCurrentSchema(techProcess.schema)
        setCurrentTechProcess(techProcess)
        setShowTechProcessList(false)
        setShowTechProcessWidget(true)
    }

    const editClb = () => {
        const productWithTechProcess = !!product.technological_process;
        const techProcessHasImage = !!product.technological_process?.image;
        const showWidget = productWithTechProcess && !techProcessHasImage;

        setShowTechProcessList(true)
        setShowTechProcessWidget(showWidget)
        setCurrentSchema(showWidget ? product.technological_process?.schema || {} : {})
        setCurrentTechProcess(null)
    }

    const hideAll = () => {
        setShowTechProcessList(false)
        setShowTechProcessWidget(false)
        setCurrentSchema({})
        setCurrentTechProcess(null)
    }

    return (
        <div className={classNames('', {}, [className])}>
            {
                product.technological_process &&
                <>
                    <TechProcesWidget
                        product={product}
                        editClb={editClb}
                        closeEditClb={hideAll}
                        editState={showTechProcessList || showTechProcessWidget}
                    />
                    <hr/>
                </>

            }

            {showTechProcessWidget &&
                <TechProcesWidget
                    product={product}
                    schema={currentSchema || currentTechProcess?.schema}
                    imageUrl={currentTechProcess?.image}
                    updCallback={updCallback}
                    closeEditClb={hideAll}
                />
            }

            {showTechProcessList &&
                <TechProcessList
                    constructorCallback={(schema) => setConstructorClb(schema)}
                    submitCallback={(schema) => setTechProcessClb(schema)}
                />
            }
        </div>
    );
});