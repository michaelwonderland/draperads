import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Facebook } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface MetaAuthButtonProps {
  onAuthStatusChange?: (status: boolean) => void;
  className?: string;
}

export function MetaAuthButton({ onAuthStatusChange, className = '' }: MetaAuthButtonProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check Meta connection status on load
  const { data: authStatus, refetch } = useQuery({
    queryKey: ['/api/meta/status'],
    onSuccess: (data: any) => {
      setIsConnected(data?.isAuthenticated || false);
      if (onAuthStatusChange) {
        onAuthStatusChange(data?.isAuthenticated || false);
      }
    },
    onError: () => {
      setIsConnected(false);
      if (onAuthStatusChange) {
        onAuthStatusChange(false);
      }
    },
  });

  useEffect(() => {
    // If we just arrived from a Meta callback, refresh the status
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('meta_connected')) {
      refetch();
    }
  }, [refetch]);

  const handleConnectClick = async () => {
    try {
      setIsLoading(true);
      const response = await apiRequest('/api/meta/login');
      
      if (response && response.loginUrl) {
        // Redirect to Meta OAuth
        window.location.href = response.loginUrl;
      }
    } catch (error) {
      console.error('Failed to initialize Meta login:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleConnectClick}
      disabled={isLoading || isConnected}
      className={`${className} ${isConnected ? 'bg-green-600 hover:bg-green-700' : 'bg-[#1877F2] hover:opacity-90'}`}
    >
      <Facebook className="w-4 h-4 mr-2" />
      {isLoading ? 'Connecting...' : isConnected ? 'Connected to Meta' : 'Connect Meta Account'}
    </Button>
  );
}