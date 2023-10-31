import {Col, Container, Offcanvas, Row} from "react-bootstrap";
import useWindowDimensions from "shared/lib/hooks/useWindowDimensions/useWindowDimensions";
import useResizableBlocks from "shared/lib/hooks/useResizableBlocks/useResizableBlocks";
import {EqSectionCard} from "../EqBody/EqSectionCard/EqSectionCard";
import React, {useState} from "react";
import useDoubleTap from "../../../../shared/lib/hooks/useDoubleTap/useDoubleTap";
import logo from "../../../../shared/assets/images/SZMK Logo White Horizontal 900х352.png";
import {AppDropdown} from "../../../../widgets/AppDropdown";
import {UserInfoWithRouts} from "../../../../widgets/UserInfoWithRouts";
import {useQueryParams} from "../../../../shared/lib/hooks/useQueryParams/useQueryParams";

const EqPage = () => {
    const {windowWidth, windowHeight} = useWindowDimensions(0);
    const [showFilters, setShowFilters] = useState<boolean>(false);
    const {setQueryParam, queryParameters} = useQueryParams();

    const {
        leftBlockWidth,
        rightBlockWidth,
        inWorkHeight,
        readyHeight,
        isDragging,
        resetSize,
        drag
    } = useResizableBlocks(windowWidth, windowHeight);

    const handleDoubleTap = useDoubleTap(resetSize);

    return (
        <Container
            style={{width: "100vw", height: "100vh", background: "var(--bs-gray-300)"}}
            className={'m-0 p-0'}
            fluid
            data-bs-theme={'dark'}
        >
            {/*<EqNav/>*/}

            <Row
                className={'p-0 m-0'}
                style={{
                    height: `${windowHeight}px`,
                    width: `100%`,
                }}>
                <Col style={{
                    width: `${leftBlockWidth}px`,
                }}>
                    <EqSectionCard
                        cls={''}
                        heightPx={inWorkHeight}
                        widthPx={leftBlockWidth}
                        listType={'in_work'}
                    />


                    <Row style={{
                        height: '36px',
                        background: '#00969b',
                        opacity: isDragging ? 0.5 : 1,
                    }}
                         className={'d-flex justify-content-between align-items-center px-2 rounded'}>
                        <div
                            className={'bg-dark rounded d-flex align-items-center justify-content-center me-2'}
                            style={{
                                width: "40px",
                                height: "90%",
                                touchAction: 'none',
                                cursor: 'pointer',
                            }}
                            onClick={() => setShowFilters(true)}
                        >
                            <i className="fas fa-filter text-light fs-6"/>
                        </div>
                        {!!drag &&
                            <div className={'bg-dark rounded d-flex align-items-center justify-content-center ms-2'}
                                 style={{
                                     width: "40px",
                                     height: "90%",
                                     touchAction: 'none',
                                     cursor: 'grab',
                                 }}
                                 ref={drag}
                                 onDoubleClick={resetSize}
                                 onTouchEnd={(e) => handleDoubleTap(e)}
                            >
                                <i className="fas fa-compress-alt text-light fs-3"/>
                            </div>
                        }
                    </Row>


                    <EqSectionCard
                        cls={''}
                        heightPx={readyHeight}
                        widthPx={leftBlockWidth}
                        listType={'ready'}
                    />

                </Col>

                <Col style={{
                    width: `${rightBlockWidth}px`,
                }}
                >


                    <EqSectionCard
                        cls={''}
                        heightPx={windowHeight}
                        widthPx={rightBlockWidth}
                        listType={'await'}
                    />
                </Col>
            </Row>

            <Offcanvas
                show={showFilters}
                onHide={() => setShowFilters(false)}
                data-bs-theme={'dark'}
                placement={'start'}
                style={{maxWidth: '300px'}}
            >
                <Offcanvas.Header closeButton className={'p-2 px-3'}>
                    <Offcanvas.Title>
                        <img height={"45px"} src={logo} alt={"СЗМК"} className={'me-2 me-xxl-4 my-auto'}/>
                    </Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body className={'p-2 px-3 pt-0'}>
                    <AppDropdown
                        className={'border border-2 border-light rounded p-2 mb-1'}
                        active
                        title={'Конструктора'}
                        onChange={(item) => console.log(item)}
                        items={['Конструктора', 'Обивка', 'Крой']}
                    />
                    <AppDropdown
                        className={'border border-2 border-light rounded p-2 mb-1'}
                        title={queryParameters.view_mode || 'Режим бригадира'}
                        onChange={(item) => setQueryParam('view_mode', item === 'Режим бригадира' ? '' : item)}
                        items={['Режим бригадира', 'Личные наряды']}
                    />
                    <UserInfoWithRouts className={'border border-2 border-light rounded p-2 mb-1'}/>
                </Offcanvas.Body>
            </Offcanvas>

        </Container>
    )
}

export default EqPage;