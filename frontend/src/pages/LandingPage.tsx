import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ScanLine, Brain, Shield, Zap, Heart, ChevronRight, Star,
  CheckCircle2, ArrowRight, Activity, PawPrint
} from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'Gemini AI Vision',
    desc: 'Powered by Google\'s latest Gemini multimodal model for accurate veterinary image analysis.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: ScanLine,
    title: 'Disease Detection',
    desc: 'Upload any pet image and get instant AI-powered disease identification with bounding boxes.',
    color: 'from-teal-500 to-green-500',
  },
  {
    icon: Shield,
    title: 'Detailed Diagnosis',
    desc: 'Full treatment plans, home care tips, and when-to-visit-vet recommendations.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: Activity,
    title: 'Scan History',
    desc: 'Track all your pet\'s health scans in one place with trend analysis and disease history.',
    color: 'from-orange-500 to-red-500',
  },
];

const workflow = [
  { step: '01', title: 'Upload Image', desc: 'Drag & drop your pet\'s photo or take one with your camera' },
  { step: '02', title: 'AI Analysis', desc: 'Our Gemini AI instantly analyzes the image for health conditions' },
  { step: '03', title: 'Get Diagnosis', desc: 'Receive comprehensive disease info and treatment recommendations' },
  { step: '04', title: 'Track Health', desc: 'Monitor your pet\'s health over time with our smart dashboard' },
];

const testimonials = [
  {
    name: 'Sarah M.',
    role: 'Dog Owner',
    content: 'Detected my dog\'s skin infection before it got serious. The AI diagnosis was incredibly accurate!',
    stars: 5,
  },
  {
    name: 'Dr. James K.',
    role: 'Veterinarian',
    content: 'An excellent tool for initial screenings. I recommend it to all my clients for early detection.',
    stars: 5,
  },
  {
    name: 'Priya L.',
    role: 'Cat Owner',
    content: 'The bounding box visualization showed exactly where the issue was. Amazing technology!',
    stars: 5,
  },
];

const faqs = [
  {
    q: 'What types of pets does it support?',
    a: 'Dogs, cats, birds, rabbits, and other common household pets are supported.',
  },
  {
    q: 'How accurate is the AI diagnosis?',
    a: 'Our Gemini AI provides high-accuracy assessments, though it should complement—not replace—professional veterinary advice.',
  },
  {
    q: 'Is my pet\'s data secure?',
    a: 'Yes. Images are processed securely and stored safely in our database.',
  },
  {
    q: 'Can I download my pet\'s report?',
    a: 'Yes! Every scan generates a downloadable PDF report with full diagnosis details.',
  },
];

function FloatingPet({ delay = 0, x = 0, y = 0, emoji }: { delay?: number; x?: number; y?: number; emoji: string }) {
  return (
    <motion.div
      animate={{
        y: [y, y - 20, y],
        rotate: [-5, 5, -5],
      }}
      transition={{
        duration: 4,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      className="absolute text-4xl select-none pointer-events-none"
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      {emoji}
    </motion.div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen animated-bg text-white overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-dark-900/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-blue-500 flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white">PetCare AI</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how" className="hover:text-white transition-colors">How It Works</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm text-slate-400 hover:text-white transition-colors">Login</Link>
            <Link
              to="/login"
              className="bg-gradient-to-r from-primary-600 to-blue-600 text-white text-sm font-medium px-5 py-2 rounded-xl hover:opacity-90 transition-opacity"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/20 via-transparent to-blue-900/20 pointer-events-none" />

        {/* Floating pet emojis */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <FloatingPet emoji="🐕" x={8} y={30} delay={0} />
          <FloatingPet emoji="🐈" x={85} y={25} delay={1} />
          <FloatingPet emoji="🐇" x={12} y={65} delay={2} />
          <FloatingPet emoji="🦜" x={78} y={60} delay={0.5} />
        </div>

        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-flex items-center gap-2 bg-primary-500/10 border border-primary-500/20 text-primary-400 text-xs font-semibold px-4 py-2 rounded-full mb-6">
              <Zap className="w-3 h-3" />
              Powered by Google Gemini AI
            </span>

            <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6">
              AI-Powered{' '}
              <span className="gradient-text">Pet Disease</span>
              <br />Detection
            </h1>

            <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
              Upload a photo of your pet and our advanced AI instantly analyzes symptoms, detects diseases, and provides personalized treatment recommendations.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/login"
                className="flex items-center gap-2 bg-gradient-to-r from-primary-600 to-blue-600 text-white font-semibold px-8 py-4 rounded-2xl hover:opacity-90 transition-opacity glow-teal"
              >
                <ScanLine className="w-5 h-5" />
                Start Free Scan
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#how"
                className="flex items-center gap-2 bg-white/5 border border-white/10 text-white font-medium px-8 py-4 rounded-2xl hover:bg-white/10 transition-colors"
              >
                See How It Works
              </a>
            </div>

            {/* Stats */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 mt-16 pt-16 border-t border-white/5">
              {[
                { value: '99%', label: 'Detection Accuracy' },
                { value: '10s', label: 'Avg. Analysis Time' },
                { value: '50+', label: 'Diseases Detected' },
              ].map(({ value, label }) => (
                <div key={label} className="text-center">
                  <div className="text-3xl font-black gradient-text-teal">{value}</div>
                  <div className="text-sm text-slate-400 mt-1">{label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 bg-dark-800/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Everything you need for <span className="gradient-text">pet health</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              Comprehensive AI-powered tools to keep your pet healthy and happy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, desc, color }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="glass p-6 rounded-2xl card-hover"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-white font-bold mb-2">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              How It <span className="gradient-text">Works</span>
            </h2>
            <p className="text-slate-400 text-lg">Diagnose your pet in 4 simple steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-8 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-primary-600 to-blue-600 opacity-30" />

            {workflow.map(({ step, title, desc }, i) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                viewport={{ once: true }}
                className="text-center relative"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-600 to-blue-600 flex items-center justify-center text-white font-black text-xl mx-auto mb-4">
                  {step}
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-dark-800/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Trusted by <span className="gradient-text">Pet Owners</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map(({ name, role, content, stars }, i) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="glass p-6 rounded-2xl"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: stars }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed mb-4">"{content}"</p>
                <div>
                  <div className="text-white font-semibold text-sm">{name}</div>
                  <div className="text-slate-400 text-xs">{role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Frequently Asked <span className="gradient-text">Questions</span>
            </h2>
          </div>
          <div className="space-y-4">
            {faqs.map(({ q, a }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="glass p-5 rounded-2xl"
              >
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-white font-semibold mb-1">{q}</h4>
                    <p className="text-slate-400 text-sm leading-relaxed">{a}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-primary-900/30 to-blue-900/30 border-t border-white/5">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <PawPrint className="w-16 h-16 text-primary-400 mx-auto mb-6" />
            <h2 className="text-4xl font-black text-white mb-4">
              Start protecting your pet today
            </h2>
            <p className="text-slate-400 text-lg mb-8">
              Join thousands of pet owners using AI-powered health monitoring.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-600 to-blue-600 text-white font-bold px-10 py-4 rounded-2xl hover:opacity-90 transition-opacity text-lg glow-teal"
            >
              Get Started Free
              <ChevronRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-dark-900 border-t border-white/5 text-center text-slate-500 text-sm">
        © 2026 PetCare AI. Built with Google Gemini AI.
      </footer>
    </div>
  );
}
