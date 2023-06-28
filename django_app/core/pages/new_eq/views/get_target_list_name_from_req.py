def get_target_list_name_from_req(request):
    if request.method == "POST":
        return request.data.get("target_list")
    if request.method == "GET":
        return request.query_params.get("target_list")
