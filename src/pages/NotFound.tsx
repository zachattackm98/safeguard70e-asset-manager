
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-primary">404</h1>
        <h2 className="text-2xl font-semibold mt-2">Page Not Found</h2>
        <p className="text-muted-foreground mt-4 mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Button asChild>
          <Link to="/dashboard">Return to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
