import type {ReactNode} from "react";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip.tsx";


interface TTProps {
    children: ReactNode;
    description: string;
    asChild?: boolean;
}

export const TT = (props: TTProps) => {
    const {children, description, asChild=false} = props;

    return (
        <Tooltip>
            <TooltipTrigger asChild={asChild}>
                {children}
            </TooltipTrigger>
            <TooltipContent>
                <p>{description}</p>
            </TooltipContent>
        </Tooltip>
    );
};