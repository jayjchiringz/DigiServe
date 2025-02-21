#sales/serializers.py
from django.core.validators import URLValidator
from django.core.exceptions import ValidationError

from rest_framework import viewsets, serializers

from .models import (
    SubscriptionPlan, Business, Item, PriceHistory, Table, Sale,
    StockEntry, Report, DailyReceipt, Category, Expenditure, UserProfile
)


def validate_logo(logo):
    if logo is None:
        return None
    validator = URLValidator()
    try:
        validator(logo)
    except ValidationError:
        raise serializers.ValidationError('Invalid logo URL.')
    return logo


class SubscriptionPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionPlan
        fields = '__all__'


class BusinessSerializer(serializers.ModelSerializer):
    logo = serializers.SerializerMethodField()

    def get_logo(self, obj):
        if obj.logo:
            request = self.context.get('request')
            return request.build_absolute_uri(obj.logo.url) if request else obj.logo.url
        return None

    class Meta:
        model = Business
        fields = '__all__'


class ItemSerializer(serializers.Serializer):
    item = serializers.IntegerField()  # Reference to Item ID
    quantity = serializers.IntegerField()
    unit_selling_price = serializers.DecimalField(max_digits=10, decimal_places=2)


class PriceHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = PriceHistory
        fields = '__all__'


class TableSerializer(serializers.ModelSerializer):
    class Meta:
        model = Table
        fields = '__all__'


class SaleItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Item
        fields = ["item", "quantity", "unit_selling_price"]


class SaleSerializer(serializers.ModelSerializer):
    grand_total = serializers.SerializerMethodField()

    class Meta:
        model = Sale
        fields = [
            "table",
            "payment_mode",
            "customer_name",
            "item",
            "quantity",            
            "total_amount",
            "tip",
            "grand_total",
            "status",
            "receipt_no",
            "user",
        ]

    def get_grand_total(self, obj):
        """Compute grand_total as total_amount + tip."""
        return obj.total_amount + (obj.tip or 0)

    def validate(self, data):
        """Ensure the item has sufficient stock for the requested quantity."""
        item = data.get("item")
        quantity = data.get("quantity", 0)

        if item.stock < quantity:
            raise serializers.ValidationError(f"Insufficient stock for {item.name}. Available: {item.stock}.")
        return data

    def create(self, validated_data):
        """Deduct stock when creating a sale."""
        item = validated_data["item"]
        quantity = validated_data["quantity"]
        unit_selling_price = item.unit_selling_price

        # Compute the total amount
        validated_data["total_amount"] = quantity * unit_selling_price

        # Deduct stock
        if item.stock < quantity:
            raise serializers.ValidationError(f"Insufficient stock for {item.name}. Available: {item.stock}.")
        item.stock -= quantity
        item.save()

        # Create the sale
        return Sale.objects.create(**validated_data)


class StockEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = StockEntry
        fields = '__all__'


class ReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = '__all__'


class DailyReceiptSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyReceipt
        fields = '__all__'


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'


class ExpenditureSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expenditure
        fields = '__all__'


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = '__all__'