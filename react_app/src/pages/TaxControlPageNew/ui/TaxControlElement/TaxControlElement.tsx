import React from 'react';
import {Button} from "react-bootstrap";
import {Slider} from "../../../../shared/ui/Slider/Slider";
import {AppInput} from "../../../../shared/ui/AppInput/AppInput";


interface TaxControlElementProps {
    className?: string;
    department: string;
    color: string;
}


export const TaxControlElement = (props: TaxControlElementProps) => {

    const {
        className,
        department,
        color,
    } = props;

    const images = [
        '/media/images/products/8e5b5bb0-5399-11ed-0a80-05c20039448a__pragamini-tahta001_aisGvb2.jpg',
        '/media/images/products/0f001a40-1706-11ed-0a80-0459002f10bb__risunok3_9J5ES0O.png',
    ]

    return (
        <>
            <tr>
                <td rowSpan={2}>
                    <Slider
                        images={images}
                        width={'70px'}
                        height={'70px'}
                    />
                </td>
                <td rowSpan={2}>
                    Угловой диван / "Монреаль" / База / (сп.м. 2,0х1,5 м, ф. Г, стол)
                </td>
                <td style={{background: color}} rowSpan={2}>
                    <div className={'d-flex align-items-center'}>
                        <div>

                            {department}

                            <hr className={'m-1'}/>

                            <Button
                                size={'sm'}
                                variant={'secondary'}
                            >
                                История
                            </Button>
                        </div>
                    </div>
                </td>
                <td>
                    Утверд.{'->'}
                </td>
                <td>
                    <AppInput
                        inputSize={'sm'}
                        type={'number'}
                        style={{width: "100px"}}
                        defaultValue={400}
                        disabled
                    />
                </td>
                <td>
                    12.08.2023
                </td>
                <td>
                    Харченко Д.
                </td>
                <td>
                    <Button
                        size={'sm'}
                        variant={'success'}
                    >
                        Утвердить
                    </Button>
                </td>
            </tr>

            <tr>
                <td className={'bg-danger bg-gradient fw-bold'}>
                    Предл.{'->'}
                </td>
                <td>
                    <AppInput
                        inputSize={'sm'}
                        type={'number'}
                        style={{width: "100px"}}
                        defaultValue={500}
                    />
                </td>
                <td>
                    14.08.2023
                </td>
                <td>
                    Великий Д.
                </td>
                <td>
                    <Button
                        size={'sm'}
                        variant={'warning'}
                    >
                        Предложить
                    </Button>
                </td>
            </tr>

            <tr>
                <td colSpan={3}>
                    <p>08.08.2023 - Назначение тарифа №1 </p>
                    <p>08.08.2023 - Назначение тарифа №1 </p>
                    <p>08.08.2023 - Назначение тарифа №1 </p>
                    <p>08.08.2023 - Назначение тарифа №1 </p>
                    <p>08.08.2023 - Назначение тарифа №1 </p>
                    <p>08.08.2023 - Назначение тарифа №1 </p>
                    <p>08.08.2023 - Назначение тарифа №1 </p>
                </td>
                <td colSpan={5}>
                    <p>Харченко Д. Тариф: 500. Предложил Великий Д.</p>
                    <p>Харченко Д. Тариф: 500. Предложил Великий Д.</p>
                    <p>Харченко Д. Тариф: 500. Предложил Великий Д.</p>
                    <p>Харченко Д. Тариф: 500. Предложил Великий Д.</p>
                    <p>Харченко Д. Тариф: 500. Предложил Великий Д.</p>
                    <p>Харченко Д. Тариф: 500. Предложил Великий Д.</p>
                    <p>Харченко Д. Тариф: 500. Предложил Великий Д.</p>
                </td>
            </tr>
        </>
    );
};
