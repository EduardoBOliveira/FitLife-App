import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Dumbbell, Calendar, Activity, Award, Scale, Target } from "lucide-react";
import { BackButton } from "@/components/Navigation/BackButton";

interface ExerciseHistory {
  id: string;
  exercicio_id: string;
  data_treino: string;
  series_realizadas: number;
  repeticoes_realizadas: number;
  carga_realizada: number;
  exercicios: {
    nome: string;
  };
}

interface WeightHistory {
  data: string;
  peso: number;
}

export default function Evolution() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [weightHistory, setWeightHistory] = useState<WeightHistory[]>([]);
  const [exerciseHistory, setExerciseHistory] = useState<ExerciseHistory[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<string>("all");
  const [periodFilter, setPeriodFilter] = useState<string>("30");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [user, periodFilter]);

  const fetchData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Buscar perfil
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      setProfile(profileData);

      // Calcular data inicial baseada no filtro
      const daysAgo = parseInt(periodFilter);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      // Buscar histórico de peso
      const { data: weightData } = await supabase
        .from('historico_peso')
        .select('*')
        .eq('user_id', user.id)
        .gte('data', startDate.toISOString().split('T')[0])
        .order('data', { ascending: true });

      setWeightHistory(weightData || []);

      // Buscar histórico de exercícios com JOIN
      const { data: exerciseData } = await supabase
        .from('exercicios_historico')
        .select(`
          *,
          exercicios:exercicio_id (nome)
        `)
        .eq('user_id', user.id)
        .gte('data_treino', startDate.toISOString().split('T')[0])
        .order('data_treino', { ascending: true });

      setExerciseHistory(exerciseData || []);
    } catch (error: any) {
      console.error("Erro ao carregar dados:", error.message);
    } finally {
      setLoading(false);
    }
  };

  // Cálculos de estatísticas
  const calculateIMC = () => {
    if (!profile?.peso || !profile?.altura) return 0;
    return (profile.peso / Math.pow(profile.altura / 100, 2)).toFixed(1);
  };

  const calculateWeightChange = () => {
    if (weightHistory.length < 2) return { value: 0, percent: 0 };
    const first = weightHistory[0].peso;
    const last = weightHistory[weightHistory.length - 1].peso;
    const diff = last - first;
    const percent = ((diff / first) * 100).toFixed(1);
    return { value: diff.toFixed(1), percent };
  };

  const calculateTotalWorkouts = () => {
    const uniqueDates = new Set(exerciseHistory.map(e => e.data_treino));
    return uniqueDates.size;
  };

  const calculateTotalLoad = () => {
    return exerciseHistory.reduce((sum, ex) => {
      return sum + (ex.carga_realizada * ex.repeticoes_realizadas * ex.series_realizadas);
    }, 0).toFixed(0);
  };

  const calculateAverageStrength = () => {
    const exerciseGroups = exerciseHistory.reduce((acc, ex) => {
      const key = ex.exercicios.nome;
      if (!acc[key]) acc[key] = [];
      acc[key].push(ex.carga_realizada);
      return acc;
    }, {} as Record<string, number[]>);

    let totalGrowth = 0;
    let count = 0;

    Object.values(exerciseGroups).forEach(loads => {
      if (loads.length >= 2) {
        const first = loads[0];
        const last = loads[loads.length - 1];
        const growth = ((last - first) / first) * 100;
        totalGrowth += growth;
        count++;
      }
    });

    return count > 0 ? (totalGrowth / count).toFixed(1) : "0";
  };

  // Preparar dados para gráficos
  const weightChartData = weightHistory.map(entry => ({
    data: new Date(entry.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    peso: Number(entry.peso),
    imc: profile?.altura ? (Number(entry.peso) / Math.pow(profile.altura / 100, 2)).toFixed(1) : 0
  }));

  const getLoadChartData = () => {
    const filtered = selectedExercise === "all" 
      ? exerciseHistory 
      : exerciseHistory.filter(e => e.exercicios.nome === selectedExercise);

    const grouped = filtered.reduce((acc, ex) => {
      const date = new Date(ex.data_treino).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      const existing = acc.find(item => item.data === date && item.exercicio === ex.exercicios.nome);
      
      if (existing) {
        existing.carga = Math.max(existing.carga, ex.carga_realizada);
      } else {
        acc.push({
          data: date,
          exercicio: ex.exercicios.nome,
          carga: ex.carga_realizada
        });
      }
      return acc;
    }, [] as any[]);

    return grouped;
  };

  const getVolumeChartData = () => {
    const grouped = exerciseHistory.reduce((acc, ex) => {
      const date = new Date(ex.data_treino).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      const volume = ex.carga_realizada * ex.repeticoes_realizadas * ex.series_realizadas;
      
      const existing = acc.find(item => item.data === date);
      if (existing) {
        existing.volume += volume;
      } else {
        acc.push({ data: date, volume });
      }
      return acc;
    }, [] as any[]);

    return grouped;
  };

  const getFrequencyChartData = () => {
    const weeklyData = exerciseHistory.reduce((acc, ex) => {
      const date = new Date(ex.data_treino);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      
      if (!acc[weekKey]) {
        acc[weekKey] = new Set();
      }
      acc[weekKey].add(ex.data_treino);
      return acc;
    }, {} as Record<string, Set<string>>);

    return Object.entries(weeklyData).map(([week, dates]) => ({
      semana: week,
      dias: dates.size
    }));
  };

  // Comparativos de performance
  const getBestEvolution = () => {
    const exerciseGroups = exerciseHistory.reduce((acc, ex) => {
      const key = ex.exercicios.nome;
      if (!acc[key]) acc[key] = [];
      acc[key].push({ carga: ex.carga_realizada, data: ex.data_treino });
      return acc;
    }, {} as Record<string, any[]>);

    let bestExercise = "";
    let bestGrowth = 0;

    Object.entries(exerciseGroups).forEach(([name, records]) => {
      if (records.length >= 2) {
        const sorted = records.sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
        const growth = sorted[sorted.length - 1].carga - sorted[0].carga;
        if (growth > bestGrowth) {
          bestGrowth = growth;
          bestExercise = name;
        }
      }
    });

    return { exercise: bestExercise, growth: bestGrowth };
  };

  const getMostConsistent = () => {
    const exerciseCounts = exerciseHistory.reduce((acc, ex) => {
      acc[ex.exercicios.nome] = (acc[ex.exercicios.nome] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const sorted = Object.entries(exerciseCounts).sort((a, b) => b[1] - a[1]);
    return sorted[0] || ["", 0];
  };

  const getHighestVolume = () => {
    const exerciseVolumes = exerciseHistory.reduce((acc, ex) => {
      const volume = ex.carga_realizada * ex.repeticoes_realizadas * ex.series_realizadas;
      acc[ex.exercicios.nome] = (acc[ex.exercicios.nome] || 0) + volume;
      return acc;
    }, {} as Record<string, number>);

    const sorted = Object.entries(exerciseVolumes).sort((a, b) => b[1] - a[1]);
    return sorted[0] || ["", 0];
  };

  const uniqueExercises = Array.from(new Set(exerciseHistory.map(e => e.exercicios.nome)));

  const weightChange = calculateWeightChange();
  const bestEvolution = getBestEvolution();
  const mostConsistent = getMostConsistent();
  const highestVolume = getHighestVolume();

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/3 mb-6"></div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-muted rounded"></div>
              ))}
            </div>
            <div className="h-96 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <BackButton />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Evolução</h1>
              <p className="text-muted-foreground">
                Acompanhe seu progresso e conquistas
              </p>
            </div>
            
            <Select value={periodFilter} onValueChange={setPeriodFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Últimos 7 dias</SelectItem>
                <SelectItem value="30">Últimos 30 dias</SelectItem>
                <SelectItem value="90">Últimos 3 meses</SelectItem>
                <SelectItem value="365">Último ano</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Cards de Resumo */}
        <motion.div
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Scale className="h-8 w-8 text-primary" />
                {parseFloat(String(weightChange.value)) < 0 ? (
                  <TrendingDown className="h-5 w-5 text-green-600" />
                ) : parseFloat(String(weightChange.value)) > 0 ? (
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                ) : null}
              </div>
              <div className="text-2xl font-bold">{profile?.peso || 0}kg</div>
              <div className="text-sm text-muted-foreground">
                {parseFloat(String(weightChange.value)) !== 0 && (
                  <span className={parseFloat(String(weightChange.value)) < 0 ? "text-green-600" : "text-orange-600"}>
                    {Number(weightChange.value) > 0 ? '+' : ''}{weightChange.value}kg ({weightChange.percent}%)
                  </span>
                )}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Peso Atual</div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Target className="h-8 w-8 text-secondary" />
              </div>
              <div className="text-2xl font-bold">{calculateIMC()}</div>
              <div className="text-sm text-muted-foreground">
                Índice de Massa Corporal
              </div>
              <div className="text-xs text-muted-foreground mt-1">IMC Atual</div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Calendar className="h-8 w-8 text-primary" />
              </div>
              <div className="text-2xl font-bold">{calculateTotalWorkouts()}</div>
              <div className="text-sm text-muted-foreground">
                Treinos realizados
              </div>
              <div className="text-xs text-muted-foreground mt-1">Frequência</div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Dumbbell className="h-8 w-8 text-secondary" />
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div className="text-2xl font-bold">+{calculateAverageStrength()}%</div>
              <div className="text-sm text-muted-foreground">
                Evolução média de força
              </div>
              <div className="text-xs text-muted-foreground mt-1">Progressão</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Comparativos de Performance */}
        {exerciseHistory.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  Destaques de Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  {bestEvolution.exercise && (
                    <div className="p-4 bg-primary/5 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        <span className="font-semibold">Maior Evolução</span>
                      </div>
                      <div className="text-lg font-bold">{bestEvolution.exercise}</div>
                      <div className="text-sm text-muted-foreground">+{bestEvolution.growth}kg</div>
                    </div>
                  )}
                  
                  {mostConsistent[0] && (
                    <div className="p-4 bg-secondary/5 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Activity className="h-5 w-5 text-secondary" />
                        <span className="font-semibold">Mais Consistente</span>
                      </div>
                      <div className="text-lg font-bold">{String(mostConsistent[0])}</div>
                      <div className="text-sm text-muted-foreground">{String(mostConsistent[1])} treinos</div>
                    </div>
                  )}
                  
                  {highestVolume[0] && (
                    <div className="p-4 bg-primary/5 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Dumbbell className="h-5 w-5 text-primary" />
                        <span className="font-semibold">Maior Volume</span>
                      </div>
                      <div className="text-lg font-bold">{highestVolume[0]}</div>
                      <div className="text-sm text-muted-foreground">{(Number(highestVolume[1]) / 1000).toFixed(1)}t acumulados</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Gráficos */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Gráfico de Peso */}
          {weightChartData.length > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Evolução do Peso</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={weightChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="data" />
                        <YAxis domain={['dataMin - 2', 'dataMax + 2']} />
                        <Tooltip 
                          formatter={(value, name) => {
                            if (name === 'peso') return [`${value}kg`, 'Peso'];
                            if (name === 'imc') return [value, 'IMC'];
                            return [value, name];
                          }}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="peso" 
                          stroke="hsl(var(--primary))" 
                          strokeWidth={3}
                          dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                          name="Peso"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Gráfico de Volume */}
          {getVolumeChartData().length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Volume Total de Treino</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={getVolumeChartData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="data" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`${value}kg`, 'Volume']} />
                        <Area 
                          type="monotone" 
                          dataKey="volume" 
                          stroke="hsl(var(--secondary))" 
                          fill="hsl(var(--secondary) / 0.3)" 
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Gráfico de Cargas por Exercício */}
          {getLoadChartData().length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <CardTitle>Evolução de Cargas</CardTitle>
                    <Select value={selectedExercise} onValueChange={setSelectedExercise}>
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Selecione o exercício" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os exercícios</SelectItem>
                        {uniqueExercises.map(ex => (
                          <SelectItem key={ex} value={ex}>{ex}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={getLoadChartData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="data" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`${value}kg`, 'Carga']} />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="carga" 
                          stroke="hsl(var(--primary))" 
                          strokeWidth={3}
                          dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                          name="Carga"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Gráfico de Frequência Semanal */}
          {getFrequencyChartData().length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Frequência Semanal</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={getFrequencyChartData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="semana" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`${value} dias`, 'Treinos']} />
                        <Bar 
                          dataKey="dias" 
                          fill="hsl(var(--secondary))" 
                          radius={[8, 8, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Mensagem se não houver dados */}
        {exerciseHistory.length === 0 && weightHistory.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="border-0 shadow-lg">
              <CardContent className="p-12 text-center">
                <Activity className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Nenhum dado ainda</h3>
                <p className="text-muted-foreground mb-6">
                  Complete seus treinos e registre seu peso para ver sua evolução aqui
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
