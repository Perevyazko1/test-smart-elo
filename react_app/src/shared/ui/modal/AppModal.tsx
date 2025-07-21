import {type ReactNode, useState} from "react";

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog.tsx";
import {Btn} from "@/shared/ui/buttons/Btn.tsx";

interface AppModalProps {
    trigger: ReactNode;
    content: ReactNode;
    title: string;
    description: string;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export const AppModal = (props: AppModalProps) => {
    const {open, trigger, content, title, description, onOpenChange} = props;

    const [internalOpen, setInternalOpen] = useState(false);
    const isOpen = open !== undefined ? open : internalOpen;
    const handleOpenChange = onOpenChange || setInternalOpen;

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-yellow-100 max-h-screen overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>
                        {description}
                    </DialogDescription>
                </DialogHeader>

                {content}

                <DialogFooter>
                    <DialogClose asChild>
                        <Btn
                            bg={"white"}
                        >
                            Закрыть окно
                        </Btn>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};