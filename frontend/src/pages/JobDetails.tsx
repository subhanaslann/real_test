import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { jobsService, type Job } from '@/services/jobs.service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { FileCode, CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function JobDetails() {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [selectedFileIndex, setSelectedFileIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchJob = async () => {
    if (!id) return;
    try {
      const data = await jobsService.getJobById(id);
      setJob(data);
    } catch (error) {
      console.error('Failed to fetch job', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJob();
    const interval = setInterval(() => {
      if (job && job.status !== 'COMPLETED' && job.status !== 'FAILED') {
        fetchJob();
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [id, job?.status]);

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin h-8 w-8" /></div>;
  }

  if (!job) {
    return <div className="flex h-screen items-center justify-center">Job not found</div>;
  }

  const result = job.result;

  if (job.status === 'FAILED') {
    return (
      <div className="container mx-auto flex h-screen flex-col items-center justify-center p-4">
         <div className="w-full max-w-md rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
            <h2 className="text-xl font-bold text-destructive">Analysis Failed</h2>
            <p className="mt-2 text-muted-foreground">
              {result?.error || 'An unknown error occurred during the analysis.'}
            </p>
            <div className="mt-6">
              <a href="/dashboard" className="text-sm text-primary hover:underline">Back to Dashboard</a>
            </div>
         </div>
      </div>
    );
  }

  const files = result?.details || [];
  const summary = result?.summary;
  const selectedFile = files[selectedFileIndex];

  // Chart Data
  const chartData = [
    { name: 'Covered', value: summary?.overallCoverage || 0 },
    { name: 'Uncovered', value: 100 - (summary?.overallCoverage || 0) },
  ];
  const COLORS = ['#10b981', '#ef4444'];

  return (
    <div className="container mx-auto h-[calc(100vh-2rem)] max-w-7xl p-4">
      <div className="grid h-full grid-rows-[auto_1fr] gap-4">
        
        {/* Header & Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Overview</CardTitle>
              <CardDescription>{job.repoUrl}</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
              <div className="h-20 w-20">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie 
                        data={chartData} 
                        innerRadius={25} 
                        outerRadius={35} 
                        paddingAngle={2} 
                        dataKey="value"
                        stroke="none"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                 </ResponsiveContainer>
              </div>
              <div className="flex-1">
                 <div className="flex items-center justify-between">
                    <Badge variant={job.status === 'COMPLETED' ? 'success' : 'secondary'}>{job.status}</Badge>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{summary?.overallCoverage?.toFixed(1)}%</div>
                      <div className="text-xs text-muted-foreground">Overall Coverage</div>
                    </div>
                 </div>
                 <Progress value={summary?.overallCoverage} className="mt-2 h-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
             <CardHeader className="pb-2">
               <CardTitle className="text-sm font-medium text-muted-foreground">Files Analyzed</CardTitle>
             </CardHeader>
             <CardContent>
               <div className="text-2xl font-bold">{summary?.analyzedFiles} <span className="text-sm text-muted-foreground">/ {summary?.totalFiles}</span></div>
             </CardContent>
          </Card>

          <Card>
             <CardHeader className="pb-2">
               <CardTitle className="text-sm font-medium text-muted-foreground">Test Files</CardTitle>
             </CardHeader>
             <CardContent>
               <div className="text-2xl font-bold">{summary?.testFiles}</div>
             </CardContent>
          </Card>
        </div>

        {/* Main Content: Split View */}
        {job.status === 'COMPLETED' && (
        <div className="grid h-full gap-4 md:grid-cols-3 lg:grid-cols-4 overflow-hidden">
          {/* File List (Left) */}
          <Card className="col-span-1 flex flex-col overflow-hidden">
            <CardHeader className="px-4 py-3 border-b">
               <CardTitle className="text-base">Files</CardTitle>
            </CardHeader>
            <ScrollArea className="flex-1">
              <div className="flex flex-col">
                {files.map((file: any, index: number) => (
                  <button
                    key={file.file}
                    onClick={() => setSelectedFileIndex(index)}
                    className={cn(
                      "flex items-center justify-between px-4 py-3 text-sm transition-colors hover:bg-accent/50 text-left",
                      selectedFileIndex === index && "bg-accent text-accent-foreground border-l-2 border-primary"
                    )}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileCode className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="truncate">{file.file}</span>
                    </div>
                    <div className={cn("text-xs font-medium", 
                        file.coveragePercentage >= 80 ? "text-green-500" : 
                        file.coveragePercentage >= 50 ? "text-yellow-500" : "text-red-500"
                    )}>
                      {file.coveragePercentage.toFixed(0)}%
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </Card>

          {/* File Details (Right) */}
          <Card className="col-span-2 lg:col-span-3 flex flex-col overflow-hidden">
             <CardHeader className="border-b px-6 py-4">
               <div className="flex items-center justify-between">
                 <div>
                   <CardTitle className="text-xl font-mono">{selectedFile?.file}</CardTitle>
                   <CardDescription className="mt-1">
                     Matched Test: <span className="font-mono text-primary">{selectedFile?.testFile || 'None'}</span>
                   </CardDescription>
                 </div>
                 <div className="text-right">
                   <div className="text-2xl font-bold text-primary">{selectedFile?.coveragePercentage}%</div>
                   <p className="text-xs text-muted-foreground">File Coverage</p>
                 </div>
               </div>
             </CardHeader>
             
             <ScrollArea className="flex-1 p-6">
                <div className="space-y-6">
                   {/* Functions List */}
                   <div>
                     <h3 className="mb-4 text-sm font-medium uppercase text-muted-foreground tracking-wider">Functions Analysis</h3>
                     <div className="space-y-2">
                       {selectedFile?.functions.map((func: any, i: number) => (
                         <div key={i} className="flex items-center justify-between rounded-md border bg-card/50 p-3 shadow-sm">
                            <div className="flex items-center gap-3">
                              {func.covered ? (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                              ) : (
                                <XCircle className="h-5 w-5 text-destructive" />
                              )}
                              <span className="font-mono text-sm">{func.functionName}</span>
                            </div>
                            <Badge variant={func.covered ? 'success' : 'destructive'}>
                              {func.covered ? 'Covered' : 'Uncovered'}
                            </Badge>
                         </div>
                       ))}
                       {selectedFile?.functions.length === 0 && (
                         <p className="text-muted-foreground text-sm">No functions found in this file.</p>
                       )}
                     </div>
                   </div>
                </div>
             </ScrollArea>
          </Card>
        </div>
        )}

        {job.status !== 'COMPLETED' && (
          <div className="flex flex-col items-center justify-center h-64 border rounded-lg bg-card/50">
             <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
             <p className="text-lg font-medium">Analysis in progress...</p>
             <p className="text-muted-foreground">Please wait while we analyze your repository.</p>
          </div>
        )}

      </div>
    </div>
  );
}
