import { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Upload, 
  File, 
  CheckCircle, 
  AlertCircle, 
  X,
  FileText,
  TrendingUp,
  Download
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BankStatementUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UploadedFile {
  name: string;
  size: number;
  type: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  matchedTransactions?: number;
  unmatchedTransactions?: number;
}

export const BankStatementUploadModal = ({ isOpen, onClose }: BankStatementUploadModalProps) => {
  const { toast } = useToast();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      handleFiles(selectedFiles);
    }
  };

  const handleFiles = (fileList: File[]) => {
    const validFiles = fileList.filter(file => {
      const validTypes = ['text/csv', 'application/pdf', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
      return validTypes.includes(file.type) || file.name.endsWith('.csv') || file.name.endsWith('.pdf') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
    });

    if (validFiles.length !== fileList.length) {
      toast({
        title: "Invalid File Type",
        description: "Please upload CSV, PDF, or Excel files only",
        variant: "destructive"
      });
    }

    const newFiles: UploadedFile[] = validFiles.map(file => ({
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'pending',
      progress: 0
    }));

    setFiles(prev => [...prev, ...newFiles]);
  };

  const processFiles = async () => {
    setIsProcessing(true);
    
    for (let i = 0; i < files.length; i++) {
      if (files[i].status === 'pending') {
        // Update to processing
        setFiles(prev => prev.map((file, index) => 
          index === i ? { ...file, status: 'processing' } : file
        ));

        // Simulate file processing with progress
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise(resolve => setTimeout(resolve, 200));
          setFiles(prev => prev.map((file, index) => 
            index === i ? { ...file, progress } : file
          ));
        }

        // Simulate processing results
        const matchedTransactions = Math.floor(Math.random() * 20) + 15;
        const unmatchedTransactions = Math.floor(Math.random() * 5);

        setFiles(prev => prev.map((file, index) => 
          index === i ? { 
            ...file, 
            status: 'completed',
            matchedTransactions,
            unmatchedTransactions
          } : file
        ));
      }
    }
    
    setIsProcessing(false);
    toast({
      title: "Processing Complete",
      description: "Bank statements have been processed and matched with transactions",
    });
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-success" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'processing': return <TrendingUp className="h-4 w-4 text-warning animate-pulse" />;
      default: return <File className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-success text-success-foreground';
      case 'error': return 'bg-destructive text-destructive-foreground';
      case 'processing': return 'bg-warning text-warning-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Upload Bank Statements</DialogTitle>
          <DialogDescription>
            Upload your bank statements to automatically match transactions and identify discrepancies
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Upload Area */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Select Bank Statements</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragOver 
                    ? 'border-primary bg-primary/10' 
                    : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                }`}
                onDrop={handleDrop}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
              >
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Drop files here or click to browse</h3>
                <p className="text-muted-foreground mb-4">
                  Supports CSV, PDF, and Excel files (Max 10MB each)
                </p>
                <Input
                  type="file"
                  multiple
                  accept=".csv,.pdf,.xlsx,.xls"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <Label htmlFor="file-upload">
                  <Button variant="outline" className="cursor-pointer">
                    Browse Files
                  </Button>
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* File List */}
          {files.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Uploaded Files</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {files.map((file, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(file.status)}
                        <div>
                          <p className="font-medium">{file.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(file.status)}>
                          {file.status.toUpperCase()}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          className="h-6 w-6 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {file.status === 'processing' && (
                      <Progress value={file.progress} className="mb-2" />
                    )}
                    
                    {file.status === 'completed' && (
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Matched Transactions:</span>
                          <span className="font-medium text-success">{file.matchedTransactions}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Unmatched:</span>
                          <span className="font-medium text-warning">{file.unmatchedTransactions}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Processing Results */}
          {files.some(f => f.status === 'completed') && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Processing Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-success/10 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-success">
                      {files.reduce((sum, f) => sum + (f.matchedTransactions || 0), 0)}
                    </div>
                    <p className="text-sm text-muted-foreground">Matched Transactions</p>
                  </div>
                  <div className="bg-warning/10 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-warning">
                      {files.reduce((sum, f) => sum + (f.unmatchedTransactions || 0), 0)}
                    </div>
                    <p className="text-sm text-muted-foreground">Unmatched</p>
                  </div>
                  <div className="bg-primary/10 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-primary">
                      {files.filter(f => f.status === 'completed').length}
                    </div>
                    <p className="text-sm text-muted-foreground">Files Processed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Info Alert */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Supported Formats:</strong> CSV files with standard banking columns, 
              PDF bank statements (will be parsed automatically), and Excel files with transaction data.
              The system will attempt to match transactions by amount, date, and reference numbers.
            </AlertDescription>
          </Alert>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            {files.some(f => f.status === 'completed') && (
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Results
              </Button>
            )}
            <Button 
              onClick={processFiles}
              disabled={files.length === 0 || isProcessing || files.every(f => f.status !== 'pending')}
              className="button-luxury"
            >
              {isProcessing ? (
                <>
                  <FileText className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Process Files
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};