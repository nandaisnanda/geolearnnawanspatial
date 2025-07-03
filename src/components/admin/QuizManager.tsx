import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, FileQuestion } from 'lucide-react';

interface Quiz {
  id: string;
  course_id: string | null;
  title: string;
  description: string | null;
  passing_score: number | null;
  time_limit: number | null;
  created_at: string | null;
}

interface QuizQuestion {
  id: string;
  quiz_id: string | null;
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string | null;
  order_index: number | null;
  created_at: string | null;
}

const QuizManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [showQuizForm, setShowQuizForm] = useState(false);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [quizFormData, setQuizFormData] = useState({
    title: '',
    description: '',
    passing_score: 70,
    time_limit: 30,
  });

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [maxQuestions] = useState(20); // Maximum 20 questions per quiz

  // Fetch quizzes
  const { isLoading: quizzesLoading } = useQuery({
    queryKey: ['admin-quizzes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setQuizzes(data as Quiz[]);
      return data;
    }
  });

  // Fetch questions for selected quiz
  useEffect(() => {
    const fetchQuestions = async () => {
      if (!selectedQuiz) {
        setQuestions([]);
        return;
      }
      const { data, error } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('quiz_id', selectedQuiz.id)
        .order('order_index', { ascending: true });
      if (error) {
        toast({
          title: "Error fetching questions",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      setQuestions(data as QuizQuestion[]);
    };
    fetchQuestions();
  }, [selectedQuiz, toast]);

  // Create/Update quiz mutation
  const saveQuizMutation = useMutation({
    mutationFn: async (quizData: typeof quizFormData & { id?: string }) => {
      if (quizData.id) {
        const { data, error } = await supabase
          .from('quizzes')
          .update(quizData)
          .eq('id', quizData.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('quizzes')
          .insert(quizData)
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-quizzes'] });
      setShowQuizForm(false);
      setSelectedQuiz(data);
      toast({
        title: quizFormData.title ? "Quiz Updated!" : "Quiz Created!",
        description: quizFormData.title ? "Quiz has been updated successfully." : "New quiz has been created successfully.",
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
      queryClient.invalidateQueries({ queryKey: ['admin-quizzes'] });
      setSelectedQuiz(null);
      setQuestions([]);
      toast({
        title: "Quiz Deleted!",
        description: "Quiz has been deleted successfully.",
      });
    }
  });

  // Create/Update questions mutation
  const saveQuestionsMutation = useMutation({
    mutationFn: async (questionsToSave: QuizQuestion[]) => {
      // Upsert questions
      const { data, error } = await supabase
        .from('quiz_questions')
        .upsert(questionsToSave, { onConflict: 'id' });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-quizzes'] });
      toast({
        title: "Questions Saved!",
        description: "Quiz questions have been saved successfully.",
      });
    }
  });

  const resetQuizForm = () => {
    setQuizFormData({
      title: '',
      description: '',
      passing_score: 70,
      time_limit: 30,
    });
    setSelectedQuiz(null);
    setShowQuizForm(false);
    setShowQuestionForm(false);
    setQuestions([]);
  };

  const handleEditQuiz = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setQuizFormData({
      title: quiz.title,
      description: quiz.description || '',
      passing_score: quiz.passing_score || 70,
      time_limit: quiz.time_limit || 30,
    });
    setShowQuizForm(true);
    setShowQuestionForm(true);
  };

  const handleQuizSubmit = () => {
    if (!quizFormData.title.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a quiz title.",
        variant: "destructive",
      });
      return;
    }
    const quizData = {
      ...quizFormData,
      ...(selectedQuiz && { id: selectedQuiz.id }),
      course_id: selectedQuiz?.course_id || null,
    };
    saveQuizMutation.mutate(quizData);
  };

  const addQuestion = () => {
    if (questions.length >= maxQuestions) {
      toast({
        title: "Maximum Questions Reached",
        description: `You can only add up to ${maxQuestions} questions per quiz.`,
        variant: "destructive",
      });
      return;
    }

    const newQuestion: QuizQuestion = {
      id: `temp-${Date.now()}`,
      question: '',
      options: ['', '', '', ''],
      correct_answer: 0,
      explanation: '',
      order_index: questions.length,
      quiz_id: selectedQuiz ? selectedQuiz.id : '',
      created_at: null
    };
    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (index: number) => {
    const newQuestions = [...questions];
    newQuestions.splice(index, 1);
    // Reorder order_index
    newQuestions.forEach((q, i) => {
      q.order_index = i;
    });
    setQuestions(newQuestions);
  };

  const updateQuestion = (index: number, field: keyof QuizQuestion, value: any) => {
    const newQuestions = [...questions];
    newQuestions[index] = {
      ...newQuestions[index],
      [field]: value,
    };
    setQuestions(newQuestions);
  };

  const updateQuestionOption = (questionIndex: number, optionIndex: number, value: string) => {
    const newQuestions = [...questions];
    const options = [...newQuestions[questionIndex].options];
    options[optionIndex] = value;
    newQuestions[questionIndex].options = options;
    setQuestions(newQuestions);
  };

  const handleSaveQuestions = () => {
    if (!selectedQuiz) {
      toast({
        title: "No Quiz Selected",
        description: "Please select or create a quiz first.",
        variant: "destructive",
      });
      return;
    }
    // Validate questions
    for (const question of questions) {
      if (!question.question.trim()) {
        toast({
          title: "Question Required",
          description: "Please fill in all question texts.",
          variant: "destructive",
        });
        return;
      }
      if (question.options.some(opt => !opt.trim())) {
        toast({
          title: "Option Required",
          description: "Please fill in all answer options.",
          variant: "destructive",
        });
        return;
      }
    }
    // Assign quiz_id to all questions
    const questionsToSave = questions.map((q, i) => ({
      ...q,
      quiz_id: selectedQuiz.id,
      order_index: i,
    }));
    saveQuestionsMutation.mutate(questionsToSave);
  };

  return (
    <div className="space-y-6">
      <Card className="glass-effect glow-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-geo-accent">Quiz Management</CardTitle>
            <Button
              onClick={() => {
                resetQuizForm();
                setShowQuizForm(true);
                setShowQuestionForm(false);
              }}
              className="bg-gradient-to-r from-geo-accent to-geo-highlight hover:from-geo-accent/90 hover:to-geo-highlight/90 text-black font-semibold"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Quiz
            </Button>
          </div>
        </CardHeader>

        {showQuizForm && (
          <CardContent className="space-y-4">
            <Input
              placeholder="Quiz Title"
              value={quizFormData.title}
              onChange={(e) => setQuizFormData({ ...quizFormData, title: e.target.value })}
            />
            <Textarea
              placeholder="Quiz Description"
              value={quizFormData.description}
              onChange={(e) => setQuizFormData({ ...quizFormData, description: e.target.value })}
              className="min-h-24"
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="number"
                placeholder="Passing Score (%)"
                value={quizFormData.passing_score}
                onChange={(e) => setQuizFormData({ ...quizFormData, passing_score: Number(e.target.value) })}
                min={0}
                max={100}
              />
              <Input
                type="number"
                placeholder="Time Limit (minutes)"
                value={quizFormData.time_limit}
                onChange={(e) => setQuizFormData({ ...quizFormData, time_limit: Number(e.target.value) })}
                min={1}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleQuizSubmit}
                disabled={saveQuizMutation.isPending}
                className="bg-gradient-to-r from-geo-highlight to-geo-accent hover:from-geo-highlight/90 hover:to-geo-accent/90 text-black"
              >
                {saveQuizMutation.isPending ? 'Saving...' : (selectedQuiz ? 'Update Quiz' : 'Create Quiz')}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowQuizForm(false);
                  setShowQuestionForm(false);
                  setSelectedQuiz(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Quizzes List */}
      <div className="grid gap-4">
        {quizzes.map((quiz) => (
          <Card key={quiz.id} className="glass-effect glow-border cursor-pointer hover:shadow-2xl hover:shadow-geo-accent/20 transition-all duration-500">
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-lg">{quiz.title}</h3>
                <p className="text-sm text-muted-foreground">{quiz.description}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleEditQuiz(quiz)}
                  className="text-geo-accent hover:text-geo-highlight"
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteQuizMutation.mutate(quiz.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {quizzes.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <FileQuestion className="h-12 w-12 mx-auto mb-4" />
            <p>No quizzes available. Create your first quiz!</p>
          </div>
        )}
      </div>

      {/* Questions Section */}
      {showQuestionForm && selectedQuiz && (
        <Card className="glass-effect glow-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-geo-accent">
                Quiz Questions ({questions.length}/{maxQuestions})
              </CardTitle>
              <Button
                onClick={addQuestion}
                disabled={questions.length >= maxQuestions}
                className="bg-gradient-to-r from-geo-accent to-geo-highlight hover:from-geo-accent/90 hover:to-geo-highlight/90 text-black"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {questions.map((question, index) => (
              <div key={question.id} className="border border-geo-accent/20 rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Question {index + 1}</h4>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeQuestion(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <Textarea
                  placeholder="Enter your question"
                  value={question.question}
                  onChange={(e) => updateQuestion(index, 'question', e.target.value)}
                  className="min-h-20"
                />
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Answer Options</label>
                  {question.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`correct-${index}`}
                        checked={question.correct_answer === optionIndex}
                        onChange={() => updateQuestion(index, 'correct_answer', optionIndex)}
                        className="text-geo-accent"
                      />
                      <Input
                        placeholder={`Option ${optionIndex + 1}`}
                        value={option}
                        onChange={(e) => updateQuestionOption(index, optionIndex, e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  ))}
                </div>
                
                <Textarea
                  placeholder="Explanation (optional)"
                  value={question.explanation || ''}
                  onChange={(e) => updateQuestion(index, 'explanation', e.target.value)}
                  className="min-h-16"
                />
              </div>
            ))}
            
            {questions.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <FileQuestion className="h-12 w-12 mx-auto mb-4" />
                <p>No questions added yet. Click "Add Question" to get started.</p>
              </div>
            )}

            {questions.length > 0 && (
              <div className="flex justify-end">
                <Button
                  onClick={handleSaveQuestions}
                  disabled={saveQuestionsMutation.isPending}
                  className="bg-gradient-to-r from-geo-highlight to-geo-accent hover:from-geo-highlight/90 hover:to-geo-accent/90 text-black"
                >
                  {saveQuestionsMutation.isPending ? 'Saving...' : 'Save Questions'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QuizManager;
