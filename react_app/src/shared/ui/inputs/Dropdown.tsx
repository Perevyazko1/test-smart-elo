import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover.tsx";
import {Btn} from "@/shared/ui/buttons/Btn.tsx";
import {Check, ChevronsUpDown} from "lucide-react";
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from "@/components/ui/command.tsx";
import {twMerge} from "tailwind-merge";
import {useState} from "react";

interface IProps<T> {
    items: T[] | undefined | null;
    selectedItem: T | undefined | null;
    setSelectedItem: (arg: T | undefined | null) => void;
    getItemLabel: (arg: T | undefined | null) => string;
    resetItem?: string;
    className?: string;
    disabled?: boolean;
}

export function Dropdown<T>(props: IProps<T>) {
    const {items, setSelectedItem, selectedItem, getItemLabel, className, disabled = false, resetItem} = props;
    const [open, setOpen] = useState(false);

    return (
        <Popover
            open={open}
            onOpenChange={setOpen}
        >
            <PopoverTrigger asChild className={"w-full disabled:text-black"} disabled={disabled}>
                <Btn
                    role="combobox"
                    aria-expanded={open}
                    className={
                        twMerge(
                            "justify-between flex bg-black text-white gap-4 capitalize text-nowrap",
                            className
                        )
                    }

                >
                    {getItemLabel(selectedItem)}
                    {!disabled && (
                        <ChevronsUpDown className="opacity-50"/>
                    )}
                </Btn>
            </PopoverTrigger>
            <PopoverContent className="w-[250px] p-0">
                <Command>
                    <CommandInput placeholder="Поиск..." className="h-9"/>
                    <CommandList>
                        <CommandEmpty>Не найдено совпадений</CommandEmpty>
                        <CommandGroup>
                            {resetItem && (
                                <CommandItem
                                    value={resetItem}
                                    onSelect={() => {
                                        setSelectedItem(null)
                                        setOpen(false)
                                    }}
                                >
                                    <span className={'capitalize'}>{resetItem}</span>
                                    <Check
                                        className={twMerge(
                                            "ml-auto",
                                            selectedItem === null ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                </CommandItem>
                            )}
                            {items?.map((item, index) => (
                                <CommandItem
                                    key={index}
                                    value={getItemLabel(item)}
                                    onSelect={() => {
                                        setSelectedItem(
                                            item === selectedItem ? null : item
                                        )
                                        setOpen(false)
                                    }}
                                >
                                    <span className={'capitalize'}>{getItemLabel(item)}</span>
                                    <Check
                                        className={twMerge(
                                            "ml-auto",
                                            selectedItem === item ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}