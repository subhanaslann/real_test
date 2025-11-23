import { Zap, Activity, GitBranch, CheckCircle } from 'lucide-react'

function App() {

  return (
    <div className="min-h-screen bg-background p-8 font-sans">
      <header className="mb-8 flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-primary p-2">
            <Activity className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Flutter Coverage Sentinel</h1>
        </div>
        <nav className="flex gap-4">
          <button className="text-sm font-medium text-muted-foreground hover:text-primary">Dashboard</button>
          <button className="text-sm font-medium text-muted-foreground hover:text-primary">Projects</button>
          <button className="text-sm font-medium text-muted-foreground hover:text-primary">Settings</button>
        </nav>
      </header>

      <main className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Stats Card 1 */}
        <div className="rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">Total Projects</h3>
            <GitBranch className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="mt-2 text-2xl font-bold">12</div>
          <p className="text-xs text-muted-foreground">+2 from last month</p>
        </div>

        {/* Stats Card 2 */}
        <div className="rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">Avg Coverage</h3>
            <Zap className="h-4 w-4 text-yellow-500" />
          </div>
          <div className="mt-2 text-2xl font-bold">78.5%</div>
          <p className="text-xs text-muted-foreground">+4.1% increase</p>
        </div>

        {/* Stats Card 3 */}
        <div className="rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">Active Jobs</h3>
            <Activity className="h-4 w-4 text-blue-500" />
          </div>
          <div className="mt-2 text-2xl font-bold">3</div>
          <p className="text-xs text-muted-foreground">Processing now...</p>
        </div>
        
        {/* Recent Activity */}
        <div className="col-span-full rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm">
          <h3 className="mb-4 text-lg font-semibold">Recent Analysis</h3>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between rounded-md border border-border p-4 hover:bg-accent/50">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded bg-secondary flex items-center justify-center">
                    <span className="font-mono text-xs">REPO</span>
                  </div>
                  <div>
                    <p className="font-medium">flutter-ecommerce-app</p>
                    <p className="text-xs text-muted-foreground">Branch: main • 2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                   <span className="inline-flex items-center rounded-full border border-transparent bg-green-900/30 px-2.5 py-0.5 text-xs font-semibold text-green-400 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                      Completed
                   </span>
                   <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
