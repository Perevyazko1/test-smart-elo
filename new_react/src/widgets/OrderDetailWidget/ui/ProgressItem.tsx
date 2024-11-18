interface ProgressItemProps {
    warningCount: number;
    successCount: number;
    secondaryCount: number;
    dangerCount: number;
}

export const ProgressItem = (props: ProgressItemProps) => {
    const {successCount, secondaryCount, dangerCount, warningCount} = props;

    const getItemWidth = (count: number) => {
        const total = successCount + secondaryCount + dangerCount + warningCount;

        return `${count / total * 100}%`
    }

    return (
        <div className={'d-flex w-100 align-items-center'}>

            <div className={'d-flex justify-content-between w-100 rounded border border-2 gap-1'}>
                {successCount !== 0 && (
                    <div className={'bg-success rounded px-1'}
                         style={{
                             width: getItemWidth(successCount),
                             minWidth: '25px',
                             height: '25px',
                             overflow: 'hidden',
                         }}>
                        {successCount} ✔️гот.
                    </div>
                )}
                {dangerCount !== 0 && (
                    <div className={'bg-danger rounded px-1'}
                         style={{
                             width: getItemWidth(dangerCount),
                             minWidth: '25px',
                             height: '25px',
                             overflow: 'hidden',
                         }}>
                        {dangerCount} ❌ гот.
                    </div>
                )}
                {warningCount !== 0 && (
                    <div className={'bg-warning rounded px-1'}
                         style={{
                             width: getItemWidth(warningCount),
                             minWidth: '25px',
                             height: '25px',
                             overflow: 'hidden',
                         }}>
                        {warningCount} в раб.
                    </div>
                )}
                {secondaryCount !== 0 && (
                    <div className={'bg-secondary-subtle rounded px-1'}
                         style={{
                             width: getItemWidth(secondaryCount),
                             minWidth: '25px',
                             height: '25px',
                             overflow: 'hidden',
                         }}>
                        {secondaryCount} дост.
                    </div>
                )}
            </div>
        </div>
    );
};
