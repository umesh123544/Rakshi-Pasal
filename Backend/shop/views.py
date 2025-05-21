from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from django.shortcuts import get_object_or_404
from .models import Product, Order, ContactMessage
from .serializers import ProductSerializer, OrderSerializer
import random
import string
from django.core.mail import send_mail
from django.conf import settings

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    @action(detail=False, methods=['get'])
    def categories(self, request):
        categories = dict(Product.CATEGORY_CHOICES)
        return Response(categories)
    
    @action(detail=False, methods=['get'])
    def by_category(self, request, category=None):
        products = self.queryset.filter(category=category)
        serializer = self.get_serializer(products, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def search(self, request):
        query = request.query_params.get('q', '')
        products = self.queryset.filter(name__icontains=query)
        serializer = self.get_serializer(products, many=True)
        return Response(serializer.data)

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def create(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Generate order number
        order_number = 'AP-' + ''.join(random.choices(string.digits, k=6))
        serializer.validated_data['order_number'] = order_number
        
        # Calculate totals
        items = serializer.validated_data['items']
        subtotal = sum(item['product_price'] * item['quantity'] for item in items)
        delivery_fee = 100 if serializer.validated_data['delivery_option'] == 'ring_road' else 200
        total = subtotal + delivery_fee
        
        serializer.validated_data['subtotal'] = subtotal
        serializer.validated_data['delivery_fee'] = delivery_fee
        serializer.validated_data['total'] = total
        
        # Save order
        self.perform_create(serializer)
        
        # Send confirmation email
        self.send_confirmation_email(serializer.instance)
        
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    
    def send_confirmation_email(self, order):
        subject = f'Order Confirmation - {order.order_number}'
        message = f'''
        Thank you for your order, {order.customer_name}!
        
        Order Number: {order.order_number}
        Order Total: Rs.{order.total}
        Delivery Address: {order.customer_address}
        Delivery Time: {order.get_delivery_time_display()}
        
        Your order will be delivered within {self.get_delivery_time_estimate(order)}.
        '''
        
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [order.customer_email],
            fail_silently=False,
        )
    
    def get_delivery_time_estimate(self, order):
        return '1 hour' if order.delivery_option == 'ring_road' else '2-3 hours'

def contact_view(request):
    if request.method == 'POST':
        name = request.POST.get('name')
        email = request.POST.get('email')
        subject = request.POST.get('subject')
        message = request.POST.get('message')
        
        ContactMessage.objects.create(
            name=name,
            email=email,
            subject=subject,
            message=message
        )
        
        # Send confirmation email
        send_mail(
            f'Contact Form Submission: {subject}',
            f'Thank you for contacting us, {name}! We will get back to you soon.\n\nYour message:\n{message}',
            settings.DEFAULT_FROM_EMAIL,
            [email],
            fail_silently=False,
        )
        
        return Response({'status': 'success'})
    return Response({'status': 'error'}, status=400)
