import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import {
  GraduationCap, Users, MessageSquare, BookOpen, Briefcase,
  Shield, ArrowRight, CheckCircle, ChevronRight
} from 'lucide-react';

const features = [
  { icon: Users, title: 'Alumni Network', desc: 'Connect with verified alumni for mentorship and referrals' },
  { icon: MessageSquare, title: 'Career Forum', desc: 'Ask questions, share experiences, and learn from peers' },
  { icon: BookOpen, title: 'Resource Hub', desc: 'Access notes, PYQs, and study materials organized by semester' },
  { icon: Briefcase, title: 'Opportunities', desc: 'Discover internships, jobs, and referral opportunities' },
  { icon: GraduationCap, title: 'Placement Prep', desc: 'Read interview experiences and preparation strategies' },
  { icon: Shield, title: 'Secure & Private', desc: 'No public emails, verified users, and anti-misuse systems' },
];

const stats = [
  { value: '500+', label: 'Verified Members' },
  { value: '200+', label: 'Placement Stories' },
  { value: '50+', label: 'Active Mentors' },
  { value: '100+', label: 'Resources Shared' },
];

const fadeUp = { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 } };

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <img
              src="https://media.base44.com/images/public/6a053686e7159e271553eb50/a7b8e5875_Gemini_Generated_Image_2lx0f02lx0f02lx0.png"
              alt="CampusBridge"
              className="h-10 w-auto object-contain"
            />
          </div>
          <div className="flex items-center gap-3">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link to="/dashboard">
              <Button size="sm" className="gap-1.5">
                Get Started <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="max-w-6xl mx-auto px-4 pt-20 pb-28 relative">
          <motion.div {...fadeUp} transition={{ duration: 0.6 }} className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card text-sm text-muted-foreground mb-6">
              <Shield className="w-3.5 h-3.5 text-primary" />
              Secure. Verified. College-only.
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight mb-6">
              Your College's
              <span className="text-primary block">Professional Network</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8 leading-relaxed">
              Connect with seniors and alumni for mentorship, placement prep, career guidance, and resources — all within a secure, private platform.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link to="/dashboard">
                <Button size="lg" className="gap-2 h-12 px-6">
                  Join CampusBridge <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/forum">
                <Button variant="outline" size="lg" className="h-12 px-6">
                  Browse Forum
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-card">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                {...fadeUp}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center"
              >
                <p className="text-3xl font-bold text-primary">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <motion.div {...fadeUp} transition={{ duration: 0.5 }} className="text-center mb-14">
          <h2 className="text-3xl font-bold mb-3">Everything You Need</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            One platform to bridge the gap between students and alumni
          </p>
        </motion.div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feat, i) => (
            <motion.div
              key={feat.title}
              {...fadeUp}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="group p-6 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feat.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold mb-1.5">{feat.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">Ready to connect with your college network?</h2>
          <p className="text-primary-foreground/80 mb-8 max-w-md mx-auto">
            Join hundreds of students and alumni already building meaningful connections.
          </p>
          <Link to="/dashboard">
            <Button size="lg" variant="secondary" className="gap-2 h-12 px-8">
              Get Started Free <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center">
            <img
              src="https://media.base44.com/images/public/6a053686e7159e271553eb50/a7b8e5875_Gemini_Generated_Image_2lx0f02lx0f02lx0.png"
              alt="CampusBridge"
              className="h-8 w-auto object-contain"
            />
          </div>
          <p className="text-sm text-muted-foreground">© 2026 CampusBridge. Built for students, by students.</p>
        </div>
      </footer>
    </div>
  );
}