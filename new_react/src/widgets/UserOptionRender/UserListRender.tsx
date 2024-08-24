import {GroupedEmployeeItem} from "@entities/Employee";
import {Checkbox} from "@mui/material";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import {getEmployeeName} from "@shared/lib";
import {useCurrentUser} from "@shared/hooks";
import {useAddToFavorite} from "@widgets/TaskForm/model/api";
import {Spinner} from "react-bootstrap";
import classNames from "classnames";
import cls from "@shared/ui/AppSelect/AppSelect.module.scss";
import {GetRenderOptionProps} from "@shared/ui/AppSelect/AppSelectMenu";


export const UserOptionRender = (listProps: GetRenderOptionProps<GroupedEmployeeItem>) => {
    const {option, handleSelect, isSelected, colorScheme} = listProps;
    const {currentUser, setCurrentUser} = useCurrentUser();
    const [addToFavorite, {isLoading}] = useAddToFavorite();

    const addToFavoriteClb = async () => {
        if (option) {
            try {
                const result = await addToFavorite({data: option.user.id}).unwrap();
                setCurrentUser(result)
            } catch (error) {
                // Обработка ошибок
                alert("Ошибка добавления пользователя в избранное. ");
            }
        }
    }

    return (
        <div
            onClick={() => handleSelect(option)}
            className={classNames(
                cls.Option,
                cls[colorScheme],
                {[cls.Selected]: isSelected(option)}
            )}
        >
            <Checkbox
                onClick={(event) => event.stopPropagation()}
                icon={isLoading ?
                    <Spinner className={'m-0 p-0'} variant={'primary'} animation={'grow'} size={'sm'}/>
                    : <BookmarkBorderIcon sx={{color: "var(--bs-primary)", m: 0, p: 0}}/>
                }
                checkedIcon={isLoading ?
                    <Spinner className={'m-0 p-0'} variant={'primary'} animation={'grow'} size={'sm'}/>
                    : <BookmarkIcon sx={{color: "var(--bs-primary)", m: 0, p: 0}}/>
                }
                onChange={addToFavoriteClb}
                disabled={isLoading}
                sx={{
                    padding: '0 3px 0 0',
                    margin: 0,
                }}
                size={'small'}
                checked={option ? currentUser.favorite_users.includes(option.user.id) : false}
            />
            {getEmployeeName(option?.user, 'listNameInitials')}
        </div>
    )
};
