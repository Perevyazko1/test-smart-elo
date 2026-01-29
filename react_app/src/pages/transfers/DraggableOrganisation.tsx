import {useDrag} from "react-dnd";
import {ItemTypes} from "@/pages/transfers/types.ts";


interface DraggableOrganisationProps {
    name: string;
}


export const DraggableOrganisation = ({name}: DraggableOrganisationProps) => {
    const [{isDragging}, drag] = useDrag(() => ({
        type: ItemTypes.ORGANISATION,
        item: {name},
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    }));

    return (
        <div
            ref={drag as any}
            className={`p-2 border border-gray-400 rounded bg-white cursor-move ${isDragging ? 'opacity-0' : 'opacity-100'}`}
        >
            {name}
        </div>
    );
};