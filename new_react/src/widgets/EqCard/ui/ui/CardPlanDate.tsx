import {getHumansDatetime} from "@shared/lib";
import {EqAssignment, EqOrderProduct} from "@widgets/EqCardList";
import {useMemo} from "react";
import {appDays} from "@pages/EqPage/model/lib/getNextDays";


interface CardPlanDateProps {
    card: EqOrderProduct;
    assignmentsLists: EqAssignment[];
}

interface CardInfo {
    backgroundColor: string;
    text: string;
}

export const CardPlanDate = (props: CardPlanDateProps) => {
    const {assignmentsLists} = props;

    const getCardInfo = useMemo((): CardInfo => {
        const backgroundColors = [
            '#b771c3', // Воскресенье
            '#baf8c2', // Понедельник
            '#78bddc', // Вторник
            '#e8ce86', // Среда
            '#e4905b', // Четверг
            '#ff909b', // Пятница
            '#7b88cf', // Суббота
        ];

        const planDate = assignmentsLists[0]?.plane_date;

        if (!planDate) {
            return {
                backgroundColor: '#becdd2',
                text: "БЕЗ ДАТЫ",
            };
        }

        const dateTime = new Date(planDate);
        const now = new Date();

        if (now.getDate() > dateTime.getDate()) {
            return {
                backgroundColor: '#d82929',
                text: "ПРОСРОЧЕН",
            };
        }

        const diffDays = Math.floor((dateTime.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays > 7) {
            return {
                backgroundColor: '#cee0c7',
                text: `${getHumansDatetime(planDate, 'DD-MM')}`,
            };
        }

        return {
            backgroundColor: backgroundColors[dateTime.getDay()],
            text: `${appDays[dateTime.getDay()]} ${getHumansDatetime(planDate, 'DD-MM')}`,
        };
    }, [assignmentsLists]);


    return (
        <div
            className={'rounded py-1 fw-bold'}
            style={{
                writingMode: 'vertical-rl',
                fontSize: '10px',
                backgroundColor: getCardInfo.backgroundColor
            }}>
            {getCardInfo.text}
        </div>
    );
};