import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Play, Pencil, Trash2, ClipboardList } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface Workout {
  id: string;
  nome: string;
  dias_semana: number[];
  ativo: boolean;
  created_at: string;
  _count?: {
    exercicios: number;
  };
}

interface WorkoutListProps {
  onCreateNew: () => void;
  onEdit: (workout: Workout) => void;
  onStart: (workout: Workout) => void;
  onQuickLog: (workout: Workout) => void;
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

export const WorkoutList = ({ onCreateNew, onEdit, onStart, onQuickLog }: WorkoutListProps) => {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWorkouts = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('treinos')
        .select(`
          *,
          exercicios(count)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const workoutsWithCount = data.map(workout => ({
        ...workout,
        _count: {
          exercicios: workout.exercicios?.length || 0
        }
      }));
      
      setWorkouts(workoutsWithCount);
    } catch (error: any) {
      toast.error("Erro ao carregar treinos: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkouts();
  }, [user]);

  const handleDelete = async (workoutId: string) => {
    if (!confirm("Tem certeza que deseja excluir este treino?")) return;
    
    try {
      const { error } = await supabase
        .from('treinos')
        .delete()
        .eq('id', workoutId);

      if (error) throw error;
      
      toast.success("Treino excluído com sucesso!");
      fetchWorkouts();
    } catch (error: any) {
      toast.error("Erro ao excluir treino: " + error.message);
    }
  };

  const toggleActive = async (workout: Workout) => {
    try {
      const { error } = await supabase
        .from('treinos')
        .update({ ativo: !workout.ativo })
        .eq('id', workout.id);

      if (error) throw error;
      
      toast.success(`Treino ${!workout.ativo ? 'ativado' : 'desativado'} com sucesso!`);
      fetchWorkouts();
    } catch (error: any) {
      toast.error("Erro ao atualizar treino: " + error.message);
    }
  };

  const getTodayWorkout = () => {
    const today = new Date().getDay();
    return workouts.find(w => w.ativo && w.dias_semana.includes(today));
  };

  const todayWorkout = getTodayWorkout();

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {todayWorkout && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-primary bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>🎯 Treino de Hoje</span>
                <Badge variant="default">Hoje</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{todayWorkout.nome}</h3>
                  <p className="text-muted-foreground">
                    {todayWorkout._count?.exercicios || 0} exercícios
                  </p>
                </div>
                <Button onClick={() => onStart(todayWorkout)} size="lg">
                  <Play className="w-4 h-4 mr-2" />
                  Iniciar Treino
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Meus Treinos</h2>
        <Button onClick={onCreateNew}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Treino
        </Button>
      </div>

      {workouts.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-semibold mb-2">Nenhum treino criado</h3>
            <p className="text-muted-foreground mb-4">
              Crie seu primeiro treino para começar a acompanhar seus exercícios
            </p>
            <Button onClick={onCreateNew}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeiro Treino
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {workouts.map((workout) => (
            <motion.div
              key={workout.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className={workout.ativo ? "" : "opacity-60"}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{workout.nome}</h3>
                        {!workout.ativo && (
                          <Badge variant="secondary">Inativo</Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{workout._count?.exercicios || 0} exercícios</span>
                        <div className="flex gap-1">
                          {workout.dias_semana.map(day => (
                            <Badge key={day} variant="outline" className="text-xs">
                              {DAYS_OF_WEEK[day].name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {workout.ativo && (
                        <>
                          <Button
                            onClick={() => onStart(workout)}
                            variant="default"
                            size="sm"
                          >
                            <Play className="w-4 h-4 mr-1" />
                            Iniciar
                          </Button>
                          <Button
                            onClick={() => onQuickLog(workout)}
                            variant="secondary"
                            size="sm"
                            title="Registro Rápido"
                          >
                            <ClipboardList className="w-4 h-4 mr-1" />
                            Registro Rápido
                          </Button>
                        </>
                      )}
                      
                      <Button
                        onClick={() => onEdit(workout)}
                        variant="outline"
                        size="sm"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        onClick={() => toggleActive(workout)}
                        variant="outline"
                        size="sm"
                      >
                        {workout.ativo ? "Desativar" : "Ativar"}
                      </Button>
                      
                      <Button
                        onClick={() => handleDelete(workout.id)}
                        variant="destructive"
                        size="sm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};