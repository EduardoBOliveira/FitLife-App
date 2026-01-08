import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Calendar,
  Dumbbell,
  Apple,
  CheckCircle2,
  TrendingUp,
  User,
  ArrowLeft,
  Clock,
  Target,
  Play,
} from "lucide-react";
import { Link } from "react-router-dom";

const Demo = () => {
  const todayName = "Segunda-feira";

  // Mock data for demo
  const demoProfile = {
    nome: "Luisa",
    peso: 65,
    altura: 165,
    objetivo: "Ganhar massa muscular",
  };

  const demoWorkout = {
    nome: "Treino A - Peito e Tríceps",
    exercises: [
      {
        nome: "Supino reto",
        series: 4,
        reps: "8-12",
        peso: "50kg",
        ultimo: "47.5kg x 10",
      },
      {
        nome: "Supino inclinado",
        series: 3,
        reps: "10-12",
        peso: "40kg",
        ultimo: "37.5kg x 12",
      },
      {
        nome: "Crucifixo",
        series: 3,
        reps: "12-15",
        peso: "20kg",
        ultimo: "17.5kg x 14",
      },
      {
        nome: "Tríceps testa",
        series: 3,
        reps: "10-12",
        peso: "25kg",
        ultimo: "22.5kg x 11",
      },
    ],
  };

  const demoMeals = [
    {
      id: "1",
      nome: "Café da manhã",
      completed: true,
      horario: "07:00",
      items: ["Aveia com frutas", "Café com leite"],
    },
    {
      id: "2",
      nome: "Lanche da manhã",
      completed: true,
      horario: "10:00",
      items: ["Whey protein", "Banana"],
    },
    {
      id: "3",
      nome: "Almoço",
      completed: false,
      horario: "12:30",
      items: ["Frango grelhado", "Arroz integral", "Salada"],
    },
    {
      id: "4",
      nome: "Lanche da tarde",
      completed: false,
      horario: "16:00",
      items: ["Iogurte grego", "Castanhas"],
    },
    {
      id: "5",
      nome: "Jantar",
      completed: false,
      horario: "19:30",
      items: ["Salmão", "Batata doce", "Brócolis"],
    },
  ];

  const demoHabits = [
    { id: "1", nome: "Beber 2L de água", completed: true },
    { id: "2", nome: "Tomar creatina", completed: true },
    { id: "3", nome: "Dormir 8h", completed: false },
    { id: "4", nome: "Tomar vitamina D", completed: false },
  ];

  const calculateIMC = () => {
    const alturaMetros = demoProfile.altura / 100;
    const imc = demoProfile.peso / (alturaMetros * alturaMetros);
    return imc.toFixed(1);
  };

  const getIMCStatus = (imc: number) => {
    if (imc < 18.5) return { text: "Abaixo do peso", color: "bg-blue-500" };
    if (imc < 25) return { text: "Peso normal", color: "bg-green-500" };
    if (imc < 30) return { text: "Sobrepeso", color: "bg-yellow-500" };
    return { text: "Obesidade", color: "bg-red-500" };
  };

  const imc = calculateIMC();
  const imcStatus = getIMCStatus(parseFloat(imc));
  const completedMeals = demoMeals.filter((meal) => meal.completed).length;
  const completedHabits = demoHabits.filter((habit) => habit.completed).length;

  return (
    <div className="min-h-screen bg-gradient-subtle flex flex-col">
      {/* Header */}
      <header className="bg-surface border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link
              to="/"
              className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm">Voltar</span>
            </Link>
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Dumbbell className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold">
              Fit<span className="text-primary">Life</span>
            </h1>
            <Badge variant="secondary" className="ml-2">
              Demo
            </Badge>
          </div>

          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{demoProfile.nome}</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 flex-1">
        {/* 1. Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold mb-2">
            Olá, {demoProfile.nome.split(" ")[0]}! 👋
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
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <Dumbbell className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-1">Meus Treinos</h3>
              <p className="text-xs text-muted-foreground">Gerenciar treinos</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <Apple className="h-8 w-8 text-secondary mx-auto mb-3" />
              <h3 className="font-semibold mb-1">Minhas Dietas</h3>
              <p className="text-xs text-muted-foreground">Gerenciar dietas</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <CheckCircle2 className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-1">Hábitos</h3>
              <p className="text-xs text-muted-foreground">
                Acompanhar hábitos
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
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
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Peso:</span>
                  <span className="font-medium">{demoProfile.peso} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Altura:</span>
                  <span className="font-medium">{demoProfile.altura} cm</span>
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
                  <span className="text-sm text-muted-foreground">
                    Objetivo:
                  </span>
                  <p className="font-medium text-sm mt-1">
                    {demoProfile.objetivo}
                  </p>
                </div>
                <div className="pt-3 border-t">
                  <Button size="sm" variant="ghost" className="w-full">
                    Editar Perfil
                  </Button>
                </div>
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
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{demoWorkout.nome}</h3>
                    <Badge variant="outline">
                      {demoWorkout.exercises.length} exercícios
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    {demoWorkout.exercises
                      .slice(0, 3)
                      .map((exercise, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="truncate">{exercise.nome}</span>
                          <div className="flex items-center space-x-1 text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>
                              {exercise.series}x{exercise.reps}
                            </span>
                          </div>
                        </div>
                      ))}
                    {demoWorkout.exercises.length > 3 && (
                      <p className="text-xs text-muted-foreground">
                        +{demoWorkout.exercises.length - 3} mais exercício(s)
                      </p>
                    )}
                  </div>

                  <Button className="w-full">
                    <Play className="h-4 w-4 mr-2" />
                    Iniciar Treino
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* 4. Diet Progress - Grid igual ao Dashboard */}
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
              <CardDescription>
                Dieta Massa Muscular • {completedMeals} de {demoMeals.length}{" "}
                refeições concluídas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Progress
                  value={(completedMeals / demoMeals.length) * 100}
                  className="h-2"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {demoMeals.map((meal) => (
                    <div
                      key={meal.id}
                      className={`p-4 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors ${
                        meal.completed
                          ? "bg-secondary/10 border-secondary/30"
                          : ""
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          checked={meal.completed}
                          className="mt-0.5 data-[state=checked]:bg-secondary data-[state=checked]:border-secondary"
                        />
                        <div className="flex-1 min-w-0">
                          <p
                            className={`font-medium text-sm ${
                              meal.completed
                                ? "line-through text-muted-foreground"
                                : ""
                            }`}
                          >
                            {meal.nome}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            <Clock className="h-3 w-3 inline mr-1" />
                            {meal.horario}
                          </p>
                          <div className="mt-2 space-y-1">
                            {meal.items.slice(0, 2).map((item, idx) => (
                              <p
                                key={idx}
                                className="text-xs text-muted-foreground truncate"
                              >
                                • {item}
                              </p>
                            ))}
                            {meal.items.length > 2 && (
                              <p className="text-xs text-muted-foreground">
                                +{meal.items.length - 2} mais
                              </p>
                            )}
                          </div>
                        </div>
                        {meal.completed && (
                          <CheckCircle2 className="h-4 w-4 text-secondary flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 5. Daily Habits - Grid igual ao Dashboard */}
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
              <div className="space-y-4">
                <Progress
                  value={(completedHabits / demoHabits.length) * 100}
                  className="h-2"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {demoHabits.map((habit) => (
                    <div
                      key={habit.id}
                      className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors ${
                        habit.completed ? "bg-primary/10 border-primary/30" : ""
                      }`}
                    >
                      <Checkbox
                        checked={habit.completed}
                        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      <span
                        className={`text-sm flex-1 ${
                          habit.completed
                            ? "line-through text-muted-foreground"
                            : ""
                        }`}
                      >
                        {habit.nome}
                      </span>
                      {habit.completed && (
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <Card className="border-0 shadow-lg bg-gradient-primary text-white">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">Gostou do que viu?</h3>
              <p className="text-white/90 mb-6 max-w-2xl mx-auto">
                Esta é apenas uma demonstração das funcionalidades do FitLife.
                Crie sua conta gratuita e comece a transformar seus treinos e
                dieta hoje mesmo!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  variant="secondary"
                  className="interactive-scale"
                  asChild
                >
                  <Link to="/auth">
                    <User className="h-5 w-5 mr-2" />
                    Criar Minha Conta
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-black hover:text-white hover:bg-white/10 interactive-scale"
                  asChild
                >
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

      {/* Footer */}
      <footer className="bg-surface border-t mt-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Dumbbell className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold">
                Fit<span className="text-primary">Life</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              © 2024 FitLife. Desenvolvido para quem não desiste dos seus
              objetivos.
            </p>
            <Badge variant="secondary">Versão Demo</Badge>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Demo;
