import {useDrag} from "react-dnd";

interface Props {
    name: string;
    variant: string;
}

export const DragCard = (props: Props) => {
    const {name, variant} = props;
    
    const [{isDragging}, drag] = useDrag(() => ({
        type: variant,
        item: {name},
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    }));
    
    return (
        <div
            ref={drag as any}
            className={`p-2 border border-gray-400 rounded bg-white cursor-move ${isDragging ? 'opacity-50' : 'opacity-100'}`}
        >
            {name}
        </div>
    );
};
