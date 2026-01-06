import { CheckCircle, XCircle, FileSpreadsheet, ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import type { UploadHistory as UploadHistoryType } from '../../lib/api/upload';
import { useState } from 'react';

interface UploadHistoryProps {
  uploads: UploadHistoryType[];
  isLoading?: boolean;
}

export function UploadHistory({ uploads, isLoading }: UploadHistoryProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4 animate-pulse">
            <div className="h-20 bg-gray-200 rounded"></div>
          </Card>
        ))}
      </div>
    );
  }

  if (uploads.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="flex flex-col items-center space-y-2">
          <FileSpreadsheet className="h-12 w-12 text-gray-400" />
          <p className="text-gray-500">No upload history yet</p>
          <p className="text-sm text-gray-400">Upload your first file to get started</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {uploads.map((upload) => (
        <Card key={upload.id} className="overflow-hidden">
          <div className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <div className="p-2 bg-blue-100 rounded">
                  <FileSpreadsheet className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className="font-medium text-gray-900 truncate">
                      {upload.fileName}
                    </p>
                    <span className="text-xs text-gray-500">
                      {formatFileSize(upload.fileSize)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {formatDate(upload.createdAt)}
                  </p>
                  <div className="flex items-center space-x-4 mt-2">
                    <div className="flex items-center space-x-1 text-sm">
                      <span className="text-gray-500">Total:</span>
                      <Badge variant="outline">{upload.rowCount}</Badge>
                    </div>
                    <div className="flex items-center space-x-1 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-green-600 font-medium">
                        {upload.successCount}
                      </span>
                    </div>
                    {upload.errorCount > 0 && (
                      <div className="flex items-center space-x-1 text-sm">
                        <XCircle className="h-4 w-4 text-red-600" />
                        <span className="text-red-600 font-medium">
                          {upload.errorCount}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {upload.errors && upload.errors.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleExpand(upload.id)}
                >
                  {expandedId === upload.id ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>

            {expandedId === upload.id && upload.errors && (
              <div className="mt-4 pt-4 border-t">
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Errors ({upload.errorCount})
                </h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {upload.errors.map((error, index) => (
                    <div
                      key={index}
                      className="p-3 bg-red-50 border border-red-200 rounded-md"
                    >
                      <p className="text-sm font-medium text-red-900">
                        Row {error.row}
                      </p>
                      <ul className="mt-1 text-xs text-red-700 list-disc list-inside">
                        {error.errors.map((err, errIndex) => (
                          <li key={errIndex}>{err}</li>
                        ))}
                      </ul>
                      {error.data && Object.keys(error.data).length > 0 && (
                        <div className="mt-2 text-xs text-gray-600">
                          <span className="font-medium">Data: </span>
                          {JSON.stringify(error.data)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
