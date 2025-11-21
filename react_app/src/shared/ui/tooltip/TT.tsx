import type {ReactNode} from "react";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip.tsx";


interface TTProps {
    children: ReactNode;
    description: string;
    asChild?: boolean;
    className?: string;
}

export const TT = (props: TTProps) => {
    const {children, description, asChild=false, className} = props;

    return (
        <Tooltip>
            <TooltipTrigger asChild={asChild}>
                {children}
            </TooltipTrigger>
            <TooltipContent>
                <p className={className}>{description}</p>
            </TooltipContent>
        </Tooltip>
    );
};