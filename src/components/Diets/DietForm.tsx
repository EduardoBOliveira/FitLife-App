import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, GripVertical, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface Food {
  id?: string;
  nome: string;
  quantidade: string;
  observacoes?: string;
}

interface Meal {
  id?: string;
  nome_refeicao: string;
  horario?: string;
  ordem: number;
  alimentos: Food[];
}

interface Diet {
  id?: string;
  nome: string;
  ativo: boolean;
}

interface DietFormProps {
  diet?: Diet;
  onSave: () => void;
  onCancel: () => void;
}

export const DietForm = ({ diet, onSave, onCancel }: DietFormProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [dietData, setDietData] = useState<Diet>({
    nome: "",
    ativo: true,
    ...diet
  });
  const [meals, setMeals] = useState<Meal[]>([]);

  useEffect(() => {
    if (diet?.id) {
      fetchMeals();
    } else {
      // Inicializar com refeições padrão
      setMeals([
        { nome_refeicao: "Café da Manhã", horario: "07:00", ordem: 1, alimentos: [] },
        { nome_refeicao: "Lanche da Manhã", horario: "10:00", ordem: 2, alimentos: [] },
        { nome_refeicao: "Almoço", horario: "12:00", ordem: 3, alimentos: [] },
        { nome_refeicao: "Lanche da Tarde", horario: "15:00", ordem: 4, alimentos: [] },
        { nome_refeicao: "Jantar", horario: "19:00", ordem: 5, alimentos: [] },
        { nome_refeicao: "Ceia", horario: "22:00", ordem: 6, alimentos: [] },
      ]);
    }
  }, [diet?.id]);

  const fetchMeals = async () => {
    if (!diet?.id) return;

    try {
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
    } catch (error: any) {
      toast.error("Erro ao carregar refeições: " + error.message);
    }
  };

  const addMeal = () => {
    const newMeal: Meal = {
      nome_refeicao: "",
      horario: "",
      ordem: meals.length + 1,
      alimentos: []
    };
    setMeals([...meals, newMeal]);
  };

  const updateMeal = (index: number, field: keyof Meal, value: any) => {
    setMeals(prev => prev.map((meal, i) => 
      i === index ? { ...meal, [field]: value } : meal
    ));
  };

  const removeMeal = (index: number) => {
    setMeals(prev => prev.filter((_, i) => i !== index));
  };

  const addFood = (mealIndex: number) => {
    const newFood: Food = {
      nome: "",
      quantidade: "",
      observacoes: ""
    };
    
    setMeals(prev => prev.map((meal, i) => 
      i === mealIndex 
        ? { ...meal, alimentos: [...meal.alimentos, newFood] }
        : meal
    ));
  };

  const updateFood = (mealIndex: number, foodIndex: number, field: keyof Food, value: any) => {
    setMeals(prev => prev.map((meal, i) => 
      i === mealIndex 
        ? {
            ...meal,
            alimentos: meal.alimentos.map((food, j) => 
              j === foodIndex ? { ...food, [field]: value } : food
            )
          }
        : meal
    ));
  };

  const removeFood = (mealIndex: number, foodIndex: number) => {
    setMeals(prev => prev.map((meal, i) => 
      i === mealIndex 
        ? { ...meal, alimentos: meal.alimentos.filter((_, j) => j !== foodIndex) }
        : meal
    ));
  };

  const handleSave = async () => {
    if (!user || !dietData.nome.trim()) {
      toast.error("Nome da dieta é obrigatório");
      return;
    }

    const validMeals = meals.filter(meal => meal.nome_refeicao.trim());
    if (validMeals.length === 0) {
      toast.error("Adicione pelo menos uma refeição");
      return;
    }

    setLoading(true);
    try {
      let dietId = diet?.id;

      if (diet?.id) {
        // Atualizar dieta existente
        const { error } = await supabase
          .from('dietas')
          .update({
            nome: dietData.nome,
            ativo: dietData.ativo
          })
          .eq('id', diet.id);

        if (error) throw error;
      } else {
        // Criar nova dieta
        const { data, error } = await supabase
          .from('dietas')
          .insert({
            user_id: user.id,
            nome: dietData.nome,
            ativo: dietData.ativo
          })
          .select()
          .single();

        if (error) throw error;
        dietId = data.id;
      }

      // Salvar refeições
      if (dietId) {
        // Deletar refeições existentes se for edição
        if (diet?.id) {
          await supabase
            .from('refeicoes')
            .delete()
            .eq('dieta_id', dietId);
        }

        // Inserir refeições
        for (let i = 0; i < validMeals.length; i++) {
          const meal = validMeals[i];
          
          const { data: mealData, error: mealError } = await supabase
            .from('refeicoes')
            .insert({
              dieta_id: dietId,
              nome_refeicao: meal.nome_refeicao,
              horario: meal.horario || null,
              ordem: i + 1
            })
            .select()
            .single();

          if (mealError) throw mealError;

          // Inserir alimentos da refeição
          const validFoods = meal.alimentos.filter(food => food.nome.trim());
          if (validFoods.length > 0) {
            const { error: foodsError } = await supabase
              .from('alimentos')
              .insert(validFoods.map(food => ({
                refeicao_id: mealData.id,
                nome: food.nome,
                quantidade: food.quantidade,
                observacoes: food.observacoes
              })));

            if (foodsError) throw foodsError;
          }
        }
      }

      toast.success(`Dieta ${diet?.id ? 'atualizada' : 'criada'} com sucesso!`);
      onSave();
    } catch (error: any) {
      toast.error("Erro ao salvar dieta: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {diet?.id ? 'Editar Dieta' : 'Nova Dieta'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="diet-name">Nome da Dieta</Label>
            <Input
              id="diet-name"
              value={dietData.nome}
              onChange={(e) => setDietData(prev => ({ ...prev, nome: e.target.value }))}
              placeholder="Ex: Dieta de Definição"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Refeições</CardTitle>
            <Button onClick={addMeal} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Refeição
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {meals.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                Nenhuma refeição adicionada
              </p>
              <Button onClick={addMeal} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Primeira Refeição
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {meals.map((meal, mealIndex) => (
                <motion.div
                  key={mealIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 border rounded-lg bg-muted/30"
                >
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="flex items-center gap-2">
                        <GripVertical className="w-4 h-4 text-muted-foreground" />
                        <Badge variant="outline">{mealIndex + 1}</Badge>
                      </div>
                      
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <Label>Nome da Refeição</Label>
                          <Input
                            value={meal.nome_refeicao}
                            onChange={(e) => updateMeal(mealIndex, 'nome_refeicao', e.target.value)}
                            placeholder="Ex: Café da Manhã"
                          />
                        </div>
                        <div>
                          <Label className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Horário (Opcional)
                          </Label>
                          <Input
                            type="time"
                            value={meal.horario || ""}
                            onChange={(e) => updateMeal(mealIndex, 'horario', e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <Button
                        onClick={() => removeMeal(mealIndex)}
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Alimentos da refeição */}
                    <div className="ml-8 space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Alimentos</Label>
                        <Button 
                          onClick={() => addFood(mealIndex)} 
                          size="sm" 
                          variant="outline"
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Adicionar Alimento
                        </Button>
                      </div>
                      
                      {meal.alimentos.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          Nenhum alimento adicionado
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {meal.alimentos.map((food, foodIndex) => (
                            <div key={foodIndex} className="flex items-center gap-2 p-2 bg-background rounded border">
                              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
                                <Input
                                  value={food.nome}
                                  onChange={(e) => updateFood(mealIndex, foodIndex, 'nome', e.target.value)}
                                  placeholder="Nome do alimento"
                                />
                                <Input
                                  value={food.quantidade}
                                  onChange={(e) => updateFood(mealIndex, foodIndex, 'quantidade', e.target.value)}
                                  placeholder="Ex: 100g, 1 xícara"
                                />
                                <Input
                                  value={food.observacoes || ""}
                                  onChange={(e) => updateFood(mealIndex, foodIndex, 'observacoes', e.target.value)}
                                  placeholder="Observações (opcional)"
                                />
                              </div>
                              <Button
                                onClick={() => removeFood(mealIndex, foodIndex)}
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive p-1 h-auto"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button onClick={handleSave} disabled={loading} className="flex-1">
          {loading ? "Salvando..." : (diet?.id ? "Atualizar Dieta" : "Criar Dieta")}
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </div>
  );
};