import {getHumansDatetime} from "@shared/lib";
import {EqNumberListTipe} from "@widgets/EqCard/model/lib/createEqNumberLists";
import {EqOrderProduct} from "@widgets/EqCardList";
import {useMemo} from "react";
import {appDays} from "@pages/EqPage/model/lib/getNextDays";


interface CardPlanDateProps {
    card: EqOrderProduct;
    assignmentsLists: EqNumberListTipe;
}

interface CardInfo {
    backgroundColor: string;
    text: string;
}

export const CardPlanDate = (props: CardPlanDateProps) => {
    const {assignmentsLists} = props;

    const getCardInfo = useMemo((): CardInfo => {
        const backgroundColors = [
            '#81C784', // Понедельник — мягкий зеленый
            '#FFB74D', // Вторник — теплый оранжевый
            '#FFF176', // Среда — светлая желтая
            '#4FC3F7', // Четверг — спокойный голубой
            '#7986CB', // Пятница — нежный индиго
            '#BA68C8', // Суббота — мягкий фиолетовый
            '#F06292'  // Воскресенье — деликатный розовый
        ];

        const planDate = assignmentsLists.primary[0].plane_date;
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
                backgroundColor: '#e10000',
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
            text: `${appDays[dateTime.getDay()]}`,
        };
    }, [assignmentsLists.primary]);


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