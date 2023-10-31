import {Dropdown, NavDropdown} from "react-bootstrap";
import React from "react";
import {NavDropdownProps} from "react-bootstrap/NavDropdown";

interface AppDropdownProps extends Omit<NavDropdownProps, 'title' | 'onChange' | 'children'>  {
    title: string;
    items: string[];
    onChange: (item: string) => void;
}

export const AppDropdown = (props: AppDropdownProps) => {
    const {title, items, onChange, ...otherProps} = props;

    return (
        <NavDropdown title={title} {...otherProps}>
            {items?.map((item) => (
                <Dropdown.Item
                    key={item}
                    active={item === title}
                    onClick={() => onChange(item)}
                >
                    {item}
                </Dropdown.Item>
            ))}

        </NavDropdown>
    )
}