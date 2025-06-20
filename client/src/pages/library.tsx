import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Upload, FileText, BookOpen, Search, Filter } from "lucide-react";

export default function Library() {
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: courses = [] } = useQuery({
    queryKey: ["/api/courses"],
  });

  const { data: documents = [] } = useQuery({
    queryKey: ["/api/documents", selectedCourse ? { courseId: selectedCourse } : {}],
  });

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return await apiRequest("POST", "/api/documents", formData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Document uploaded and processed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      setUploadFile(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to upload document",
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const allowedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Error",
          description: "Please upload a PDF, DOCX, or TXT file",
          variant: "destructive",
        });
        return;
      }
      
      setUploadFile(file);
    }
  };

  const handleUpload = () => {
    if (!uploadFile) return;
    
    const formData = new FormData();
    formData.append('document', uploadFile);
    if (selectedCourse) {
      formData.append('courseId', selectedCourse);
    }
    
    uploadMutation.mutate(formData);
  };

  const filteredDocuments = documents.filter((doc: any) =>
    doc.originalName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-800 mb-2">Course Library</h1>
          <p className="text-neutral-600">Upload and organize your study materials</p>
        </div>
        
        {/* Upload Section */}
        <Card className="glassmorphic border-0 mt-4 md:mt-0 min-w-80">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Upload Document</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Input
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleFileUpload}
                className="bg-white/50"
              />
              <p className="text-xs text-neutral-500 mt-1">
                Supports PDF, DOCX, and TXT files
              </p>
            </div>
            
            {courses.length > 0 && (
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger className="bg-white/50">
                  <SelectValue placeholder="Select a course (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course: any) => (
                    <SelectItem key={course.id} value={course.id.toString()}>
                      {course.courseCode} - {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            
            <Button
              onClick={handleUpload}
              disabled={!uploadFile || uploadMutation.isPending}
              className="btn-coral w-full"
            >
              <Upload className="w-4 h-4 mr-2" />
              {uploadMutation.isPending ? "Uploading..." : "Upload & Process"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
            <Input
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/50 glassmorphic border-0"
            />
          </div>
        </div>
        
        {courses.length > 0 && (
          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
            <SelectTrigger className="w-full md:w-64 bg-white/50 glassmorphic border-0">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="All courses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All courses</SelectItem>
              {courses.map((course: any) => (
                <SelectItem key={course.id} value={course.id.toString()}>
                  {course.courseCode} - {course.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Documents Grid */}
      {filteredDocuments.length === 0 ? (
        <Card className="glassmorphic border-0">
          <CardContent className="text-center py-12">
            <BookOpen className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-800 mb-2">
              {documents.length === 0 ? "No documents uploaded" : "No documents match your search"}
            </h3>
            <p className="text-neutral-600">
              {documents.length === 0 
                ? "Upload your first document to get started with AI-powered studying"
                : "Try adjusting your search terms or filters"
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments.map((document: any) => (
            <Card key={document.id} className="glassmorphic hover-lift border-0">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-800 text-sm leading-tight">
                        {document.originalName}
                      </h3>
                      <p className="text-xs text-neutral-500 mt-1">
                        {Math.round(document.size / 1024)} KB
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-xs text-neutral-600">
                    <p>Uploaded: {new Date(document.createdAt).toLocaleDateString()}</p>
                    {document.chunks && (
                      <p>{document.chunks.length} text chunks processed</p>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 bg-white/50 hover:bg-white/70"
                      onClick={() => window.location.href = `/chat?document=${document.id}`}
                    >
                      Study
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 bg-white/50 hover:bg-white/70"
                      onClick={() => {
                        // TODO: Implement concept extraction view
                        toast({
                          title: "Coming Soon",
                          description: "Concept extraction view is being developed",
                        });
                      }}
                    >
                      Concepts
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
