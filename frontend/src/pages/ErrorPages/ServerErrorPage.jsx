import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ServerCrash, Home, RefreshCw } from 'lucide-react';

const ServerErrorPage = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg border-0">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mb-4">
              <ServerCrash className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-gray-100">500</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Internal server error
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4 text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Something went wrong on our end. We're working to fix the issue.
            </p>

            <div className="space-y-3">
              <Button
                onClick={() => window.location.reload()}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>

              <Button
                asChild
                variant="outline"
                className="w-full"
              >
                <Link to="/">
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ServerErrorPage;
