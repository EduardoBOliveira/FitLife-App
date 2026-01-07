import { useState } from "react";
import { DietList } from "@/components/Diets/DietList";
import { DietForm } from "@/components/Diets/DietForm";
import { DietViewer } from "@/components/Diets/DietViewer";
import { BackButton } from "@/components/Navigation/BackButton";
import { motion } from "framer-motion";

export default function Diets() {
  const [selectedDiet, setSelectedDiet] = useState<any>(null);
  const [view, setView] = useState<'list' | 'create' | 'edit' | 'view'>('list');

  const handleCreateNew = () => {
    setSelectedDiet(null);
    setView('create');
  };

  const handleEdit = (diet: any) => {
    setSelectedDiet(diet);
    setView('edit');
  };

  const handleView = (diet: any) => {
    setSelectedDiet(diet);
    setView('view');
  };

  const handleBack = () => {
    setSelectedDiet(null);
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
                <h1 className="text-3xl font-bold mb-2">Dietas</h1>
                <p className="text-muted-foreground">
                  Organize sua alimentação e acompanhe suas refeições diárias
                </p>
              </div>
              
              <DietList 
                onCreateNew={handleCreateNew}
                onEdit={handleEdit}
                onView={handleView}
              />
            </>
          )}
          
          {view === 'create' && (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Nova Dieta</h1>
                <p className="text-muted-foreground">
                  Crie uma nova dieta personalizada
                </p>
              </div>
              
              <DietForm 
                onSave={handleBack}
                onCancel={handleBack}
              />
            </>
          )}
          
          {view === 'edit' && (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Editar Dieta</h1>
                <p className="text-muted-foreground">
                  Modifique sua dieta e refeições
                </p>
              </div>
              
              <DietForm 
                diet={selectedDiet}
                onSave={handleBack}
                onCancel={handleBack}
              />
            </>
          )}
          
          {view === 'view' && selectedDiet && (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Visualizar Dieta</h1>
                <p className="text-muted-foreground">
                  Acompanhe suas refeições do dia
                </p>
              </div>
              
              <DietViewer 
                diet={selectedDiet}
                onBack={handleBack}
                onEdit={() => setView('edit')}
              />
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}