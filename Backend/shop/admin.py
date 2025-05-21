from django.contrib import admin
from .models import Product, User, Order, ContactMessage
# Register your models here.
admin.site.register(Product)
admin.site.register(User)
# admin.site.register(Cart)
admin.site.register(ContactMessage)
admin.site.register(Order)