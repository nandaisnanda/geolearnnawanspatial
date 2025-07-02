
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';

interface Quiz {
  id: string;
  title: string;
  description: string;
  course_id: string;
  time_limit: number;
  passing_score: number;
  courses: {
    title: string;
  };
}

interface Question {
  id: string;
  quiz_id: string;
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
  order_index: number;
}

const QuizManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [selectedQuizId, setSelectedQuizId] = useState<string>('');
  const [showAddQuiz, setShowAddQuiz] = useState(false);
  const [showAddQuestion, setShowAddQuestion] = useState(false);

  const [quizForm, setQuizForm] = useState({
    title: '',
    description: '',
    course_id: '',
    time_limit: 300,
    passing_score: 70
  });

  const [questionForm, setQuestionForm] = useState({
    question: '',
    options: ['', '', '', ''],
    correct_answer: 0,
    explanation: '',
    quiz_id: ''
  });

  // Fetch courses
  const { data: courses = [] } = useQuery({
    queryKey: ['courses-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('id, title')
        .order('title');
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch quizzes
  const { data: quizzes = [] } = useQuery({
    queryKey: ['quizzes-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quizzes')
        .select(`
          *,
          courses (title)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch questions for selected quiz
  const { data: questions = [] } = useQuery({
    queryKey: ['quiz-questions', selectedQuizId],
    queryFn: async () => {
      if (!selectedQuizId) return [];
      
      const { data, error } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('quiz_id', selectedQuizId)
        .order('order_index');
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedQuizId
  });

  // Create/Update quiz mutation
  const quizMutation = useMutation({
    mutationFn: async (quiz: any) => {
      if (editingQuiz) {
        const { error } = await supabase
          .from('quizzes')
          .update(quiz)
          .eq('id', editingQuiz.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('quizzes')
          .insert(quiz);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes-admin'] });
      setShowAddQuiz(false);
      setEditingQuiz(null);
      setQuizForm({
        title: '',
        description: '',
        course_id: '',
        time_limit: 300,
        passing_score: 70
      });
      toast({
        title: "Success",
        description: `Quiz ${editingQuiz ? 'updated' : 'created'} successfully!`,
      });
    }
  });

  // Create/Update question mutation
  const questionMutation = useMutation({
    mutationFn: async (question: any) => {
      if (editingQuestion) {
        const { error } = await supabase
          .from('quiz_questions')
          .update(question)
          .eq('id', editingQuestion.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('quiz_questions')
          .insert({
            ...question,
            order_index: questions.length
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz-questions', selectedQuizId] });
      setShowAddQuestion(false);
      setEditingQuestion(null);
      setQuestionForm({
        question: '',
        options: ['', '', '', ''],
        correct_answer: 0,
        explanation: '',
        quiz_id: selectedQuizId
      });
      toast({
        title: "Success",
        description: `Question ${editingQuestion ? 'updated' : 'created'} successfully!`,
      });
    }
  });

  // Delete quiz mutation
  const deleteQuizMutation = useMutation({
    mutationFn: async (quizId: string) => {
      const { error } = await supabase
        .from('quizzes')
        .delete()
        .eq('id', quizId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes-admin'] });
      toast({
        title: "Success",
        description: "Quiz deleted successfully!",
      });
    }
  });

  // Delete question mutation
  const deleteQuestionMutation = useMutation({
    mutationFn: async (questionId: string) => {
      const { error } = await supabase
        .from('quiz_questions')
        .delete()
        .eq('id', questionId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz-questions', selectedQuizId] });
      toast({
        title: "Success",
        description: "Question deleted successfully!",
      });
    }
  });

  const handleSubmitQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    quizMutation.mutate(quizForm);
  };

  const handleSubmitQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    questionMutation.mutate({
      ...questionForm,
      quiz_id: selectedQuizId
    });
  };

  const startEditQuiz = (quiz: Quiz) => {
    setEditingQuiz(quiz);
    setQuizForm({
      title: quiz.title,
      description: quiz.description || '',
      course_id: quiz.course_id,
      time_limit: quiz.time_limit || 300,
      passing_score: quiz.passing_score || 70
    });
    setShowAddQuiz(true);
  };

  const startEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    setQuestionForm({
      question: question.question,
      options: question.options,
      correct_answer: question.correct_answer,
      explanation: question.explanation || '',
      quiz_id: question.quiz_id
    });
    setShowAddQuestion(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Quiz Management</h2>
        <Button
          onClick={() => setShowAddQuiz(true)}
          className="bg-gradient-to-r from-geo-accent to-geo-highlight hover:from-geo-accent/90 hover:to-geo-highlight/90 text-black"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Quiz
        </Button>
      </div>

      {/* Quiz Form */}
      {showAddQuiz && (
        <Card className="glass-effect glow-border">
          <CardHeader>
            <CardTitle>{editingQuiz ? 'Edit Quiz' : 'Create New Quiz'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitQuiz} className="space-y-4">
              <div>
                <Label htmlFor="quiz-title">Title</Label>
                <Input
                  id="quiz-title"
                  value={quizForm.title}
                  onChange={(e) => setQuizForm(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="quiz-description">Description</Label>
                <Textarea
                  id="quiz-description"
                  value={quizForm.description}
                  onChange={(e) => setQuizForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="quiz-course">Course</Label>
                <Select value={quizForm.course_id} onValueChange={(value) => setQuizForm(prev => ({ ...prev, course_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="time-limit">Time Limit (seconds)</Label>
                  <Input
                    id="time-limit"
                    type="number"
                    value={quizForm.time_limit}
                    onChange={(e) => setQuizForm(prev => ({ ...prev, time_limit: parseInt(e.target.value) }))}
                  />
                </div>

                <div>
                  <Label htmlFor="passing-score">Passing Score (%)</Label>
                  <Input
                    id="passing-score"
                    type="number"
                    value={quizForm.passing_score}
                    onChange={(e) => setQuizForm(prev => ({ ...prev, passing_score: parseInt(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={quizMutation.isPending}>
                  <Save className="h-4 w-4 mr-2" />
                  {editingQuiz ? 'Update' : 'Create'} Quiz
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddQuiz(false);
                    setEditingQuiz(null);
                  }}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Quiz List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {quizzes.map((quiz) => (
          <Card key={quiz.id} className="glass-effect glow-border">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{quiz.title}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Course: {quiz.courses?.title}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => startEditQuiz(quiz)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteQuizMutation.mutate(quiz.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{quiz.description}</p>
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <Badge variant="outline">
                    {quiz.time_limit}s
                  </Badge>
                  <Badge variant="outline">
                    {quiz.passing_score}% pass
                  </Badge>
                </div>
                <Button
                  size="sm"
                  onClick={() => setSelectedQuizId(quiz.id)}
                  className="bg-gradient-to-r from-geo-accent to-geo-highlight hover:from-geo-accent/90 hover:to-geo-highlight/90 text-black"
                >
                  Manage Questions
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Question Management */}
      {selectedQuizId && (
        <Card className="glass-effect glow-border">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Quiz Questions</CardTitle>
              <Button
                onClick={() => {
                  setQuestionForm(prev => ({ ...prev, quiz_id: selectedQuizId }));
                  setShowAddQuestion(true);
                }}
                size="sm"
                className="bg-gradient-to-r from-geo-accent to-geo-highlight hover:from-geo-accent/90 hover:to-geo-highlight/90 text-black"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Question Form */}
            {showAddQuestion && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg">
                    {editingQuestion ? 'Edit Question' : 'Add New Question'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitQuestion} className="space-y-4">
                    <div>
                      <Label htmlFor="question-text">Question</Label>
                      <Textarea
                        id="question-text"
                        value={questionForm.question}
                        onChange={(e) => setQuestionForm(prev => ({ ...prev, question: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Options</Label>
                      {questionForm.options.map((option, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...questionForm.options];
                              newOptions[index] = e.target.value;
                              setQuestionForm(prev => ({ ...prev, options: newOptions }));
                            }}
                            placeholder={`Option ${index + 1}`}
                            required
                          />
                          <Button
                            type="button"
                            variant={questionForm.correct_answer === index ? "default" : "outline"}
                            onClick={() => setQuestionForm(prev => ({ ...prev, correct_answer: index }))}
                          >
                            {questionForm.correct_answer === index ? 'Correct' : 'Set Correct'}
                          </Button>
                        </div>
                      ))}
                    </div>

                    <div>
                      <Label htmlFor="explanation">Explanation (Optional)</Label>
                      <Textarea
                        id="explanation"
                        value={questionForm.explanation}
                        onChange={(e) => setQuestionForm(prev => ({ ...prev, explanation: e.target.value }))}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button type="submit" disabled={questionMutation.isPending}>
                        <Save className="h-4 w-4 mr-2" />
                        {editingQuestion ? 'Update' : 'Add'} Question
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowAddQuestion(false);
                          setEditingQuestion(null);
                        }}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Questions List */}
            <div className="space-y-4">
              {questions.map((question, index) => (
                <Card key={question.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold mb-2">
                          {index + 1}. {question.question}
                        </h4>
                        <div className="space-y-1">
                          {question.options.map((option, optionIndex) => (
                            <div
                              key={optionIndex}
                              className={`text-sm p-2 rounded ${
                                question.correct_answer === optionIndex
                                  ? 'bg-green-500/20 text-green-400'
                                  : 'bg-muted'
                              }`}
                            >
                              {optionIndex + 1}. {option}
                            </div>
                          ))}
                        </div>
                        {question.explanation && (
                          <p className="text-sm text-muted-foreground mt-2">
                            <strong>Explanation:</strong> {question.explanation}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => startEditQuestion(question)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteQuestionMutation.mutate(question.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QuizManager;
