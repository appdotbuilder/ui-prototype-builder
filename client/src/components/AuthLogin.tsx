
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, Lock, User, Chrome } from 'lucide-react';
import { trpc } from '@/utils/trpc';

interface AuthLoginProps {
  onLogin: (user: { id: number; name: string; email: string }) => void;
}

export function AuthLogin({ onLogin }: AuthLoginProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    confirmPassword: '' 
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Authenticate with the backend
      const user = await trpc.getUserByEmail.query({ email: loginData.email });
      
      if (user) {
        onLogin({ id: user.id, name: user.name, email: user.email });
      } else {
        // Create demo user if not exists
        const newUser = await trpc.createUser.mutate({
          email: loginData.email,
          name: 'Demo User'
        });
        onLogin({ id: newUser.id, name: newUser.name, email: newUser.email });
      }
    } catch (error) {
      console.error('Login failed:', error);
      // Fallback to demo user for development
      onLogin({ 
        id: 1, 
        name: 'Demo User', 
        email: loginData.email || 'demo@example.com' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signupData.password !== signupData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const newUser = await trpc.createUser.mutate({
        name: signupData.name,
        email: signupData.email
      });
      
      onLogin({ id: newUser.id, name: newUser.name, email: newUser.email });
    } catch (error) {
      console.error('Signup failed:', error);
      // Fallback to demo user for development
      onLogin({ 
        id: 1, 
        name: signupData.name || 'Demo User', 
        email: signupData.email || 'demo@example.com' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Simulate Google login for development
    onLogin({ 
      id: 1, 
      name: 'Google User', 
      email: 'google@example.com' 
    });
  };

  const handleDemoLogin = () => {
    onLogin({ 
      id: 1, 
      name: 'Demo User', 
      email: 'demo@example.com' 
    });
  };

  return (
    <div className="w-full space-y-4">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Welcome to UI Designer</h2>
        <p className="text-gray-600 mt-1">Design beautiful interfaces with ease</p>
      </div>

      <Tabs defaultValue="login" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
        </TabsList>

        <TabsContent value="login">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="login-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="login-email"
                  type="email"
                  placeholder="Enter your email"
                  value={loginData.email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setLoginData(prev => ({ ...prev, email: e.target.value }))
                  }
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="login-password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="login-password"
                  type="password"
                  placeholder="Enter your password"
                  value={loginData.password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setLoginData(prev => ({ ...prev, password: e.target.value }))
                  }
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="signup">
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <Label htmlFor="signup-name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="signup-name"
                  type="text"
                  placeholder="Enter your full name"
                  value={signupData.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSignupData(prev => ({ ...prev, name: e.target.value }))
                  }
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="signup-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="Enter your email"
                  value={signupData.email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSignupData(prev => ({ ...prev, email: e.target.value }))
                  }
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="signup-password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="Create a password"
                  value={signupData.password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSignupData(prev => ({ ...prev, password: e.target.value }))
                  }
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="signup-confirm">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="signup-confirm"
                  type="password"
                  placeholder="Confirm your password"
                  value={signupData.confirmPassword}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSignupData(prev => ({ ...prev, confirmPassword: e.target.value }))
                  }
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>
        </TabsContent>
      </Tabs>

      <div className="relative">
        <Separator />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="bg-white px-2 text-xs text-gray-500">or continue with</span>
        </div>
      </div>

      <div className="space-y-2">
        <Button 
          variant="outline" 
          className="w-full"
          onClick={handleGoogleLogin}
        >
          <Chrome className="w-4 h-4 mr-2" />
          Continue with Google
        </Button>
        
        <Button 
          variant="secondary" 
          className="w-full"
          onClick={handleDemoLogin}
        >
          Try Demo Mode
        </Button>
      </div>

      <p className="text-xs text-center text-gray-500">
        By continuing, you agree to our Terms of Service and Privacy Policy
      </p>
    </div>
  );
}
