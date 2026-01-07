import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { Navigate, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { 
  Calendar, 
  Dumbbell, 
  Apple, 
  CheckCircle2, 
  TrendingUp, 
  User,
  LogOut,
  Plus,
  Clock,
  Target,
  Play
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Profile {
  nome: string;
  peso?: number;
  altura?: number;
  objetivo?: string;
}

interface Workout {
  id: string;
  nome: string;
  dias_semana: number[];
  ativo: boolean;
  exercicios?: Exercise[];
}

interface Exercise {
  id: string;
  nome: string;
  series_planejadas: number;
  repeticoes_planejadas: string;
  carga_planejada?: number;
}

interface Diet {
  id: string;
  nome: string;
  ativo: boolean;
  refeicoes?: Meal[];
}

interface Meal {
  id: string;
  nome_refeicao: string;
  horario?: string;
  ordem: number;
  alimentos?: Food[];
  status?: boolean;
}

interface Food {
  id: string;
  nome: string;
  quantidade: string;
}

interface Habit {
  id: string;
  nome: string;
  ativo: boolean;
  status?: boolean;
}

const Dashboard = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [todayWorkout, setTodayWorkout] = useState<Workout | null>(null);
  const [activeDiet, setActiveDiet] = useState<Diet | null>(null);
  const [todayHabits, setTodayHabits] = useState<Habit[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      await Promise.all([
        fetchProfile(),
        fetchTodayWorkout(),
        fetchActiveDiet(),
        fetchTodayHabits()
      ]);
    } finally {
      setLoadingData(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('nome, peso, altura, objetivo')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchTodayWorkout = async () => {
    try {
      const today = new Date().getDay();
      const { data: workouts } = await supabase
        .from('treinos')
        .select(`
          id, nome, dias_semana, ativo,
          exercicios(id, nome, series_planejadas, repeticoes_planejadas, carga_planejada)
        `)
        .eq('user_id', user?.id)
        .eq('ativo', true);

      const todaysWorkout = workouts?.find(w => w.dias_semana.includes(today));
      setTodayWorkout(todaysWorkout || null);
    } catch (error) {
      console.error('Error fetching workout:', error);
    }
  };

  const fetchActiveDiet = async () => {
    try {
      const { data: diets } = await supabase
        .from('dietas')
        .select(`
          id, nome, ativo,
          refeicoes(
            id, nome_refeicao, horario, ordem,
            alimentos(id, nome, quantidade)
          )
        `)
        .eq('user_id', user?.id)
        .eq('ativo', true)
        .single();

      if (diets) {
        // Fetch meal status for today
        const today = new Date().toISOString().split('T')[0];
        const { data: mealStatus } = await supabase
          .from('refeicoes_status')
          .select('refeicao_id, status')
          .eq('user_id', user?.id)
          .eq('data', today);

        // Add status to meals
        const mealsWithStatus = diets.refeicoes?.map(meal => ({
          ...meal,
          status: mealStatus?.find(s => s.refeicao_id === meal.id)?.status || false
        }));

        setActiveDiet({
          ...diets,
          refeicoes: mealsWithStatus?.sort((a, b) => a.ordem - b.ordem)
        });
      }
    } catch (error) {
      console.error('Error fetching diet:', error);
    }
  };

  const fetchTodayHabits = async () => {
    try {
      const { data: habits } = await supabase
        .from('habitos')
        .select('id, nome, ativo')
        .eq('user_id', user?.id)
        .eq('ativo', true);

      if (habits) {
        // Fetch habit status for today
        const today = new Date().toISOString().split('T')[0];
        const { data: habitStatus } = await supabase
          .from('habitos_status')
          .select('habito_id, status')
          .eq('user_id', user?.id)
          .eq('data', today);

        const habitsWithStatus = habits.map(habit => ({
          ...habit,
          status: habitStatus?.find(s => s.habito_id === habit.id)?.status || false
        }));

        setTodayHabits(habitsWithStatus);
      }
    } catch (error) {
      console.error('Error fetching habits:', error);
    }
  };

  const toggleMealStatus = async (mealId: string, currentStatus: boolean) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { error } = await supabase
        .from('refeicoes_status')
        .upsert({
          refeicao_id: mealId,
          user_id: user?.id,
          data: today,
          status: !currentStatus
        }, {
          onConflict: 'refeicao_id,user_id,data'
        });

      if (error) throw error;

      // Update local state
      setActiveDiet(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          refeicoes: prev.refeicoes?.map(meal => 
            meal.id === mealId ? { ...meal, status: !currentStatus } : meal
          )
        };
      });

      toast.success(currentStatus ? 'Refeição desmarcada' : 'Refeição marcada como concluída');
    } catch (error) {
      console.error('Error updating meal status:', error);
      toast.error('Erro ao atualizar status da refeição');
    }
  };

  const toggleHabitStatus = async (habitId: string, currentStatus: boolean) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { error } = await supabase
        .from('habitos_status')
        .upsert({
          habito_id: habitId,
          user_id: user?.id,
          data: today,
          status: !currentStatus
        }, {
          onConflict: 'habito_id,user_id,data'
        });

      if (error) throw error;

      // Update local state
      setTodayHabits(prev => 
        prev.map(habit => 
          habit.id === habitId ? { ...habit, status: !currentStatus } : habit
        )
      );

      toast.success(currentStatus ? 'Hábito desmarcado' : 'Hábito concluído');
    } catch (error) {
      console.error('Error updating habit status:', error);
      toast.error('Erro ao atualizar status do hábito');
    }
  };

  const formatObjective = (objective?: string) => {
    if (!objective) return '';
    
    const objectives: { [key: string]: string } = {
      'perder_peso': 'Perder peso',
      'ganhar_massa': 'Ganhar massa muscular',
      'ganhar_massa_muscular': 'Ganhar massa muscular',
      'manter_peso': 'Manter peso',
      'melhorar_condicionamento': 'Melhorar condicionamento',
      'tonificar': 'Tonificar músculos'
    };

    return objectives[objective] || objective;
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const today = new Date();
  const weekDayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const todayName = weekDayNames[today.getDay()];

  const calculateIMC = () => {
    if (profile?.peso && profile?.altura) {
      const alturaMetros = profile.altura / 100; // Convert cm to meters
      const imc = profile.peso / (alturaMetros * alturaMetros);
      return imc.toFixed(1);
    }
    return null;
  };

  const getIMCStatus = (imc: number) => {
    if (imc < 18.5) return { text: 'Abaixo do peso', color: 'bg-blue-500' };
    if (imc < 25) return { text: 'Peso normal', color: 'bg-green-500' };
    if (imc < 30) return { text: 'Sobrepeso', color: 'bg-yellow-500' };
    return { text: 'Obesidade', color: 'bg-red-500' };
  };

  const imc = calculateIMC();
  const imcStatus = imc ? getIMCStatus(parseFloat(imc)) : null;

  return (
    <div className="min-h-screen bg-gradient-subtle flex flex-col">
      {/* Header */}
      <header className="bg-surface border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Dumbbell className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold">
              Fit<span className="text-primary">Life</span>
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{profile?.nome || user.email}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 flex-1">
        {/* 1. Welcome Section - Olá, Usuario */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold mb-2">
            Olá, {profile?.nome?.split(' ')[0] || 'Atleta'}! 👋
          </h2>
          <p className="text-muted-foreground text-lg">
            Hoje é {todayName}. Vamos continuar sua jornada fitness!
          </p>
        </motion.div>

        {/* 2. Quick Actions - Cards de Navegação */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer" onClick={() => navigate('/workouts')}>
            <CardContent className="p-6 text-center">
              <Dumbbell className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-1">Meus Treinos</h3>
              <p className="text-xs text-muted-foreground">Gerenciar treinos</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer" onClick={() => navigate('/diets')}>
            <CardContent className="p-6 text-center">
              <Apple className="h-8 w-8 text-secondary mx-auto mb-3" />
              <h3 className="font-semibold mb-1">Minhas Dietas</h3>
              <p className="text-xs text-muted-foreground">Gerenciar dietas</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer" onClick={() => navigate('/habits')}>
            <CardContent className="p-6 text-center">
              <CheckCircle2 className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-1">Hábitos</h3>
              <p className="text-xs text-muted-foreground">Acompanhar hábitos</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer" onClick={() => navigate('/evolution')}>
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-8 w-8 text-secondary mx-auto mb-3" />
              <h3 className="font-semibold mb-1">Evolução</h3>
              <p className="text-xs text-muted-foreground">Ver progressos</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* 3. Profile + Today's Workout - Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Profile Summary */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-0 shadow-lg h-full">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-primary" />
                  <span>Perfil</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {profile?.peso && profile?.altura ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Peso:</span>
                      <span className="font-medium">{profile.peso} kg</span>
                    </div>
                     <div className="flex justify-between">
                       <span className="text-sm text-muted-foreground">Altura:</span>
                       <span className="font-medium">{profile.altura} cm</span>
                     </div>
                    {imc && imcStatus && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">IMC:</span>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{imc}</span>
                          <Badge className={`${imcStatus.color} text-white text-xs`}>
                            {imcStatus.text}
                          </Badge>
                        </div>
                      </div>
                    )}
                    {profile?.objetivo && (
                      <div className="pt-2 border-t">
                        <span className="text-sm text-muted-foreground">Objetivo:</span>
                        <p className="font-medium text-sm mt-1">{formatObjective(profile.objetivo)}</p>
                      </div>
                    )}
                    <div className="pt-3 border-t">
                      <Button size="sm" variant="ghost" onClick={() => navigate('/profile')} className="w-full">
                        Editar Perfil
                      </Button>
                    </div>
                  </>
                 ) : (
                   <div>
                     <p className="text-sm text-muted-foreground mb-3">
                       Complete seu perfil para ver estatísticas detalhadas
                     </p>
                     <Button size="sm" variant="outline" onClick={() => navigate('/profile')}>
                       Editar Perfil
                     </Button>
                   </div>
                 )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Today's Workout */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-0 shadow-lg h-full">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Dumbbell className="h-5 w-5 text-primary" />
                  <span>Treino de Hoje</span>
                </CardTitle>
                <CardDescription>{todayName}</CardDescription>
              </CardHeader>
              <CardContent>
                {todayWorkout ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{todayWorkout.nome}</h3>
                      <Badge variant="outline">{todayWorkout.exercicios?.length || 0} exercícios</Badge>
                    </div>
                    
                    {todayWorkout.exercicios && todayWorkout.exercicios.length > 0 && (
                      <div className="space-y-2">
                        {todayWorkout.exercicios.slice(0, 3).map((exercise) => (
                          <div key={exercise.id} className="flex items-center justify-between text-sm">
                            <span className="truncate">{exercise.nome}</span>
                            <div className="flex items-center space-x-1 text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>{exercise.series_planejadas}x{exercise.repeticoes_planejadas}</span>
                            </div>
                          </div>
                        ))}
                        {todayWorkout.exercicios.length > 3 && (
                          <p className="text-xs text-muted-foreground">
                            +{todayWorkout.exercicios.length - 3} mais exercício(s)
                          </p>
                        )}
                      </div>
                    )}
                    
                    <Button 
                      className="w-full" 
                      onClick={() => navigate(`/workouts?start=${todayWorkout.id}`)}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Iniciar Treino
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">
                      Nenhum treino programado para hoje
                    </p>
                    <Button size="sm" onClick={() => navigate('/workouts')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Treino
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* 4. Diet Progress - Visualização estilo página de Dietas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Apple className="h-5 w-5 text-secondary" />
                <span>Dieta de Hoje</span>
              </CardTitle>
              {activeDiet && activeDiet.refeicoes && (
                <CardDescription>
                  {activeDiet.nome} • {activeDiet.refeicoes.filter(m => m.status).length} de {activeDiet.refeicoes.length} refeições concluídas
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              {activeDiet && activeDiet.refeicoes && activeDiet.refeicoes.length > 0 ? (
                <div className="space-y-4">
                  <Progress 
                    value={(activeDiet.refeicoes.filter(m => m.status).length / activeDiet.refeicoes.length) * 100}
                    className="h-2"
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {activeDiet.refeicoes.map((meal) => (
                      <div 
                        key={meal.id}
                        className={`p-4 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors ${
                          meal.status ? 'bg-secondary/10 border-secondary/30' : ''
                        }`}
                        onClick={() => toggleMealStatus(meal.id, meal.status || false)}
                      >
                        <div className="flex items-start space-x-3">
                          <Checkbox
                            checked={meal.status || false}
                            onCheckedChange={() => toggleMealStatus(meal.id, meal.status || false)}
                            className="mt-0.5 data-[state=checked]:bg-secondary data-[state=checked]:border-secondary"
                          />
                          <div className="flex-1 min-w-0">
                            <p className={`font-medium text-sm ${meal.status ? 'line-through text-muted-foreground' : ''}`}>
                              {meal.nome_refeicao}
                            </p>
                            {meal.horario && (
                              <p className="text-xs text-muted-foreground mt-1">
                                <Clock className="h-3 w-3 inline mr-1" />
                                {meal.horario}
                              </p>
                            )}
                            {meal.alimentos && meal.alimentos.length > 0 && (
                              <div className="mt-2 space-y-1">
                                {meal.alimentos.slice(0, 2).map((food) => (
                                  <p key={food.id} className="text-xs text-muted-foreground truncate">
                                    • {food.nome} ({food.quantidade})
                                  </p>
                                ))}
                                {meal.alimentos.length > 2 && (
                                  <p className="text-xs text-muted-foreground">
                                    +{meal.alimentos.length - 2} mais
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                          {meal.status && (
                            <CheckCircle2 className="h-4 w-4 text-secondary flex-shrink-0" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* All meals completed message */}
                  {activeDiet.refeicoes.filter(meal => !meal.status).length === 0 && (
                    <div className="text-center py-4 bg-secondary/10 rounded-lg">
                      <CheckCircle2 className="h-8 w-8 text-secondary mx-auto mb-2" />
                      <p className="text-sm text-secondary font-medium">
                        Todas as refeições de hoje foram concluídas! 🎉
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Apple className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Nenhuma dieta configurada
                  </p>
                  <Button size="sm" variant="secondary" onClick={() => navigate('/diets')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Dieta
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* 5. Daily Habits - Hábitos de Hoje */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>Hábitos de Hoje</span>
              </CardTitle>
              <CardDescription>
                {todayHabits.length > 0 
                  ? `${todayHabits.filter(h => h.status).length} de ${todayHabits.length} hábitos concluídos`
                  : 'Mantenha sua rotina em dia'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {todayHabits.length > 0 ? (
                <div className="space-y-4">
                  <Progress 
                    value={todayHabits.length > 0 ? (todayHabits.filter(h => h.status).length / todayHabits.length) * 100 : 0}
                    className="h-2"
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {todayHabits.map((habit) => (
                      <div 
                        key={habit.id}
                        className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors ${
                          habit.status ? 'bg-primary/10 border-primary/30' : ''
                        }`}
                        onClick={() => toggleHabitStatus(habit.id, habit.status || false)}
                      >
                        <Checkbox
                          checked={habit.status || false}
                          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                        <span className={`text-sm flex-1 ${habit.status ? 'line-through text-muted-foreground' : ''}`}>
                          {habit.nome}
                        </span>
                        {habit.status && (
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <CheckCircle2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum hábito configurado</h3>
                  <p className="text-muted-foreground mb-6">
                    Crie hábitos diários para manter o foco nos seus objetivos
                  </p>
                  <Button onClick={() => navigate('/habits')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Primeiro Hábito
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* 6. Footer - Rodapé */}
      <footer className="bg-surface border-t mt-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Dumbbell className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold">Fit<span className="text-primary">Life</span></span>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              © 2024 FitLife. Desenvolvido para quem não desiste dos seus objetivos.
            </p>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => navigate('/profile')}>
                <User className="h-4 w-4 mr-2" />
                Perfil
              </Button>
              <Button variant="ghost" size="sm" onClick={signOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;