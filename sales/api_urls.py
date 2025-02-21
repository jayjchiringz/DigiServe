# sales/api_urls.py
from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import authenticate_user, dashboard_data
from .api import (
    SubscriptionPlanViewSet, BusinessViewSet, ItemViewSet, PriceHistoryViewSet,
    TableViewSet, SaleViewSet, StockEntryViewSet, ReportViewSet, DailyReceiptViewSet,
    CategoryViewSet, ExpenditureViewSet, UserProfileViewSet
)

# Create and register API viewsets with the DefaultRouter
router = DefaultRouter()
router.register(r'subscription-plans', SubscriptionPlanViewSet)
router.register(r'businesses', BusinessViewSet)
router.register(r'items', ItemViewSet)
router.register(r'price-histories', PriceHistoryViewSet)
router.register(r'tables', TableViewSet)
router.register(r'sales', SaleViewSet)
router.register(r'stock-entries', StockEntryViewSet)
router.register(r'reports', ReportViewSet)
router.register(r'daily-receipts', DailyReceiptViewSet)
router.register(r'categories', CategoryViewSet)
router.register(r'expenditures', ExpenditureViewSet)
router.register(r'user-profiles', UserProfileViewSet)

# Append router-generated API routes
urlpatterns = [
    path('authenticate/', authenticate_user, name='authenticate_user'),
    path('dashboard-data/', dashboard_data, name='dashboard-data'),
]

urlpatterns += router.urls

# Debugging: Print all generated router URLs
for url in router.urls:
    print(f"Generated Router URL: {url}")