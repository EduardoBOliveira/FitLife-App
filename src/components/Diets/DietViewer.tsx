import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Clock, CheckCircle, Circle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface Food {
  id: string;
  nome: string;
  quantidade: string;
  observacoes?: string;
}

interface Meal {
  id: string;
  nome_refeicao: string;
  horario?: string;
  ordem: number;
  alimentos: Food[];
}

interface Diet {
  id: string;
  nome: string;
  ativo: boolean;
}

interface DietViewerProps {
  diet: Diet;
  onBack: () => void;
  onEdit?: () => void;
}

export const DietViewer = ({ diet, onBack, onEdit }: DietViewerProps) => {
  const { user } = useAuth();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [mealStatus, setMealStatus] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchMealsAndStatus();
  }, [diet.id]);

  const fetchMealsAndStatus = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Buscar refeições
      const { data: mealsData, error: mealsError } = await supabase
        .from('refeicoes')
        .select('*')
        .eq('dieta_id', diet.id)
        .order('ordem', { ascending: true });

      if (mealsError) throw mealsError;

      // Buscar alimentos para cada refeição
      const mealsWithFoods = await Promise.all(
        (mealsData || []).map(async (meal) => {
          const { data: foodsData, error: foodsError } = await supabase
            .from('alimentos')
            .select('*')
            .eq('refeicao_id', meal.id);

          if (foodsError) throw foodsError;

          return {
            ...meal,
            alimentos: foodsData || []
          };
        })
      );

      setMeals(mealsWithFoods);

      // Buscar status das refeições para hoje
      const mealIds = mealsWithFoods.map(m => m.id);
      if (mealIds.length > 0) {
        const { data: statusData, error: statusError } = await supabase
          .from('refeicoes_status')
          .select('*')
          .eq('user_id', user.id)
          .eq('data', today)
          .in('refeicao_id', mealIds);

        if (statusError) throw statusError;

        const statusMap: { [key: string]: boolean } = {};
        statusData?.forEach(status => {
          statusMap[status.refeicao_id] = status.status;
        });
        setMealStatus(statusMap);
      }
    } catch (error: any) {
      toast.error("Erro ao carregar dieta: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleMealStatus = async (mealId: string) => {
    if (!user) return;

    const currentStatus = mealStatus[mealId] || false;
    const newStatus = !currentStatus;

    try {
      const { error } = await supabase
        .from('refeicoes_status')
        .upsert({
          user_id: user.id,
          refeicao_id: mealId,
          data: today,
          status: newStatus,
        });

      if (error) throw error;

      setMealStatus(prev => ({
        ...prev,
        [mealId]: newStatus
      }));

      toast.success(`Refeição ${newStatus ? 'marcada como feita' : 'desmarcada'}!`);
    } catch (error: any) {
      toast.error("Erro ao atualizar refeição: " + error.message);
    }
  };

  const getCompletedCount = () => {
    return Object.values(mealStatus).filter(status => status).length;
  };

  const getCompletionPercentage = () => {
    if (meals.length === 0) return 0;
    return Math.round((getCompletedCount() / meals.length) * 100);
  };

  const formatTime = (time?: string) => {
    if (!time) return null;
    return time.slice(0, 5); // Remover segundos se houver
  };

  const isCurrentMeal = (meal: Meal) => {
    if (!meal.horario) return false;
    
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const [hours, minutes] = meal.horario.split(':').map(Number);
    const mealTime = hours * 60 + minutes;
    
    // Considera como refeição atual se estiver dentro de 1 hora da hora programada
    return Math.abs(currentTime - mealTime) <= 60;
  };

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-1/3"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
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
              <CardTitle className="flex items-center gap-2">
                {diet.nome}
                {diet.ativo && (
                  <Badge variant="default" className="bg-green-600">Ativa</Badge>
                )}
              </CardTitle>
              <p className="text-muted-foreground">
                {meals.length} refeições planejadas
              </p>
            </div>
            <div className="flex gap-2">
              {onEdit && (
                <Button variant="outline" onClick={onEdit}>
                  Editar
                </Button>
              )}
              <Button variant="outline" onClick={onBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </div>
          </div>
          
          {meals.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Progresso hoje</span>
                <span className="font-medium">
                  {getCompletedCount()}/{meals.length} - {getCompletionPercentage()}%
                </span>
              </div>
              <Progress value={getCompletionPercentage()} className="h-2" />
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Refeições */}
      {meals.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-semibold mb-2">Nenhuma refeição encontrada</h3>
            <p className="text-muted-foreground mb-4">
              Esta dieta não possui refeições cadastradas
            </p>
            {onEdit && (
              <Button onClick={onEdit}>
                Adicionar Refeições
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {meals.map((meal, index) => {
            const isCompleted = mealStatus[meal.id] || false;
            const isCurrent = isCurrentMeal(meal);
            
            return (
              <motion.div
                key={meal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`${
                  isCurrent ? 'border-primary bg-primary/5' : ''
                } ${isCompleted ? 'bg-green-50 border-green-200 dark:bg-green-950/20' : ''}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Button
                          onClick={() => toggleMealStatus(meal.id)}
                          size="sm"
                          variant={isCompleted ? "default" : "outline"}
                          className={`w-8 h-8 p-0 ${
                            isCompleted 
                              ? 'bg-green-600 hover:bg-green-700' 
                              : ''
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <Circle className="w-4 h-4" />
                          )}
                        </Button>
                        
                        <div>
                          <CardTitle className={`text-lg ${
                            isCompleted ? 'line-through text-muted-foreground' : ''
                          }`}>
                            {meal.nome_refeicao}
                          </CardTitle>
                          {meal.horario && (
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatTime(meal.horario)}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {isCurrent && (
                          <Badge variant="outline" className="border-primary text-primary">
                            Agora
                          </Badge>
                        )}
                        <Badge variant="outline">
                          {meal.alimentos.length} itens
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  
                  {meal.alimentos.length > 0 && (
                    <CardContent>
                      <div className="space-y-2">
                        {meal.alimentos.map((food, foodIndex) => (
                          <div 
                            key={food.id}
                            className="flex items-center justify-between p-2 bg-muted/30 rounded"
                          >
                            <div>
                              <span className="font-medium">{food.nome}</span>
                              <span className="text-muted-foreground ml-2">
                                {food.quantidade}
                              </span>
                            </div>
                            {food.observacoes && (
                              <span className="text-xs text-muted-foreground">
                                {food.observacoes}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};