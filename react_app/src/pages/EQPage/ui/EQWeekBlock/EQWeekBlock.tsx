import React, {memo} from 'react';


export const EqWeekBlock = memo(() => {

    return (
        <div className="row m-0"
             style={{
                 height: "7vh",
                 borderWidth: "3px",
                 borderStyle: "solid",
                 borderRadius: "6px",
                 background: "rgba(255,224,115,0.93)"
             }}>
            <div className="col d-xl-flex justify-content-between align-items-xl-center">
                Недельки
            </div>
        </div>
    );
});