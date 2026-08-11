"use client";

import React from 'react';
import Link from 'next/link';
import { 
  Globe, 
  ShieldCheck, 
  Lightbulb, 
  Puzzle, 
  Rocket, 
  Users, 
  Star, 
  Sparkles, 
  ArrowLeft, 
  CheckCircle2, 
  Compass, 
  Heart, 
  BookOpen, 
  Target, 
  Code,
  Terminal,
  Blocks,
  Printer,
  ChevronRight
} from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-sky-400 selection:text-white">
      {/* Header / Navbar */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 lg:px-12 py-3.5 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <img src="/logo.png" alt="DolaCode Logo" className="w-[80px] h-auto object-contain group-hover:scale-105 transition-transform" />
          </Link>

          <div className="flex items-center gap-3">
            <Link 
              href="/"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white shadow-md transition-all hover:scale-105"
            >
              <ArrowLeft size={14} /> Back to DolaCode
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Header Banner */}
      <section className="relative overflow-hidden bg-gradient-to-b from-sky-100/70 via-indigo-50/50 to-slate-50 border-b border-sky-100 py-16 lg:py-24 px-6">
        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-100 border border-sky-300 text-sky-700 text-xs font-black uppercase tracking-wider shadow-xs">
            <Sparkles size={16} /> Devnaija Academy Innovation
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-tight">
            About <span className="text-sky-500">DolaCode</span>
          </h1>
          <p className="text-xl sm:text-2xl font-black text-indigo-900 max-w-3xl mx-auto leading-relaxed">
            From One Classroom to Millions of Possibilities
          </p>
          <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto font-medium leading-relaxed">
            DolaCode was born from a simple belief: <strong>every child deserves the opportunity to understand, create and thrive with technology</strong>—regardless of where they live or what resources they have.
          </p>
        </div>
      </section>

      {/* Main Content Sections */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        
        {/* Story Section */}
        <section className="bg-white rounded-3xl p-8 sm:p-12 border-2 border-slate-200/90 shadow-sm space-y-6">
          <div className="inline-block bg-indigo-50 text-indigo-700 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider border border-indigo-200">
            Our Origin Story
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Our Journey Began with Devnaija Academy</h2>
          <div className="prose prose-slate max-w-none text-slate-700 space-y-4 text-base leading-relaxed font-medium">
            <p>
              Our journey began with <strong>Devnaija Academy</strong>, a Nigerian education technology company founded to equip children and young people with practical digital skills.
            </p>
            <p>
              Inside our classrooms, we watched children experience the excitement of creating their first animation, building their first website, solving a coding challenge or discovering that technology was something they could create—not just consume.
            </p>
            <div className="p-6 bg-amber-50/80 rounded-2xl border-l-4 border-amber-400 space-y-2 text-slate-800 my-6">
              <p className="font-bold text-amber-950 text-base">But we also discovered a limitation.</p>
              <p className="font-black text-xl text-amber-900">A physical classroom can only reach so many children.</p>
              <p className="text-sm text-slate-700">If we truly wanted to prepare the next generation for a technology-driven future, learning needed to move beyond the four walls of our classrooms.</p>
            </div>
            <p className="font-bold text-slate-900 text-lg">That challenge inspired DolaCode.</p>
          </div>
        </section>

        {/* Born from Devnaija Section */}
        <section className="bg-gradient-to-br from-indigo-50/60 via-purple-50/40 to-sky-50/60 rounded-3xl p-8 sm:p-12 border-2 border-indigo-200/80 shadow-md space-y-6">
          <div className="inline-block bg-purple-100 text-purple-800 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider border border-purple-300">
            Scaling Digital Education
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Born from Devnaija. Built to Scale Learning.
          </h2>
          <p className="text-slate-700 text-base sm:text-lg leading-relaxed font-medium">
            DolaCode transforms the teaching experience, curriculum knowledge and lessons learned through Devnaija Academy into an accessible, engaging digital learning platform for children.
          </p>
          <p className="text-slate-700 text-base leading-relaxed font-medium">
            Instead of depending entirely on physical instructors and classrooms, children can progress through structured learning experiences using interactive challenges, games, projects and age-appropriate technology.
          </p>
          <div className="bg-white p-6 rounded-2xl border border-indigo-200 shadow-2xs space-y-3">
            <p className="font-bold text-slate-900 text-base">
              They begin with foundational numeracy and computational thinking, progress into block-based programming and app development, and ultimately advance to real programming with Python.
            </p>
            <div className="p-4 bg-sky-50 rounded-xl border border-sky-200 text-sky-900 font-black text-lg">
              &ldquo;Our goal is not simply to teach children how to code. We want children to learn how to think, solve problems, create confidently and use technology responsibly.&rdquo;
            </div>
          </div>
        </section>

        {/* Mission & Vision Cards */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Mission */}
          <div className="bg-white rounded-3xl p-8 border-2 border-sky-200 shadow-md space-y-4 hover:border-sky-400 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 border border-sky-300 flex items-center justify-center text-sky-600">
              <Target size={26} />
            </div>
            <h3 className="text-2xl font-black text-slate-900">Our Mission</h3>
            <p className="text-slate-700 text-base leading-relaxed font-medium">
              To provide children with safe, affordable and engaging digital learning experiences that develop coding, computational thinking, creativity and problem-solving skills, empowering them to become confident creators in a technology-driven world.
            </p>
          </div>

          {/* Vision */}
          <div className="bg-white rounded-3xl p-8 border-2 border-purple-200 shadow-md space-y-4 hover:border-purple-400 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 border border-purple-300 flex items-center justify-center text-purple-600">
              <Compass size={26} />
            </div>
            <h3 className="text-2xl font-black text-slate-900">Our Vision</h3>
            <p className="text-slate-700 text-base leading-relaxed font-medium">
              To build Africa&apos;s leading safe and inclusive digital learning platform, empowering at least <strong>10 million children</strong> to become confident creators, problem-solvers and innovators over the next 10 years.
            </p>
          </div>
        </div>

        {/* What We Believe */}
        <section className="bg-white rounded-3xl p-8 sm:p-12 border-2 border-slate-200/90 shadow-sm space-y-6">
          <div className="inline-block bg-pink-50 text-pink-700 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider border border-pink-200">
            Core Beliefs
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">What We Believe</h2>
          <p className="text-slate-700 text-base sm:text-lg leading-relaxed font-medium">
            The future should not belong only to children who have access to expensive schools, private tutors or advanced technology.
          </p>
          <div className="p-6 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-2xl font-black text-2xl text-center shadow-lg">
            Talent is everywhere. Opportunity is not.
          </div>
          <p className="text-slate-700 text-base leading-relaxed font-medium">
            We believe technology can help close that gap. DolaCode is being built so that a child can progressively develop valuable digital skills through learning experiences designed to be engaging, practical and accessible.
          </p>
          <p className="text-slate-700 text-base font-semibold leading-relaxed">
            Our ambition is to help raise a generation of African children who don&apos;t simply use the technologies shaping their world—they understand them, question them and eventually build with them.
          </p>
        </section>

        {/* Our Values Grid */}
        <section className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Our Core Values</h2>
            <p className="text-slate-600 font-medium text-base">The guiding principles behind everything we build at DolaCode.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Value 1 */}
            <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 hover:border-sky-300 transition-colors space-y-3 shadow-xs">
              <div className="flex items-center gap-3">
                <Globe className="text-sky-500" size={24} />
                <h3 className="font-black text-xl text-slate-900">Accessibility</h3>
              </div>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-medium">
                Every child should have the opportunity to learn future-ready digital skills. We work to make quality technology education increasingly affordable, accessible and inclusive.
              </p>
            </div>

            {/* Value 2 */}
            <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 hover:border-emerald-300 transition-colors space-y-3 shadow-xs">
              <div className="flex items-center gap-3">
                <ShieldCheck className="text-emerald-500" size={24} />
                <h3 className="font-black text-xl text-slate-900">Safety</h3>
              </div>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-medium">
                Children&apos;s wellbeing comes first. We are committed to building learning experiences with child safety, privacy and responsible technology use at their foundation.
              </p>
            </div>

            {/* Value 3 */}
            <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 hover:border-amber-300 transition-colors space-y-3 shadow-xs">
              <div className="flex items-center gap-3">
                <Lightbulb className="text-amber-500" size={24} />
                <h3 className="font-black text-xl text-slate-900">Creativity</h3>
              </div>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-medium">
                We encourage children to imagine, experiment, build and express their ideas through technology.
              </p>
            </div>

            {/* Value 4 */}
            <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 hover:border-purple-300 transition-colors space-y-3 shadow-xs">
              <div className="flex items-center gap-3">
                <Puzzle className="text-purple-500" size={24} />
                <h3 className="font-black text-xl text-slate-900">Problem-Solving</h3>
              </div>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-medium">
                Coding is more than writing instructions for computers. We help children develop logical thinking, resilience and the confidence to approach difficult problems.
              </p>
            </div>

            {/* Value 5 */}
            <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 hover:border-pink-300 transition-colors space-y-3 shadow-xs">
              <div className="flex items-center gap-3">
                <Rocket className="text-pink-500" size={24} />
                <h3 className="font-black text-xl text-slate-900">Innovation</h3>
              </div>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-medium">
                Technology keeps changing—and so must education. We continuously explore better ways to make digital learning effective, engaging and relevant.
              </p>
            </div>

            {/* Value 6 */}
            <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 hover:border-indigo-300 transition-colors space-y-3 shadow-xs">
              <div className="flex items-center gap-3">
                <Users className="text-indigo-500" size={24} />
                <h3 className="font-black text-xl text-slate-900">Inclusion</h3>
              </div>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-medium">
                A child&apos;s gender, background, location or economic circumstances should not determine whether they can participate in the digital future.
              </p>
            </div>

            {/* Value 7 */}
            <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 hover:border-yellow-300 transition-colors sm:col-span-2 lg:col-span-3 space-y-3 shadow-xs">
              <div className="flex items-center gap-3">
                <Star className="text-yellow-500 fill-yellow-400" size={24} />
                <h3 className="font-black text-xl text-slate-900">Excellence</h3>
              </div>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-medium">
                We believe African children deserve world-class learning experiences. We continually improve our curriculum, technology and teaching methods to deliver meaningful learning outcomes.
              </p>
            </div>
          </div>
        </section>

        {/* The DolaCode Learning Journey */}
        <section className="bg-white rounded-3xl p-8 sm:p-12 border-2 border-slate-200/90 shadow-sm space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">The DolaCode Learning Journey</h2>
            <p className="text-slate-600 font-medium text-sm">Four progressive stages to build confidence and mastery.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-sky-50/70 p-6 rounded-2xl border border-sky-200 space-y-3">
              <div className="w-10 h-10 bg-sky-500 text-white rounded-xl flex items-center justify-center font-black">1</div>
              <h4 className="font-black text-slate-900 text-lg">Start with Thinking</h4>
              <p className="text-slate-600 text-xs leading-relaxed font-medium">
                Young learners build foundational numeracy, sequencing, logic and computational-thinking skills.
              </p>
            </div>

            <div className="bg-pink-50/70 p-6 rounded-2xl border border-pink-200 space-y-3">
              <div className="w-10 h-10 bg-pink-500 text-white rounded-xl flex items-center justify-center font-black">2</div>
              <h4 className="font-black text-slate-900 text-lg">Learn Through Blocks</h4>
              <p className="text-slate-600 text-xs leading-relaxed font-medium">
                Children discover programming concepts visually through block-based coding and interactive challenges.
              </p>
            </div>

            <div className="bg-purple-50/70 p-6 rounded-2xl border border-purple-200 space-y-3">
              <div className="w-10 h-10 bg-purple-500 text-white rounded-xl flex items-center justify-center font-black">3</div>
              <h4 className="font-black text-slate-900 text-lg">Graduate to Real Code</h4>
              <p className="text-slate-600 text-xs leading-relaxed font-medium">
                As their confidence grows, learners transition into text-based programming, including Python.
              </p>
            </div>

            <div className="bg-amber-50/70 p-6 rounded-2xl border border-amber-200 space-y-3">
              <div className="w-10 h-10 bg-amber-500 text-white rounded-xl flex items-center justify-center font-black">4</div>
              <h4 className="font-black text-slate-900 text-lg">Build and Create</h4>
              <p className="text-slate-600 text-xs leading-relaxed font-medium">
                Learners progress from understanding code to creating projects and web applications of their own.
              </p>
            </div>
          </div>

          <div className="p-4 bg-slate-900 text-white text-center rounded-2xl font-black text-lg sm:text-xl tracking-wider">
            Learn → Think → Build → Create
          </div>
        </section>

        {/* Built for Children. Trusted by Parents. */}
        <section className="bg-gradient-to-br from-emerald-50 via-teal-50 to-sky-50 rounded-3xl p-8 sm:p-12 border-2 border-emerald-200 shadow-md space-y-4">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Built for Children. Trusted by Parents.</h2>
          <p className="text-slate-700 text-base leading-relaxed font-medium">
            We understand that putting technology into the hands of children comes with responsibility. That is why DolaCode is committed to creating a learning environment where <strong>education, safety and responsible technology use grow together</strong>.
          </p>
          <p className="text-slate-700 text-base leading-relaxed font-medium">
            As we continue developing the platform, our approach is guided by child-centred design, age-appropriate learning, privacy-conscious technology and tools that help parents and educators understand children&apos;s learning progress.
          </p>
        </section>

        {/* Our Roots */}
        <section className="bg-white rounded-3xl p-8 sm:p-12 border-2 border-slate-200/90 shadow-sm space-y-4">
          <div className="inline-block bg-slate-100 text-slate-700 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider border border-slate-300">
            Devnaija Roots
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Our Roots</h2>
          <p className="text-slate-700 text-base leading-relaxed font-medium">
            DolaCode is powered by <strong>Devnaija Academy Limited</strong>. Since its establishment, Devnaija Academy has worked with children and young people through coding education, digital-skills programmes, school partnerships, bootcamps and community initiatives.
          </p>
          <p className="text-slate-700 text-base leading-relaxed font-medium">
            Our experience teaching learners face-to-face gave us something technology alone could not provide: <strong>the opportunity to understand how children actually learn</strong>.
          </p>
          <p className="text-slate-700 text-base leading-relaxed font-medium">
            DolaCode takes those lessons beyond the classroom. What began with individual learners in our classrooms is becoming a platform designed to reach communities across Nigeria, Africa and eventually the world.
          </p>
        </section>

        {/* Our North Star */}
        <section className="bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 text-white rounded-3xl p-8 sm:p-14 shadow-2xl text-center space-y-6">
          <div className="inline-block bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-white/30">
            Our North Star
          </div>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
            10 Million Children. 10 Years. <br />
            <span className="text-yellow-300">One Generation of Creators.</span>
          </h2>
          <p className="text-sky-100 text-base sm:text-lg max-w-3xl mx-auto font-medium leading-relaxed">
            Our ambition is bold. Over the next decade, we want DolaCode to help at least <strong>10 million children</strong> gain the confidence and skills to participate meaningfully in the digital economy.
          </p>
          <p className="text-sky-100 text-sm sm:text-base max-w-2xl mx-auto font-medium">
            We know that reaching that goal will require strong technology, great educators, parents, schools, communities and partners who share our belief in the potential of every child.
          </p>
          <div className="pt-4 border-t border-white/20 space-y-2">
            <p className="font-black text-xl text-yellow-300">Ours started in a classroom.</p>
            <p className="font-bold text-lg">Now, we&apos;re taking that classroom to millions of children.</p>
            <p className="text-2xl font-black pt-2">Welcome to DolaCode.</p>
            <p className="text-sky-200 text-sm font-semibold italic pt-2">Learn. Create. Build the Future.</p>
            <p className="text-xs text-sky-300 font-bold uppercase tracking-wider">DolaCode — A Devnaija Academy innovation.</p>
          </div>
        </section>

      </main>

      {/* Footer (Bright Theme) */}
      <footer className="border-t border-slate-200 bg-white py-8 px-6 text-center text-xs text-slate-500 font-medium">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© 2026 DolaCode Platform (Devnaija Academy). All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/" className="hover:text-slate-800 transition-colors">Home</Link>
            <Link href="/about" className="text-sky-600 font-bold">About Us</Link>
            <Link href="/terms" className="hover:text-slate-800 transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-slate-800 transition-colors">Privacy Policy</Link>
            <Link href="/child-safety" className="hover:text-slate-800 transition-colors">Child Safety</Link>
            <Link href="/contact" className="hover:text-slate-800 transition-colors">Contact Us</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
