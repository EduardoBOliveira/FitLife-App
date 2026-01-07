import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Calendar, 
  Dumbbell, 
  Apple, 
  CheckCircle2, 
  TrendingUp, 
  User,
  ArrowLeft,
  Clock,
  Target
} from "lucide-react";
import { Link } from "react-router-dom";

const Demo = () => {
  const todayName = "Segunda-feira";
  
  // Mock data for demo
  const demoProfile = {
    nome: "Maria Silva",
    peso: 65,
    altura: 1.65,
    objetivo: "Ganhar massa muscular"
  };

  const demoWorkout = {
    nome: "Treino A - Peito e Tríceps",
    exercises: [
      { nome: "Supino reto", series: 4, reps: "8-12", peso: "50kg", ultimo: "47.5kg x 10" },
      { nome: "Supino inclinado", series: 3, reps: "10-12", peso: "40kg", ultimo: "37.5kg x 12" },
      { nome: "Crucifixo", series: 3, reps: "12-15", peso: "20kg", ultimo: "17.5kg x 14" },
      { nome: "Tríceps testa", series: 3, reps: "10-12", peso: "25kg", ultimo: "22.5kg x 11" }
    ]
  };

  const demoMeals = [
    { nome: "Café da manhã", completed: true, items: ["Aveia com frutas", "Café com leite"] },
    { nome: "Lanche da manhã", completed: true, items: ["Whey protein", "Banana"] },
    { nome: "Almoço", completed: false, items: ["Frango grelhado", "Arroz integral", "Salada"] },
    { nome: "Lanche da tarde", completed: false, items: ["Iogurte grego", "Castanhas"] },
    { nome: "Jantar", completed: false, items: ["Salmão", "Batata doce", "Brócolis"] }
  ];

  const demoHabits = [
    { nome: "Beber 2L de água", completed: true },
    { nome: "Tomar creatina", completed: true },
    { nome: "Dormir 8h", completed: false },
    { nome: "Tomar vitamina D", completed: false }
  ];

  const calculateIMC = () => {
    const imc = demoProfile.peso / (demoProfile.altura * demoProfile.altura);
    return imc.toFixed(1);
  };

  const getIMCStatus = (imc: number) => {
    if (imc < 18.5) return { text: 'Abaixo do peso', color: 'bg-blue-500' };
    if (imc < 25) return { text: 'Peso normal', color: 'bg-green-500' };
    if (imc < 30) return { text: 'Sobrepeso', color: 'bg-yellow-500' };
    return { text: 'Obesidade', color: 'bg-red-500' };
  };

  const imc = calculateIMC();
  const imcStatus = getIMCStatus(parseFloat(imc));
  const completedMeals = demoMeals.filter(meal => meal.completed).length;
  const completedHabits = demoHabits.filter(habit => habit.completed).length;

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-surface border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm">Voltar</span>
            </Link>
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Dumbbell className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold">
              Fit<span className="text-primary">Life</span>
            </h1>
            <Badge variant="secondary" className="ml-2">Demo</Badge>
          </div>
          
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{demoProfile.nome}</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold mb-2">
            Olá, {demoProfile.nome.split(' ')[0]}! 👋
          </h2>
          <p className="text-muted-foreground text-lg">
            Hoje é {todayName}. Vamos continuar sua jornada fitness!
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Profile Summary */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-primary" />
                  <span>Perfil</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Peso:</span>
                  <span className="font-medium">{demoProfile.peso} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Altura:</span>
                  <span className="font-medium">{demoProfile.altura} m</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">IMC:</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{imc}</span>
                    <Badge className={`${imcStatus.color} text-white text-xs`}>
                      {imcStatus.text}
                    </Badge>
                  </div>
                </div>
                <div className="pt-2 border-t">
                  <span className="text-sm text-muted-foreground">Objetivo:</span>
                  <p className="font-medium text-sm mt-1">{demoProfile.objetivo}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Today's Workout */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Dumbbell className="h-5 w-5 text-primary" />
                  <span>Treino de Hoje</span>
                </CardTitle>
                <CardDescription>{todayName}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm">{demoWorkout.nome}</h3>
                    <Badge variant="outline">4 exercícios</Badge>
                  </div>
                  <div className="space-y-2">
                    {demoWorkout.exercises.slice(0, 2).map((exercise, index) => (
                      <div key={index} className="text-xs space-y-1">
                        <div className="flex justify-between font-medium">
                          <span>{exercise.nome}</span>
                          <span className="text-muted-foreground">{exercise.series}x{exercise.reps}</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                          <span>Planejado: {exercise.peso}</span>
                          <span>Último: {exercise.ultimo}</span>
                        </div>
                      </div>
                    ))}
                    <Button size="sm" className="w-full mt-3">
                      <Target className="h-4 w-4 mr-2" />
                      Iniciar Treino
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Diet Progress */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Apple className="h-5 w-5 text-secondary" />
                  <span>Dieta de Hoje</span>
                </CardTitle>
                <CardDescription>
                  {completedMeals} de {demoMeals.length} refeições concluídas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Progress value={(completedMeals / demoMeals.length) * 100} className="h-2" />
                  <div className="space-y-2">
                    {demoMeals.slice(0, 3).map((meal, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <CheckCircle2 
                            className={`h-4 w-4 ${meal.completed ? 'text-green-500' : 'text-muted-foreground'}`} 
                          />
                          <span className={meal.completed ? 'line-through text-muted-foreground' : ''}>
                            {meal.nome}
                          </span>
                        </div>
                        <Clock className="h-3 w-3 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Daily Habits */}
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
                {completedHabits} de {demoHabits.length} hábitos concluídos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {demoHabits.map((habit, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                    <CheckCircle2 
                      className={`h-5 w-5 ${habit.completed ? 'text-green-500' : 'text-muted-foreground'}`} 
                    />
                    <span className={`text-sm ${habit.completed ? 'line-through text-muted-foreground' : ''}`}>
                      {habit.nome}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Progress Charts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-secondary" />
                <span>Evolução do Peso</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Gráfico de evolução será exibido aqui conforme você registra seu peso
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Dumbbell className="h-5 w-5 text-primary" />
                <span>Evolução dos Exercícios</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Dumbbell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Histórico de cargas e repetições dos seus exercícios favoritos
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-center"
        >
          <Card className="border-0 shadow-lg bg-gradient-primary text-white">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">Gostou do que viu?</h3>
              <p className="text-white/90 mb-6 max-w-2xl mx-auto">
                Esta é apenas uma demonstração das funcionalidades do FitLife. 
                Crie sua conta gratuita e comece a transformar seus treinos e dieta hoje mesmo!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" asChild>
                  <Link to="/auth">
                    <User className="h-5 w-5 mr-2" />
                    Criar Minha Conta
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10" asChild>
                  <Link to="/">
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    Voltar ao Início
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Demo;