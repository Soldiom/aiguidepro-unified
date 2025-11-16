import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: 'ltr' | 'rtl';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.dashboard': 'Dashboard',
    'nav.agents': 'Agents',
    'nav.tasks': 'Tasks',
    'nav.workflows': 'Workflows',
    'nav.settings': 'Settings',
    
    // Hero Section
    'hero.badge': 'Powered by GitHub + Hugging Face + Netlify',
    'hero.title1': 'AI Employees Working',
    'hero.title2': '24/7 for You',
    'hero.subtitle': 'A team of intelligent AI agents that understand your goals, plan the steps, execute tasks, and learn from results - all automatically.',
    'hero.cta.primary': 'Start Building',
    'hero.cta.secondary': 'View on GitHub',
    
    // Features
    'features.autonomous.title': 'Autonomous Execution',
    'features.autonomous.desc': 'Agents work independently without constant supervision',
    'features.planning.title': 'Intelligent Planning',
    'features.planning.desc': 'Analyzes tasks and creates optimal execution plans',
    'features.learning.title': 'Self-Learning',
    'features.learning.desc': 'Improves performance with every completed task',
    'features.integration.title': 'Multi-Tool Integration',
    'features.integration.desc': 'Seamlessly integrates with GitHub, HuggingFace, and more',
    
    // Agent Types
    'agents.title': 'Meet Your AI Team',
    'agents.subtitle': 'Six specialized agents, each expert in their domain',
    'agents.research.name': 'Research & Analysis Agent',
    'agents.research.desc': 'Deep research, data analysis, and comprehensive report generation',
    'agents.development.name': 'Software Development Agent',
    'agents.development.desc': 'Code writing, debugging, and full application development',
    'agents.content.name': 'Content Creation Agent',
    'agents.content.desc': 'Content writing, image generation, and presentation creation',
    'agents.project.name': 'Project Management Agent',
    'agents.project.desc': 'Task planning, team coordination, and progress tracking',
    'agents.business.name': 'Business Consulting Agent',
    'agents.business.desc': 'Market analysis, strategy development, and decision support',
    'agents.tutor.name': 'Personal Tutor Agent',
    'agents.tutor.desc': 'Concept explanation, personalized learning, and skill development',
    
    // Capabilities
    'cap.research.1': 'Multi-source research',
    'cap.research.2': 'Data analysis',
    'cap.research.3': 'Report generation',
    'cap.research.4': 'Insight extraction',
    'cap.dev.1': 'Code generation',
    'cap.dev.2': 'Bug fixing',
    'cap.dev.3': 'Testing',
    'cap.dev.4': 'Documentation',
    'cap.content.1': 'Content writing',
    'cap.content.2': 'Image generation',
    'cap.content.3': 'Presentations',
    'cap.content.4': 'Marketing copy',
    'cap.project.1': 'Task planning',
    'cap.project.2': 'Resource allocation',
    'cap.project.3': 'Progress tracking',
    'cap.project.4': 'Reporting',
    'cap.business.1': 'Market analysis',
    'cap.business.2': 'Strategy planning',
    'cap.business.3': 'Financial analysis',
    'cap.business.4': 'Decision support',
    'cap.tutor.1': 'Concept explanation',
    'cap.tutor.2': 'Learning paths',
    'cap.tutor.3': 'Skill assessment',
    'cap.tutor.4': 'Progress tracking',
    
    // CTA
    'cta.title': 'Ready to Deploy Your AI Team?',
    'cta.subtitle': 'Start automating your workflows with intelligent AI agents today',
    'cta.button': 'Get Started Free',
    
    // Footer
    'footer.copyright': '© 2025 AI Guide Pro Unified System. Built with ❤️ using GitHub, Hugging Face, and Netlify.',
    'footer.github': 'GitHub',
    'footer.website': 'althowaikh.com',
    
    // Buttons
    'btn.learn_more': 'Learn More',
    'btn.create_agent': 'Create Agent',
    'btn.create_task': 'Create Task',
    'btn.activate': 'Activate',
    'btn.pause': 'Pause',
    'btn.configure': 'Configure',
    'btn.logs': 'Logs',
    'btn.delete': 'Delete',
    'btn.cancel': 'Cancel',
    'btn.save': 'Save',
    'btn.submit': 'Submit',
    'btn.back': 'Back',
    
    // Agent Management
    'agent.management': 'Agent Management',
    'agent.create.title': 'Create New Agent',
    'agent.create.desc': 'Configure and deploy a new AI agent',
    'agent.name': 'Agent Name',
    'agent.type': 'Agent Type',
    'agent.description': 'Description',
    'agent.status': 'Status',
    'agent.no_agents': 'No Agents Yet',
    'agent.no_agents.desc': 'Create your first AI agent to get started',
    'agent.creating': 'Creating...',
    
    // Task Management
    'task.management': 'Task Management',
    'task.create.title': 'Create New Task',
    'task.create.desc': 'Assign a task to an AI agent',
    'task.title': 'Task Title',
    'task.type': 'Task Type',
    'task.description': 'Description',
    'task.priority': 'Priority',
    'task.assign': 'Assign to Agent',
    'task.auto_assign': 'Auto-assign',
    'task.status': 'Status',
    'task.progress': 'Progress',
    'task.no_tasks': 'No Tasks Found',
    'task.no_tasks.desc': 'Create your first task to get started',
    'task.creating': 'Creating...',
    
    // Dashboard
    'dashboard.welcome': 'Welcome back',
    'dashboard.subtitle': "Here's what's happening with your AI agents",
    'dashboard.total_agents': 'Total Agents',
    'dashboard.tasks_completed': 'Tasks Completed',
    'dashboard.running_tasks': 'Running Tasks',
    'dashboard.active_workflows': 'Active Workflows',
    'dashboard.recent_tasks': 'Recent Tasks',
    'dashboard.your_agents': 'Your Agents',
    'dashboard.view_all': 'View All',
    'dashboard.manage': 'Manage',
    'dashboard.quick_actions': 'Quick Actions',
    
    // Status
    'status.active': 'Active',
    'status.inactive': 'Inactive',
    'status.busy': 'Busy',
    'status.error': 'Error',
    'status.pending': 'Pending',
    'status.queued': 'Queued',
    'status.running': 'Running',
    'status.completed': 'Completed',
    'status.failed': 'Failed',
    'status.cancelled': 'Cancelled',
    
    // Priority
    'priority.low': 'Low',
    'priority.medium': 'Medium',
    'priority.high': 'High',
    'priority.urgent': 'Urgent',
    
    // Messages
    'msg.agent.created': 'Agent created successfully!',
    'msg.agent.updated': 'Agent updated successfully!',
    'msg.agent.deleted': 'Agent deleted successfully!',
    'msg.task.created': 'Task created successfully!',
    'msg.task.updated': 'Task updated successfully!',
    'msg.task.deleted': 'Task deleted successfully!',
    'msg.confirm.delete': 'Are you sure you want to delete this',
    'msg.auth.required': 'Authentication Required',
    'msg.auth.login': 'Please log in to access this page',
    
    // Purchase Page
    'choosePlan': 'Choose Your Plan',
    'purchaseDescription': 'Get lifetime access to AI Guide Pro Desktop Edition with offline capabilities',
    'mostPopular': 'Most Popular',
    'lifetime': 'lifetime',
    'selectPlan': 'Select this plan',
    'completeYourPurchase': 'Complete Your Purchase',
    'enterEmailToReceiveLicense': 'Enter your email to receive your license key',
    'emailAddress': 'Email Address',
    'secureOfflineLicense': 'Secure Offline License',
    'secureOfflineDescription': 'Your license works completely offline with RSA encryption',
    'instantActivation': 'Instant Activation',
    'instantActivationDescription': 'Activate on your devices immediately after purchase',
    'selectedPlan': 'Selected Plan',
    'deviceActivations': 'Device Activations',
    'total': 'Total',
    'purchaseNow': 'Purchase Now',
    'processing': 'Processing...',
    'pleaseEnterEmail': 'Please enter your email address',
    'purchaseSuccess': 'Purchase successful! Check your email for the license key.',
    'purchaseFailed': 'Purchase failed. Please try again.',
    'frequentlyAskedQuestions': 'Frequently Asked Questions',
    'faqQuestion1': 'How does offline licensing work?',
    'faqAnswer1': 'Your license key is cryptographically signed and can be validated completely offline. No internet connection required after activation.',
    'faqQuestion2': 'Can I transfer my license to another device?',
    'faqAnswer2': 'Yes! You can deactivate on one device and activate on another, as long as you stay within your activation limit.',
    'faqQuestion3': 'What happens if I exceed my activation limit?',
    'faqAnswer3': 'You can deactivate unused devices from your account dashboard, or upgrade to a plan with more activations.',
    'allRightsReserved': 'All rights reserved',
    'home': 'Home',
    'dashboard': 'Dashboard',

    // Automation
    'automation.title': '24/7 Automated Training',
    'automation.subtitle': 'Continuous learning from GitHub and HuggingFace',
    'automation.start': 'Start Training',
    'automation.stop': 'Stop Training',
    'automation.collect': 'Collect Data',
    'automation.status.title': 'Status',
    'automation.status.running': 'Running',
    'automation.status.stopped': 'Stopped',
    'automation.totalJobs': 'Total Jobs',
    'automation.completed': 'Completed',
    'automation.failed': 'Failed',
    'automation.models.title': 'Specialized Models',
    'automation.models.description': 'AI models trained for specific domains',
    'automation.models.dataPoints': 'Data Points',
    'automation.models.trained': 'Trained',
    'automation.models.empty': 'No models trained yet',
    'automation.models.emptyHint': 'Start automated training to generate specialized models',
    'automation.jobs.title': 'Recent Training Jobs',
    'automation.jobs.description': 'Last 10 training jobs',
    'automation.jobs.dataPoints': 'data points',
    'automation.jobs.empty': 'No training jobs yet',
    'automation.jobs.emptyHint': 'Training jobs will appear here once automation starts',
  },
  ar: {
    // Navigation
    'nav.home': 'الرئيسية',
    'nav.dashboard': 'لوحة التحكم',
    'nav.agents': 'الوكلاء',
    'nav.tasks': 'المهام',
    'nav.workflows': 'سير العمل',
    'nav.settings': 'الإعدادات',
    
    // Hero Section
    'hero.badge': 'مدعوم بـ GitHub + Hugging Face + Netlify',
    'hero.title1': 'موظفو AI الأذكياء',
    'hero.title2': 'يعملون لك على مدار الساعة',
    'hero.subtitle': 'فريق من الوكلاء الأذكياء يفهمون أهدافك، يخططون الخطوات، ينفذون المهام، ويتعلمون من النتائج - كل ذلك تلقائياً.',
    'hero.cta.primary': 'ابدأ البناء',
    'hero.cta.secondary': 'عرض على GitHub',
    
    // Features
    'features.autonomous.title': 'التنفيذ المستقل',
    'features.autonomous.desc': 'يعمل الوكلاء بشكل مستقل دون إشراف مستمر',
    'features.planning.title': 'التخطيط الذكي',
    'features.planning.desc': 'يحلل المهام وينشئ خطط تنفيذ مثالية',
    'features.learning.title': 'التعلم الذاتي',
    'features.learning.desc': 'يتحسن الأداء مع كل مهمة مكتملة',
    'features.integration.title': 'تكامل متعدد الأدوات',
    'features.integration.desc': 'يتكامل بسلاسة مع GitHub و HuggingFace والمزيد',
    
    // Agent Types
    'agents.title': 'تعرف على فريق AI الخاص بك',
    'agents.subtitle': 'ستة وكلاء متخصصين، كل منهم خبير في مجاله',
    'agents.research.name': 'وكيل البحث والتحليل',
    'agents.research.desc': 'بحث عميق، تحليل بيانات، وإنشاء تقارير شاملة',
    'agents.development.name': 'وكيل تطوير البرمجيات',
    'agents.development.desc': 'كتابة الأكواد، إصلاح الأخطاء، وبناء تطبيقات كاملة',
    'agents.content.name': 'وكيل إنشاء المحتوى',
    'agents.content.desc': 'كتابة المحتوى، توليد الصور، وإنشاء العروض التقديمية',
    'agents.project.name': 'وكيل إدارة المشاريع',
    'agents.project.desc': 'تخطيط المهام، تنسيق الفريق، وتتبع التقدم',
    'agents.business.name': 'وكيل الاستشارات التجارية',
    'agents.business.desc': 'تحليل السوق، تطوير الاستراتيجية، ودعم القرارات',
    'agents.tutor.name': 'وكيل المعلم الشخصي',
    'agents.tutor.desc': 'شرح المفاهيم، التعلم الشخصي، وتطوير المهارات',
    
    // Capabilities
    'cap.research.1': 'بحث متعدد المصادر',
    'cap.research.2': 'تحليل البيانات',
    'cap.research.3': 'إنشاء التقارير',
    'cap.research.4': 'استخلاص الأفكار',
    'cap.dev.1': 'توليد الأكواد',
    'cap.dev.2': 'إصلاح الأخطاء',
    'cap.dev.3': 'الاختبار',
    'cap.dev.4': 'التوثيق',
    'cap.content.1': 'كتابة المحتوى',
    'cap.content.2': 'توليد الصور',
    'cap.content.3': 'العروض التقديمية',
    'cap.content.4': 'المحتوى التسويقي',
    'cap.project.1': 'تخطيط المهام',
    'cap.project.2': 'تخصيص الموارد',
    'cap.project.3': 'تتبع التقدم',
    'cap.project.4': 'إعداد التقارير',
    'cap.business.1': 'تحليل السوق',
    'cap.business.2': 'التخطيط الاستراتيجي',
    'cap.business.3': 'التحليل المالي',
    'cap.business.4': 'دعم القرارات',
    'cap.tutor.1': 'شرح المفاهيم',
    'cap.tutor.2': 'مسارات التعلم',
    'cap.tutor.3': 'تقييم المهارات',
    'cap.tutor.4': 'تتبع التقدم',
    
    // CTA
    'cta.title': 'هل أنت مستعد لنشر فريق AI الخاص بك؟',
    'cta.subtitle': 'ابدأ أتمتة سير العمل باستخدام وكلاء AI الأذكياء اليوم',
    'cta.button': 'ابدأ مجاناً',
    
    // Footer
    'footer.copyright': '© 2025 نظام AI Guide Pro الموحد. بُني بـ ❤️ باستخدام GitHub و Hugging Face و Netlify.',
    'footer.github': 'GitHub',
    'footer.website': 'althowaikh.com',
    
    // Buttons
    'btn.learn_more': 'اعرف المزيد',
    'btn.create_agent': 'إنشاء وكيل',
    'btn.create_task': 'إنشاء مهمة',
    'btn.activate': 'تفعيل',
    'btn.pause': 'إيقاف مؤقت',
    'btn.configure': 'تكوين',
    'btn.logs': 'السجلات',
    'btn.delete': 'حذف',
    'btn.cancel': 'إلغاء',
    'btn.save': 'حفظ',
    'btn.submit': 'إرسال',
    'btn.back': 'رجوع',
    
    // Agent Management
    'agent.management': 'إدارة الوكلاء',
    'agent.create.title': 'إنشاء وكيل جديد',
    'agent.create.desc': 'تكوين ونشر وكيل AI جديد',
    'agent.name': 'اسم الوكيل',
    'agent.type': 'نوع الوكيل',
    'agent.description': 'الوصف',
    'agent.status': 'الحالة',
    'agent.no_agents': 'لا توجد وكلاء بعد',
    'agent.no_agents.desc': 'أنشئ وكيلك الأول للبدء',
    'agent.creating': 'جاري الإنشاء...',
    
    // Task Management
    'task.management': 'إدارة المهام',
    'task.create.title': 'إنشاء مهمة جديدة',
    'task.create.desc': 'تعيين مهمة لوكيل AI',
    'task.title': 'عنوان المهمة',
    'task.type': 'نوع المهمة',
    'task.description': 'الوصف',
    'task.priority': 'الأولوية',
    'task.assign': 'تعيين للوكيل',
    'task.auto_assign': 'تعيين تلقائي',
    'task.status': 'الحالة',
    'task.progress': 'التقدم',
    'task.no_tasks': 'لا توجد مهام',
    'task.no_tasks.desc': 'أنشئ مهمتك الأولى للبدء',
    'task.creating': 'جاري الإنشاء...',
    
    // Dashboard
    'dashboard.welcome': 'مرحباً بعودتك',
    'dashboard.subtitle': 'إليك ما يحدث مع وكلاء AI الخاصين بك',
    'dashboard.total_agents': 'إجمالي الوكلاء',
    'dashboard.tasks_completed': 'المهام المكتملة',
    'dashboard.running_tasks': 'المهام الجارية',
    'dashboard.active_workflows': 'سير العمل النشط',
    'dashboard.recent_tasks': 'المهام الأخيرة',
    'dashboard.your_agents': 'وكلاؤك',
    'dashboard.view_all': 'عرض الكل',
    'dashboard.manage': 'إدارة',
    'dashboard.quick_actions': 'إجراءات سريعة',
    
    // Status
    'status.active': 'نشط',
    'status.inactive': 'غير نشط',
    'status.busy': 'مشغول',
    'status.error': 'خطأ',
    'status.pending': 'قيد الانتظار',
    'status.queued': 'في الطابور',
    'status.running': 'قيد التنفيذ',
    'status.completed': 'مكتمل',
    'status.failed': 'فشل',
    'status.cancelled': 'ملغي',
    
    // Priority
    'priority.low': 'منخفضة',
    'priority.medium': 'متوسطة',
    'priority.high': 'عالية',
    'priority.urgent': 'عاجلة',
    
    // Messages
    'msg.agent.created': 'تم إنشاء الوكيل بنجاح!',
    'msg.agent.updated': 'تم تحديث الوكيل بنجاح!',
    'msg.agent.deleted': 'تم حذف الوكيل بنجاح!',
    'msg.task.created': 'تم إنشاء المهمة بنجاح!',
    'msg.task.updated': 'تم تحديث المهمة بنجاح!',
    'msg.task.deleted': 'تم حذف المهمة بنجاح!',
    'msg.confirm.delete': 'هل أنت متأكد من حذف',
       'msg.auth.required': 'مطلوب مصادقة',
    'msg.auth.login': 'يرجى تسجيل الدخول للوصول إلى هذه الصفحة',
    
    // Purchase Page
    'choosePlan': 'اختر خطتك',
    'purchaseDescription': 'احصل على وصول مدى الحياة لإصدار AI Guide Pro Desktop مع إمكانيات offline',
    'mostPopular': 'الأكثر شعبية',
    'lifetime': 'مدى الحياة',
    'selectPlan': 'اختر هذه الخطة',
    'completeYourPurchase': 'أكمل عملية الشراء',
    'enterEmailToReceiveLicense': 'أدخل بريدك الإلكتروني لاستلام مفتاح الترخيص',
    'emailAddress': 'البريد الإلكتروني',
    'secureOfflineLicense': 'ترخيص آمن بدون إنترنت',
    'secureOfflineDescription': 'يعمل ترخيصك بالكامل بدون إنترنت مع تشفير RSA',
    'instantActivation': 'تفعيل فوري',
    'instantActivationDescription': 'فعّل على أجهزتك فوراً بعد الشراء',
    'selectedPlan': 'الخطة المختارة',
    'deviceActivations': 'تفعيلات الأجهزة',
    'total': 'المجموع',
    'purchaseNow': 'اشتر الآن',
    'processing': 'جاري المعالجة...',
    'pleaseEnterEmail': 'يرجى إدخال بريدك الإلكتروني',
    'purchaseSuccess': 'تم الشراء بنجاح! تحقق من بريدك الإلكتروني للحصول على مفتاح الترخيص.',
    'purchaseFailed': 'فشل الشراء. يرجى المحاولة مرة أخرى.',
    'frequentlyAskedQuestions': 'الأسئلة الشائعة',
    'faqQuestion1': 'كيف يعمل الترخيص بدون إنترنت؟',
    'faqAnswer1': 'مفتاح الترخيص الخاص بك موقّع تشفيرياً ويمكن التحقق منه بالكامل بدون إنترنت. لا حاجة لاتصال بالإنترنت بعد التفعيل.',
    'faqQuestion2': 'هل يمكنني نقل ترخيصي إلى جهاز آخر؟',
    'faqAnswer2': 'نعم! يمكنك إلغاء التفعيل على جهاز واحد والتفعيل على آخر، طالما بقيت ضمن حد التفعيل الخاص بك.',
    'faqQuestion3': 'ماذا يحدث إذا تجاوزت حد التفعيل؟',
    'faqAnswer3': 'يمكنك إلغاء تفعيل الأجهزة غير المستخدمة من لوحة تحكم حسابك، أو الترقية إلى خطة بمزيد من التفعيلات.',
    'allRightsReserved': 'جميع الحقوق محفوظة',
    'home': 'الرئيسية',
    'dashboard': 'لوحة التحكم',

    // Automation
    'automation.title': 'التدريب الآلي على مدار الساعة',
    'automation.subtitle': 'التعلم المستمر من GitHub و HuggingFace',
    'automation.start': 'بدء التدريب',
    'automation.stop': 'إيقاف التدريب',
    'automation.collect': 'جمع البيانات',
    'automation.status.title': 'الحالة',
    'automation.status.running': 'قيد التشغيل',
    'automation.status.stopped': 'متوقف',
    'automation.totalJobs': 'إجمالي المهام',
    'automation.completed': 'مكتمل',
    'automation.failed': 'فشل',
    'automation.models.title': 'النماذج المتخصصة',
    'automation.models.description': 'نماذج AI مدربة لمجالات محددة',
    'automation.models.dataPoints': 'نقاط البيانات',
    'automation.models.trained': 'مُدرّب',
    'automation.models.empty': 'لا توجد نماذج مدربة بعد',
    'automation.models.emptyHint': 'ابدأ التدريب الآلي لإنشاء نماذج متخصصة',
    'automation.jobs.title': 'مهام التدريب الأخيرة',
    'automation.jobs.description': 'آخر 10 مهام تدريب',
    'automation.jobs.dataPoints': 'نقاط بيانات',
    'automation.jobs.empty': 'لا توجد مهام تدريب بعد',
    'automation.jobs.emptyHint': 'ستظهر مهام التدريب هنا بمجرد بدء الأتمتة',
  },
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved === 'ar' || saved === 'en') ? saved : 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return (translations[language] as Record<string, string>)[key] || key;
  };

  const dir = language === 'ar' ? 'rtl' : 'ltr';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
