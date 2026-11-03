from django.urls import path
from .views import (
    RegisterView, LoginView, UserDataView, AdminDashboardStatsView,
    UpdateProgressView, BadgesListView, SubmitFeedbackView, ChatView,
    SuperAdminDashboardView, SchoolDashboardView, CreateClassroomView, AssignTeacherToClassView,
    ParentDashboardView, LinkChildView, ApproveSchoolView, DeleteSchoolView, AddSchoolTeacherView,
    AddSchoolStudentView, InviteParentView, BulkUploadStudentsView, TeacherDashboardView,
    ClaimParentAccountView, GoogleAuthView, SubmitOnboardingDiagnosticView,
    WebChallengeDetailView, WebChallengeSaveDraftView, WebChallengeSubmitView,
    WebChallengeProjectsListView, SchoolJoinInfoView, ClassJoinInfoView, StudentJoinClassView,
    PizzaShopSaveProgressView, PizzaShopGetProgressView,
    RobotMazeSaveProgressView, RobotMazeGetProgressView,
    MyLittleShopSaveProgressView, MyLittleShopGetProgressView,
    FrogAdventureSaveProgressView, FrogAdventureGetProgressView,
    TrafficRescueSaveProgressView, TrafficRescueGetProgressView,
    PetRescueSaveProgressView, PetRescueGetProgressView,
    PythonExecuteView, PythonProjectsListView, PythonProjectDetailView,
    BlocklyProjectsListView, BlocklyProjectDetailView,
    AppStudioProjectsListView, AppStudioProjectDetailView,
    PremiumContentDeliveryView
)
from .payment_views import (
    PlansListView, InitializePaymentView, VerifyPaymentView,
    PaystackWebhookView, CancelSubscriptionView, SubscriptionStatusView,
    SubscriptionAccessCheckView
)
from .parent_admin_subscription_views import (
    ParentSubscriptionDetailView, ParentCancelSubscriptionView,
    ParentUpdatePaymentMethodView, ParentPaymentReceiptView,
    AdminSubscriptionOverviewView, AdminSubscribersListView,
    AdminPaymentsListView, AdminPlansManageView, AdminPlanDetailManageView,
    AdminPlanToggleStatusView, AdminManualCompensationView,
    AdminAuditLogsListView, AdminSubscriptionSettingsView,
    AdminProcessRenewalsView
)

urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/google/', GoogleAuthView.as_view(), name='google_auth'),
    path('auth/user/', UserDataView.as_view(), name='user_data'),
    path('auth/join-class/', StudentJoinClassView.as_view(), name='join_class'),
    path('user/onboarding-diagnostic/', SubmitOnboardingDiagnosticView.as_view(), name='onboarding_diagnostic'),
    path('admin-stats/', AdminDashboardStatsView.as_view(), name='admin_stats'),
    path('user/progress/', UpdateProgressView.as_view(), name='update_progress'),
    path('pizza-shop/save-progress/', PizzaShopSaveProgressView.as_view(), name='pizza_shop_save_progress'),
    path('pizza-shop/progress/', PizzaShopGetProgressView.as_view(), name='pizza_shop_get_progress'),
    path('robot-maze/save-progress/', RobotMazeSaveProgressView.as_view(), name='robot_maze_save_progress'),
    path('robot-maze/progress/', RobotMazeGetProgressView.as_view(), name='robot_maze_get_progress'),
    path('my-little-shop/save-progress/', MyLittleShopSaveProgressView.as_view(), name='my_little_shop_save_progress'),
    path('my-little-shop/progress/', MyLittleShopGetProgressView.as_view(), name='my_little_shop_get_progress'),
    path('frog-adventure/save-progress/', FrogAdventureSaveProgressView.as_view(), name='frog_adventure_save_progress'),
    path('frog-adventure/progress/', FrogAdventureGetProgressView.as_view(), name='frog_adventure_get_progress'),
    path('traffic-rescue/save-progress/', TrafficRescueSaveProgressView.as_view(), name='traffic_rescue_save_progress'),
    path('traffic-rescue/progress/', TrafficRescueGetProgressView.as_view(), name='traffic_rescue_get_progress'),
    path('pet-rescue/save-progress/', PetRescueSaveProgressView.as_view(), name='pet_rescue_save_progress'),
    path('pet-rescue/progress/', PetRescueGetProgressView.as_view(), name='pet_rescue_get_progress'),
    path('badges/', BadgesListView.as_view(), name='badges_list'),
    path('feedback/', SubmitFeedbackView.as_view(), name='submit_feedback'),
    path('chat/', ChatView.as_view(), name='chat'),
    path('super-admin/dashboard/', SuperAdminDashboardView.as_view(), name='super_admin_dashboard'),
    path('super-admin/approve-school/', ApproveSchoolView.as_view(), name='approve_school'),
    path('super-admin/delete-school/', DeleteSchoolView.as_view(), name='delete_school'),
    path('school/join-info/', SchoolJoinInfoView.as_view(), name='school_join_info'),
    path('class/join-info/', ClassJoinInfoView.as_view(), name='class_join_info'),
    path('school/dashboard/', SchoolDashboardView.as_view(), name='school_dashboard'),
    path('school/create-class/', CreateClassroomView.as_view(), name='create_classroom'),
    path('school/assign-teacher-class/', AssignTeacherToClassView.as_view(), name='assign_teacher_class'),
    path('school/add-teacher/', AddSchoolTeacherView.as_view(), name='add_school_teacher'),
    path('school/add-student/', AddSchoolStudentView.as_view(), name='add_school_student'),
    path('school/bulk-upload-students/', BulkUploadStudentsView.as_view(), name='bulk_upload_students'),
    path('school/invite-parent/', InviteParentView.as_view(), name='invite_parent'),
    path('teacher/dashboard/', TeacherDashboardView.as_view(), name='teacher_dashboard'),
    path('parent/dashboard/', ParentDashboardView.as_view(), name='parent_dashboard'),
    path('parent/link-child/', LinkChildView.as_view(), name='link_child'),
    path('parent/claim-account/', ClaimParentAccountView.as_view(), name='claim_parent_account'),

    # Web Dev Studio Endpoints
    path('web-studio/projects/', WebChallengeProjectsListView.as_view(), name='web_challenge_projects'),
    path('web-studio/challenges/<str:slug>/', WebChallengeDetailView.as_view(), name='web_challenge_detail'),
    path('web-studio/save-draft/', WebChallengeSaveDraftView.as_view(), name='web_challenge_save_draft'),
    path('web-studio/submit/', WebChallengeSubmitView.as_view(), name='web_challenge_submit'),

    # Sandboxed Python Execution & Project APIs
    path('python/execute/', PythonExecuteView.as_view(), name='python_execute'),
    path('python/projects/', PythonProjectsListView.as_view(), name='python_projects_list'),
    path('python/projects/<int:pk>/', PythonProjectDetailView.as_view(), name='python_project_detail'),

    # Block Coding APIs
    path('block-coding/projects/', BlocklyProjectsListView.as_view(), name='blockly_projects_list'),
    path('block-coding/projects/<int:pk>/', BlocklyProjectDetailView.as_view(), name='blockly_project_detail'),

    # App Studio APIs
    path('app-studio/projects/', AppStudioProjectsListView.as_view(), name='app_studio_projects_list'),
    path('app-studio/projects/<str:pk>/', AppStudioProjectDetailView.as_view(), name='app_studio_project_detail'),

    # Premium Content Delivery
    path('curriculum/premium-content/', PremiumContentDeliveryView.as_view(), name='premium_content_delivery'),

    # Paystack Subscription & Payment Endpoints
    path('payments/plans/', PlansListView.as_view(), name='payment_plans'),
    path('payments/initialize/', InitializePaymentView.as_view(), name='payment_initialize'),
    path('payments/verify/', VerifyPaymentView.as_view(), name='payment_verify'),
    path('payments/webhook/', PaystackWebhookView.as_view(), name='payment_webhook'),
    path('payments/cancel/', CancelSubscriptionView.as_view(), name='payment_cancel'),
    path('payments/status/', SubscriptionStatusView.as_view(), name='payment_status'),

    # Official Webhook & Subscription API routes
    path('webhooks/paystack', PaystackWebhookView.as_view(), name='paystack_webhook'),
    path('webhooks/paystack/', PaystackWebhookView.as_view(), name='paystack_webhook_slash'),
    path('subscription/initialize', InitializePaymentView.as_view(), name='subscription_initialize'),
    path('subscription/initialize/', InitializePaymentView.as_view(), name='subscription_initialize_slash'),
    path('subscription/verify', VerifyPaymentView.as_view(), name='subscription_verify'),
    path('subscription/verify/', VerifyPaymentView.as_view(), name='subscription_verify_slash'),
    path('subscription/access-check', SubscriptionAccessCheckView.as_view(), name='subscription_access_check'),
    path('subscription/access-check/', SubscriptionAccessCheckView.as_view(), name='subscription_access_check_slash'),

    # Parent Subscription Management Portal APIs
    path('parent/subscription/detail/', ParentSubscriptionDetailView.as_view(), name='parent_subscription_detail'),
    path('parent/subscription/cancel/', ParentCancelSubscriptionView.as_view(), name='parent_subscription_cancel'),
    path('parent/subscription/update-payment-method/', ParentUpdatePaymentMethodView.as_view(), name='parent_subscription_update_payment_method'),
    path('parent/payments/<str:reference>/receipt/', ParentPaymentReceiptView.as_view(), name='parent_payment_receipt'),

    # Admin Dashboard: Subscriptions & Payments Section APIs
    path('admin/subscriptions/overview/', AdminSubscriptionOverviewView.as_view(), name='admin_subscriptions_overview'),
    path('admin/subscriptions/subscribers/', AdminSubscribersListView.as_view(), name='admin_subscriptions_subscribers'),
    path('admin/subscriptions/payments/', AdminPaymentsListView.as_view(), name='admin_subscriptions_payments'),
    path('admin/subscriptions/plans/', AdminPlansManageView.as_view(), name='admin_subscriptions_plans'),
    path('admin/subscriptions/plans/<int:pk>/', AdminPlanDetailManageView.as_view(), name='admin_subscriptions_plan_detail'),
    path('admin/subscriptions/plans/<int:pk>/toggle-status/', AdminPlanToggleStatusView.as_view(), name='admin_subscriptions_plan_toggle'),
    path('admin/subscriptions/<int:pk>/manual-compensation/', AdminManualCompensationView.as_view(), name='admin_subscriptions_manual_compensation'),
    path('admin/subscriptions/audit-logs/', AdminAuditLogsListView.as_view(), name='admin_subscriptions_audit_logs'),
    path('admin/subscriptions/settings/', AdminSubscriptionSettingsView.as_view(), name='admin_subscriptions_settings'),
    path('admin/subscriptions/process-renewals/', AdminProcessRenewalsView.as_view(), name='admin_subscriptions_process_renewals'),
]




