import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Clock, Play, Pause, Square, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
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
  lastRepeticoes?: number;
  lastCarga?: number;
}

interface WorkoutSessionProps {
  workout: Workout;
  onFinish: () => void;
  onBack: () => void;
}

// Chave para localStorage baseada no workout e usuário
const getStorageKey = (workoutId: string, userId: string) => 
  `workout_session_${workoutId}_${userId}`;

interface StoredSessionState {
  workoutId: string;
  currentExerciseIndex: number;
  exerciseSets: { [key: string]: ExerciseSet[] };
  timer: number;
  sessionStartTime: string;
}

export const WorkoutSession = ({ workout, onFinish, onBack }: WorkoutSessionProps) => {
  const { user } = useAuth();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [exerciseSets, setExerciseSets] = useState<{ [key: string]: ExerciseSet[] }>({});
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sessionStartTime] = useState(new Date());
  const [isRestored, setIsRestored] = useState(false);

  // Salvar estado no localStorage sempre que houver mudanças
  useEffect(() => {
    if (!user || loading || !isRestored) return;
    
    const storageKey = getStorageKey(workout.id, user.id);
    const stateToSave: StoredSessionState = {
      workoutId: workout.id,
      currentExerciseIndex,
      exerciseSets,
      timer,
      sessionStartTime: sessionStartTime.toISOString(),
    };
    
    localStorage.setItem(storageKey, JSON.stringify(stateToSave));
  }, [currentExerciseIndex, exerciseSets, timer, workout.id, user, loading, isRestored, sessionStartTime]);

  // Restaurar estado do localStorage ao montar
  useEffect(() => {
    if (!user) return;
    
    const storageKey = getStorageKey(workout.id, user.id);
    const savedState = localStorage.getItem(storageKey);
    
    if (savedState) {
      try {
        const parsed: StoredSessionState = JSON.parse(savedState);
        
        if (parsed.workoutId === workout.id) {
          setCurrentExerciseIndex(parsed.currentExerciseIndex);
          setExerciseSets(parsed.exerciseSets);
          setTimer(parsed.timer);
          setIsRestored(true);
          toast.success("Treino em andamento restaurado!");
        }
      } catch (e) {
        console.error("Erro ao restaurar estado do treino:", e);
      }
    }
  }, [workout.id, user]);

  useEffect(() => {
    fetchExercises();
  }, [workout.id, user]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const fetchExercises = async () => {
    try {
      const { data, error } = await supabase
        .from('exercicios')
        .select('*')
        .eq('treino_id', workout.id)
        .order('ordem', { ascending: true });

      if (error) throw error;
      
      setExercises(data || []);
      
      // Verificar se já existe estado salvo
      const storageKey = user ? getStorageKey(workout.id, user.id) : null;
      const savedState = storageKey ? localStorage.getItem(storageKey) : null;
      
      if (savedState) {
        try {
          const parsed: StoredSessionState = JSON.parse(savedState);
          if (parsed.workoutId === workout.id && Object.keys(parsed.exerciseSets).length > 0) {
            // Estado já restaurado, não reinicializar
            setIsRestored(true);
            setLoading(false);
            return;
          }
        } catch (e) {
          console.error("Erro ao verificar estado salvo:", e);
        }
      }
      
      // Buscar histórico do último treino para cada exercício
      const exerciseIds = data?.map(ex => ex.id) || [];
      const lastWorkoutData: { [key: string]: { [series: number]: { repeticoes: number, carga: number } } } = {};
      
      if (exerciseIds.length > 0 && user) {
        const { data: historico, error: histError } = await supabase
          .from('exercicios_historico')
          .select('exercicio_id, series_realizadas, repeticoes_realizadas, carga_realizada, data_treino')
          .in('exercicio_id', exerciseIds)
          .eq('user_id', user.id)
          .order('data_treino', { ascending: false });

        if (!histError && historico) {
          // Agrupar por exercício e série, pegando o mais recente
          historico.forEach(entry => {
            if (!lastWorkoutData[entry.exercicio_id]) {
              lastWorkoutData[entry.exercicio_id] = {};
            }
            if (!lastWorkoutData[entry.exercicio_id][entry.series_realizadas]) {
              lastWorkoutData[entry.exercicio_id][entry.series_realizadas] = {
                repeticoes: entry.repeticoes_realizadas,
                carga: entry.carga_realizada
              };
            }
          });
        }
      }
      
      // Inicializar sets para cada exercício com dados do último treino
      const initialSets: { [key: string]: ExerciseSet[] } = {};
      data?.forEach(exercise => {
        initialSets[exercise.id] = Array.from({ length: exercise.series_planejadas }, (_, i) => {
          const seriesNum = i + 1;
          const lastData = lastWorkoutData[exercise.id]?.[seriesNum];
          
          return {
            series: seriesNum,
            repeticoes: 0,
            carga: exercise.carga_planejada || 0,
            completed: false,
            lastRepeticoes: lastData?.repeticoes,
            lastCarga: lastData?.carga
          };
        });
      });
      setExerciseSets(initialSets);
      setIsRestored(true);
    } catch (error: any) {
      toast.error("Erro ao carregar exercícios: " + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Função para limpar o estado salvo (chamada ao finalizar)
  const clearSavedState = () => {
    if (!user) return;
    const storageKey = getStorageKey(workout.id, user.id);
    localStorage.removeItem(storageKey);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  const resetTimer = () => {
    setTimer(0);
    setIsTimerRunning(false);
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
    
    if (!currentSet.completed) {
      // Iniciar timer automático para descanso
      setTimer(0);
      setIsTimerRunning(true);
    }
  };

  const nextExercise = () => {
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
      resetTimer();
    }
  };

  const prevExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(prev => prev - 1);
      resetTimer();
    }
  };

  const getTotalProgress = () => {
    const totalSets = Object.values(exerciseSets).reduce((acc, sets) => acc + sets.length, 0);
    const completedSets = Object.values(exerciseSets).reduce(
      (acc, sets) => acc + sets.filter(set => set.completed).length, 0
    );
    return totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;
  };

  const getExerciseProgress = (exerciseId: string) => {
    const sets = exerciseSets[exerciseId] || [];
    const completed = sets.filter(set => set.completed).length;
    return sets.length > 0 ? Math.round((completed / sets.length) * 100) : 0;
  };

  const saveWorkoutSession = async () => {
    if (!user) return;

    const allSetsCompleted = Object.values(exerciseSets).every(sets => 
      sets.every(set => set.completed)
    );

    if (!allSetsCompleted) {
      const confirm = window.confirm(
        "Nem todos os exercícios foram concluídos. Deseja finalizar mesmo assim?"
      );
      if (!confirm) return;
    }

    setLoading(true);
    try {
      const historyEntries: any[] = [];
      
      Object.entries(exerciseSets).forEach(([exerciseId, sets]) => {
        sets.forEach(set => {
          if (set.completed) {
            historyEntries.push({
              user_id: user.id,
              exercicio_id: exerciseId,
              data_treino: new Date().toISOString().split('T')[0],
              series_realizadas: 1,
              repeticoes_realizadas: set.repeticoes,
              carga_realizada: set.carga,
            });
          }
        });
      });

      if (historyEntries.length > 0) {
        // Agrupar por exercício e série para salvar corretamente
        const groupedEntries: any[] = [];
        Object.entries(exerciseSets).forEach(([exerciseId, sets]) => {
          sets.forEach((set, index) => {
            if (set.completed) {
              groupedEntries.push({
                user_id: user.id,
                exercicio_id: exerciseId,
                data_treino: new Date().toISOString().split('T')[0],
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
      }

      // Limpar estado salvo após finalização bem-sucedida
      clearSavedState();
      
      toast.success("Treino finalizado com sucesso!");
      onFinish();
    } catch (error: any) {
      toast.error("Erro ao salvar treino: " + error.message);
    } finally {
      setLoading(false);
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

  const currentExercise = exercises[currentExerciseIndex];
  const currentSets = exerciseSets[currentExercise.id] || [];

  return (
    <div className="space-y-6">
      {/* Header com progresso geral */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{workout.nome}</CardTitle>
              <p className="text-muted-foreground">
                Exercício {currentExerciseIndex + 1} de {exercises.length}
              </p>
            </div>
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Progresso Geral</span>
              <span>{getTotalProgress()}%</span>
            </div>
            <Progress value={getTotalProgress()} className="h-2" />
          </div>
        </CardHeader>
      </Card>

      {/* Timer */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-4">
            <div className="text-center">
              <div className="text-3xl font-mono font-bold">
                {formatTime(timer)}
              </div>
              <p className="text-sm text-muted-foreground">Tempo de descanso</p>
            </div>
            <div className="flex space-x-2">
              <Button onClick={toggleTimer} variant="outline" size="sm">
                {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              <Button onClick={resetTimer} variant="outline" size="sm">
                <Square className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exercício Atual */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {currentExercise.nome}
                <Badge variant="outline">
                  {getExerciseProgress(currentExercise.id)}%
                </Badge>
              </CardTitle>
              {currentExercise.observacoes && (
                <p className="text-sm text-muted-foreground mt-1">
                  {currentExercise.observacoes}
                </p>
              )}
            </div>
            <div className="flex space-x-2">
              <Button 
                onClick={prevExercise} 
                disabled={currentExerciseIndex === 0}
                variant="outline"
                size="sm"
              >
                Anterior
              </Button>
              <Button 
                onClick={nextExercise} 
                disabled={currentExerciseIndex === exercises.length - 1}
                variant="outline"
                size="sm"
              >
                Próximo
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {currentSets.map((set, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border ${
                  set.completed ? 'bg-green-50 border-green-200 dark:bg-green-950/20' : 'bg-card'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="font-semibold text-lg">
                    {set.series}ª série
                  </div>
                  <Button
                    onClick={() => toggleSetComplete(currentExercise.id, index)}
                    variant={set.completed ? "default" : "outline"}
                    size="sm"
                    className={set.completed ? "bg-green-600 hover:bg-green-700" : ""}
                  >
                    {set.completed ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Concluída
                      </>
                    ) : (
                      "Marcar"
                    )}
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Repetições */}
                  <div>
                    <Label className="text-sm text-muted-foreground mb-1">Repetições</Label>
                    {set.lastRepeticoes && (
                      <p className="text-xs text-muted-foreground mb-1">
                        Último: {set.lastRepeticoes} reps
                      </p>
                    )}
                    <Input
                      type="number"
                      value={set.repeticoes}
                      onChange={(e) => updateSet(currentExercise.id, index, 'repeticoes', parseInt(e.target.value) || 0)}
                      placeholder={currentExercise.repeticoes_planejadas}
                      disabled={set.completed}
                      className="w-full"
                    />
                  </div>
                  
                  {/* Carga */}
                  <div>
                    <Label className="text-sm text-muted-foreground mb-1">Carga (kg)</Label>
                    {set.lastCarga !== undefined && (
                      <p className="text-xs text-muted-foreground mb-1">
                        Último: {set.lastCarga} kg
                      </p>
                    )}
                    <Input
                      type="number"
                      step="0.5"
                      value={set.carga}
                      onChange={(e) => updateSet(currentExercise.id, index, 'carga', parseFloat(e.target.value) || 0)}
                      placeholder={currentExercise.carga_planejada?.toString() || "0"}
                      disabled={set.completed}
                      className="w-full"
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Finalizar Treino */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Finalizar Treino</h3>
              <p className="text-sm text-muted-foreground">
                Progresso: {getTotalProgress()}% concluído
              </p>
            </div>
            <Button onClick={saveWorkoutSession} disabled={loading} size="lg">
              {loading ? "Salvando..." : "Finalizar Treino"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};