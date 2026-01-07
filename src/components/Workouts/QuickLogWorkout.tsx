import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, ArrowLeft, CheckCircle, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface Exercise {
  id: string;
  nome: string;
  series_planejadas: number;
  repeticoes_planejadas: string;
  carga_planejada?: number;
  observacoes?: string;
  ordem: number;
}

interface Workout {
  id: string;
  nome: string;
}

interface ExerciseSet {
  series: number;
  repeticoes: number;
  carga: number;
  completed: boolean;
}

interface QuickLogWorkoutProps {
  workout: Workout;
  onFinish: () => void;
  onBack: () => void;
}

export const QuickLogWorkout = ({ workout, onFinish, onBack }: QuickLogWorkoutProps) => {
  const { user } = useAuth();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [exerciseSets, setExerciseSets] = useState<{ [key: string]: ExerciseSet[] }>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  useEffect(() => {
    fetchExercises();
  }, [workout.id, user]);

  const fetchExercises = async () => {
    try {
      const { data, error } = await supabase
        .from('exercicios')
        .select('*')
        .eq('treino_id', workout.id)
        .order('ordem', { ascending: true });

      if (error) throw error;
      
      setExercises(data || []);
      
      // Inicializar sets para cada exercício
      const initialSets: { [key: string]: ExerciseSet[] } = {};
      data?.forEach(exercise => {
        initialSets[exercise.id] = Array.from({ length: exercise.series_planejadas }, (_, i) => ({
          series: i + 1,
          repeticoes: 0,
          carga: exercise.carga_planejada || 0,
          completed: false
        }));
      });
      setExerciseSets(initialSets);
    } catch (error: any) {
      toast.error("Erro ao carregar exercícios: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateSet = (exerciseId: string, setIndex: number, field: keyof ExerciseSet, value: any) => {
    setExerciseSets(prev => ({
      ...prev,
      [exerciseId]: prev[exerciseId].map((set, i) => 
        i === setIndex ? { ...set, [field]: value } : set
      )
    }));
  };

  const toggleSetComplete = (exerciseId: string, setIndex: number) => {
    const currentSet = exerciseSets[exerciseId][setIndex];
    updateSet(exerciseId, setIndex, 'completed', !currentSet.completed);
  };

  const saveQuickLog = async () => {
    if (!user) return;

    const hasCompletedSets = Object.values(exerciseSets).some(sets => 
      sets.some(set => set.completed)
    );

    if (!hasCompletedSets) {
      toast.error("Marque pelo menos uma série como concluída antes de salvar.");
      return;
    }

    setSaving(true);
    try {
      const groupedEntries: any[] = [];
      Object.entries(exerciseSets).forEach(([exerciseId, sets]) => {
        sets.forEach((set) => {
          if (set.completed) {
            groupedEntries.push({
              user_id: user.id,
              exercicio_id: exerciseId,
              data_treino: format(selectedDate, 'yyyy-MM-dd'),
              series_realizadas: set.series,
              repeticoes_realizadas: set.repeticoes,
              carga_realizada: set.carga,
            });
          }
        });
      });

      if (groupedEntries.length > 0) {
        const { error } = await supabase
          .from('exercicios_historico')
          .insert(groupedEntries);

        if (error) throw error;
      }

      toast.success("Treino registrado com sucesso!");
      onFinish();
    } catch (error: any) {
      toast.error("Erro ao salvar treino: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-1/3"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (exercises.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <h3 className="text-lg font-semibold mb-2">Nenhum exercício encontrado</h3>
          <p className="text-muted-foreground mb-4">
            Este treino não possui exercícios cadastrados
          </p>
          <Button onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{workout.nome}</CardTitle>
              <p className="text-muted-foreground">
                Registro rápido de {exercises.length} exercícios
              </p>
            </div>
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Seletor de Data */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Label className="text-sm font-medium">Data do Treino:</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP", { locale: ptBR }) : "Selecione uma data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  disabled={(date) => date > new Date()}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Exercícios */}
      {exercises.map((exercise, exerciseIndex) => (
        <motion.div
          key={exercise.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: exerciseIndex * 0.1 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{exercise.nome}</CardTitle>
              {exercise.observacoes && (
                <p className="text-sm text-muted-foreground">{exercise.observacoes}</p>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(exerciseSets[exercise.id] || []).map((set, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${
                      set.completed ? 'bg-green-50 border-green-200 dark:bg-green-950/20' : 'bg-card'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="font-medium w-16">{set.series}ª série</span>
                      
                      <div className="flex-1 grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs text-muted-foreground">Repetições</Label>
                          <Input
                            type="number"
                            value={set.repeticoes || ''}
                            onChange={(e) => updateSet(exercise.id, index, 'repeticoes', parseInt(e.target.value) || 0)}
                            placeholder={exercise.repeticoes_planejadas}
                            className="h-8"
                          />
                        </div>
                        
                        <div>
                          <Label className="text-xs text-muted-foreground">Carga (kg)</Label>
                          <Input
                            type="number"
                            step="0.5"
                            value={set.carga || ''}
                            onChange={(e) => updateSet(exercise.id, index, 'carga', parseFloat(e.target.value) || 0)}
                            placeholder={exercise.carga_planejada?.toString() || "0"}
                            className="h-8"
                          />
                        </div>
                      </div>
                      
                      <Button
                        onClick={() => toggleSetComplete(exercise.id, index)}
                        variant={set.completed ? "default" : "outline"}
                        size="sm"
                        className={set.completed ? "bg-green-600 hover:bg-green-700" : ""}
                      >
                        {set.completed ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          "✓"
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}

      {/* Salvar */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Salvar Registro</h3>
              <p className="text-sm text-muted-foreground">
                Data: {format(selectedDate, "PPP", { locale: ptBR })}
              </p>
            </div>
            <Button onClick={saveQuickLog} disabled={saving} size="lg">
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Salvando..." : "Salvar Treino"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
