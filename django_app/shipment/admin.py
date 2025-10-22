from django.contrib import admin
from shipment.models import Shipment, ShipmentRow, ShipmentComment, ShipmentItem


admin.site.register(Shipment)
admin.site.register(ShipmentRow)
admin.site.register(ShipmentComment)
admin.site.register(ShipmentItem)
