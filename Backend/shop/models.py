from django.db import models

class Product(models.Model):
    CATEGORY_CHOICES = [
        ('whiskey', 'Whiskey'),
        ('wine', 'Wine'),
        ('beer', 'Beer'),
        ('vodka', 'Vodka'),
    ]
    
    name = models.CharField(max_length=255)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image_url = models.URLField()
    description = models.TextField(blank=True)
    in_stock = models.PositiveIntegerField(default=0)
    
    def __str__(self):
        return self.name

class Order(models.Model):
    customer_name = models.CharField(max_length=255)
    customer_email = models.EmailField()
    customer_phone = models.CharField(max_length=20)
    customer_address = models.TextField()
    items = models.JSONField()  # Stores cart items as JSON
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    delivery_fee = models.DecimalField(max_digits=10, decimal_places=2)
    total = models.DecimalField(max_digits=10, decimal_places=2)
    delivery_time = models.CharField(max_length=50)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Order #{self.id}"
