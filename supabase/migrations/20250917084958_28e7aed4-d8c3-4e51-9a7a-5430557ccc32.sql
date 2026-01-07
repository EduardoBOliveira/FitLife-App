-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  idade INTEGER,
  peso DECIMAL(5,2),
  altura DECIMAL(5,2),
  sexo TEXT CHECK (sexo IN ('masculino', 'feminino', 'outro')),
  objetivo TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile" ON public.profiles
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = user_id);

-- Create weight history table
CREATE TABLE public.historico_peso (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  peso DECIMAL(5,2) NOT NULL,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on weight history
ALTER TABLE public.historico_peso ENABLE ROW LEVEL SECURITY;

-- Weight history policies
CREATE POLICY "Users can view their own weight history" ON public.historico_peso
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own weight entries" ON public.historico_peso
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own weight entries" ON public.historico_peso
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own weight entries" ON public.historico_peso
FOR DELETE USING (auth.uid() = user_id);

-- Create workouts table
CREATE TABLE public.treinos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  dias_semana INTEGER[] NOT NULL DEFAULT '{}', -- Array of weekday numbers (0-6)
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on workouts
ALTER TABLE public.treinos ENABLE ROW LEVEL SECURITY;

-- Workouts policies
CREATE POLICY "Users can view their own workouts" ON public.treinos
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own workouts" ON public.treinos
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workouts" ON public.treinos
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workouts" ON public.treinos
FOR DELETE USING (auth.uid() = user_id);

-- Create exercises table
CREATE TABLE public.exercicios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  treino_id UUID NOT NULL REFERENCES public.treinos(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  series_planejadas INTEGER NOT NULL,
  repeticoes_planejadas TEXT NOT NULL, -- Can be "8-12" or "10"
  carga_planejada DECIMAL(6,2),
  observacoes TEXT,
  ordem INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on exercises
ALTER TABLE public.exercicios ENABLE ROW LEVEL SECURITY;

-- Exercises policies
CREATE POLICY "Users can view exercises from their workouts" ON public.exercicios
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.treinos 
    WHERE treinos.id = exercicios.treino_id 
    AND treinos.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create exercises for their workouts" ON public.exercicios
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.treinos 
    WHERE treinos.id = exercicios.treino_id 
    AND treinos.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update exercises from their workouts" ON public.exercicios
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.treinos 
    WHERE treinos.id = exercicios.treino_id 
    AND treinos.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete exercises from their workouts" ON public.exercicios
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.treinos 
    WHERE treinos.id = exercicios.treino_id 
    AND treinos.user_id = auth.uid()
  )
);

-- Create exercise history table
CREATE TABLE public.exercicios_historico (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  exercicio_id UUID NOT NULL REFERENCES public.exercicios(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data_treino DATE NOT NULL DEFAULT CURRENT_DATE,
  series_realizadas INTEGER NOT NULL,
  repeticoes_realizadas INTEGER NOT NULL,
  carga_realizada DECIMAL(6,2) NOT NULL,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on exercise history
ALTER TABLE public.exercicios_historico ENABLE ROW LEVEL SECURITY;

-- Exercise history policies
CREATE POLICY "Users can view their own exercise history" ON public.exercicios_historico
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own exercise history" ON public.exercicios_historico
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own exercise history" ON public.exercicios_historico
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own exercise history" ON public.exercicios_historico
FOR DELETE USING (auth.uid() = user_id);

-- Create diets table
CREATE TABLE public.dietas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on diets
ALTER TABLE public.dietas ENABLE ROW LEVEL SECURITY;

-- Diets policies
CREATE POLICY "Users can view their own diets" ON public.dietas
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own diets" ON public.dietas
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own diets" ON public.dietas
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own diets" ON public.dietas
FOR DELETE USING (auth.uid() = user_id);

-- Create meals table
CREATE TABLE public.refeicoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dieta_id UUID NOT NULL REFERENCES public.dietas(id) ON DELETE CASCADE,
  nome_refeicao TEXT NOT NULL,
  horario TIME,
  ordem INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on meals
ALTER TABLE public.refeicoes ENABLE ROW LEVEL SECURITY;

-- Meals policies
CREATE POLICY "Users can view meals from their diets" ON public.refeicoes
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.dietas 
    WHERE dietas.id = refeicoes.dieta_id 
    AND dietas.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create meals for their diets" ON public.refeicoes
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.dietas 
    WHERE dietas.id = refeicoes.dieta_id 
    AND dietas.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update meals from their diets" ON public.refeicoes
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.dietas 
    WHERE dietas.id = refeicoes.dieta_id 
    AND dietas.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete meals from their diets" ON public.refeicoes
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.dietas 
    WHERE dietas.id = refeicoes.dieta_id 
    AND dietas.user_id = auth.uid()
  )
);

