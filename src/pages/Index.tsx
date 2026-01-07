import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { 
  Dumbbell, 
  Apple, 
  Target, 
  TrendingUp, 
  Clock, 
  Calendar,
  CheckCircle,
  BarChart3,
  Zap,
  Shield,
  Play
} from "lucide-react";
import heroImage from "@/assets/fitlife-hero.jpg";

const Index = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        damping: 20,
        stiffness: 100
      }
    }
  };

  const features = [
    {
      icon: Dumbbell,
      title: "Controle de Treinos",
      description: "Registre seus exercícios, séries e cargas. Acompanhe sua evolução em tempo real.",
      color: "text-primary"
    },
    {
      icon: Apple,
      title: "Gestão de Dieta",
      description: "Organize suas refeições e marque o que já consumiu. Mantenha-se no foco.",
      color: "text-secondary"
    },
    {
      icon: Target,
      title: "Hábitos Saudáveis",
      description: "Crie uma rotina de hábitos e receba lembretes. Consistência é tudo.",
      color: "text-primary"
    },
    {
      icon: TrendingUp,
      title: "Evolução Visual",
      description: "Gráficos intuitivos mostram seu progresso de peso, IMC e desempenho.",
      color: "text-secondary"
    }
  ];

  const benefits = [
    { icon: Clock, text: "Dashboard prático para o dia a dia" },
    { icon: Calendar, text: "Treinos organizados por dia da semana" },
    { icon: CheckCircle, text: "Marque refeições como concluídas" },
    { icon: BarChart3, text: "Histórico completo de evolução" },
    { icon: Zap, text: "Interface rápida e intuitiva" },
    { icon: Shield, text: "Seus dados 100% seguros" }
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Hero Section */}
      <motion.section 
        className="relative overflow-hidden bg-gradient-hero text-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 container mx-auto px-4 py-20 md:py-32">
          <motion.div 
            className="max-w-4xl mx-auto text-center"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants} className="mb-6">
              <Badge variant="secondary" className="mb-4 text-sm font-medium">
                🏋️ Sua evolução fitness começa aqui
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 text-glow">
                Fit<span className="text-secondary">Life</span>
              </h1>
              <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
                Substitua planilhas e anotações por uma plataforma{" "}
                <span className="text-secondary font-semibold">intuitiva</span> e{" "}
                <span className="text-secondary font-semibold">motivadora</span>
              </p>
            </motion.div>
            
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-4 interactive-scale" asChild>
                <Link to="/auth">
                  <Zap className="mr-2 h-5 w-5" />
                  Começar Agora
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-4 border-white/30 text-black hover:text-white hover:bg-white/10 interactive-scale" asChild>
                <Link to="/demo">
                  <Play className="mr-2 h-5 w-5" />
                  Ver Demonstração
                </Link>
              </Button>
            </motion.div>

            <motion.div variants={itemVariants} className="max-w-2xl mx-auto">
              <img 
                src={heroImage} 
                alt="FitLife Dashboard Preview" 
                className="rounded-2xl shadow-2xl border border-white/20"
              />
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section 
        className="py-20 container mx-auto px-4"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <motion.div 
          className="text-center mb-16"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.h2 
            variants={itemVariants}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            Tudo que você precisa em um só lugar
          </motion.h2>
          <motion.p 
            variants={itemVariants}
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            Ferramentas completas para transformar sua rotina fitness em resultados consistentes
          </motion.p>
        </motion.div>

        <motion.div 
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="h-full interactive card-elevated border-0 shadow-lg">
                <CardHeader className="text-center pb-4">
                  <feature.icon className={`h-12 w-12 mx-auto mb-4 ${feature.color}`} />
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* Benefits Section */}
      <motion.section 
        className="py-20 bg-surface"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="container mx-auto px-4">
          <motion.div 
            className="max-w-4xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div variants={itemVariants} className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Por que escolher o FitLife?
              </h2>
              <p className="text-xl text-muted-foreground">
                Desenhado para quem leva fitness a sério, mas valoriza simplicidade
              </p>
            </motion.div>

            <motion.div 
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={containerVariants}
            >
              {benefits.map((benefit, index) => (
                <motion.div 
                  key={index}
                  variants={itemVariants}
                  className="flex items-center space-x-4 p-4 rounded-xl bg-card hover:bg-card-elevated transition-colors"
                >
                  <benefit.icon className="h-6 w-6 text-primary flex-shrink-0" />
                  <span className="text-foreground font-medium">{benefit.text}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section 
        className="py-20 bg-gradient-hero text-white"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="container mx-auto px-4 text-center">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.h2 
              variants={itemVariants}
              className="text-3xl md:text-4xl font-bold mb-6"
            >
              Pronto para transformar seus treinos?
            </motion.h2>
            <motion.p 
              variants={itemVariants}
              className="text-xl text-white/90 mb-8 max-w-2xl mx-auto"
            >
              Comece hoje mesmo e veja como é simples manter o foco nos seus objetivos fitness
            </motion.p>
            <motion.div variants={itemVariants}>
              <Button size="lg" variant="secondary" className="text-lg px-12 py-4 interactive-scale" asChild>
                <Link to="/auth">
                  <Target className="mr-2 h-5 w-5" />
                  Criar Minha Conta
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="py-8 border-t bg-background">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            © 2024 FitLife. Desenvolvido para quem não desiste dos seus objetivos.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;