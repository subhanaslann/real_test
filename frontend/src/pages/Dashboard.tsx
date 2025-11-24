import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { 
  Search, Plus, GitBranch, CheckCircle, XCircle, Clock, Loader2, 
  LogOut, Github, LayoutDashboard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { jobsService, type Job } from '@/services/jobs.service';
import { authService, type User } from '@/services/auth.service';

export default function Dashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [repos, setRepos] = useState<any[]>([]);
  
  // Form States
  const [activeTab, setActiveTab] = useState<'repos' | 'manual'>('repos');
  const [selectedRepo, setSelectedRepo] = useState('');
  const [manualUrl, setManualUrl] = useState('');
  
  // UI States
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingRepos, setIsFetchingRepos] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data Fetching
  const fetchJobs = async () => {
    try {
      const response: any = await jobsService.getAllJobs();
      // Handle wrapped response: {success, data, error}
      const data = response?.data || response;
      if (Array.isArray(data)) {
        const sorted = data.sort((a: Job, b: Job) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setJobs(sorted);
      } else {
        console.error('Jobs data is not an array:', response);
        setJobs([]);
      }
    } catch (error) {
      console.error('Failed to fetch jobs', error);
      setJobs([]);
    }
  };

  const fetchProfileAndRepos = async () => {
    try {
      const profile = await authService.getProfile();
      setUser(profile);
      
      setIsFetchingRepos(true);
      try {
        const repoResponse: any = await authService.getRepos();
        // Handle wrapped response: {success, data, error}
        const repoData = repoResponse?.data || repoResponse;
        if (Array.isArray(repoData)) {
          setRepos(repoData);
        } else {
          console.error('Repo data is not an array:', repoResponse);
          setRepos([]);
        }
      } catch (err) {
        console.error('Failed to fetch repos', err);
        setRepos([]);
        // Don't block UI, just show manual tab or empty list
      } finally {
        setIsFetchingRepos(false);
      }
    } catch (err) {
      console.error('Failed to fetch profile', err);
    }
  };

  useEffect(() => {
    fetchProfileAndRepos();
    fetchJobs();
    const interval = setInterval(fetchJobs, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateJob = async () => {
    const urlToAnalyze = activeTab === 'repos' ? selectedRepo : manualUrl;
    
    if (!urlToAnalyze) {
      setError('Lütfen geçerli bir repository seçin veya URL girin.');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      await jobsService.createJob(urlToAnalyze);
      setManualUrl('');
      setSelectedRepo('');
      fetchJobs();
    } catch (error) {
      console.error('Failed to create job', error);
      setError('Analiz başlatılamadı. Lütfen URL\'i kontrol edin.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED': 
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200 gap-1"><CheckCircle className="h-3 w-3" /> Completed</Badge>;
      case 'FAILED': 
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200 gap-1"><XCircle className="h-3 w-3" /> Failed</Badge>;
      case 'ANALYZING': 
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200 animate-pulse gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Analyzing</Badge>;
      case 'CLONING': 
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-yellow-200 animate-pulse gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Cloning</Badge>;
      default: 
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const getCoverage = (job: Job) => {
    if (job.status !== 'COMPLETED' || !job.result) return 0;
    return job.result.summary?.overallCoverage || 0;
  };

  const safeFormatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return 'Just now';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="container mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-slate-900 p-1.5 rounded-lg">
              <LayoutDashboard className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl text-slate-900">Sentinel</span>
          </div>
          
          <div className="flex items-center gap-4">
            {user && (
              <div className="flex items-center gap-3 bg-slate-100 py-1.5 px-3 rounded-full">
                <img 
                  src={user.avatarUrl} 
                  alt={user.username} 
                  className="w-6 h-6 rounded-full border border-slate-300"
                />
                <span className="text-sm font-medium text-slate-700">{user.username}</span>
              </div>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-6xl p-6 space-y-8">
        {/* Action Area */}
        <Card className="border-slate-200 shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-900 text-white pb-8 pt-6">
            <CardTitle className="text-2xl">Yeni Analiz Başlat</CardTitle>
            <p className="text-slate-400">GitHub repolarınızı seçin veya manuel URL girin.</p>
          </CardHeader>
          
          <div className="px-6 -mt-4">
             <div className="bg-white rounded-lg p-1 shadow-lg border border-slate-200 inline-flex mb-6">
               <button
                 onClick={() => setActiveTab('repos')}
                 className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                   activeTab === 'repos' 
                     ? 'bg-blue-50 text-blue-600 shadow-sm' 
                     : 'text-slate-500 hover:text-slate-900'
                 }`}
               >
                 Repolarımdan Seç
               </button>
               <button
                 onClick={() => setActiveTab('manual')}
                 className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                   activeTab === 'manual' 
                     ? 'bg-blue-50 text-blue-600 shadow-sm' 
                     : 'text-slate-500 hover:text-slate-900'
                 }`}
               >
                 Manuel URL
               </button>
             </div>
          </div>

          <CardContent className="space-y-4 pt-0">
            {activeTab === 'repos' ? (
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  {isFetchingRepos ? (
                    <div className="h-10 w-full bg-slate-100 animate-pulse rounded-md flex items-center px-3 text-sm text-slate-400">
                      Repolar yükleniyor...
                    </div>
                  ) : (
                    <select
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={selectedRepo}
                      onChange={(e) => setSelectedRepo(e.target.value)}
                    >
                      <option value="">Bir repository seçin...</option>
                      {repos.map((repo: any) => (
                        <option key={repo.id} value={repo.clone_url}>
                          {repo.full_name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <Button onClick={handleCreateJob} disabled={isLoading || !selectedRepo} className="bg-blue-600 hover:bg-blue-700">
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                  Analiz Et
                </Button>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Github className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input 
                    placeholder="https://github.com/user/repo.git" 
                    className="pl-10"
                    value={manualUrl}
                    onChange={(e) => setManualUrl(e.target.value)}
                  />
                </div>
                <Button onClick={handleCreateJob} disabled={isLoading || !manualUrl} className="bg-blue-600 hover:bg-blue-700">
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                  Analiz Et
                </Button>
              </div>
            )}
            
            {error && (
              <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md border border-red-100 flex items-center gap-2">
                <XCircle className="h-4 w-4" />
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Jobs List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Geçmiş Analizler</h2>
          <div className="grid gap-4">
            {jobs.map((job) => (
              <Link key={job.id} to={`/jobs/${job.id}`}>
                <Card className="group transition-all hover:shadow-md hover:border-blue-200 border-slate-200">
                  <CardContent className="p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-start gap-3">
                        <div className="bg-slate-100 p-2 rounded-lg group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                          <GitBranch className="h-5 w-5 text-slate-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900 text-base group-hover:text-blue-700 transition-colors">
                            {job.repoUrl ? job.repoUrl.split('/').slice(-2).join('/') : 'Unknown Repo'}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{safeFormatDate(job.createdAt)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                         {/* Status */}
                        <div className="min-w-[100px] flex justify-end">
                          {getStatusBadge(job.status)}
                        </div>

                        {/* Coverage Bar */}
                        <div className="flex flex-col gap-1 w-full sm:w-48">
                          <div className="flex justify-between text-xs font-medium">
                            <span className="text-slate-500">Coverage</span>
                            <span className={getCoverage(job) >= 80 ? "text-green-600" : "text-slate-700"}>
                              {getCoverage(job).toFixed(1)}%
                            </span>
                          </div>
                          <Progress 
                            value={getCoverage(job)} 
                            className="h-2 bg-slate-100" 
                            // Custom indicator color logic isn't directly in shadcn default, but CSS classes work
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}

            {jobs.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center bg-white border-2 border-dashed border-slate-200 rounded-xl">
                <div className="bg-slate-50 p-4 rounded-full mb-4">
                  <Search className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Henüz bir analiz yok</h3>
                <p className="text-sm text-slate-500 max-w-xs mt-1">
                  Yukarıdaki formdan GitHub reponuzu seçerek veya URL girerek ilk analizi başlatın.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
