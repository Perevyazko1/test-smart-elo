import {Box, Drawer} from "@mui/material";
import {ExcludeUsersFilter} from "@pages/TaskPage/ui/TaskPageNav/ui/ExcludeUsersFilter";


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
                padding: '1rem 1rem',
                position: 'relative',
                minWidth: 300,
                overflow: 'visible'
            }}>
                <ExcludeUsersFilter/>
            </Box>
        </Drawer>
    );
};
