import {useDrop} from "react-dnd";
import {ItemTypes} from "@/pages/transfers/types.ts";


interface OrganisationDropZoneProps {
    name: string;
    onDrop: (draggedName: string) => void;
}


export const OrganisationDropZone = ({name, onDrop}: OrganisationDropZoneProps) => {
    const [{isOver, canDrop}, drop] = useDrop(() => ({
        accept: ItemTypes.ORGANISATION,
        drop: (item: { name: string }) => onDrop(item.name),
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
            canDrop: !!monitor.canDrop(),
        }),
    }));

    const isActive = isOver && canDrop;

    return (
        <div
            ref={drop as any}
            className={`p-4 border-2 border-dashed rounded transition-colors ${
                isActive ? 'bg-green-100 border-green-500' : 'bg-gray-50 border-gray-300'
            }`}
        >
            {name}
        </div>
    );
};
