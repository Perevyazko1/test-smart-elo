import React, {memo, useCallback, useEffect, useState} from 'react';
import {Container, Form, Table} from "react-bootstrap";

import {classNames, Mods} from "shared/lib/classNames/classNames";
import {tech_process_schema} from "entities/TechnologicalProcess";
import {DepartmentConsts} from "entities/Department";

import {checkSchemaValid} from "./model/lib/checkSchemaValid";


interface TechProcessWidgetProps {
    disabled?: boolean,
    className?: string,
    schema?: tech_process_schema,
    onSubmitData?: (data: tech_process_schema) => void,
    onCancellation?: () => void,
}


export const TechProcessWidget = memo((props: TechProcessWidgetProps) => {
    const {
        disabled = false,
        className,
        schema,
        onSubmitData,
        onCancellation,
        ...otherProps
    } = props

    const [actualSchema, setActualSchema] = useState<tech_process_schema>(schema || {})
    const [schemaValid, setSchemaValid] = useState<boolean>(checkSchemaValid(actualSchema))

    const departments = Object.values(DepartmentConsts).filter(name => name !== DepartmentConsts.D1)

    const edit_tech_process = useCallback((key: string, value: string) => {
        setActualSchema((prevData) => {
            const newData: tech_process_schema = {...prevData};

            if (newData.hasOwnProperty(key)) {
                if (newData[key].includes(value)) {
                    const filteredValues = newData[key].filter((item) => item !== value);
                    if (filteredValues.length > 0) {
                        newData[key] = filteredValues;
                    } else {
                        delete newData[key];
                    }
                } else {
                    newData[key] = [...newData[key], value];
                }
            } else {
                newData[key] = [value];
            }

            return newData;
        });
    }, []);

    useEffect(() => {
        setSchemaValid(checkSchemaValid(actualSchema))
    }, [actualSchema])

    const mods: Mods = {};

    return (
        <Container
            className={classNames('', mods, [className])}
            {...otherProps}
        >
            <Table
                striped bordered hover size="sm"
                className={'w-100 caption-top'}
            >
                {!disabled &&
                    <caption>
                        Отметить в каждой строке в какой отдел будет передан полуфабрикат
                    </caption>
                }
                <thead>
                <tr>
                    <th
                        style={{width: "120px"}}
                    >
                        #
                    </th>
                    {departments.slice(1).map((name) => (
                        <th
                            key={name}
                            style={{
                                width: '80px',
                                wordBreak: 'break-all',
                                verticalAlign: "middle"
                            }}
                            className={'text-center'}
                        >
                            {name}
                        </th>
                    ))}
                </tr>
                </thead>
                <tbody>

                {departments.slice(0, -1).map((name) => (
                    <tr key={name}>
                        <td
                            className={'fw-bold'}
                        >
                            {name}
                        </td>

                        {departments.slice(1).map((_, index2) => (
                            <td
                                key={index2}
                                align="center"
                            >
                                {name !== departments.slice(1)[index2]
                                    ?
                                    <Form.Check
                                        type={'checkbox'}
                                        style={{transform: "scale(1.5)"}}
                                        defaultChecked={
                                            actualSchema[name]
                                                ? actualSchema[name].includes(departments.slice(1)[index2])
                                                : false
                                        }
                                        disabled={disabled}

                                        onChange={() => {
                                            edit_tech_process(name, departments[index2 + 1])
                                        }}
                                    />
                                    :
                                    <>
                                        #
                                    </>
                                }
                            </td>
                        ))}
                    </tr>
                ))}
                </tbody>
            </Table>

            <div>

                {!disabled && onSubmitData &&
                    <button
                        disabled={!schemaValid}
                        type={'button'}
                        className={'btn btn-success'}
                        onClick={() => onSubmitData(actualSchema)}
                    >
                        Подтвердить
                    </button>
                }

                {!disabled && onCancellation &&
                    <button
                        type={'button'}
                        className={'btn btn-warning mx-3'}
                        onClick={() => onCancellation()}
                    >
                        Отмена
                    </button>
                }
            </div>

        </Container>
    );
});