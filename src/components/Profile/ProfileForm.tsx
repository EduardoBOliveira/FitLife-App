import { useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface ProfileFormData {
  nome: string;
  idade: number;
  peso: number;
  altura: number;
  sexo: string;
  objetivo: string;
}

interface ProfileFormProps {
  profile?: any;
  onSuccess?: () => void;
}

export const ProfileForm = ({ profile, onSuccess }: ProfileFormProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ProfileFormData>({
    defaultValues: {
      nome: profile?.nome || "",
      idade: profile?.idade || "",
      peso: profile?.peso || "",
      altura: profile?.altura || "",
      sexo: profile?.sexo || "",
      objetivo: profile?.objetivo || "",
    }
  });

  const watchedValues = watch();
  const imc = watchedValues.peso && watchedValues.altura 
    ? (watchedValues.peso / Math.pow(watchedValues.altura / 100, 2)).toFixed(1)
    : null;

  const getIMCStatus = (imc: number) => {
    if (imc < 18.5) return { text: "Abaixo do peso", color: "text-blue-600" };
    if (imc < 25) return { text: "Peso normal", color: "text-green-600" };
    if (imc < 30) return { text: "Sobrepeso", color: "text-yellow-600" };
    return { text: "Obesidade", color: "text-red-600" };
  };

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          ...data,
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      // Registrar peso no histórico se foi alterado
      if (data.peso !== profile?.peso) {
        await supabase
          .from('historico_peso')
          .insert({
            user_id: user.id,
            peso: data.peso,
          });
      }

      toast.success("Perfil atualizado com sucesso!");
      onSuccess?.();
    } catch (error: any) {
      toast.error("Erro ao salvar perfil: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Informações Pessoais</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nome">Nome completo</Label>
                <Input 
                  id="nome"
                  {...register("nome", { required: "Nome é obrigatório" })}
                  placeholder="Seu nome completo"
                />
                {errors.nome && <p className="text-destructive text-sm mt-1">{errors.nome.message}</p>}
              </div>
              
              <div>
                <Label htmlFor="idade">Idade</Label>
                <Input 
                  id="idade"
                  type="number"
                  {...register("idade", { required: "Idade é obrigatória", min: 1, max: 120 })}
                  placeholder="Sua idade"
                />
                {errors.idade && <p className="text-destructive text-sm mt-1">{errors.idade.message}</p>}
              </div>

              <div>
                <Label htmlFor="peso">Peso (kg)</Label>
                <Input 
                  id="peso"
                  type="number"
                  step="0.1"
                  {...register("peso", { required: "Peso é obrigatório", min: 1 })}
                  placeholder="Seu peso atual"
                />
                {errors.peso && <p className="text-destructive text-sm mt-1">{errors.peso.message}</p>}
              </div>

              <div>
                <Label htmlFor="altura">Altura (cm)</Label>
                <Input 
                  id="altura"
                  type="number"
                  {...register("altura", { required: "Altura é obrigatória", min: 50, max: 300 })}
                  placeholder="Sua altura"
                />
                {errors.altura && <p className="text-destructive text-sm mt-1">{errors.altura.message}</p>}
              </div>

              <div>
                <Label>Sexo</Label>
                <Select onValueChange={(value) => setValue("sexo", value)} value={watchedValues.sexo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione seu sexo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="masculino">Masculino</SelectItem>
                    <SelectItem value="feminino">Feminino</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Objetivo</Label>
                <Select onValueChange={(value) => setValue("objetivo", value)} value={watchedValues.objetivo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seu objetivo principal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="perder_peso">Perder peso</SelectItem>
                    <SelectItem value="ganhar_massa">Ganhar massa muscular</SelectItem>
                    <SelectItem value="manter_forma">Manter forma física</SelectItem>
                    <SelectItem value="performance">Melhorar performance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {imc && (
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-center">
                  <p className="text-lg font-semibold">IMC: {imc}</p>
                  <p className={`text-sm ${getIMCStatus(Number(imc)).color}`}>
                    {getIMCStatus(Number(imc)).text}
                  </p>
                </div>
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Salvando..." : "Salvar Perfil"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};