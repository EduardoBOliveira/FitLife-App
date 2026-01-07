import { HabitsManager } from "@/components/Habits/HabitsManager";
import { BackButton } from "@/components/Navigation/BackButton";
import { motion } from "framer-motion";

export default function Habits() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <BackButton />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Hábitos Diários</h1>
            <p className="text-muted-foreground">
              Acompanhe seus hábitos saudáveis e mantenha a consistência no seu dia a dia
            </p>
          </div>
          
          <HabitsManager />
        </motion.div>
      </div>
    </div>
  );
}