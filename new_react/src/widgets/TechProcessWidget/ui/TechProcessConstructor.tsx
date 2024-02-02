import React, {memo, useCallback, useEffect, useState} from 'react';
import {Container, Form, Table} from "react-bootstrap";
import {TechProcessSchema} from "@entities/TechProcess";

import {checkSchemaValid} from "../model/lib/checkSchemaValid";
import {DepartmentConsts} from "../model/consts/consts";


interface TechProcessConstructorProps {
    disabled?: boolean,
    className?: string,
    schema?: TechProcessSchema,
    callback?: (schema: TechProcessSchema) => void,
    isValidClb?: (valid: boolean) => void,
}


export const TechProcessConstructor = memo((props: TechProcessConstructorProps) => {
    const {
        disabled = false,
        className,
        schema,
        callback,
        isValidClb,
        ...otherProps
    } = props;

    const [actualSchema, setActualSchema] = useState<TechProcessSchema>(schema || {})
    const [schemaValid, setSchemaValid] = useState<boolean>(checkSchemaValid(actualSchema))

    const departments = Object.values(DepartmentConsts).filter(name => name !== DepartmentConsts.D1)

    const edit_tech_process = useCallback((key: string, value: string) => {
        setActualSchema((prevData) => {
            const newData: TechProcessSchema = {...prevData};

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
        // eslint-disable-next-line
    }, [actualSchema])

    useEffect(() => {
        if (callback && isValidClb) {
            if (schemaValid) {
                callback(actualSchema)
            }
            isValidClb(schemaValid)
        }
        // eslint-disable-next-line
    }, [schemaValid])

    return (
        <Container
            className={className}
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

        </Container>
    );
});