import React, {memo} from 'react';
import {Form, Table} from "react-bootstrap";

import {classNames, Mods} from "shared/lib/classNames/classNames";
import {tech_process_schema} from "entities/TechnologicalProcess";


interface TechProcessWidgetProps {
    className?: string,
    departments: string[],
    schema?: tech_process_schema
}


export const TechProcessWidget = memo((props: TechProcessWidgetProps) => {
    const {
        className,
        departments,
        schema,
        ...otherProps
    } = props

    const mods: Mods = {};

    return (
        <Table
            striped bordered hover size="sm"
            className={classNames('w-100 caption-top', mods, [className])}
            {...otherProps}
        >
            <caption>
                Отметить в каждой строке в какой отдел будет передан полуфабрикат
            </caption>
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

            {departments.slice(0, -1).map((name, index) => (
                <tr key={name}>
                    <td>{name}</td>

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
                                    checked={
                                        schema
                                            ? schema[name].includes(departments.slice(1)[index2])
                                            : false
                                    }
                                    onChange={() => console.log('Chacked')}
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
    );
});