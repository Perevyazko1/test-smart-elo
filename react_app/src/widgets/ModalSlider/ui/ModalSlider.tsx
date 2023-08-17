import {memo} from 'react';
import {AppModal} from "../../../shared/ui/AppModal/AppModal";
import {Slider} from "../../../shared/ui/Slider/Slider";

interface ModalSliderProps {
    onHide: () => void,
    urls: string[],
}


export const ModalSlider = memo((props: ModalSliderProps) => {
    const {
        onHide,
        urls,
    } = props;

    return (
        <AppModal title={''} onHide={onHide}>
            <Slider images={urls} height={'100%'} width={'100%'} clickable={false}/>
         </AppModal>
    );
});