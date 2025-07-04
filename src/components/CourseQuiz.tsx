import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, Clock, Award } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation } from '@tanstack/react-query';

interface Question {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
  explanation?: string;
  order_index: number;
}

interface Quiz {
  id: string;
  title: string;
  description?: string;
  time_limit: number;
  passing_score: number;
  course_id?: string;
  quiz_questions: Question[];
}

interface CourseQuizProps {
  courseId?: string;
}

const CourseQuiz: React.FC<CourseQuizProps> = ({ courseId }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [quizStarted, setQuizStarted] = useState(false);

  // Fetch quiz for the course
  const { data: quiz, isLoading } = useQuery({
    queryKey: ['quiz', courseId],
    queryFn: async (): Promise<Quiz | null> => {
      if (!courseId) return null;
      
      const { data, error } = await supabase
        .from('quizzes')
        .select(`
          *,
          quiz_questions (
            id,
            question,
            options,
            correct_answer,
            explanation,
            order_index
          )
        `)
        .eq('course_id', courseId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') return null; // No quiz found
        throw error;
      }
      
      // Transform the data to match our interfaces
      const transformedQuestions = data.quiz_questions.map((q: any) => ({
        ...q,
        options: Array.isArray(q.options) ? q.options : []
      })) as Question[];

      return {
        ...data,
        quiz_questions: transformedQuestions.sort((a: Question, b: Question) => a.order_index - b.order_index)
      };
    },
    enabled: !!courseId
  });

  // Submit quiz results
  const submitQuizMutation = useMutation({
    mutationFn: async (finalAnswers: number[]) => {
      if (!quiz || !user) throw new Error('Missing quiz or user data');

      const score = finalAnswers.reduce((acc, answer, index) => {
        return acc + (answer === quiz.quiz_questions[index].correct_answer ? 1 : 0);
      }, 0);

      const percentage = Math.round((score / quiz.quiz_questions.length) * 100);

      const { data, error } = await supabase
        .from('quiz_results')
        .insert({
          quiz_id: quiz.id,
          user_id: user.id,
          score,
          percentage,
          answers: finalAnswers,
          time_taken: quiz.time_limit - (timeLeft || 0)
        })
        .select()
        .single();

      if (error) throw error;

      // Update leaderboard and award achievements
      await supabase.rpc('update_leaderboard_score', {
        p_user_id: user.id,
        p_score: score,
        p_percentage: percentage
      });

      // Update enrollment progress if quiz is passed
      if (percentage >= quiz.passing_score && quiz.course_id) {
        await supabase
          .from('user_enrollments')
          .update({ 
            quiz_completed: true,
            progress: 100,
            completed_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
          .eq('course_id', quiz.course_id);
      }

      return { ...data, score, percentage };
    },
    onSuccess: (result) => {
      setShowResults(true);
      const passed = result.percentage >= quiz!.passing_score;
      toast({
        title: passed ? "Congratulations!" : "Quiz Completed",
        description: passed 
          ? `You passed with ${result.percentage}%! Check your achievements!` 
          : `You scored ${result.percentage}%. Try again to improve!`,
        variant: passed ? "default" : "destructive",
      });
    },
    onError: (error) => {
      console.error('Error submitting quiz:', error);
      toast({
        title: "Error",
        description: "Failed to submit quiz. Please try again.",
        variant: "destructive",
      });
    }
  });

  const startQuiz = () => {
    if (!quiz) return;
    setQuizStarted(true);
    setTimeLeft(quiz.time_limit);
    setAnswers(new Array(quiz.quiz_questions.length).fill(-1));

    // Start countdown timer
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < quiz!.quiz_questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmitQuiz = () => {
    submitQuizMutation.mutate(answers);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <Card className="glass-effect glow-border">
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Loading quiz...</p>
        </CardContent>
      </Card>
    );
  }

  if (!courseId) {
    return (
      <Card className="glass-effect glow-border">
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Please select a course to take a quiz.</p>
        </CardContent>
      </Card>
    );
  }

  if (!quiz) {
    return (
      <Card className="glass-effect glow-border">
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">No quiz available for this course yet.</p>
        </CardContent>
      </Card>
    );
  }

  if (!quizStarted) {
    return (
      <Card className="glass-effect glow-border">
        <CardHeader>
          <CardTitle className="text-geo-accent">{quiz.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {quiz.description && (
            <p className="text-muted-foreground">{quiz.description}</p>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-geo-accent" />
              <span className="text-sm">Time Limit: {formatTime(quiz.time_limit)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-geo-accent" />
              <span className="text-sm">Passing Score: {quiz.passing_score}%</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-geo-accent" />
              <span className="text-sm">Questions: {quiz.quiz_questions.length}</span>
            </div>
          </div>

          <Button 
            onClick={startQuiz}
            className="w-full bg-geo-accent text-black hover:bg-geo-accent/90"
          >
            Start Quiz
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (showResults) {
    const score = answers.reduce((acc, answer, index) => {
      return acc + (answer === quiz.quiz_questions[index].correct_answer ? 1 : 0);
    }, 0);
    const percentage = Math.round((score / quiz.quiz_questions.length) * 100);
    const passed = percentage >= quiz.passing_score;

    return (
      <Card className="glass-effect glow-border">
        <CardHeader>
          <CardTitle className="text-center">
            {passed ? (
              <div className="flex items-center justify-center text-green-500">
                <CheckCircle className="h-6 w-6 mr-2" />
                Quiz Passed!
              </div>
            ) : (
              <div className="flex items-center justify-center text-red-500">
                <XCircle className="h-6 w-6 mr-2" />
                Quiz Not Passed
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="text-3xl font-bold text-geo-accent">
            {score}/{quiz.quiz_questions.length} ({percentage}%)
          </div>
          <p className="text-muted-foreground">
            {passed 
              ? 'Congratulations! You have successfully completed the quiz.'
              : `You need ${quiz.passing_score}% to pass. Keep studying and try again!`
            }
          </p>
          <Button 
            onClick={() => window.location.reload()}
            className="bg-geo-accent text-black hover:bg-geo-accent/90"
          >
            Take Quiz Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  const question = quiz.quiz_questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.quiz_questions.length) * 100;

  return (
    <Card className="glass-effect glow-border">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-geo-accent">
            Question {currentQuestion + 1} of {quiz.quiz_questions.length}
          </CardTitle>
          {timeLeft !== null && (
            <Badge variant={timeLeft < 60 ? "destructive" : "outline"}>
              <Clock className="h-4 w-4 mr-1" />
              {formatTime(timeLeft)}
            </Badge>
          )}
        </div>
        <Progress value={progress} className="mt-2" />
      </CardHeader>
      
      <CardContent className="space-y-6">
        <h3 className="text-lg font-semibold">{question.question}</h3>
        
        <div className="space-y-3">
          {question.options.map((option, index) => (
            <Button
              key={index}
              variant={answers[currentQuestion] === index ? "default" : "outline"}
              className={`w-full text-left justify-start p-4 h-auto ${
                answers[currentQuestion] === index 
                  ? 'bg-geo-accent text-black' 
                  : 'hover:bg-geo-accent/10'
              }`}
              onClick={() => handleAnswerSelect(index)}
            >
              <span className="mr-3 font-semibold">
                {String.fromCharCode(65 + index)}.
              </span>
              {option}
            </Button>
          ))}
        </div>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePreviousQuestion}
            disabled={currentQuestion === 0}
          >
            Previous
          </Button>
          
          {currentQuestion === quiz.quiz_questions.length - 1 ? (
            <Button
              onClick={handleSubmitQuiz}
              disabled={answers[currentQuestion] === -1 || submitQuizMutation.isPending}
              className="bg-geo-highlight text-black hover:bg-geo-highlight/90"
            >
              {submitQuizMutation.isPending ? 'Submitting...' : 'Submit Quiz'}
            </Button>
          ) : (
            <Button
              onClick={handleNextQuestion}
              disabled={answers[currentQuestion] === -1}
              className="bg-geo-accent text-black hover:bg-geo-accent/90"
            >
              Next
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseQuiz;
