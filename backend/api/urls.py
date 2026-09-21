from django.urls import path
from .views import (
    RegisterView, LoginView, UserDataView, AdminDashboardStatsView,
    UpdateProgressView, BadgesListView, SubmitFeedbackView, ChatView,
    SuperAdminDashboardView, SchoolDashboardView, CreateClassroomView, AssignTeacherToClassView,
    ParentDashboardView, LinkChildView, ApproveSchoolView, AddSchoolTeacherView,
    AddSchoolStudentView, InviteParentView, BulkUploadStudentsView, TeacherDashboardView,
    ClaimParentAccountView, GoogleAuthView, SubmitOnboardingDiagnosticView,
    WebChallengeDetailView, WebChallengeSaveDraftView, WebChallengeSubmitView,
    WebChallengeProjectsListView, SchoolJoinInfoView, ClassJoinInfoView, StudentJoinClassView
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
    path('badges/', BadgesListView.as_view(), name='badges_list'),
    path('feedback/', SubmitFeedbackView.as_view(), name='submit_feedback'),
    path('chat/', ChatView.as_view(), name='chat'),
    path('super-admin/dashboard/', SuperAdminDashboardView.as_view(), name='super_admin_dashboard'),
    path('super-admin/approve-school/', ApproveSchoolView.as_view(), name='approve_school'),
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
]




