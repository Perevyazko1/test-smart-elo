from attr import dataclass


@dataclass
class RequestParams:
    pin_code: str
    view_mode_key: str
    project_filter: str
    department_number: str
    week: str
    year: str


def get_eq_req_params(request) -> RequestParams | None:
    if request.method == "POST":
        return RequestParams(
            pin_code=str(request.user.pin_code),
            view_mode_key=str(request.data.get("view_mode")),
            project_filter=str(request.data.get("project")),
            department_number=str(request.user.current_department.number),
            week=str(request.data.get("week")),
            year=str(request.data.get("year")),
        )
    elif request.method == "GET":
        return RequestParams(
            pin_code=str(request.user.pin_code),
            view_mode_key=str(request.query_params.get("view_mode")),
            project_filter=request.query_params.get("project"),
            department_number=str(request.user.current_department.number),
            week=request.query_params.get("week"),
            year=request.query_params.get("year"),
        )
    else:
        # TODO добавить логи на этот случай
        return None
