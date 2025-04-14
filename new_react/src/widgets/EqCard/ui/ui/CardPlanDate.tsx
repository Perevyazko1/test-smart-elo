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

// Константы цветов для дней недели
const BACKGROUND_COLORS = [
    "#b771c3", // Воскресенье
    "#baf8c2", // Понедельник
    "#78bddc", // Вторник
    "#e8ce86", // Среда
    "#e4905b", // Четверг
    "#ff909b", // Пятница
    "#7b88cf", // Суббота
] as const;

const DEFAULT_COLOR = "#becdd2";
const OVERDUE_COLOR = "#d82929";
const FAR_FUTURE_COLOR = "#cee0c7";

// Функция для вычисления разницы в днях
const getDaysDifference = (planDate: string | Date): number => {
    const dateTime = new Date(planDate);
    const now = new Date();

    if (isNaN(dateTime.getTime())) {
        throw new Error("Invalid date provided");
    }

    // Убираем время, сравниваем только даты
    dateTime.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);

    const diffInMs = dateTime.getTime() - now.getTime();
    return Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
};

export const CardPlanDate = ({assignmentsLists}: CardPlanDateProps) => {
    const getCardInfo = useMemo((): CardInfo => {
        const planDate = assignmentsLists[0]?.plane_date;

        // Нет даты
        if (!planDate) {
            return {
                backgroundColor: DEFAULT_COLOR,
                text: "БЕЗ ДАТЫ",
            };
        }

        const dateTime = new Date(planDate);
        if (isNaN(dateTime.getTime())) {
            return {
                backgroundColor: DEFAULT_COLOR,
                text: "ОШИБКА ДАТЫ",
            };
        }

        const diffDays = getDaysDifference(planDate);

        // Просрочено
        if (diffDays < 0) {
            return {
                backgroundColor: OVERDUE_COLOR,
                text: "ПРОСРОЧЕН",
            };
        }

        // Более 7 дней
        if (diffDays > 7) {
            return {
                backgroundColor: FAR_FUTURE_COLOR,
                text: getHumansDatetime(planDate, "DD-MM"),
            };
        }

        // В пределах недели
        return {
            backgroundColor: BACKGROUND_COLORS[dateTime.getDay()],
            text: `${appDays[dateTime.getDay()]} ${getHumansDatetime(planDate, "DD-MM")}`,
        };
    }, [assignmentsLists]);

    return (
        <div
            className="card-plan-date rounded py-1 fw-bold"
            style={{
                writingMode: "vertical-rl",
                fontSize: "10px",
                backgroundColor: getCardInfo.backgroundColor,
            }}
        >
            {getCardInfo.text}
        </div>
    );
};