import {useState} from "react";
import ChildComponent from "./ChildComponent";

export const TestQueue = () => {
    const [items, setItems] = useState<number[]>([]);

    const addItem = (item: number) => {
        setItems((prevItems) => [...prevItems, item]);
    };

    return (
        <div>
            <button onClick={() => addItem(Math.floor(Math.random() * 10))}>
                Add Item
            </button>

            {items.join(', ')}
            <ChildComponent items={items}/>
            <ChildComponent items={items}/>
            <ChildComponent items={items}/>
            <ChildComponent items={items}/>
            <ChildComponent items={items}/>
            <ChildComponent items={items}/>
            <ChildComponent items={items}/>
        </div>
    );
};
