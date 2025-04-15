import {AppTooltip} from "@shared/ui";

interface ProgresBarProps {
    width: string;
    bg: string;
    value: number;
    unit: "₽" | " изд." | "%" | " пом.";
    title: string;
    formatValue?: boolean;
}

export const ProgresBar = (props: ProgresBarProps) => {
    const {width, bg, value, unit, title, formatValue = true} = props;

    const fValue = Math.floor(value).toLocaleString('ru-RU');

    return (
        <div className={'px-1 text-center border-black border'}
             style={{
                 width: width,
                 backgroundColor: bg,
                 minWidth: `fit-content`,
             }}
        >
            <AppTooltip title={title} classNames={'w-100'}>
                <>{formatValue ? fValue : value}{unit}</>
            </AppTooltip>
        </div>
    );
};