import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { 
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowLeft,
  AlertCircle,
  Play
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

const statusConfig: Record<string, { icon: any; color: string; label: string }> = {
  pending: { icon: Clock, color: "bg-gray-500", label: "Pending" },
  queued: { icon: Clock, color: "bg-blue-500", label: "Queued" },
  running: { icon: Loader2, color: "bg-yellow-500", label: "Running" },
  completed: { icon: CheckCircle2, color: "bg-green-500", label: "Completed" },
  failed: { icon: XCircle, color: "bg-red-500", label: "Failed" },
  cancelled: { icon: AlertCircle, color: "bg-orange-500", label: "Cancelled" },
};

const priorityColors: Record<string, string> = {
  low: "bg-slate-200 text-slate-700",
  medium: "bg-blue-200 text-blue-700",
  high: "bg-orange-200 text-orange-700",
  urgent: "bg-red-200 text-red-700",
};

export default function Tasks() {
  const { isAuthenticated } = useAuth();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: tasks, isLoading, refetch } = trpc.tasks.list.useQuery();
  const { data: agents } = trpc.agents.list.useQuery();
  
  const createTask = trpc.tasks.create.useMutation({
    onSuccess: () => {
      toast.success("Task created successfully!");
      refetch();
      setIsCreateDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Failed to create task: ${error.message}`);
    },
  });

  const updateTask = trpc.tasks.update.useMutation({
    onSuccess: () => {
      toast.success("Task updated successfully!");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to update task: ${error.message}`);
    },
  });

  const deleteTask = trpc.tasks.delete.useMutation({
    onSuccess: () => {
      toast.success("Task deleted successfully!");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to delete task: ${error.message}`);
    },
  });

  const handleCreateTask = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const agentId = formData.get("agentId");
    
    createTask.mutate({
      agentId: agentId ? parseInt(agentId as string) : undefined,
      type: formData.get("type") as string,
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      priority: formData.get("priority") as any,
    });
  };

  const handleCancelTask = (id: number) => {
    if (confirm("Are you sure you want to cancel this task?")) {
      updateTask.mutate({ id, status: "cancelled" });
    }
  };

  const filteredTasks = statusFilter === "all" 
    ? tasks 
    : tasks?.filter(task => task.status === statusFilter);

  const taskStats = {
    total: tasks?.length || 0,
    pending: tasks?.filter(t => t.status === "pending").length || 0,
    running: tasks?.filter(t => t.status === "running").length || 0,
    completed: tasks?.filter(t => t.status === "completed").length || 0,
    failed: tasks?.filter(t => t.status === "failed").length || 0,
  };

  // Public access enabled - no authentication required

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <header className="border-b bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <h1 className="text-2xl font-bold">Task Management</h1>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Task
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Task</DialogTitle>
                  <DialogDescription>
                    Assign a task to an AI agent
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateTask} className="space-y-4">
                  <div>
                    <Label htmlFor="title">Task Title</Label>
                    <Input id="title" name="title" placeholder="Research market trends..." required />
                  </div>
                  <div>
                    <Label htmlFor="type">Task Type</Label>
                    <Input id="type" name="type" placeholder="research, analysis, development..." required />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea 
                      id="description" 
                      name="description" 
                      placeholder="Detailed task description..."
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="agentId">Assign to Agent (Optional)</Label>
                    <Select name="agentId">
                      <SelectTrigger>
                        <SelectValue placeholder="Auto-assign" />
                      </SelectTrigger>
                      <SelectContent>
                        {agents?.map(agent => (
                          <SelectItem key={agent.id} value={agent.id.toString()}>
                            {agent.name} ({agent.type})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select name="priority" defaultValue="medium">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full" disabled={createTask.isPending}>
                    {createTask.isPending ? "Creating..." : "Create Task"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{taskStats.total}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Total Tasks</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-600">{taskStats.pending}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Pending</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">{taskStats.running}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Running</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{taskStats.completed}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Completed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">{taskStats.failed}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Failed</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filter */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex gap-2 flex-wrap">
          <Button 
            variant={statusFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("all")}
          >
            All
          </Button>
          {Object.entries(statusConfig).map(([status, config]) => (
            <Button
              key={status}
              variant={statusFilter === status ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(status)}
            >
              {config.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Tasks List */}
      <main className="container mx-auto px-4 py-4 pb-8">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, idx) => (
              <Card key={idx} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : filteredTasks && filteredTasks.length > 0 ? (
          <div className="space-y-4">
            {filteredTasks.map((task) => {
              const config = statusConfig[task.status];
              const Icon = config.icon;
              const agent = agents?.find(a => a.id === task.agentId);

              return (
                <Card key={task.id} className="border-2 hover:shadow-lg transition-all">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`w-3 h-3 rounded-full ${config.color}`} />
                          <CardTitle className="text-lg">{task.title}</CardTitle>
                          <Badge className={priorityColors[task.priority]} variant="secondary">
                            {task.priority}
                          </Badge>
                        </div>
                        <CardDescription>
                          {task.description || "No description"}
                        </CardDescription>
                        <div className="flex items-center gap-4 mt-3 text-sm text-slate-600 dark:text-slate-400">
                          <span>Type: {task.type}</span>
                          {agent && <span>Agent: {agent.name}</span>}
                          <span>Created {formatDistanceToNow(new Date(task.createdAt))} ago</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Icon className={`w-5 h-5 ${task.status === "running" ? "animate-spin" : ""}`} />
                        <Badge variant="outline">{config.label}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  {task.status === "running" && (
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{task.progress}%</span>
                        </div>
                        <Progress value={task.progress || 0} />
                      </div>
                    </CardContent>
                  )}
                  {task.errorMessage && (
                    <CardContent>
                      <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded p-3">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                          <div className="text-sm text-red-700 dark:text-red-400">
                            {task.errorMessage}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  )}
                  <CardContent>
                    <div className="flex gap-2">
                      {task.status === "pending" && (
                        <Button size="sm" variant="outline">
                          <Play className="w-4 h-4 mr-1" /> Start
                        </Button>
                      )}
                      {(task.status === "pending" || task.status === "queued" || task.status === "running") && (
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleCancelTask(task.id)}
                          disabled={updateTask.isPending}
                        >
                          Cancel
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-12 text-center">
              <Clock className="w-16 h-16 mx-auto mb-4 text-slate-400" />
              <h3 className="text-2xl font-bold mb-2">No Tasks Found</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                {statusFilter === "all" 
                  ? "Create your first task to get started"
                  : `No ${statusFilter} tasks found`
                }
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Task
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
