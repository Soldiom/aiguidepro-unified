import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Play, Square, RefreshCw, Database, Brain, CheckCircle2, XCircle, Clock } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Automation() {
  const { t, language } = useLanguage();
  const [isCollecting, setIsCollecting] = useState(false);

  const { data: status, refetch: refetchStatus } = trpc.automation.status.useQuery(undefined, {
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const { data: models } = trpc.automation.models.useQuery();

  const startMutation = trpc.automation.start.useMutation({
    onSuccess: () => {
      refetchStatus();
    },
  });

  const stopMutation = trpc.automation.stop.useMutation({
    onSuccess: () => {
      refetchStatus();
    },
  });

  const collectMutation = trpc.automation.collect.useMutation({
    onSuccess: () => {
      setIsCollecting(false);
      refetchStatus();
    },
    onError: () => {
      setIsCollecting(false);
    },
  });

  const handleStart = () => {
    startMutation.mutate();
  };

  const handleStop = () => {
    stopMutation.mutate();
  };

  const handleCollect = () => {
    setIsCollecting(true);
    collectMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50" dir={language === "ar" ? "rtl" : "ltr"}>
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  {t("automation.title")}
                </h1>
                <p className="text-sm text-muted-foreground">{t("automation.subtitle")}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {status?.isRunning ? (
                <Button onClick={handleStop} variant="destructive" disabled={stopMutation.isPending}>
                  <Square className="h-4 w-4 mr-2" />
                  {t("automation.stop")}
                </Button>
              ) : (
                <Button onClick={handleStart} disabled={startMutation.isPending}>
                  <Play className="h-4 w-4 mr-2" />
                  {t("automation.start")}
                </Button>
              )}

              <Button onClick={handleCollect} variant="outline" disabled={isCollecting || collectMutation.isPending}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isCollecting ? "animate-spin" : ""}`} />
                {t("automation.collect")}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("automation.status.title")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {status?.isRunning ? (
                  <>
                    <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-2xl font-bold text-green-600">{t("automation.status.running")}</span>
                  </>
                ) : (
                  <>
                    <div className="h-3 w-3 rounded-full bg-gray-400" />
                    <span className="text-2xl font-bold text-gray-600">{t("automation.status.stopped")}</span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("automation.totalJobs")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{status?.totalJobs || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("automation.completed")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{status?.completed || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("automation.failed")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{status?.failed || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Available Models */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              {t("automation.models.title")}
            </CardTitle>
            <CardDescription>{t("automation.models.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            {models && models.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {models.map((model, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg capitalize">{model.domain}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">{t("automation.models.dataPoints")}:</span>
                          <Badge variant="secondary">{model.dataPoints}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">{t("automation.models.trained")}:</span>
                          <span className="text-xs">
                            {model.trainedAt ? new Date(model.trainedAt).toLocaleDateString() : "N/A"}
                          </span>
                        </div>
                        <div className="pt-2">
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded block truncate">
                            {model.modelPath}
                          </code>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{t("automation.models.empty")}</p>
                <p className="text-sm mt-2">{t("automation.models.emptyHint")}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Jobs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              {t("automation.jobs.title")}
            </CardTitle>
            <CardDescription>{t("automation.jobs.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            {status?.jobs && status.jobs.length > 0 ? (
              <div className="space-y-4">
                {status.jobs.map((job: any) => (
                  <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      {job.status === "completed" && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                      {job.status === "running" && <Clock className="h-5 w-5 text-blue-600 animate-spin" />}
                      {job.status === "failed" && <XCircle className="h-5 w-5 text-red-600" />}
                      {job.status === "pending" && <Clock className="h-5 w-5 text-gray-400" />}

                      <div>
                        <div className="font-medium capitalize">{job.domain}</div>
                        <div className="text-sm text-muted-foreground">
                          {job.dataPoints} {t("automation.jobs.dataPoints")}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <Badge
                        variant={
                          job.status === "completed"
                            ? "default"
                            : job.status === "running"
                              ? "secondary"
                              : job.status === "failed"
                                ? "destructive"
                                : "outline"
                        }
                      >
                        {job.status}
                      </Badge>
                      {job.completedAt && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(job.completedAt).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{t("automation.jobs.empty")}</p>
                <p className="text-sm mt-2">{t("automation.jobs.emptyHint")}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
