import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { authService } from '@/services/auth.service';
import { Github } from 'lucide-react';

export default function Login() {
  const handleLogin = () => {
    authService.login();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary">Sentinel</CardTitle>
          <CardDescription>
            Flutter Test Coverage Analyzer
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="text-center text-sm text-muted-foreground">
            Sign in to start analyzing your repositories.
          </div>
          <Button onClick={handleLogin} className="w-full" size="lg">
            <Github className="mr-2 h-5 w-5" />
            Login with GitHub
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
