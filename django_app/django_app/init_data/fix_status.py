from core.models import OrderProduct, Assignment, ProductionStep
from staff.models import Department


def fix_status():
    target_ops = OrderProduct.objects.filter(status=0)
    for op in target_ops:
        target_ass = Assignment.objects.filter(
            order_product=op,
            tariffication_date__isnull=True,
        )
        target_pss = ProductionStep.objects.filter(
            product=op.product,
            is_active=True,
        )
        target_dps = Department.objects.filter(
            productionstep__in=target_pss
        )
        if target_ass.exclude(department__in=target_dps).exists():
            print("Найдены наряды вне техпроцесса")
            target_ass.exclude(department__in=target_dps).delete()
            ass = Assignment.objects.filter(
                order_product=op,
                tariffication_date__isnull=True,
            )
            if not ass.exists():
                op.set_status = 1
                op.save()
                print(f"Статус серии {op.series_id} актуализирован")
