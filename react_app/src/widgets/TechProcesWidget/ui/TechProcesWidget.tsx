import {memo, useCallback} from 'react';
import {Button, Table} from "react-bootstrap";

import {eq_card} from "entities/EqPageCard";
import {GET_STATIC_URL} from "../../../shared/const/server_config";
import {TechProcessConstructor} from "../../TechProcessConstructor";

interface TechProcesWithImageProps {
    eqCard: eq_card;
    hasChanged: boolean;
    editCallback?: () => void;
    cancelCallback?: () => void;
    className?: string;
}


export const TechProcesWidget = memo((props: TechProcesWithImageProps) => {
    const {
        eqCard,
        hasChanged = false,
        editCallback,
        cancelCallback,
        className,
    } = props;

    const techProcessConfirmed = useCallback(() => {
        return !!eqCard?.product?.technological_process_confirmed
    }, [eqCard?.product?.technological_process_confirmed]);

    const techProcessSelected = useCallback(() => {
        return !!eqCard?.product?.technological_process
    }, [eqCard?.product?.technological_process]);

    const getImageSrc = useCallback(() => {
        if (eqCard.product.technological_process?.image) {
            return GET_STATIC_URL() + eqCard.product.technological_process?.image
        } else {
            return null
        }
    }, [eqCard.product.technological_process?.image])

    return (
        <Table striped bordered hover className={className}>
            <thead>
            <tr>
                <td colSpan={3} className={"fw-bold text-center bg-gradient bg-light"}>
                    Текущий технологический процесс
                </td>
            </tr>
            <tr>
                <th>Изображение</th>
                <th>Название</th>
                <th>
                    {techProcessConfirmed() ? "Подтвердил" : "Изменить"}
                </th>
            </tr>
            </thead>
            <tbody>

            {techProcessSelected() &&
                <tr>
                    <td>
                        {getImageSrc()
                            ?
                            <img src={getImageSrc() || ""}
                                 alt={'Без изображения'}
                                 loading={"lazy"}
                                 style={{maxHeight: '400px', maxWidth: '500px'}}
                            />
                            :
                            <TechProcessConstructor schema={eqCard.product.technological_process?.schema}
                                                    disabled={true}
                            />
                        }
                    </td>
                    <td>
                        {eqCard.product.technological_process?.name}
                    </td>
                    <td>
                        {techProcessConfirmed()
                            ?
                            <div>
                                {eqCard.product.technological_process_confirmed?.first_name
                                    + " " +
                                    eqCard.product.technological_process_confirmed?.last_name
                                }
                            </div>
                            :
                            <>
                                {hasChanged ?
                                    <Button type={'button'}
                                            variant={'warning'}
                                            onClick={cancelCallback}>
                                        Отмена
                                    </Button> :
                                    <Button type={'button'}
                                            variant={'success'}
                                            onClick={editCallback}>
                                        Изменить
                                    </Button>}
                            </>
                        }
                    </td>
                </tr>
            }
            </tbody>
        </Table>
    );
});