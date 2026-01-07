import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, Check, X, Trash2, Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface Habit {
  id: string;
  nome: string;
  notificacao: boolean;
  ativo: boolean;
  created_at: string;
}

interface HabitStatus {
  id: string;
  habito_id: string;
  data: string;
  status: boolean;
}

export const HabitsManager = () => {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitStatus, setHabitStatus] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newHabitName, setNewHabitName] = useState("");
  const [newHabitNotification, setNewHabitNotification] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  const fetchHabits = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data: habitsData, error: habitsError } = await supabase
        .from('habitos')
        .select('*')
        .eq('user_id', user.id)
        .eq('ativo', true)
        .order('created_at', { ascending: true });

      if (habitsError) throw habitsError;
      setHabits(habitsData || []);

      // Buscar status dos hábitos para hoje
      if (habitsData && habitsData.length > 0) {
        const { data: statusData, error: statusError } = await supabase
          .from('habitos_status')
          .select('*')
          .eq('user_id', user.id)
          .eq('data', today)
          .in('habito_id', habitsData.map(h => h.id));

        if (statusError) throw statusError;

        const statusMap: { [key: string]: boolean } = {};
        statusData?.forEach(status => {
          statusMap[status.habito_id] = status.status;
        });
        setHabitStatus(statusMap);
      }
    } catch (error: any) {
      toast.error("Erro ao carregar hábitos: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHabits();
  }, [user]);

  const handleCreateHabit = async () => {
    if (!user || !newHabitName.trim()) return;

    try {
      const { error } = await supabase
        .from('habitos')
        .insert({
          user_id: user.id,
          nome: newHabitName.trim(),
          notificacao: newHabitNotification,
        });

      if (error) throw error;

      toast.success("Hábito criado com sucesso!");
      setNewHabitName("");
      setNewHabitNotification(false);
      setShowAddForm(false);
      fetchHabits();
    } catch (error: any) {
      toast.error("Erro ao criar hábito: " + error.message);
    }
  };

  const handleToggleHabit = async (habit: Habit) => {
    if (!user) return;

    const currentStatus = habitStatus[habit.id] || false;
    const newStatus = !currentStatus;

    try {
      const { error } = await supabase
        .from('habitos_status')
        .upsert({
          user_id: user.id,
          habito_id: habit.id,
          data: today,
          status: newStatus,
        });

      if (error) throw error;

      setHabitStatus(prev => ({
        ...prev,
        [habit.id]: newStatus
      }));

      toast.success(`Hábito ${newStatus ? 'marcado como feito' : 'desmarcado'}!`);
    } catch (error: any) {
      toast.error("Erro ao atualizar hábito: " + error.message);
    }
  };

  const handleDeleteHabit = async (habitId: string) => {
    if (!confirm("Tem certeza que deseja excluir este hábito?")) return;

    try {
      const { error } = await supabase
        .from('habitos')
        .update({ ativo: false })
        .eq('id', habitId);

      if (error) throw error;

      toast.success("Hábito excluído com sucesso!");
      fetchHabits();
    } catch (error: any) {
      toast.error("Erro ao excluir hábito: " + error.message);
    }
  };

  const getCompletedCount = () => {
    return Object.values(habitStatus).filter(status => status).length;
  };

  const getCompletionPercentage = () => {
    if (habits.length === 0) return 0;
    return Math.round((getCompletedCount() / habits.length) * 100);
  };

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-1/3"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            Hábitos Diários
            {habits.length > 0 && (
              <Badge variant={getCompletionPercentage() === 100 ? "default" : "secondary"}>
                {getCompletedCount()}/{habits.length}
              </Badge>
            )}
          </CardTitle>
          <Button onClick={() => setShowAddForm(true)} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar
          </Button>
        </div>
        
        {habits.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Progresso hoje</span>
              <span className="font-medium">{getCompletionPercentage()}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${getCompletionPercentage()}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="bg-primary h-2 rounded-full"
              />
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-4 p-4 border rounded-lg bg-muted/50"
            >
              <div className="space-y-3">
                <div>
                  <Label htmlFor="habit-name">Nome do hábito</Label>
                  <Input
                    id="habit-name"
                    value={newHabitName}
                    onChange={(e) => setNewHabitName(e.target.value)}
                    placeholder="Ex: Beber 2L de água"
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateHabit()}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="habit-notification"
                    checked={newHabitNotification}
                    onCheckedChange={setNewHabitNotification}
                  />
                  <Label htmlFor="habit-notification" className="flex items-center gap-2">
                    <Bell className="w-4 h-4" />
                    Receber notificações
                  </Label>
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={handleCreateHabit} disabled={!newHabitName.trim()}>
                    Criar Hábito
                  </Button>
                  <Button variant="outline" onClick={() => setShowAddForm(false)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {habits.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              Nenhum hábito criado ainda
            </p>
            <Button onClick={() => setShowAddForm(true)} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeiro Hábito
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {habits.map((habit) => {
              const isCompleted = habitStatus[habit.id] || false;
              
              return (
                <motion.div
                  key={habit.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex items-center justify-between p-3 border rounded-lg transition-all ${
                    isCompleted 
                      ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900' 
                      : 'bg-card hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={() => handleToggleHabit(habit)}
                      size="sm"
                      variant={isCompleted ? "default" : "outline"}
                      className={`w-8 h-8 p-0 ${
                        isCompleted 
                          ? 'bg-green-600 hover:bg-green-700' 
                          : ''
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <div className="w-4 h-4" />
                      )}
                    </Button>
                    
                    <div>
                      <span className={`font-medium ${
                        isCompleted ? 'line-through text-muted-foreground' : ''
                      }`}>
                        {habit.nome}
                      </span>
                      {habit.notificacao && (
                        <Bell className="w-3 h-3 ml-2 inline text-muted-foreground" />
                      )}
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => handleDeleteHabit(habit.id)}
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </motion.div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};