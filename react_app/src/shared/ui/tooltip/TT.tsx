import type {ReactNode} from "react";
import {ExitIcon} from "@radix-ui/react-icons";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip.tsx";
import {Btn} from "@/shared/ui/buttons/Btn.tsx";


interface TTProps {
    children: ReactNode;
    description: string;
}

export const TT = (props: TTProps) => {
    const {children, description} = props;

    return (
        <Tooltip>
            <TooltipTrigger>
                {children}
            </TooltipTrigger>
            <TooltipContent>
                <p>{description}</p>
            </TooltipContent>
        </Tooltip>
    );
};