import {STATIC_URL} from "@/shared/consts/serverConfig.ts";
import Chair from "./Chair.jpg";

interface IProps {

}

export function ShipmentCardImage(props: IProps) {
    const {} = props;

    return (
        <div className={'size-25 border-2 border-dashed relative'}>
            <img
                loading={'lazy'}
                src={Chair}
                alt="Chair"
                className={'object-fill max-h-full max-w-full'}
            />
            <div className={'flex justify-evenly bottom-0 absolute w-full'}>
                <span className={'text-green-400 bg-gray-300 px-1'}><b>1</b></span>
                <span className={'text-red-700 bg-gray-300 px-1'}><b>3</b></span>
            </div>
        </div>
    );
}