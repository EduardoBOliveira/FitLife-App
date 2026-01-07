import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface Exercise {
  id?: string;
  nome: string;
  series_planejadas: number;
  repeticoes_planejadas: string;
  carga_planejada?: number;
  observacoes?: string;
  ordem: number;
}

interface Workout {
  id?: string;
  nome: string;
  dias_semana: number[];
  ativo: boolean;
}

interface WorkoutFormProps {
  workout?: Workout;
  onSave: () => void;
  onCancel: () => void;
}

const DAYS_OF_WEEK = [
  { id: 0, name: "Dom", fullName: "Domingo" },
  { id: 1, name: "Seg", fullName: "Segunda" },
  { id: 2, name: "Ter", fullName: "Terça" },
  { id: 3, name: "Qua", fullName: "Quarta" },
  { id: 4, name: "Qui", fullName: "Quinta" },
  { id: 5, name: "Sex", fullName: "Sexta" },
  { id: 6, name: "Sáb", fullName: "Sábado" },
];

export const WorkoutForm = ({ workout, onSave, onCancel }: WorkoutFormProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [workoutData, setWorkoutData] = useState<Workout>({
    nome: "",
    dias_semana: [],
    ativo: true,
    ...workout
  });
  const [exercises, setExercises] = useState<Exercise[]>([]);

  useEffect(() => {
    if (workout?.id) {
      fetchExercises();
    }
  }, [workout?.id]);

  const fetchExercises = async () => {
    if (!workout?.id) return;

    try {
      const { data, error } = await supabase
        .from('exercicios')
        .select('*')
        .eq('treino_id', workout.id)
        .order('ordem', { ascending: true });

      if (error) throw error;
      setExercises(data || []);
    } catch (error: any) {
      toast.error("Erro ao carregar exercícios: " + error.message);
    }
  };

  const handleDayToggle = (dayId: number) => {
    setWorkoutData(prev => ({
      ...prev,
      dias_semana: prev.dias_semana.includes(dayId)
        ? prev.dias_semana.filter(d => d !== dayId)
        : [...prev.dias_semana, dayId].sort()
    }));
  };

  const addExercise = () => {
    const newExercise: Exercise = {
      nome: "",
      series_planejadas: 3,
      repeticoes_planejadas: "10-12",
      carga_planejada: undefined,
      observacoes: "",
      ordem: exercises.length + 1
    };
    setExercises([...exercises, newExercise]);
  };

  const updateExercise = (index: number, field: keyof Exercise, value: any) => {
    setExercises(prev => prev.map((exercise, i) => 
      i === index ? { ...exercise, [field]: value } : exercise
    ));
  };

  const removeExercise = (index: number) => {
    setExercises(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!user || !workoutData.nome.trim()) {
      toast.error("Nome do treino é obrigatório");
      return;
    }

    if (workoutData.dias_semana.length === 0) {
      toast.error("Selecione pelo menos um dia da semana");
      return;
    }

    setLoading(true);
    try {
      let workoutId = workout?.id;

      if (workout?.id) {
        // Atualizar treino existente
        const { error } = await supabase
          .from('treinos')
          .update({
            nome: workoutData.nome,
            dias_semana: workoutData.dias_semana,
            ativo: workoutData.ativo
          })
          .eq('id', workout.id);

        if (error) throw error;
      } else {
        // Criar novo treino
        const { data, error } = await supabase
          .from('treinos')
          .insert({
            user_id: user.id,
            nome: workoutData.nome,
            dias_semana: workoutData.dias_semana,
            ativo: workoutData.ativo
          })
          .select()
          .single();

        if (error) throw error;
        workoutId = data.id;
      }

      // Salvar exercícios
      if (workoutId) {
        // Deletar exercícios existentes se for edição
        if (workout?.id) {
          await supabase
            .from('exercicios')
            .delete()
            .eq('treino_id', workoutId);
        }

        // Inserir exercícios
        const validExercises = exercises.filter(ex => ex.nome.trim());
        if (validExercises.length > 0) {
          const { error: exercisesError } = await supabase
            .from('exercicios')
            .insert(validExercises.map((exercise, index) => ({
              treino_id: workoutId,
              nome: exercise.nome,
              series_planejadas: exercise.series_planejadas,
              repeticoes_planejadas: exercise.repeticoes_planejadas,
              carga_planejada: exercise.carga_planejada,
              observacoes: exercise.observacoes,
              ordem: index + 1
            })));

          if (exercisesError) throw exercisesError;
        }
      }

      toast.success(`Treino ${workout?.id ? 'atualizado' : 'criado'} com sucesso!`);
      onSave();
    } catch (error: any) {
      toast.error("Erro ao salvar treino: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {workout?.id ? 'Editar Treino' : 'Novo Treino'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="workout-name">Nome do Treino</Label>
            <Input
              id="workout-name"
              value={workoutData.nome}
              onChange={(e) => setWorkoutData(prev => ({ ...prev, nome: e.target.value }))}
              placeholder="Ex: Treino de Peito e Tríceps"
            />
          </div>

          <div>
            <Label>Dias da Semana</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {DAYS_OF_WEEK.map((day) => (
                <div key={day.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`day-${day.id}`}
                    checked={workoutData.dias_semana.includes(day.id)}
                    onCheckedChange={() => handleDayToggle(day.id)}
                  />
                  <Label htmlFor={`day-${day.id}`} className="cursor-pointer">
                    {day.name}
                  </Label>
                </div>
              ))}
            </div>
            <div className="flex gap-1 mt-2">
              {workoutData.dias_semana.map(dayId => (
                <Badge key={dayId} variant="outline">
                  {DAYS_OF_WEEK[dayId].fullName}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Exercícios</CardTitle>
            <Button onClick={addExercise} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Exercício
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {exercises.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                Nenhum exercício adicionado
              </p>
              <Button onClick={addExercise} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Primeiro Exercício
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {exercises.map((exercise, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 border rounded-lg bg-muted/30"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex items-center gap-2">
                      <GripVertical className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-muted-foreground">
                        {index + 1}
                      </span>
                    </div>
                    
                    <div className="flex-1 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <Label>Nome do Exercício</Label>
                          <Input
                            value={exercise.nome}
                            onChange={(e) => updateExercise(index, 'nome', e.target.value)}
                            placeholder="Ex: Supino Reto"
                          />
                        </div>
                        <div>
                          <Label>Séries</Label>
                          <Input
                            type="number"
                            value={exercise.series_planejadas}
                            onChange={(e) => updateExercise(index, 'series_planejadas', parseInt(e.target.value) || 0)}
                            placeholder="3"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <Label>Repetições</Label>
                          <Input
                            value={exercise.repeticoes_planejadas}
                            onChange={(e) => updateExercise(index, 'repeticoes_planejadas', e.target.value)}
                            placeholder="Ex: 10-12, 15, até a falha"
                          />
                        </div>
                        <div>
                          <Label>Carga (kg) - Opcional</Label>
                          <Input
                            type="number"
                            step="0.5"
                            value={exercise.carga_planejada || ""}
                            onChange={(e) => updateExercise(index, 'carga_planejada', parseFloat(e.target.value) || undefined)}
                            placeholder="Ex: 70"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label>Observações - Opcional</Label>
                        <Input
                          value={exercise.observacoes || ""}
                          onChange={(e) => updateExercise(index, 'observacoes', e.target.value)}
                          placeholder="Ex: Descanso de 90s entre séries"
                        />
                      </div>
                    </div>
                    
                    <Button
                      onClick={() => removeExercise(index)}
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button onClick={handleSave} disabled={loading} className="flex-1">
          {loading ? "Salvando..." : (workout?.id ? "Atualizar Treino" : "Criar Treino")}
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </div>
  );
};