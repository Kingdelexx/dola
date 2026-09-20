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


class WebDevStudioAPITests(TestCase):
    def setUp(self):
        from rest_framework.test import APIClient
        from api.models import WebChallenge

        self.client = APIClient()
        self.student = User.objects.create_user(username="web_kid", email="kid@dola.com", password="password123")
        self.profile = UserProfile.objects.create(user=self.student, role="student", points=10)
        self.client.force_authenticate(user=self.student)

        self.challenge = WebChallenge.objects.create(
            slug="hero-badge",
            title="Superhero Badge Challenge",
            stage_order=1,
            instructions_markdown="Build a card with an `<h1>` and a `<button>`",
            starter_html="<div class='card'></div>",
            starter_css=".card { background: black; }",
            solution_criteria={"required_tags": ["h1", "button"], "required_classes": ["card"]},
            reward_xp=50
        )

    def test_get_web_challenge_detail(self):
        response = self.client.get('/api/web-studio/challenges/hero-badge/')
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data.get('success'))
        self.assertEqual(response.data['challenge']['slug'], 'hero-badge')

    def test_save_draft(self):
        payload = {
            "slug": "hero-badge",
            "saved_html": "<div class='card'><h1>Draft</h1></div>",
            "saved_css": ".card { color: red; }"
        }
        response = self.client.post('/api/web-studio/save-draft/', payload, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data.get('success'))

        # Verify DB state
        from api.models import StudentChallengeProgress
        prog = StudentChallengeProgress.objects.get(student=self.student, challenge=self.challenge)
        self.assertEqual(prog.saved_html, "<div class='card'><h1>Draft</h1></div>")

    def test_submit_valid_solution(self):
        payload = {
            "slug": "hero-badge",
            "html": "<div class='card'><h1>HERO LEO</h1><button>GO</button></div>",
            "css": ".card { background: gold; }"
        }
        response = self.client.post('/api/web-studio/submit/', payload, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data.get('success'))
        self.assertTrue(response.data.get('is_completed'))
        self.assertEqual(response.data.get('reward_xp'), 50)

        # Check XP awarded to profile
        self.profile.refresh_from_db()
        self.assertEqual(self.profile.points, 60) # 10 + 50 = 60

    def test_submit_empty_malformed_and_nested_html(self):
        # 1. Empty code
        res_empty = self.client.post('/api/web-studio/submit/', {"slug": "hero-badge", "html": "", "css": ""}, format='json')
        self.assertEqual(res_empty.status_code, 200)
        self.assertFalse(res_empty.data.get('success'))

        # 2. Malformed HTML
        res_malformed = self.client.post('/api/web-studio/submit/', {"slug": "hero-badge", "html": "<div class='card'<h1<button>invalid>>", "css": "invalid {"}, format='json')
        self.assertEqual(res_malformed.status_code, 200)
        self.assertIsInstance(res_malformed.data.get('criteria_results'), list)

        # 3. Deeply nested HTML
        nested_html = "<div><div><div class='card'><h1>Nested</h1><button>Press</button></div></div></div>"
        res_nested = self.client.post('/api/web-studio/submit/', {"slug": "hero-badge", "html": nested_html, "css": ".card { }"}, format='json')
        self.assertEqual(res_nested.status_code, 200)
        self.assertTrue(res_nested.data.get('success'))

