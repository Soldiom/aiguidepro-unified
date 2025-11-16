import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Link } from "wouter";
import { 
  Brain, 
  Code, 
  FileText, 
  Briefcase, 
  TrendingUp, 
  GraduationCap,
  Zap,
  CheckCircle2,
  ArrowRight,
  Github,
  Sparkles,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";

const agentTypes = [
  {
    icon: Brain,
    nameKey: 'agents.research.name',
    descKey: 'agents.research.desc',
    type: "research",
    capabilities: ['cap.research.1', 'cap.research.2', 'cap.research.3', 'cap.research.4'],
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-50 dark:bg-blue-950/20",
  },
  {
    icon: Code,
    nameKey: 'agents.development.name',
    descKey: 'agents.development.desc',
    type: "development",
    capabilities: ['cap.dev.1', 'cap.dev.2', 'cap.dev.3', 'cap.dev.4'],
    color: "from-purple-500 to-pink-500",
    bgColor: "bg-purple-50 dark:bg-purple-950/20",
  },
  {
    icon: FileText,
    nameKey: 'agents.content.name',
    descKey: 'agents.content.desc',
    type: "content",
    capabilities: ['cap.content.1', 'cap.content.2', 'cap.content.3', 'cap.content.4'],
    color: "from-orange-500 to-red-500",
    bgColor: "bg-orange-50 dark:bg-orange-950/20",
  },
  {
    icon: Briefcase,
    nameKey: 'agents.project.name',
    descKey: 'agents.project.desc',
    type: "project_management",
    capabilities: ['cap.project.1', 'cap.project.2', 'cap.project.3', 'cap.project.4'],
    color: "from-green-500 to-emerald-500",
    bgColor: "bg-green-50 dark:bg-green-950/20",
  },
  {
    icon: TrendingUp,
    nameKey: 'agents.business.name',
    descKey: 'agents.business.desc',
    type: "business",
    capabilities: ['cap.business.1', 'cap.business.2', 'cap.business.3', 'cap.business.4'],
    color: "from-yellow-500 to-amber-500",
    bgColor: "bg-yellow-50 dark:bg-yellow-950/20",
  },
  {
    icon: GraduationCap,
    nameKey: 'agents.tutor.name',
    descKey: 'agents.tutor.desc',
    type: "tutor",
    capabilities: ['cap.tutor.1', 'cap.tutor.2', 'cap.tutor.3', 'cap.tutor.4'],
    color: "from-indigo-500 to-violet-500",
    bgColor: "bg-indigo-50 dark:bg-indigo-950/20",
  },
];

const features = [
  {
    icon: Zap,
    titleKey: 'features.autonomous.title',
    descKey: 'features.autonomous.desc',
  },
  {
    icon: Brain,
    titleKey: 'features.planning.title',
    descKey: 'features.planning.desc',
  },
  {
    icon: Sparkles,
    titleKey: 'features.learning.title',
    descKey: 'features.learning.desc',
  },
  {
    icon: CheckCircle2,
    titleKey: 'features.integration.title',
    descKey: 'features.integration.desc',
  },
];

export default function Home() {
  const { isAuthenticated, user } = useAuth();
  const { t, language } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <header className="border-b bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={APP_LOGO} alt="Logo" className="h-10 w-10" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {APP_TITLE}
              </h1>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-4">
              <a href="https://althowaikh.com" target="_blank" rel="noopener noreferrer">
                <Button variant="ghost">{t('footer.website')}</Button>
              </a>
              <Link href="/dashboard">
                <Button variant="ghost">{t('nav.dashboard')}</Button>
              </Link>
              <Link href="/agents">
                <Button variant="ghost">{t('nav.agents')}</Button>
              </Link>
              <Link href="/tasks">
                <Button variant="ghost">{t('nav.tasks')}</Button>
              </Link>
              <Link href="/automation">
                <Button variant="ghost">Automation</Button>
              </Link>
              {isAuthenticated ? (
                <Badge variant="secondary" className="px-3 py-1">
                  {user?.name || user?.email}
                </Badge>
              ) : (
                <a href={getLoginUrl()}>
                  <Button variant="outline" size="sm">Login</Button>
                </a>
              )}
              <LanguageSwitcher />
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 space-y-2">
              <a href="https://althowaikh.com" target="_blank" rel="noopener noreferrer" className="block">
                <Button variant="ghost" className="w-full justify-start">{t('footer.website')}</Button>
              </a>
              <Link href="/dashboard">
                <Button variant="ghost" className="w-full justify-start">{t('nav.dashboard')}</Button>
              </Link>
              <Link href="/agents">
                <Button variant="ghost" className="w-full justify-start">{t('nav.agents')}</Button>
              </Link>
              <Link href="/tasks">
                <Button variant="ghost" className="w-full justify-start">{t('nav.tasks')}</Button>
              </Link>
              <Link href="/automation">
                <Button variant="ghost" className="w-full justify-start">Automation</Button>
              </Link>
              {!isAuthenticated && (
                <a href={getLoginUrl()}>
                  <Button className="w-full">Login</Button>
                </a>
              )}
              <div className="pt-2">
                <LanguageSwitcher />
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <Badge className="mb-6 px-4 py-2 text-sm" variant="secondary">
          <Sparkles className="w-4 h-4 mr-2 inline" />
          {t('hero.badge')}
        </Badge>
        <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          {t('hero.title1')}
          <br />
          {t('hero.title2')}
        </h2>
        <p className="text-xl text-slate-600 dark:text-slate-400 mb-8 max-w-3xl mx-auto">
          {t('hero.subtitle')}
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/dashboard">
            <Button size="lg" className="text-lg px-8">
              {t('hero.cta.primary')} <ArrowRight className={`${language === 'ar' ? 'mr-2 rotate-180' : 'ml-2'} w-5 h-5`} />
            </Button>
          </Link>
          <a href="https://github.com/Soldiom/aiguidepro-unified" target="_blank" rel="noopener noreferrer">
            <Button size="lg" variant="outline" className="text-lg px-8">
              <Github className={`${language === 'ar' ? 'ml-2' : 'mr-2'} w-5 h-5`} />
              {t('hero.cta.secondary')}
            </Button>
          </a>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {features.map((feature, idx) => (
            <Card key={idx} className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${agentTypes[idx % agentTypes.length].color} flex items-center justify-center mb-4`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-lg">{t(feature.titleKey)}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-400">{t(feature.descKey)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Agent Types */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h3 className="text-4xl font-bold mb-4">{t('agents.title')}</h3>
          <p className="text-xl text-slate-600 dark:text-slate-400">
            {t('agents.subtitle')}
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agentTypes.map((agent, idx) => (
            <Card key={idx} className={`border-2 hover:shadow-xl transition-all hover:-translate-y-1 ${agent.bgColor}`}>
              <CardHeader>
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${agent.color} flex items-center justify-center mb-4`}>
                  <agent.icon className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl">{t(agent.nameKey)}</CardTitle>
                <CardDescription className="text-base">{t(agent.descKey)}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {agent.capabilities.map((capKey, capIdx) => (
                    <div key={capIdx} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span>{t(capKey)}</span>
                    </div>
                  ))}
                </div>
                <Link href={`/agents?type=${agent.type}`}>
                  <Button className="w-full mt-4" variant="outline">
                    {t('btn.learn_more')} <ArrowRight className={`${language === 'ar' ? 'mr-2 rotate-180' : 'ml-2'} w-4 h-4`} />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
          <CardContent className="p-12 text-center">
            <h3 className="text-4xl font-bold mb-4">{t('cta.title')}</h3>
            <p className="text-xl mb-8 opacity-90">
              {t('cta.subtitle')}
            </p>
            <Link href="/dashboard">
              <Button size="lg" variant="secondary" className="text-lg px-8">
                {t('cta.button')} <ArrowRight className={`${language === 'ar' ? 'mr-2 rotate-180' : 'ml-2'} w-5 h-5`} />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-slate-600 dark:text-slate-400">
          <p>{t('footer.copyright')}</p>
          <div className="flex gap-6 justify-center mt-4">
            <a href="https://github.com/Soldiom" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
              {t('footer.github')}
            </a>
            <a href="https://althowaikh.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
              {t('footer.website')}
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
