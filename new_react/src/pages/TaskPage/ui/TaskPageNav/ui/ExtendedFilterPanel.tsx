import {Box, Drawer} from "@mui/material";
import {ExcludeUsersFilter} from "@pages/TaskPage/ui/TaskPageNav/ui/ExcludeUsersFilter";
import {AppTooltip} from "@shared/ui";


interface ExtendedFilterPanelProps {
    show: boolean;
    setShow: (value: boolean) => void;
}


export const ExtendedFilterPanel = (props: ExtendedFilterPanelProps) => {
    const {show, setShow} = props;

    return (
        <Drawer
            open={show}
            anchor={'top'}
            disablePortal
            onClose={() => setShow(false)}
            ModalProps={{
                keepMounted: true,
            }}
            sx={{
                '& .MuiDrawer-paper': {
                    backgroundColor: 'black',
                    color: 'white',
                    overflow: 'visible',
                },
            }}
        >
            <Box style={{
                padding: '1rem',
                position: 'relative',
                overflow: 'visible',
                display: "block",
            }}>
                <AppTooltip
                    classNames={'d-block w-25'}
                    title="Фильтр исключающий задачи где указаны соответсвующие пользователи"
                >
                    <ExcludeUsersFilter/>
                </AppTooltip>
            </Box>
        </Drawer>
    );
};
