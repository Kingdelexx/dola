from django.urls import path
from .views import RegisterView, LoginView, UserDataView, AdminDashboardStatsView, UpdateProgressView, BadgesListView, SubmitFeedbackView

urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/user/', UserDataView.as_view(), name='user_data'),
    path('admin-stats/', AdminDashboardStatsView.as_view(), name='admin_stats'),
    path('user/progress/', UpdateProgressView.as_view(), name='update_progress'),
    path('badges/', BadgesListView.as_view(), name='badges_list'),
    path('feedback/', SubmitFeedbackView.as_view(), name='submit_feedback'),
]
