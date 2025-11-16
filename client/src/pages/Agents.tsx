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
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Link, useLocation } from "wouter";
import { 
  Brain, 
  Code, 
  FileText, 
  Briefcase, 
  TrendingUp, 
  GraduationCap,
  Plus,
  Play,
  Pause,
  Trash2,
  Settings,
  Activity,
  ArrowLeft
} from "lucide-react";
import { toast } from "sonner";

const agentIcons: Record<string, any> = {
  research: Brain,
  development: Code,
  content: FileText,
  project_management: Briefcase,
  business: TrendingUp,
  tutor: GraduationCap,
};

const agentColors: Record<string, string> = {
  research: "from-blue-500 to-cyan-500",
  development: "from-purple-500 to-pink-500",
  content: "from-orange-500 to-red-500",
  project_management: "from-green-500 to-emerald-500",
  business: "from-yellow-500 to-amber-500",
  tutor: "from-indigo-500 to-violet-500",
};

const statusColors: Record<string, string> = {
  active: "bg-green-500",
  inactive: "bg-gray-500",
  busy: "bg-yellow-500",
  error: "bg-red-500",
};

export default function Agents() {
  const { isAuthenticated } = useAuth();
  const [location, navigate] = useLocation();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<string>("");
  const [agentName, setAgentName] = useState("");
  const [agentDescription, setAgentDescription] = useState("");

  // Get type from URL query
  const params = new URLSearchParams(location.split('?')[1]);
  const typeFilter = params.get('type');

  const { data: agents, isLoading, refetch } = trpc.agents.list.useQuery();
  const createAgent = trpc.agents.create.useMutation({
    onSuccess: () => {
      toast.success("Agent created successfully!");
      refetch();
      setIsCreateDialogOpen(false);
      // Reset form
      setAgentName("");
      setSelectedType("");
      setAgentDescription("");
    },
    onError: (error) => {
      toast.error(`Failed to create agent: ${error.message}`);
    },
  });

  const updateAgent = trpc.agents.update.useMutation({
    onSuccess: () => {
      toast.success("Agent updated successfully!");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to update agent: ${error.message}`);
    },
  });

  const deleteAgent = trpc.agents.delete.useMutation({
    onSuccess: () => {
      toast.success("Agent deleted successfully!");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to delete agent: ${error.message}`);
    },
  });

  const handleCreateAgent = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!selectedType) {
      toast.error("Please select an agent type");
      return;
    }
    
    createAgent.mutate({
      name: agentName,
      type: selectedType as any,
      description: agentDescription,
      capabilities: JSON.stringify([]),
      config: JSON.stringify({}),
    });
  };

  const handleToggleStatus = (id: number, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    updateAgent.mutate({ id, status: newStatus as any });
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this agent?")) {
      deleteAgent.mutate({ id });
    }
  };

  const filteredAgents = typeFilter 
    ? agents?.filter(agent => agent.type === typeFilter)
    : agents;

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
              <h1 className="text-2xl font-bold">Agent Management</h1>
              {typeFilter && (
                <Badge variant="secondary" className="text-sm">
                  Filter: {typeFilter}
                </Badge>
              )}
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Agent
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Agent</DialogTitle>
                  <DialogDescription>
                    Configure and deploy a new AI agent
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateAgent} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Agent Name</Label>
                    <Input 
                      id="name" 
                      value={agentName}
                      onChange={(e) => setAgentName(e.target.value)}
                      placeholder="My Research Agent" 
                      required 
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Agent Type</Label>
                    <Select value={selectedType} onValueChange={setSelectedType} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select agent type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="research">Research & Analysis</SelectItem>
                        <SelectItem value="development">Software Development</SelectItem>
                        <SelectItem value="content">Content Creation</SelectItem>
                        <SelectItem value="project_management">Project Management</SelectItem>
                        <SelectItem value="business">Business Consulting</SelectItem>
                        <SelectItem value="tutor">Personal Tutor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea 
                      id="description" 
                      value={agentDescription}
                      onChange={(e) => setAgentDescription(e.target.value)}
                      placeholder="Describe what this agent will do..."
                      rows={3}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={createAgent.isPending}>
                    {createAgent.isPending ? "Creating..." : "Create Agent"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* Agents Grid */}
      <main className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, idx) => (
              <Card key={idx} className="animate-pulse">
                <CardHeader>
                  <div className="w-16 h-16 bg-slate-200 dark:bg-slate-800 rounded-2xl mb-4" />
                  <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : filteredAgents && filteredAgents.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAgents.map((agent) => {
              const Icon = agentIcons[agent.type] || Brain;
              const color = agentColors[agent.type] || "from-gray-500 to-gray-600";
              const statusColor = statusColors[agent.status] || "bg-gray-500";

              return (
                <Card key={agent.id} className="border-2 hover:shadow-lg transition-all">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${statusColor} animate-pulse`} />
                        <Badge variant="secondary" className="text-xs">
                          {agent.status}
                        </Badge>
                      </div>
                    </div>
                    <CardTitle className="text-xl">{agent.name}</CardTitle>
                    <CardDescription>
                      {agent.description || "No description provided"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        size="sm"
                        variant={agent.status === "active" ? "destructive" : "default"}
                        onClick={() => handleToggleStatus(agent.id, agent.status)}
                        disabled={updateAgent.isPending}
                      >
                        {agent.status === "active" ? (
                          <><Pause className="w-4 h-4 mr-1" /> Pause</>
                        ) : (
                          <><Play className="w-4 h-4 mr-1" /> Activate</>
                        )}
                      </Button>
                      <Button size="sm" variant="outline">
                        <Settings className="w-4 h-4 mr-1" /> Configure
                      </Button>
                      <Button size="sm" variant="outline">
                        <Activity className="w-4 h-4 mr-1" /> Logs
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(agent.id)}
                        disabled={deleteAgent.isPending}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
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
              <Brain className="w-16 h-16 mx-auto mb-4 text-slate-400" />
              <h3 className="text-2xl font-bold mb-2">No Agents Yet</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Create your first AI agent to get started
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Agent
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
