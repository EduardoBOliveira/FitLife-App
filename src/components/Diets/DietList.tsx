import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Utensils, Pencil, Trash2, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface Diet {
  id: string;
  nome: string;
  ativo: boolean;
  created_at: string;
  _count?: {
    refeicoes: number;
  };
}

interface DietListProps {
  onCreateNew: () => void;
  onEdit: (diet: Diet) => void;
  onView: (diet: Diet) => void;
}

export const DietList = ({ onCreateNew, onEdit, onView }: DietListProps) => {
  const { user } = useAuth();
  const [diets, setDiets] = useState<Diet[]>([]);
  const [loading, setLoading] = useState(true);
  const [todayProgress, setTodayProgress] = useState<{ [key: string]: number }>({});

  const fetchDiets = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('dietas')
        .select(`
          *,
          refeicoes(count)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const dietsWithCount = data.map(diet => ({
        ...diet,
        _count: {
          refeicoes: diet.refeicoes?.length || 0
        }
      }));
      
      setDiets(dietsWithCount);
      
      // Buscar progresso do dia
      await fetchTodayProgress(dietsWithCount);
    } catch (error: any) {
      toast.error("Erro ao carregar dietas: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayProgress = async (dietsData: Diet[]) => {
    if (!user) return;
    
    const today = new Date().toISOString().split('T')[0];
    const progress: { [key: string]: number } = {};
    
    for (const diet of dietsData) {
      if (!diet.ativo) continue;
      
      // Buscar total de refeições
      const { data: mealsData } = await supabase
        .from('refeicoes')
        .select('id')
        .eq('dieta_id', diet.id);
      
      if (!mealsData) continue;
      
      // Buscar quantas foram feitas hoje
      const { data: statusData } = await supabase
        .from('refeicoes_status')
        .select('*')
        .eq('user_id', user.id)
        .eq('data', today)
        .eq('status', true)
        .in('refeicao_id', mealsData.map(m => m.id));
      
      const totalMeals = mealsData.length;
      const completedMeals = statusData?.length || 0;
      
      progress[diet.id] = totalMeals > 0 ? Math.round((completedMeals / totalMeals) * 100) : 0;
    }
    
    setTodayProgress(progress);
  };

  useEffect(() => {
    fetchDiets();
  }, [user]);

  const handleDelete = async (dietId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta dieta?")) return;
    
    try {
      const { error } = await supabase
        .from('dietas')
        .delete()
        .eq('id', dietId);

      if (error) throw error;
      
      toast.success("Dieta excluída com sucesso!");
      fetchDiets();
    } catch (error: any) {
      toast.error("Erro ao excluir dieta: " + error.message);
    }
  };

  const toggleActive = async (diet: Diet) => {
    try {
      const { error } = await supabase
        .from('dietas')
        .update({ ativo: !diet.ativo })
        .eq('id', diet.id);

      if (error) throw error;
      
      toast.success(`Dieta ${!diet.ativo ? 'ativada' : 'desativada'} com sucesso!`);
      fetchDiets();
    } catch (error: any) {
      toast.error("Erro ao atualizar dieta: " + error.message);
    }
  };

  const getActiveDiet = () => {
    return diets.find(d => d.ativo);
  };

  const activeDiet = getActiveDiet();

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
      {activeDiet && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-green-500 bg-green-50/50 dark:bg-green-950/20">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>🍽️ Dieta Ativa</span>
                <Badge variant="default" className="bg-green-600">Hoje</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{activeDiet.nome}</h3>
                  <p className="text-muted-foreground">
                    {activeDiet._count?.refeicoes || 0} refeições
                  </p>
                  {todayProgress[activeDiet.id] !== undefined && (
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${todayProgress[activeDiet.id]}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">
                        {todayProgress[activeDiet.id]}%
                      </span>
                    </div>
                  )}
                </div>
                <Button onClick={() => onView(activeDiet)} size="lg">
                  <Utensils className="w-4 h-4 mr-2" />
                  Ver Dieta
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Minhas Dietas</h2>
        <Button onClick={onCreateNew}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Dieta
        </Button>
      </div>

      {diets.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-semibold mb-2">Nenhuma dieta criada</h3>
            <p className="text-muted-foreground mb-4">
              Crie sua primeira dieta para começar a acompanhar sua alimentação
            </p>
            <Button onClick={onCreateNew}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeira Dieta
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {diets.map((diet) => (
            <motion.div
              key={diet.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className={diet.ativo ? "" : "opacity-60"}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{diet.nome}</h3>
                        {!diet.ativo && (
                          <Badge variant="secondary">Inativa</Badge>
                        )}
                        {diet.ativo && (
                          <Badge variant="default" className="bg-green-600">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Ativa
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{diet._count?.refeicoes || 0} refeições</span>
                        {diet.ativo && todayProgress[diet.id] !== undefined && (
                          <span>Progresso hoje: {todayProgress[diet.id]}%</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => onView(diet)}
                        variant="default"
                        size="sm"
                      >
                        <Utensils className="w-4 h-4 mr-1" />
                        Ver
                      </Button>
                      
                      <Button
                        onClick={() => onEdit(diet)}
                        variant="outline"
                        size="sm"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        onClick={() => toggleActive(diet)}
                        variant="outline"
                        size="sm"
                      >
                        {diet.ativo ? "Desativar" : "Ativar"}
                      </Button>
                      
                      <Button
                        onClick={() => handleDelete(diet.id)}
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