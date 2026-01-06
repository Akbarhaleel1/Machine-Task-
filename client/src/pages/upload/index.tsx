import { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FileUp, CheckCircle, AlertCircle, Download, FileText } from 'lucide-react';
import { FileUploadZone } from '@/components/upload/file-upload-zone';
import { UploadHistory } from '@/components/upload/upload-history';
import { uploadLeads, getUploadHistory } from '@/lib/api/upload';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function UploadPage() {
  const queryClient = useQueryClient();
  const [showResult, setShowResult] = useState(false);

  const { data: historyData, isLoading: historyLoading } = useQuery({
    queryKey: ['uploadHistory'],
    queryFn: () => getUploadHistory(10),
  });

  const uploadMutation = useMutation({
    mutationFn: uploadLeads,
    onSuccess: (data) => {
      setShowResult(true);
      queryClient.invalidateQueries({ queryKey: ['uploadHistory'] });

      if (data.data.errorCount === 0) {
        toast.success(`Successfully uploaded ${data.data.successCount} leads!`);
      } else {
        toast.warning(
          `Uploaded ${data.data.successCount} leads with ${data.data.errorCount} errors.`
        );
      }
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to upload file';

      // Check if backend is not running
      if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
        toast.error('Backend server is not running. Please start the server or the upload will not be saved.');
      } else {
        toast.error(errorMessage);
      }
    },
  });

  const handleFileSelect = (file: File) => {
    setShowResult(false);
    uploadMutation.mutate(file);
  };

  const downloadTemplate = () => {
    const headers = ['name', 'phone', 'email', 'source', 'status', 'interestLevel', 'budget', 'notes'];
    const sampleRow = [
      'John Doe',
      '1234567890',
      'john@example.com',
      'Facebook',
      'NEW',
      'HOT',
      '50000',
      'Interested in premium plan'
    ];

    const csvContent = [
      headers.join(','),
      sampleRow.join(',')
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lead_upload_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast.success('Template downloaded successfully');
  };

  const uploads = historyData?.data || [];
  const stats = {
    totalUploads: uploads.length,
    successfulUploads: uploads.filter((h) => h.errorCount === 0).length,
    totalRecordsProcessed: uploads.reduce((sum, h) => sum + h.rowCount, 0),
    successRate: uploads.length > 0
      ? Math.round((uploads.filter((h) => h.errorCount === 0).length / uploads.length) * 100)
      : 0,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="max-w-7xl mx-auto p-8 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent-purple-600 bg-clip-text text-transparent">
                Upload Leads
              </h1>
              <p className="text-muted-foreground mt-2">
                Import lead data from CSV or Excel files.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2" onClick={downloadTemplate}>
                <Download className="w-4 h-4" />
                Download Template
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileUp className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Uploads</p>
                <p className="text-2xl font-bold text-primary mt-1">{stats.totalUploads}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Successful</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                  {stats.successfulUploads}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Records Processed</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                  {stats.totalRecordsProcessed.toLocaleString()}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                  {stats.successRate}%
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Upload Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="p-6 bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-900/30">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h3 className="font-semibold text-blue-900 dark:text-blue-300">
                  File Format Requirements
                </h3>
                <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1 list-disc list-inside">
                  <li>CSV or Excel (.xlsx, .xls) files accepted</li>
                  <li>Required columns: Name, Phone (or Email)</li>
                  <li>Optional columns: Email, Source, Budget, Notes</li>
                  <li>Maximum file size: 10MB</li>
                  <li>First row should contain column headers</li>
                </ul>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* File Upload Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Upload File</h3>
            <FileUploadZone
              onFileSelect={handleFileSelect}
              isUploading={uploadMutation.isPending}
            />
          </Card>
        </motion.div>

        {/* Upload Result */}
        {showResult && uploadMutation.data && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  {uploadMutation.data.data.errorCount === 0 ? (
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  ) : (
                    <AlertCircle className="h-6 w-6 text-yellow-600" />
                  )}
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Upload Results
                  </h3>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Total Rows</p>
                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-300 mt-1">
                      {uploadMutation.data.data.totalRows}
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-sm text-green-600 dark:text-green-400 font-medium">Success</p>
                    <p className="text-2xl font-bold text-green-900 dark:text-green-300 mt-1">
                      {uploadMutation.data.data.successCount}
                    </p>
                  </div>
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400 font-medium">Errors</p>
                    <p className="text-2xl font-bold text-red-900 dark:text-red-300 mt-1">
                      {uploadMutation.data.data.errorCount}
                    </p>
                  </div>
                </div>

                {uploadMutation.data.data.errors.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">Error Details</h4>
                    <div className="max-h-60 overflow-y-auto space-y-2">
                      {uploadMutation.data.data.errors.map((error, index) => (
                        <div
                          key={index}
                          className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 rounded-md"
                        >
                          <p className="text-sm font-medium text-red-900 dark:text-red-300">
                            Row {error.row}
                          </p>
                          <ul className="mt-1 text-xs text-red-700 dark:text-red-400 list-disc list-inside">
                            {error.errors.map((err, errIndex) => (
                              <li key={errIndex}>{err}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Upload History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Upload History</h2>
          </div>
          <UploadHistory
            uploads={uploads}
            isLoading={historyLoading}
          />
        </motion.div>

        {/* Sample Data Format */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Sample CSV Format</h3>
            <div className="bg-muted/50 p-4 rounded-lg overflow-x-auto">
              <pre className="text-sm">
{`Name,Phone,Email,Source,Budget,Notes
John Doe,+1 (555) 123-4567,john@example.com,Website,25000,Interested in premium plan
Jane Smith,+1 (555) 987-6543,jane@company.com,LinkedIn,50000,Enterprise client
Bob Johnson,+1 (555) 456-7890,bob@startup.io,Referral,15000,Startup founder`}
              </pre>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
