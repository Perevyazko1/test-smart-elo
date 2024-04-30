interface ProgressItemProps {
    successCount: number;
    secondaryCount: number;
    dangerCount: number;
}

export const ProgressItem = (props: ProgressItemProps) => {
    const {successCount, secondaryCount, dangerCount} = props;

    const getItemWidth = (count: number) => {
        const total = successCount + secondaryCount + dangerCount;

        return `${count / total * 100}%`
    }

    return (
        <div className={'d-flex w-100 align-items-center'}>

            <div className={'d-flex justify-content-between w-100 rounded border border-2 gap-1'}>
                <div className={'bg-success rounded px-1'}
                     style={{
                         width: getItemWidth(successCount),
                         height: '25px',
                         overflow: 'hidden',
                     }}>
                    {successCount} готовы
                </div>
                <div className={'bg-danger rounded px-1'}
                     style={{
                         width: getItemWidth(dangerCount),
                         height: '25px',
                         overflow: 'hidden',
                     }}>
                    {dangerCount} в работе
                </div>
                <div className={'bg-secondary rounded px-1'}
                     style={{
                         width: getItemWidth(secondaryCount),
                         height: '25px',
                         overflow: 'hidden',
                     }}>
                    {secondaryCount} ожидают
                </div>
            </div>
        </div>
    );
};
