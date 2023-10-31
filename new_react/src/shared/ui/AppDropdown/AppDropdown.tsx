import {ReactNode, useState} from "react";
import {Button} from "react-bootstrap";

import cls from './AppDropdown.module.scss';

interface AppDropdownProps {
    items?: string[];
    selected: string;
    onSelect?: (item: string) => void;
    active?: boolean;
    children?: ReactNode;
}

export const AppDropdown = (props: AppDropdownProps) => {
    const {items, selected, onSelect, active, children} = props;

    const [isOpen, setIsOpen] = useState<boolean>(false);

    const selectClb = (item: string) => {
        setIsOpen(false);
        onSelect && onSelect(item);
    }

    const renderOptions = items?.map((item) => {
        return (
            <div key={item}>
                <Button variant={item === 'Подтвердить' ? 'success' : 'black'}
                        onClick={() => selectClb(item)}
                        active={item === selected}
                        className={'text-nowrap w-100'}
                >
                    {item}
                </Button>
                <hr className={'p-0 m-0'}/>
            </div>
        )
    });

    return (
        <div onMouseLeave={() => setIsOpen(false)}
             style={{
                 position: 'relative',
             }}
        >
            <div>
                <Button variant={'black'} onClick={() => setIsOpen(!isOpen)} className={'text-nowrap'}>
                    {selected}
                    <i className={`fas fa-chevron-down ms-2 ${cls.dropIcon} ${isOpen && cls.rotate} ${active && ' text-danger'}`}/>
                </Button>
            </div>

            <div className={`${cls.menu} ${isOpen && cls.expand} rounded p-1 border border-secondary`}>
                {children}
                {renderOptions}
            </div>
        </div>
    )
}