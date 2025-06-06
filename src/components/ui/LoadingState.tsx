interface LoadingStateProps {
  type?: 'card' | 'list' | 'chart' | 'profile';
  count?: number;
  className?: string;
}

export default function LoadingState({ type = 'card', count = 1, className = '' }: LoadingStateProps) {
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden animate-pulse">
            <div className="p-6">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 bg-gray-700 rounded-full" />
                <div className="flex-1">
                  <div className="h-6 w-32 bg-gray-700 rounded mb-2" />
                  <div className="h-4 w-24 bg-gray-700 rounded" />
                </div>
              </div>
              <div className="mt-6 space-y-4">
                <div className="h-4 w-full bg-gray-700 rounded" />
                <div className="h-4 w-3/4 bg-gray-700 rounded" />
                <div className="h-2 w-full bg-gray-700 rounded" />
              </div>
            </div>
          </div>
        );

      case 'list':
        return (
          <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden animate-pulse">
            <div className="p-4">
              {[...Array(count)].map((_, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-gray-700 last:border-0">
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 bg-gray-700 rounded-full" />
                    <div>
                      <div className="h-4 w-32 bg-gray-700 rounded mb-2" />
                      <div className="h-3 w-24 bg-gray-700 rounded" />
                    </div>
                  </div>
                  <div className="h-4 w-20 bg-gray-700 rounded" />
                </div>
              ))}
            </div>
          </div>
        );

      case 'chart':
        return (
          <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden animate-pulse">
            <div className="p-6">
              <div className="h-6 w-48 bg-gray-700 rounded mb-4" />
              <div className="h-64 bg-gray-700 rounded" />
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden animate-pulse">
            <div className="h-48 sm:h-64 bg-gray-700" />
            <div className="p-6">
              <div className="h-8 w-64 bg-gray-700 rounded mb-4" />
              <div className="h-4 w-32 bg-gray-700 rounded mb-6" />
              <div className="space-y-4">
                <div className="h-4 w-full bg-gray-700 rounded" />
                <div className="h-4 w-5/6 bg-gray-700 rounded" />
                <div className="h-4 w-4/6 bg-gray-700 rounded" />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={className}>
      {[...Array(count)].map((_, i) => (
        <div key={i} className={i > 0 ? 'mt-6' : ''}>
          {renderSkeleton()}
        </div>
      ))}
    </div>
  );
} 