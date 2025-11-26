import logging
import time

from django.contrib.auth.middleware import get_user
from django.http import HttpRequest
from django.utils.deprecation import MiddlewareMixin
from rest_framework.authentication import TokenAuthentication
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.request import Request as DRFRequest


class CustomAuthenticationMiddleware(MiddlewareMixin):
    """
    Выполняет токен-аутентификацию до EasyAudit,
    чтобы EasyAudit всегда видел правильного request.user.
    """

    def __init__(self, get_response):
        super().__init__(get_response)
        self.token_auth = TokenAuthentication()

    def process_request(self, request: HttpRequest):
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')

        if auth_header.startswith('Token '):
            try:
                drf_request = DRFRequest(request)
                user, token = self.token_auth.authenticate(drf_request)
                if user and user.is_authenticated:
                    request.user = user
                    request.auth = token
                    return
            except AuthenticationFailed:
                request.user = None
                request.auth = None
        else:
            # Сессионная аутентификация
            request.user = get_user(request)


# Настроим логгер (как в RequestLogMiddleware)
logger = logging.getLogger("django.request")
logger.propagate = False
if not logger.hasHandlers():
    handler = logging.StreamHandler()
    formatter = logging.Formatter(
        "[%(asctime)s] %(levelname)-8s %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S"
    )
    handler.setFormatter(formatter)
    logger.addHandler(handler)


class RequestAndAuditMiddleware(MiddlewareMixin):
    """
    Мидлвара для логирования запросов в консоль и аудита в БД.
    Объединяет функциональность CustomAuditMiddleware и RequestLogMiddleware.
    """

    def process_request(self, request):
        # Сохраняем время начала запроса
        request._start_time = time.time()

    def process_response(self, request, response):
        # Пропускаем OPTIONS-запросы
        if request.method == "OPTIONS":
            return response

        # --- Логирование в консоль (часть RequestLogMiddleware) ---
        duration = (time.time() - getattr(request, "_start_time", time.time())) * 1000
        method = request.method
        path = request.get_full_path()
        status = response.status_code
        ip = request.META.get("REMOTE_ADDR", "-")

        if status < 300:
            status_color = "\033[92m"
        elif status < 400:
            status_color = "\033[94m"
        elif status < 500:
            status_color = "\033[93m"
        else:
            status_color = "\033[91m"

        method_color = "\033[96m"
        duration_color = "\033[95m"
        reset = "\033[0m"

        log_message = (
            f"{method_color}{method}{reset} {path} "
            f"→ {status_color}{status}{reset} "
            f"({duration_color}{duration:.2f} ms{reset}) "
            f"from {ip}"
        )
        logger.info(log_message)

        # --- Аудит в БД (часть CustomAuditMiddleware) ---
        # user_id = getattr(request.user, 'id', None)
        # if user_id:
        #     audit_logger.request({
        #         "url": request.path,
        #         "method": request.method,
        #         "query_string": f'{request.GET.urlencode()} T-({int(duration)}ms) S-({status}) ',
        #         "user_id": user_id,
        #         "remote_ip": request.META.get('REMOTE_ADDR'),
        #         "datetime": timezone.now(),
        #     })
        return response