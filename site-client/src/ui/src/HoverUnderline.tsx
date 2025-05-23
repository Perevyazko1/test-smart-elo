import {cx} from "@/utils/class-builder";

export const HoverUnderline = () => {
    // parent component must be relative & group
    return (
        <span className={cx([
            'h-1 bg-b_7C origin-center transition-all absolute -bottom-1 -left-3 -right-3 scale-0',
            'group-hover:scale-100',
        ])}/>
    );
};