-- Create foods table
CREATE TABLE public.alimentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  refeicao_id UUID NOT NULL REFERENCES public.refeicoes(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  quantidade TEXT NOT NULL,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on foods
ALTER TABLE public.alimentos ENABLE ROW LEVEL SECURITY;

-- Foods policies
CREATE POLICY "Users can view foods from their meals" ON public.alimentos
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.refeicoes
    JOIN public.dietas ON dietas.id = refeicoes.dieta_id
    WHERE refeicoes.id = alimentos.refeicao_id 
    AND dietas.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create foods for their meals" ON public.alimentos
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.refeicoes
    JOIN public.dietas ON dietas.id = refeicoes.dieta_id
    WHERE refeicoes.id = alimentos.refeicao_id 
    AND dietas.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update foods from their meals" ON public.alimentos
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.refeicoes
    JOIN public.dietas ON dietas.id = refeicoes.dieta_id
    WHERE refeicoes.id = alimentos.refeicao_id 
    AND dietas.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete foods from their meals" ON public.alimentos
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.refeicoes
    JOIN public.dietas ON dietas.id = refeicoes.dieta_id
    WHERE refeicoes.id = alimentos.refeicao_id 
    AND dietas.user_id = auth.uid()
  )
);

-- Create meal status table
CREATE TABLE public.refeicoes_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  refeicao_id UUID NOT NULL REFERENCES public.refeicoes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  status BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(refeicao_id, user_id, data)
);

-- Enable RLS on meal status
ALTER TABLE public.refeicoes_status ENABLE ROW LEVEL SECURITY;

-- Meal status policies
CREATE POLICY "Users can view their own meal status" ON public.refeicoes_status
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own meal status" ON public.refeicoes_status
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meal status" ON public.refeicoes_status
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meal status" ON public.refeicoes_status
FOR DELETE USING (auth.uid() = user_id);

-- Create habits table
CREATE TABLE public.habitos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  notificacao BOOLEAN NOT NULL DEFAULT false,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on habits
ALTER TABLE public.habitos ENABLE ROW LEVEL SECURITY;

-- Habits policies
CREATE POLICY "Users can view their own habits" ON public.habitos
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own habits" ON public.habitos
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own habits" ON public.habitos
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own habits" ON public.habitos
FOR DELETE USING (auth.uid() = user_id);

-- Create habits status table
CREATE TABLE public.habitos_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  habito_id UUID NOT NULL REFERENCES public.habitos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  status BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(habito_id, user_id, data)
);

-- Enable RLS on habits status
ALTER TABLE public.habitos_status ENABLE ROW LEVEL SECURITY;

-- Habits status policies
CREATE POLICY "Users can view their own habits status" ON public.habitos_status
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own habits status" ON public.habitos_status
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own habits status" ON public.habitos_status
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own habits status" ON public.habitos_status
FOR DELETE USING (auth.uid() = user_id);

-- Create function to update updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_treinos_updated_at
  BEFORE UPDATE ON public.treinos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_exercicios_updated_at
  BEFORE UPDATE ON public.exercicios
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dietas_updated_at
  BEFORE UPDATE ON public.dietas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_refeicoes_updated_at
  BEFORE UPDATE ON public.refeicoes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_alimentos_updated_at
  BEFORE UPDATE ON public.alimentos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_refeicoes_status_updated_at
  BEFORE UPDATE ON public.refeicoes_status
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_habitos_updated_at
  BEFORE UPDATE ON public.habitos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_habitos_status_updated_at
  BEFORE UPDATE ON public.habitos_status
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, nome)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email, 'Usuário')
  );
  RETURN NEW;
END;
$$;

-- Create trigger to automatically create profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();