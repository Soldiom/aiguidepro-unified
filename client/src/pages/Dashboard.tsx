import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { 
  Brain, 
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Activity,
  Users,
  Zap,
  ArrowRight,
  Github,
  ExternalLink
} from "lucide-react";

export default function Dashboard() {
  const { isAuthenticated, user } = useAuth();
  
  const { data: agents } = trpc.agents.list.useQuery();
  const { data: tasks } = trpc.tasks.list.useQuery();
  const { data: workflows } = trpc.workflows.list.useQuery();

  const stats = {
    totalAgents: agents?.length || 0,
    activeAgents: agents?.filter(a => a.status === "active").length || 0,
    totalTasks: tasks?.length || 0,
    completedTasks: tasks?.filter(t => t.status === "completed").length || 0,
    runningTasks: tasks?.filter(t => t.status === "running").length || 0,
    failedTasks: tasks?.filter(t => t.status === "failed").length || 0,
    activeWorkflows: workflows?.filter(w => w.status === "active").length || 0,
  };

  const completionRate = stats.totalTasks > 0 
    ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
    : 0;

  const recentTasks = tasks?.slice(0, 5) || [];
  const recentAgents = agents?.slice(0, 4) || [];

  // Public access enabled - no authentication required

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <header className="border-b bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost">← Home</Button>
              </Link>
              <h1 className="text-2xl font-bold">Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/agents">
                <Button variant="ghost">Agents</Button>
              </Link>
              <Link href="/tasks">
                <Button variant="ghost">Tasks</Button>
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
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
         <h2 className="text-3xl font-bold mb-2">Welcome{isAuthenticated && user ? `, ${user.name || user.email}` : ''}!</h2>
          <p className="text-slate-600 dark:text-slate-400">
            Here's what's happening with your AI agents
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Total Agents
                </CardTitle>
                <Brain className="w-5 h-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalAgents}</div>
              <p className="text-sm text-green-600 mt-1">
                {stats.activeAgents} active
              </p>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Tasks Completed
                </CardTitle>
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.completedTasks}</div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {completionRate}% success rate
              </p>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Running Tasks
                </CardTitle>
                <Activity className="w-5 h-5 text-yellow-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.runningTasks}</div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {stats.failedTasks} failed
              </p>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Active Workflows
                </CardTitle>
                <Zap className="w-5 h-5 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.activeWorkflows}</div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {workflows?.length || 0} total
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Tasks */}
          <Card className="border-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Tasks</CardTitle>
                <Link href="/tasks">
                  <Button variant="ghost" size="sm">
                    View All <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {recentTasks.length > 0 ? (
                <div className="space-y-3">
                  {recentTasks.map(task => (
                    <div key={task.id} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                      <div className="flex-1">
                        <div className="font-medium text-sm mb-1">{task.title}</div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">
                          {task.type} • {task.status}
                        </div>
                      </div>
                      {task.status === "completed" && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                      {task.status === "running" && <Activity className="w-5 h-5 text-yellow-600 animate-pulse" />}
                      {task.status === "failed" && <XCircle className="w-5 h-5 text-red-600" />}
                      {task.status === "pending" && <Clock className="w-5 h-5 text-gray-600" />}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-600 dark:text-slate-400">
                  <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No tasks yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Active Agents */}
          <Card className="border-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Your Agents</CardTitle>
                <Link href="/agents">
                  <Button variant="ghost" size="sm">
                    Manage <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {recentAgents.length > 0 ? (
                <div className="space-y-3">
                  {recentAgents.map(agent => (
                    <div key={agent.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                        <Brain className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{agent.name}</div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">
                          {agent.type}
                        </div>
                      </div>
                      <Badge 
                        variant={agent.status === "active" ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {agent.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-600 dark:text-slate-400">
                  <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No agents created yet</p>
                  <Link href="/agents">
                    <Button size="sm" className="mt-3">Create Agent</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="border-2 hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/agents">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Create Agent
                </CardTitle>
                <CardDescription>
                  Deploy a new AI agent to automate tasks
                </CardDescription>
              </CardHeader>
            </Link>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/tasks">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Create Task
                </CardTitle>
                <CardDescription>
                  Assign a new task to your AI agents
                </CardDescription>
              </CardHeader>
            </Link>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow cursor-pointer">
            <a href="https://github.com/Soldiom/aiguidepro-unified" target="_blank" rel="noopener noreferrer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Github className="w-5 h-5" />
                  View on GitHub
                  <ExternalLink className="w-4 h-4 ml-auto" />
                </CardTitle>
                <CardDescription>
                  Explore the source code and documentation
                </CardDescription>
              </CardHeader>
            </a>
          </Card>
        </div>
      </main>
    </div>
  );
}
