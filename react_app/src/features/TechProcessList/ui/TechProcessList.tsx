import {memo} from 'react';
import {Button, Table} from "react-bootstrap";

import {tech_process_schema} from "entities/TechnologicalProcess";
import {GET_STATIC_URL} from "shared/const/server_config";
import {Mods} from "shared/lib/classNames/classNames";

import {useTechProcessList} from "../api/api";

interface TechProcessListProps {
    className?: string;
    constructorCallback: (schema: tech_process_schema) => void;
}


export const TechProcessList = memo((props: TechProcessListProps) => {
    const {
        className,
        constructorCallback,
    } = props;

    const {data, isLoading} = useTechProcessList(null);

    return (
        <>
            {isLoading ? "Загрузка..." :

                <Table striped bordered hover className={className}>

                    <thead>
                    <tr>
                        <td colSpan={4} className={"fw-bold text-center bg-gradient bg-light"}>
                            Выберите технологический процесс:
                        </td>
                    </tr>

                    <tr>
                        <th>Изображение</th>
                        <th>Название</th>
                        <th>
                            Выбрать
                        </th>
                    </tr>
                    </thead>

                    <tbody>
                    {data?.tech_processes?.map((tech_process) => (
                        <tr key={tech_process.name}>
                            <td>
                                <img
                                    src={GET_STATIC_URL() + tech_process.image}
                                    alt={tech_process.name}
                                    style={{maxWidth: "500px", maxHeight: "400px"}}
                                    loading={'lazy'}
                                />
                            </td>
                            <td>{tech_process.name}</td>
                            <td>
                                <div className={'d-flex flex-column'}
                                >
                                    <Button type={'button'}
                                            variant={'success'}
                                            onClick={() => console.log(tech_process.id)}
                                    >
                                        Выбрать
                                    </Button>

                                    <Button type={'button'}
                                            style={{maxWidth: '120px'}}
                                            className={'mt-4'}
                                            onClick={() => constructorCallback(tech_process.schema)}
                                    >
                                        Создать на основании данного
                                    </Button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    <tr>
                        <td colSpan={3}>
                            <Button type={'button'}
                                    className={'my-4 w-100'}
                                    onClick={() => constructorCallback({})}
                            >
                                Создать новый технологический процесс
                            </Button>
                        </td>
                    </tr>

                    </tbody>

                </Table>
            }
        </>
    );
});