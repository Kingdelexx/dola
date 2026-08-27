from django.test import TestCase
from django.contrib.auth.models import User
from api.models import UserProfile, ProgressLog
from api.views import calculate_skills, calculate_weekly_journey

class DolaCodeCurriculumTests(TestCase):
    def setUp(self):
        # Create student
        self.student = User.objects.create_user(username="student_sam", email="student@dola.com", password="passWord123!")
        self.profile = UserProfile.objects.create(
            user=self.student,
            role="student",
            stage1_progress=20,
            stage2_progress=2,
            stage3_progress=0,
            stage4_progress=0
        )
        self.parent = User.objects.create_user(username="parent_sam", email="parent@dola.com", password="passWord123!")
        UserProfile.objects.create(user=self.parent, role="parent")

    def test_skills_calculation(self):
        skills = calculate_skills(self.profile)
        # Should calculate percentages for 8 learning competencies
        self.assertIn("numeracy_pattern_recognition", skills)
        self.assertIn("logical_reasoning", skills)
        self.assertIn("sequencing", skills)
        self.assertIn("problem_decomposition", skills)
        self.assertIn("computational_thinking", skills)
        self.assertIn("coding_application", skills)
        self.assertIn("debugging", skills)
        self.assertIn("creative_problem_solving", skills)
        
        # Verify numeracy index is positive because stage1_progress > 0
        self.assertGreater(skills["numeracy_pattern_recognition"], 0)

    def test_weekly_journey(self):
        journey = calculate_weekly_journey(self.student, self.profile)
        self.assertIn("title", journey)
        self.assertIn("journey_level_label", journey)
        self.assertIn("journey_group", journey)

    def test_registration_band_assignment(self):
        class MockRequest:
            def __init__(self, data):
                self.data = data
        from api.serializers import UserSerializer
        
        # Test Discoverer age (<= 8)
        request = MockRequest({'role': 'student', 'profile': {'age': 7, 'coding_experience': 'none'}})
        serializer = UserSerializer(data={'username': 'test_disc', 'email': 'test_disc@dola.com', 'password': 'passWord123!'}, context={'request': request})
        self.assertTrue(serializer.is_valid())
        user = serializer.save()
        self.assertEqual(user.profile.learning_band, 'Discoverer')

        # Test Explorer age (9 to 11)
        request = MockRequest({'role': 'student', 'profile': {'age': 10, 'coding_experience': 'some'}})
        serializer = UserSerializer(data={'username': 'test_exp', 'email': 'test_exp@dola.com', 'password': 'passWord123!'}, context={'request': request})
        self.assertTrue(serializer.is_valid())
        user = serializer.save()
        self.assertEqual(user.profile.learning_band, 'Explorer')

        # Test Builder age (12 to 14)
        request = MockRequest({'role': 'student', 'profile': {'age': 13, 'coding_experience': 'expert'}})
        serializer = UserSerializer(data={'username': 'test_bld', 'email': 'test_bld@dola.com', 'password': 'passWord123!'}, context={'request': request})
        self.assertTrue(serializer.is_valid())
        user = serializer.save()
        self.assertEqual(user.profile.learning_band, 'Builder')

        # Test Innovator age (>= 15)
        request = MockRequest({'role': 'student', 'profile': {'age': 16, 'coding_experience': 'some'}})
        serializer = UserSerializer(data={'username': 'test_inn', 'email': 'test_inn@dola.com', 'password': 'passWord123!'}, context={'request': request})
        self.assertTrue(serializer.is_valid())
        user = serializer.save()
        self.assertEqual(user.profile.learning_band, 'Innovator')

    def test_submit_diagnostic(self):
        from rest_framework.test import APIClient
        from api.models import StudentCompetency
        
        client = APIClient()
        client.force_authenticate(user=self.student)
        
        response = client.post('/api/user/onboarding-diagnostic/', {'score': 4}, format='json')
        self.assertEqual(response.status_code, 200)
        
        self.profile.refresh_from_db()
        self.assertEqual(self.profile.starting_score, 4)
        
        # Verify student competency is automatically initialized
        comp = StudentCompetency.objects.filter(user=self.student).first()
        self.assertIsNotNone(comp)
        self.assertEqual(comp.status, 'INTRODUCED')
