
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [signupError, setSignupError] = useState<string | null>(null);
  const { login, signUp, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Fill in test credentials for demo purposes
  const fillTestCredentials = () => {
    setEmail('admin@example.com');
    setPassword('password123');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLoginError(null);

    try {
      await login(email, password);
      navigate('/dashboard');
      toast({
        title: 'Login successful',
        description: 'Welcome to Safeguard70E',
      });
    } catch (error: any) {
      console.error('Login error:', error);
      
      if (error.status === 400) {
        setLoginError('Invalid email or password');
      } else if (error.status === 429) {
        setLoginError('Too many login attempts. Please try again later.');
      } else if (!navigator.onLine) {
        setLoginError('You appear to be offline. Please check your internet connection.');
      } else if (error.message?.includes('timeout') || error.status === 504) {
        setLoginError('The server took too long to respond. Please try again later.');
      } else {
        setLoginError(error.message || 'Login failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSignupError(null);

    // Basic validation
    if (password.length < 6) {
      setSignupError('Password must be at least 6 characters long');
      setIsSubmitting(false);
      return;
    }

    try {
      await signUp(email, password, name);
      toast({
        title: 'Account created',
        description: 'Please sign in with your new account.',
      });
      
      // Switch to the login tab after successful signup
      const loginTab = document.querySelector('[data-state="inactive"][data-value="login"]') as HTMLElement;
      if (loginTab) loginTab.click();
      
    } catch (error: any) {
      console.error('Signup error:', error);
      
      if (error.status === 429) {
        setSignupError('Too many signup attempts. Please try again later.');
      } else if (!navigator.onLine) {
        setSignupError('You appear to be offline. Please check your internet connection.');
      } else if (error.message?.includes('timeout') || error.status === 504) {
        setSignupError('The server took too long to respond. Please try again later.');
      } else if (error.message?.includes('already')) {
        setSignupError('This email is already registered. Please try logging in instead.');
      } else {
        setSignupError(error.message || 'Signup failed. Please try again or use a different email.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">Safeguard70E</h1>
          <p className="text-muted-foreground mt-2">OSHA 1910.137 & NFPA 70E Compliance Management</p>
        </div>
        
        <Tabs defaultValue="login">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Sign In</CardTitle>
                <CardDescription>
                  Access your Safeguard70E account
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4">
                  {loginError && (
                    <Alert variant="destructive" className="text-sm py-2">
                      <AlertDescription>{loginError}</AlertDescription>
                    </Alert>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email"
                      type="email" 
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input 
                      id="password"
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="pt-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      className="w-full"
                      onClick={fillTestCredentials}
                    >
                      Use Test Credentials
                    </Button>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : 'Sign In'}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
          
          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle>Create Account</CardTitle>
                <CardDescription>
                  Register a new Safeguard70E account
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSignUp}>
                <CardContent className="space-y-4">
                  {signupError && (
                    <Alert variant="destructive" className="text-sm py-2">
                      <AlertDescription>{signupError}</AlertDescription>
                    </Alert>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input 
                      id="signup-name"
                      type="text" 
                      placeholder="John Smith"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input 
                      id="signup-email"
                      type="email" 
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input 
                      id="signup-password"
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <p className="text-xs text-muted-foreground">Password must be at least 6 characters long</p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Account...
                      </>
                    ) : 'Create Account'}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Login;
