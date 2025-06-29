
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, Clock, Award } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

const sampleQuestions: Question[] = [
  {
    id: 1,
    question: "What does GIS stand for?",
    options: [
      "Geographic Information System",
      "Global Information Service",
      "Geospatial Intelligence Software",
      "Geographic Interface System"
    ],
    correctAnswer: 0,
    explanation: "GIS stands for Geographic Information System, which is a framework for gathering, managing, and analyzing spatial and geographic data."
  },
  {
    id: 2,
    question: "Which coordinate system is commonly used for GPS?",
    options: [
      "UTM",
      "WGS84",
      "NAD83",
      "State Plane"
    ],
    correctAnswer: 1,
    explanation: "WGS84 (World Geodetic System 1984) is the standard coordinate system used by GPS satellites."
  },
  {
    id: 3,
    question: "What is remote sensing?",
    options: [
      "Collecting data from satellites only",
      "Acquiring information about objects without physical contact",
      "Using GPS for navigation",
      "Creating digital maps"
    ],
    correctAnswer: 1,
    explanation: "Remote sensing is the acquisition of information about an object or phenomenon without making physical contact with it."
  }
];

const Quiz = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [quizStarted, setQuizStarted] = useState(false);

  useEffect(() => {
    if (quizStarted && timeLeft > 0 && !showResults) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showResults) {
      handleSubmitQuiz();
    }
  }, [timeLeft, quizStarted, showResults]);

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < sampleQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmitQuiz = () => {
    const score = selectedAnswers.reduce((acc, answer, index) => {
      return acc + (answer === sampleQuestions[index]?.correctAnswer ? 1 : 0);
    }, 0);
    
    const percentage = Math.round((score / sampleQuestions.length) * 100);
    
    // Save quiz result
    const quizResults = JSON.parse(localStorage.getItem(`geolearn_quiz_results_${user?.id}`) || '[]');
    quizResults.push({
      quizId: 'gis-fundamentals',
      score: percentage,
      completedAt: new Date().toISOString(),
      answers: selectedAnswers
    });
    localStorage.setItem(`geolearn_quiz_results_${user?.id}`, JSON.stringify(quizResults));
    
    setShowResults(true);
    
    toast({
      title: "Quiz Completed!",
      description: `You scored ${percentage}% on the GIS Fundamentals quiz.`,
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateScore = () => {
    return selectedAnswers.reduce((acc, answer, index) => {
      return acc + (answer === sampleQuestions[index]?.correctAnswer ? 1 : 0);
    }, 0);
  };

  if (!quizStarted) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-6 py-8">
          <div className="max-w-2xl mx-auto">
            <Card className="glass-effect glow-border">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl mb-4 bg-gradient-to-r from-geo-accent to-geo-highlight bg-clip-text text-transparent">
                  GIS Fundamentals Quiz
                </CardTitle>
                <p className="text-muted-foreground">
                  Test your knowledge of Geographic Information Systems basics
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-geo-dark/30 rounded-lg">
                    <span>Questions:</span>
                    <Badge>{sampleQuestions.length} questions</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-geo-dark/30 rounded-lg">
                    <span>Time Limit:</span>
                    <Badge variant="outline">5 minutes</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-geo-dark/30 rounded-lg">
                    <span>Passing Score:</span>
                    <Badge className="bg-green-500">70%</Badge>
                  </div>
                </div>
                
                <Button
                  onClick={() => setQuizStarted(true)}
                  className="w-full bg-gradient-to-r from-geo-accent to-geo-highlight hover:from-geo-accent/90 hover:to-geo-highlight/90 text-black font-semibold py-4 text-lg"
                >
                  Start Quiz
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (showResults) {
    const score = calculateScore();
    const percentage = Math.round((score / sampleQuestions.length) * 100);
    const passed = percentage >= 70;

    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-6 py-8">
          <div className="max-w-2xl mx-auto">
            <Card className="glass-effect glow-border">
              <CardHeader className="text-center">
                <div className={`mx-auto mb-4 ${passed ? 'text-green-500' : 'text-red-500'}`}>
                  {passed ? <Award className="h-16 w-16 mx-auto" /> : <XCircle className="h-16 w-16 mx-auto" />}
                </div>
                <CardTitle className="text-3xl mb-2">
                  {passed ? 'Congratulations!' : 'Keep Learning!'}
                </CardTitle>
                <p className="text-muted-foreground">
                  You scored {score} out of {sampleQuestions.length} questions correctly
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2 bg-gradient-to-r from-geo-accent to-geo-highlight bg-clip-text text-transparent">
                    {percentage}%
                  </div>
                  <Badge className={passed ? "bg-green-500" : "bg-red-500"}>
                    {passed ? 'Passed' : 'Failed'}
                  </Badge>
                </div>

                <div className="space-y-4">
                  {sampleQuestions.map((question, index) => (
                    <div key={question.id} className="p-4 bg-geo-dark/30 rounded-lg">
                      <div className="flex items-start gap-3">
                        {selectedAnswers[index] === question.correctAnswer ? (
                          <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500 mt-1 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <p className="font-medium mb-2">{question.question}</p>
                          <p className="text-sm text-muted-foreground">{question.explanation}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-4">
                  <Button
                    onClick={() => {
                      setCurrentQuestion(0);
                      setSelectedAnswers([]);
                      setShowResults(false);
                      setTimeLeft(300);
                      setQuizStarted(false);
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Retake Quiz
                  </Button>
                  <Button
                    onClick={() => window.history.back()}
                    className="flex-1 bg-gradient-to-r from-geo-accent to-geo-highlight hover:from-geo-accent/90 hover:to-geo-highlight/90 text-black"
                  >
                    Continue Learning
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = sampleQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / sampleQuestions.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Quiz Progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                Question {currentQuestion + 1} of {sampleQuestions.length}
              </span>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4" />
                <span className={timeLeft < 60 ? 'text-red-500' : 'text-muted-foreground'}>
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>
            <Progress value={progress} className="w-full" />
          </div>

          <Card className="glass-effect glow-border">
            <CardHeader>
              <CardTitle className="text-xl">{currentQ.question}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {currentQ.options.map((option, index) => (
                  <Button
                    key={index}
                    variant={selectedAnswers[currentQuestion] === index ? "default" : "outline"}
                    className={`w-full text-left justify-start p-4 h-auto ${
                      selectedAnswers[currentQuestion] === index
                        ? "bg-geo-accent/20 border-geo-accent text-geo-accent"
                        : "hover:bg-geo-accent/10"
                    }`}
                    onClick={() => handleAnswerSelect(index)}
                  >
                    <span className="mr-3 font-bold">{String.fromCharCode(65 + index)}.</span>
                    {option}
                  </Button>
                ))}
              </div>

              <div className="flex justify-between pt-6">
                <Button
                  variant="outline"
                  onClick={handlePreviousQuestion}
                  disabled={currentQuestion === 0}
                >
                  Previous
                </Button>
                
                {currentQuestion === sampleQuestions.length - 1 ? (
                  <Button
                    onClick={handleSubmitQuiz}
                    disabled={selectedAnswers[currentQuestion] === undefined}
                    className="bg-gradient-to-r from-geo-accent to-geo-highlight hover:from-geo-accent/90 hover:to-geo-highlight/90 text-black"
                  >
                    Submit Quiz
                  </Button>
                ) : (
                  <Button
                    onClick={handleNextQuestion}
                    disabled={selectedAnswers[currentQuestion] === undefined}
                    className="bg-gradient-to-r from-geo-accent to-geo-highlight hover:from-geo-accent/90 hover:to-geo-highlight/90 text-black"
                  >
                    Next
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Quiz;
