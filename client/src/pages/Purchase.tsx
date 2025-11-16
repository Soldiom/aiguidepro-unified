import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Check, CreditCard, Shield, Zap } from "lucide-react";
import { Link } from "wouter";
import { APP_LOGO, APP_TITLE, ALTHOWAIKH_URL } from "@/const";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const pricingPlans = [
  {
    id: "single",
    name: { en: "Single License", ar: "ترخيص فردي" },
    price: 49,
    activations: 1,
    features: {
      en: [
        "1 Device Activation",
        "Lifetime Updates",
        "Offline Usage",
        "All AI Models",
        "Unlimited Documents",
        "Email Support"
      ],
      ar: [
        "تفعيل جهاز واحد",
        "تحديثات مدى الحياة",
        "استخدام بدون إنترنت",
        "جميع نماذج AI",
        "مستندات غير محدودة",
        "دعم عبر البريد"
      ]
    },
    popular: false
  },
  {
    id: "team",
    name: { en: "Team License", ar: "ترخيص فريق" },
    price: 129,
    activations: 5,
    features: {
      en: [
        "5 Device Activations",
        "Lifetime Updates",
        "Offline Usage",
        "All AI Models",
        "Unlimited Documents",
        "Priority Support",
        "Team Management",
        "License Transfer"
      ],
      ar: [
        "تفعيل 5 أجهزة",
        "تحديثات مدى الحياة",
        "استخدام بدون إنترنت",
        "جميع نماذج AI",
        "مستندات غير محدودة",
        "دعم أولوية",
        "إدارة الفريق",
        "نقل الترخيص"
      ]
    },
    popular: true
  },
  {
    id: "enterprise",
    name: { en: "Enterprise License", ar: "ترخيص مؤسسي" },
    price: 499,
    activations: 50,
    features: {
      en: [
        "50 Device Activations",
        "Lifetime Updates",
        "Offline Usage",
        "All AI Models",
        "Unlimited Documents",
        "24/7 Support",
        "Custom Integration",
        "On-Premise Deployment",
        "Training & Onboarding"
      ],
      ar: [
        "تفعيل 50 جهاز",
        "تحديثات مدى الحياة",
        "استخدام بدون إنترنت",
        "جميع نماذج AI",
        "مستندات غير محدودة",
        "دعم 24/7",
        "تكامل مخصص",
        "نشر محلي",
        "تدريب وإعداد"
      ]
    },
    popular: false
  }
];

export default function Purchase() {
  const { t, language } = useLanguage();
  const [selectedPlan, setSelectedPlan] = useState("team");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const generateLicense = trpc.licensing.generate.useMutation();

  const handlePurchase = async () => {
    if (!email) {
      toast.error(t("pleaseEnterEmail"));
      return;
    }

    setLoading(true);

    try {
      const plan = pricingPlans.find(p => p.id === selectedPlan);
      if (!plan) throw new Error("Plan not found");

      // In production, integrate with payment gateway (Stripe, PayPal, etc.)
      // For now, generate license directly
      const result = await generateLicense.mutateAsync({
        email,
        maxActivations: plan.activations,
        // expiresInDays: 365, // Optional: 1 year expiration
      });

      toast.success(t("purchaseSuccess"));
      
      // Show license key
      alert(`Your License Key:\\n\\n${result.licenseKey}\\n\\nPlease save this key securely. You will need it to activate the desktop application.`);

      // In production, send email with license key
      console.log("License generated:", result.licenseKey);

    } catch (error: any) {
      toast.error(error.message || t("purchaseFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <img src={APP_LOGO} alt={APP_TITLE} className="h-8 w-8" />
              <span className="font-bold text-xl">{APP_TITLE}</span>
            </div>
          </Link>

          <nav className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost">{t("home")}</Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="ghost">{t("dashboard")}</Button>
            </Link>
            <a href={ALTHOWAIKH_URL} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost">althowaikh.com</Button>
            </a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            {t("choosePlan")}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t("purchaseDescription")}
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {pricingPlans.map((plan) => (
            <Card 
              key={plan.id}
              className={`relative cursor-pointer transition-all ${
                selectedPlan === plan.id 
                  ? "border-primary shadow-lg scale-105" 
                  : "hover:border-primary/50"
              } ${plan.popular ? "border-primary" : ""}`}
              onClick={() => setSelectedPlan(plan.id)}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                  {t("mostPopular")}
                </div>
              )}

              <CardHeader>
                <CardTitle className="text-2xl">
                  {language === "ar" ? plan.name.ar : plan.name.en}
                </CardTitle>
                <CardDescription>
                  <span className="text-4xl font-bold text-foreground">${plan.price}</span>
                  <span className="text-muted-foreground"> / {t("lifetime")}</span>
                </CardDescription>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3">
                  {(language === "ar" ? plan.features.ar : plan.features.en).map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <RadioGroup value={selectedPlan} onValueChange={setSelectedPlan} className="w-full">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value={plan.id} id={plan.id} />
                    <Label htmlFor={plan.id} className="flex-1 cursor-pointer">
                      {t("selectPlan")}
                    </Label>
                  </div>
                </RadioGroup>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Purchase Form */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-6 w-6" />
              {t("completeYourPurchase")}
            </CardTitle>
            <CardDescription>
              {t("enterEmailToReceiveLicense")}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">{t("emailAddress")}</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Security Features */}
            <div className="bg-muted p-4 rounded-lg space-y-3">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">{t("secureOfflineLicense")}</p>
                  <p className="text-sm text-muted-foreground">{t("secureOfflineDescription")}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Zap className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">{t("instantActivation")}</p>
                  <p className="text-sm text-muted-foreground">{t("instantActivationDescription")}</p>
                </div>
              </div>
            </div>

            {/* Selected Plan Summary */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-muted-foreground">{t("selectedPlan")}:</span>
                <span className="font-medium">
                  {language === "ar" 
                    ? pricingPlans.find(p => p.id === selectedPlan)?.name.ar
                    : pricingPlans.find(p => p.id === selectedPlan)?.name.en
                  }
                </span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-muted-foreground">{t("deviceActivations")}:</span>
                <span className="font-medium">
                  {pricingPlans.find(p => p.id === selectedPlan)?.activations}
                </span>
              </div>
              <div className="flex justify-between items-center text-lg font-bold pt-2 border-t">
                <span>{t("total")}:</span>
                <span>${pricingPlans.find(p => p.id === selectedPlan)?.price}</span>
              </div>
            </div>
          </CardContent>

          <CardFooter>
            <Button 
              className="w-full" 
              size="lg"
              onClick={handlePurchase}
              disabled={loading || !email}
            >
              {loading ? t("processing") : t("purchaseNow")}
            </Button>
          </CardFooter>
        </Card>

        {/* FAQ */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">{t("frequentlyAskedQuestions")}</h2>
          
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t("faqQuestion1")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{t("faqAnswer1")}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t("faqQuestion2")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{t("faqAnswer2")}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t("faqQuestion3")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{t("faqAnswer3")}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-16 py-8">
        <div className="container text-center text-muted-foreground">
          <p>© 2025 {APP_TITLE}. {t("allRightsReserved")}.</p>
          <p className="mt-2">
            <a href={ALTHOWAIKH_URL} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
              althowaikh.com
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
