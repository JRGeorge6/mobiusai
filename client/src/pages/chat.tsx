import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Brain, Users, Send, MessageCircle } from "lucide-react";

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [mode, setMode] = useState<'active_recall' | 'feynman'>('active_recall');
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [sessionId, setSessionId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: courses = [] } = useQuery({
    queryKey: ["/api/courses"],
  });

  const chatMutation = useMutation({
    mutationFn: async ({ message, mode, courseId, sessionId }: {
      message: string;
      mode: string;
      courseId?: string;
      sessionId?: number;
    }) => {
      const response = await apiRequest("POST", "/api/chat", {
        message,
        mode,
        courseId: courseId ? parseInt(courseId) : null,
        sessionId,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: data.response }
      ]);
      setSessionId(data.sessionId);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage = { role: 'user' as const, content: inputMessage };
    setMessages(prev => [...prev, userMessage]);

    chatMutation.mutate({
      message: inputMessage,
      mode,
      courseId: selectedCourse,
      sessionId,
    });

    setInputMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const startNewSession = () => {
    setMessages([]);
    setSessionId(null);
    
    // Send initial AI message based on mode
    const initialMessage = mode === 'active_recall' 
      ? "I'm ready to test your knowledge! I'll analyze your course materials and ask you questions to help reinforce your learning. What would you like to study today?"
      : "I'm here to learn from you! Pick a concept you'd like to teach me, and I'll ask questions to help you think deeper about it. What would you like to explain?";
    
    setMessages([{ role: 'assistant', content: initialMessage }]);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    startNewSession();
  }, [mode]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-neutral-800 mb-2">AI Study Assistant</h1>
          <p className="text-neutral-600">
            {mode === 'active_recall' 
              ? "Test your knowledge with AI-generated questions"
              : "Teach concepts back and receive probing questions"
            }
          </p>
        </div>
        
        <div className="flex space-x-2 mt-4 md:mt-0">
          <Button
            variant={mode === 'active_recall' ? 'default' : 'outline'}
            onClick={() => setMode('active_recall')}
            className={mode === 'active_recall' ? 'btn-coral' : 'bg-white/50 hover:bg-white/70'}
          >
            <Brain className="w-4 h-4 mr-2" />
            Active Recall
          </Button>
          <Button
            variant={mode === 'feynman' ? 'default' : 'outline'}
            onClick={() => setMode('feynman')}
            className={mode === 'feynman' ? 'btn-coral' : 'bg-white/50 hover:bg-white/70'}
          >
            <Users className="w-4 h-4 mr-2" />
            Feynman Mode
          </Button>
        </div>
      </div>

      {/* Course Selection */}
      {courses.length > 0 && (
        <Card className="glassmorphic border-0 mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-neutral-700">Study Context:</label>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger className="w-64 bg-white/50">
                  <SelectValue placeholder="Select a course" />
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
              <Button
                size="sm"
                variant="outline"
                onClick={startNewSession}
                className="bg-white/50 hover:bg-white/70"
              >
                New Session
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Chat Interface */}
      <Card className="glassmorphic border-0">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-semibold text-neutral-800">
            Study Session
          </CardTitle>
          <Badge variant="outline" className="bg-white/50">
            <MessageCircle className="w-3 h-3 mr-1" />
            {mode === 'active_recall' ? 'Testing Knowledge' : 'Teaching Mode'}
          </Badge>
        </CardHeader>
        <CardContent>
          {/* Messages */}
          <div className="h-96 overflow-y-auto mb-6 space-y-4 border rounded-lg p-4 bg-white/20">
            {messages.length === 0 ? (
              <div className="text-center text-neutral-500 py-8">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 text-neutral-400" />
                <p>Start a conversation to begin your study session</p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-md p-4 rounded-2xl text-white text-sm ${
                      message.role === 'user'
                        ? 'chat-bubble-user rounded-br-md'
                        : 'chat-bubble-ai rounded-bl-md'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))
            )}
            {chatMutation.isPending && (
              <div className="flex justify-start">
                <div className="chat-bubble-ai text-white p-4 rounded-2xl rounded-bl-md max-w-md">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="flex space-x-3">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                mode === 'active_recall'
                  ? "Type your answer..."
                  : "Explain a concept you'd like to teach..."
              }
              className="flex-1 bg-white/50 border-white/30 focus:bg-white/70"
              disabled={chatMutation.isPending}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || chatMutation.isPending}
              className="btn-coral px-6"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
