import { useState, useEffect } from "react";
import { ProfileForm } from "@/components/Profile/ProfileForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { BackButton } from "@/components/Navigation/BackButton";

interface WeightEntry {
  data: string;
  peso: number;
  created_at: string;
}

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [weightHistory, setWeightHistory] = useState<WeightEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Buscar histórico de peso
      const { data: weightData, error: weightError } = await supabase
        .from('historico_peso')
        .select('*')
        .eq('user_id', user.id)
        .order('data', { ascending: true })
        .limit(30);

      if (weightError) throw weightError;
      setWeightHistory(weightData || []);
    } catch (error: any) {
      console.error("Erro ao carregar perfil:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const getWeightTrend = () => {
    if (weightHistory.length < 2) return null;
    
    const recent = weightHistory.slice(-5);
    const firstWeight = recent[0].peso;
    const lastWeight = recent[recent.length - 1].peso;
    const diff = lastWeight - firstWeight;
    
    if (Math.abs(diff) < 0.1) return { type: 'stable', diff: 0 };
    return { 
      type: diff > 0 ? 'gaining' : 'losing', 
      diff: Math.abs(diff) 
    };
  };

  const weightTrend = getWeightTrend();

  const chartData = weightHistory.map(entry => ({
    data: new Date(entry.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    peso: Number(entry.peso)
  }));

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/3 mb-6"></div>
            <div className="h-96 bg-muted rounded mb-6"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <BackButton />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold mb-2">Meu Perfil</h1>
          <p className="text-muted-foreground">
            Gerencie suas informações pessoais e acompanhe sua evolução
          </p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ProfileForm 
              profile={profile} 
              onSuccess={fetchProfile}
            />
          </div>

          <div className="space-y-6">
            {profile && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Resumo</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {profile.peso && profile.altura && (
                      <div className="text-center p-4 bg-primary/5 rounded-lg">
                        <div className="text-2xl font-bold text-primary">
                          {((profile.peso / Math.pow(profile.altura / 100, 2))).toFixed(1)}
                        </div>
                        <div className="text-sm text-muted-foreground">IMC atual</div>
                      </div>
                    )}
                    
                    {profile.objetivo && (
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">Objetivo</div>
                        <div className="capitalize">
                          {profile.objetivo.replace('_', ' ')}
                        </div>
                      </div>
                    )}
                    
                    {weightTrend && (
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">Tendência</div>
                        <div className="flex items-center gap-2">
                          {weightTrend.type === 'gaining' && (
                            <>
                              <TrendingUp className="w-4 h-4 text-orange-600" />
                              <span className="text-orange-600">+{weightTrend.diff.toFixed(1)}kg</span>
                            </>
                          )}
                          {weightTrend.type === 'losing' && (
                            <>
                              <TrendingDown className="w-4 h-4 text-green-600" />
                              <span className="text-green-600">-{weightTrend.diff.toFixed(1)}kg</span>
                            </>
                          )}
                          {weightTrend.type === 'stable' && (
                            <>
                              <Minus className="w-4 h-4 text-gray-600" />
                              <span className="text-gray-600">Estável</span>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>

        {chartData.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Evolução do Peso</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="data" />
                      <YAxis domain={['dataMin - 2', 'dataMax + 2']} />
                      <Tooltip 
                        formatter={(value) => [`${value}kg`, 'Peso']}
                        labelFormatter={(label) => `Data: ${label}`}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="peso" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={3}
                        dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}