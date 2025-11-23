import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Search, Plus, GitBranch, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { jobsService, type Job } from '@/services/jobs.service';

export default function Dashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [repoUrl, setRepoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fetchJobs = async () => {
    try {
      const data = await jobsService.getAllJobs();
      // Sort by date desc
      const sorted = data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setJobs(sorted);
    } catch (error) {
      console.error('Failed to fetch jobs', error);
    }
  };

  useEffect(() => {
    fetchJobs();
    // Poll every 3 seconds
    const interval = setInterval(fetchJobs, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateJob = async () => {
    if (!repoUrl) return;
    setIsLoading(true);
    try {
      await jobsService.createJob(repoUrl);
      setRepoUrl('');
      fetchJobs(); // Immediate refresh
    } catch (error) {
      console.error('Failed to create job', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <Badge variant="success">Completed</Badge>;
      case 'FAILED': return <Badge variant="destructive">Failed</Badge>;
      case 'ANALYZING': return <Badge variant="info" className="animate-pulse">Analyzing</Badge>;
      case 'CLONING': return <Badge variant="warning" className="animate-pulse">Cloning</Badge>;
      default: return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const getCoverage = (job: Job) => {
    if (job.status !== 'COMPLETED' || !job.result) return 0;
    return job.result.summary?.overallCoverage || 0;
  };

  return (
    <div className="container mx-auto max-w-5xl p-6 space-y-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
           <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
           <p className="text-muted-foreground">Manage and track your coverage analysis jobs.</p>
        </div>
        <div className="flex w-full max-w-md items-center space-x-2">
          <Input 
            placeholder="https://github.com/user/repo.git" 
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
          />
          <Button onClick={handleCreateJob} disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
            Analyze
          </Button>
        </div>
      </header>

      <div className="grid gap-4">
        {jobs.map((job) => (
          <Link key={job.id} to={`/jobs/${job.id}`}>
            <Card className="transition-colors hover:bg-accent/50">
              <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <GitBranch className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold text-lg">{job.repoUrl.split('/').pop()?.replace('.git', '')}</span>
                    {getStatusBadge(job.status)}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
                    </span>
                    <span>{job.repoUrl}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:w-48">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Coverage</span>
                    <span>{getCoverage(job).toFixed(1)}%</span>
                  </div>
                  <Progress value={getCoverage(job)} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}

        {jobs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
            <Search className="h-12 w-12 opacity-20" />
            <p className="mt-2">No jobs found. Start a new analysis above.</p>
          </div>
        )}
      </div>
    </div>
  );
}
