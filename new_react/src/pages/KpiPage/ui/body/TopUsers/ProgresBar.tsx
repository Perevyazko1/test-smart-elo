import {AppTooltip} from "@shared/ui";

interface ProgresBarProps {
    width: string;
    bg: string;
    value: number;
    unit: "₽" | " изд." | "%" | " пом.";
    title: string;
}

export const ProgresBar = (props: ProgresBarProps) => {
    const {width, bg, value, unit, title} = props;

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
                <>{fValue}{unit}</>
            </AppTooltip>
        </div>
    );
};