import { useState } from "react";
import { WorkoutList } from "@/components/Workouts/WorkoutList";
import { WorkoutForm } from "@/components/Workouts/WorkoutForm";
import { WorkoutSession } from "@/components/Workouts/WorkoutSession";
import { QuickLogWorkout } from "@/components/Workouts/QuickLogWorkout";
import { BackButton } from "@/components/Navigation/BackButton";
import { motion } from "framer-motion";

export default function Workouts() {
  const [selectedWorkout, setSelectedWorkout] = useState<any>(null);
  const [view, setView] = useState<'list' | 'create' | 'edit' | 'execute' | 'quicklog'>('list');

  const handleCreateNew = () => {
    setSelectedWorkout(null);
    setView('create');
  };

  const handleEdit = (workout: any) => {
    setSelectedWorkout(workout);
    setView('edit');
  };

  const handleStart = (workout: any) => {
    setSelectedWorkout(workout);
    setView('execute');
  };

  const handleQuickLog = (workout: any) => {
    setSelectedWorkout(workout);
    setView('quicklog');
  };

  const handleBack = () => {
    setSelectedWorkout(null);
    setView('list');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <BackButton />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {view === 'list' && (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Treinos</h1>
                <p className="text-muted-foreground">
                  Crie, gerencie e execute seus treinos de forma organizada
                </p>
              </div>
              
              <WorkoutList 
                onCreateNew={handleCreateNew}
                onEdit={handleEdit}
                onStart={handleStart}
                onQuickLog={handleQuickLog}
              />
            </>
          )}
          
          {view === 'create' && (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Novo Treino</h1>
                <p className="text-muted-foreground">
                  Crie um novo treino personalizado
                </p>
              </div>
              
              <WorkoutForm 
                onSave={handleBack}
                onCancel={handleBack}
              />
            </>
          )}
          
          {view === 'edit' && (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Editar Treino</h1>
                <p className="text-muted-foreground">
                  Modifique os dados do seu treino
                </p>
              </div>
              
              <WorkoutForm 
                workout={selectedWorkout}
                onSave={handleBack}
                onCancel={handleBack}
              />
            </>
          )}
          
          {view === 'execute' && selectedWorkout && (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Sessão de Treino</h1>
                <p className="text-muted-foreground">
                  Acompanhe seu treino em tempo real
                </p>
              </div>
              
              <WorkoutSession 
                workout={selectedWorkout}
                onFinish={handleBack}
                onBack={handleBack}
              />
            </>
          )}

          {view === 'quicklog' && selectedWorkout && (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Registro Rápido</h1>
                <p className="text-muted-foreground">
                  Registre um treino passado ou adicione dados rapidamente
                </p>
              </div>
              
              <QuickLogWorkout 
                workout={selectedWorkout}
                onFinish={handleBack}
                onBack={handleBack}
              />
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}