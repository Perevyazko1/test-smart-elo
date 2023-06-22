import {useSelector} from "react-redux";
import {getEqPageCards} from "../../model/selectors/getEqPageCards/getEqPageCards";
import {Skeleton} from "../../../../shared/ui/Skeleton/Skeleton";
import {Stack} from "react-bootstrap";

const MobileDesign = () => {
    const pageList = useSelector(getEqPageCards.selectAll)

    return (
        <Stack gap={2} className={'pt-2 px-1'}>
            {pageList.map((card) => (
                <Skeleton height={'250px'} width={'100%'} key={card.series_id}/>
            ))}
        </Stack>
    );
};

export default MobileDesign;