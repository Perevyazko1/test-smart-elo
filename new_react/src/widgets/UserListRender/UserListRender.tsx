import {HTMLAttributes} from "react";
import {Employee, useAddToFavorite} from "@entities/Employee";
import {Checkbox} from "@mui/material";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import {getEmployeeName} from "@shared/lib";
import {useCurrentUser} from "@shared/hooks";
import {Spinner} from "react-bootstrap";

interface UserListRenderProps {
    props: HTMLAttributes<HTMLLIElement>;
    option: Employee;
}

interface AppHTMLLi extends HTMLAttributes<HTMLLIElement> {
    key: any;
}

export const UserListRender = (listProps: UserListRenderProps) => {
    const {option, props} = listProps;
    const {currentUser, setCurrentUser} = useCurrentUser();
    const [addToFavorite, {isLoading}] = useAddToFavorite();

    const {key, ...otherProps} = props as AppHTMLLi;

    const addToFavoriteClb = async () => {
        try {
            const result = await addToFavorite({data: option.id}).unwrap();
            setCurrentUser(result)
        } catch (error) {
            // Обработка ошибок
            alert("Ошибка добавления пользователя в избранное. ");
        }
    }

    return (
        <div className={'d-flex justify-content-between pe-1'}>
            <li
                key={key}
                {...otherProps}
            >
                {getEmployeeName(option, 'listNameInitials')}
            </li>

            <Checkbox
                icon={isLoading ?
                    <Spinner className={'m-0 p-0'} variant={'primary'} animation={'grow'} size={'sm'}/>
                    : <BookmarkBorderIcon sx={{color: "var(--bs-primary)"}}/>}
                checkedIcon={isLoading ?
                    <Spinner className={'m-0 p-0'} variant={'primary'} animation={'grow'} size={'sm'}/>
                    : <BookmarkIcon sx={{color: "var(--bs-primary)"}}/>}
                onChange={addToFavoriteClb}
                disabled={isLoading}
                sx={{
                    padding: 0,
                    margin: 0,

                }}
                size={'small'}
                checked={currentUser.favorite_users.includes(option.id)}
            />

        </div>
    )
};
