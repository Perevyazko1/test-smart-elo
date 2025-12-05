import {twMerge} from "tailwind-merge";

interface IProps {
    left: number;
    center: number;
    right: number;
    className?: string;
}

export function ProgressiveCell(props: IProps) {
    const {left, right, center, className} = props;

    const targetWidth = Math.abs(Math.max(15, left / (left + right) * 100));

    return (
        <td className={twMerge('relative min-w-[5em] print:min-w-[3em]', className)}>
            <div className={'absolute inset-0 flex justify-between items-center p-1'}>
                {left > 0 && (
                    <div
                        className={'bg-green-200 h-2/3 flex items-center justify-center border-1 border-black'}
                        style={{
                            width: `${targetWidth}%`,
                            minWidth: 'content',
                        }}
                    >
                        <b>{left}</b>
                    </div>
                )}

                {center > 0 && (
                    <div
                        className={'bg-fuchsia-300 h-2/3 flex items-center justify-center border-1 flex-1 border-black'}
                        style={{
                            minWidth: 'content',
                        }}
                    >
                        <b>{center}</b>
                    </div>
                )}

                {right > 0 && (
                    <div className={'flex-1 h-2/3 flex items-center justify-center border-1 border-black text-red-500'}>
                        <b>{right}</b>
                    </div>
                )}
            </div>
        </td>
    );
}