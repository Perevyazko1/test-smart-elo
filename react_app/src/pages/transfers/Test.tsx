import { useDrag, useDrop } from 'react-dnd';
import {toast} from "sonner";

interface Props {

}

const ItemTypes = {
    ORGANISATION: 'organisation'
};

interface DraggableOrganisationProps {
    name: string;
}

const DraggableOrganisation = ({ name }: DraggableOrganisationProps) => {
    const [{ isDragging }, drag] = useDrag(() => ({
        type: ItemTypes.ORGANISATION,
        item: { name },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    }));

    return (
        <div
            ref={drag as any}
            className={`p-2 border border-gray-400 rounded bg-white cursor-move ${isDragging ? 'opacity-60' : 'opacity-100'}`}
        >
            {name}
        </div>
    );
};

interface OrganisationDropZoneProps {
    name: string;
    onDrop: (draggedName: string) => void;
}

const OrganisationDropZone = ({ name, onDrop }: OrganisationDropZoneProps) => {
    const [{ isOver, canDrop }, drop] = useDrop(() => ({
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

export const TransfersPage = (props: Props) => {
    const {} = props;

    const organisations = [
        "СЗМК",
        "СЗМК+",
        "ИП Сулим В.В.",
        "Касса",
        "ИП Харьков И.Ю.",
        "ИП Харченко Д.В.",
        "ИП Самсонов М.Г.",
        "ИП Кудрявцева О.В.",
        "ИП Великий Д.Д.",
        "ИП Березин Е.А.",
    ]

    const handleDrop = (targetName: string, draggedName: string) => {
        toast.success(`${targetName} - ${draggedName}`);
    };

    return (
        <div className={'p-4'}>
            <div className={'flex flex-col gap-4 bg-yellow-50 p-4 border-2 border-black'}>
                <h1>Переводы</h1>

                <div className="flex gap-8">
                    <div className="w-1/3">
                        <h2 className="font-bold mb-2">Откуда</h2>
                        <DraggableOrganisation name="СЗМК" />
                    </div>

                    <div className="w-2/3 flex flex-col gap-2">
                        <h2 className="font-bold mb-2">Куда</h2>
                        <div className="grid grid-cols-2 gap-2">
                            {organisations.map((org) => (
                                <OrganisationDropZone
                                    key={org}
                                    name={org}
                                    onDrop={(draggedName) => handleDrop(org, draggedName)}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
