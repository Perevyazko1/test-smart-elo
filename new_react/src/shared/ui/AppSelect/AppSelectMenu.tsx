import React, {Fragment, ReactNode} from "react";
import classNames from "classnames";

import {Popper} from "@mui/material";
import CheckIcon from '@mui/icons-material/Check';

import {AppSkeleton} from "@shared/ui";

import cls from "./AppSelect.module.scss";


export interface GetRenderOptionProps<T> {
    option: T | null;
    colorScheme: 'darkInput' | 'lightInput';
    handleSelect: (option: T | null) => void;
    isSelected: (option: T | null) => boolean;
}

interface AppSelectMenuProps<T> {
    sortedOptions: T[],
    children?: ReactNode;
    anchorEl: HTMLElement | null;
    isSelected: (option: T) => boolean;
    handleSelect: (option: T | null) => void;
    colorScheme: 'lightInput' | 'darkInput';
    getRenderOption?: (props: GetRenderOptionProps<T>) => ReactNode;
    getStringOptionValue: (option: T | null) => string;
    isLoading?: boolean;
}


export const AppSelectMenu = <T, >(props: AppSelectMenuProps<T>) => {
    const {
        anchorEl,
        isLoading,
        colorScheme,
        children,
        sortedOptions,
        getRenderOption,
        handleSelect,
        isSelected,
        getStringOptionValue,
    } = props;

    if (!anchorEl) return null;

    return (
        <Popper placement={'bottom-start'} open={!!anchorEl} disablePortal anchorEl={anchorEl} sx={{zIndex: 11200}}>
            <div className={classNames(cls.OptionsContainer, cls[colorScheme])}>
                {children}
                {sortedOptions.map((option, index) => (
                    getRenderOption ? (
                            <Fragment key={index}>
                                {getRenderOption({
                                    option,
                                    colorScheme,
                                    handleSelect: () => handleSelect(option),
                                    isSelected: () => isSelected(option),
                                })}
                            </Fragment>)
                        : (
                            <div
                                key={index}
                                onClick={() => handleSelect(option)}
                                className={classNames(
                                    cls.Option,
                                    cls[colorScheme],
                                    {[cls.Selected]: isSelected(option)}
                                )}
                            >
                                {isSelected(option) &&
                                    <CheckIcon
                                        sx={{m: 0, p: 0}}
                                        fontSize={'small'}
                                        color={'info'}
                                    />
                                }
                                {getStringOptionValue(option)}
                            </div>
                        )
                ))}
                {isLoading &&
                    <>
                        <AppSkeleton className={classNames(
                            cls.Option,
                            cls[colorScheme],
                        )}/>
                        <AppSkeleton className={classNames(
                            cls.Option,
                            cls[colorScheme],
                        )}/>
                        <AppSkeleton className={classNames(
                            cls.Option,
                            cls[colorScheme],
                        )}/>
                    </>
                }
            </div>
        </Popper>
    );
};
