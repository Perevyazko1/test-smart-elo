import {useDragLayer, useDrop} from "react-dnd";


export const CustomDragLayer = () => {
    const {isDragging, item, currentOffset} = useDragLayer((monitor) => ({
        item: monitor.getItem(),
        itemType: monitor.getItemType(),
        currentOffset: monitor.getSourceClientOffset(),
        isDragging: monitor.isDragging(),
    }));

    if (!isDragging || !currentOffset) {
        return null;
    }

    return (
        <div style={{
            position: 'fixed',
            pointerEvents: 'none',
            zIndex: 100,
            left: 0,
            top: 0,
            width: '350px',
            height: '100%',
        }}>
            <div style={{
                transform: `translate(${currentOffset.x}px, ${currentOffset.y}px)`,
            }}>
                <div className="p-2 border-2 border-blue-500 rounded bg-white shadow-lg opacity-80 rotate-3 scale-105">
                    {item.name} 🚚
                </div>
            </div>
        </div>
    );
};