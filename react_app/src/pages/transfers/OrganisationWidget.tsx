import {DraggableOrganisation} from "@/pages/transfers/DraggableOrganisation.tsx";
import {useDragLayer} from "react-dnd";
import {FINAL_SOURCE, ItemTypes, ORGANISATIONS} from "@/pages/transfers/types.ts";
import {OrganisationDropZone} from "@/pages/transfers/OrganisationDropZone.tsx";
import {toast} from "sonner";
import {DragCard} from "@/pages/transfers/DragCard.tsx";
import {DropZone} from "@/pages/transfers/DropZone.tsx";
import {useState} from "react";

interface Props {
    name: string;
}

export const OrganisationWidget = (props: Props) => {
    const {name} = props;

    const [childItems, setChildItems] = useState<string[]>([]);
    const [secondChild, setSecondChild] = useState<string[]>([]);

    const {isDragging, draggedItem, draggedType} = useDragLayer((monitor) => ({
        isDragging: monitor.isDragging(),
        draggedItem: monitor.getItem(),
        draggedType: monitor.getItemType(),
    }));


    const handleDrop = (targetName: string, draggedName: string) => {
        if (childItems.includes(targetName)) {
            setChildItems(p => p.filter(item => item !== targetName));
        } else {
            setChildItems(p => [...p, targetName]);
        }

        toast.success(`${draggedName} - ${targetName}`);
    };

    const handleDrop2 = (targetName: string, draggedName: string) => {
        if (secondChild.includes(targetName)) {
            setSecondChild(p => p.filter(item => item !== targetName));
        } else {
            setSecondChild(p => [...p, targetName]);
        }

        toast.success(`${draggedName} - ${targetName}`);
    };

    const secondAreaName = `${ItemTypes.FINAL_SOURCE}_${name}`

    return (
        <div className="flex gap-8">
            <div className="w-1/3">
                <h2 className="font-bold mb-2">Откуда</h2>
                <DragCard name={name} variant={'ORGANISATION'}/>
            </div>

            <div className="w-1/3 flex flex-col gap-2">
                <h2 className="font-bold mb-2">Куда</h2>
                {childItems.map(item => (
                    <DragCard
                        name={item}
                        variant={secondAreaName}
                        key={item}
                    />
                ))}

                {(isDragging && draggedItem.name === name && draggedType === ItemTypes.ORGANISATION) && (
                    <div
                        className="p-4 border-2 border-dashed border-blue-500 bg-blue-50 rounded animate-pulse">
                        <p className="text-blue-600 font-medium">
                            Куда переводим {draggedItem?.name}?
                        </p>
                        <div className="grid grid-cols-1 gap-2 mt-4">
                            {ORGANISATIONS.map((org) => (
                                <DropZone
                                    key={org}
                                    accept={'ORGANISATION'}
                                    name={org}
                                    onDrop={(draggedName) => handleDrop(org, draggedName)}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="w-1/3 flex flex-col gap-2">
                <h2 className="font-bold mb-2">Куда 2</h2>
                {secondChild.map(item => (
                    <DragCard
                        name={item}
                        variant={secondAreaName}
                        key={item}
                    />
                ))}

                {(isDragging && draggedType === secondAreaName) && (
                    <div
                        className="p-4 border-2 border-dashed border-blue-500 bg-blue-50 rounded animate-pulse">
                        <p className="text-blue-600 font-medium">
                            Куда переводим {draggedItem?.name}?
                        </p>
                        <div className="grid grid-cols-1 gap-2 mt-4">
                            {FINAL_SOURCE.map((org) => (
                                <DropZone
                                    key={org}
                                    accept={secondAreaName}
                                    name={org}
                                    onDrop={(draggedName) => handleDrop2(org, draggedName)}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
