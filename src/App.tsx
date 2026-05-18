import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Aulas from "./pages/Aulas";
import Presenca from "./pages/Presenca";
import Alunos from "./pages/Alunos";
import Relatorios from "./pages/Relatorios";
import AulaDetalhes from "./pages/AulaDetalhes";
import Checkin from "./pages/Checkin";

import Professores from "./pages/Professores";
import Turmas from "./pages/Turmas";
import Atividades from "./pages/Atividades";
import Materiais from "./pages/Materiais";
import Configuracoes from "./pages/Configuracoes";

import NovaAula from "./pages/NovaAula";
import AssistenteIA from "./pages/AssistenteIA";

import AlunoHome from "./pages/aluno/AlunoHome";
import AlunoAulas from "./pages/aluno/AlunoAulas";
import AlunoAtividades from "./pages/aluno/AlunoAtividades";
import AlunoMateriais from "./pages/aluno/AlunoMateriais";
import AlunoProgresso from "./pages/aluno/AlunoProgresso";
import AlunoPerfil from "./pages/aluno/AlunoPerfil";

import ProfessorHome from "./pages/professor/ProfessorHome";
import ProfessorAulas from "./pages/professor/ProfessorAulas";
import ProfessorPresenca from "./pages/professor/ProfessorPresenca";
import ProfessorAtividades from "./pages/professor/ProfessorAtividades";
import ProfessorMateriais from "./pages/professor/ProfessorMateriais";
import ProfessorAlunos from "./pages/professor/ProfessorAlunos";

import Unauthorized from "./pages/Unauthorized";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          
          {/* Shared Content Creation roles */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'coordinator', 'teacher']} />}>
             <Route path="/aulas/nova" element={<NovaAula />} />
             <Route path="/aulas/nova/ia" element={<AssistenteIA />} />
             <Route path="/aulas/:id" element={<AulaDetalhes />} />
          </Route>

          {/* Admin & Coordinator routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'coordinator']} />}>
             <Route path="/dashboard" element={<Dashboard />} />
             <Route path="/alunos" element={<Alunos />} />
             <Route path="/professores" element={<Professores />} />
             <Route path="/turmas" element={<Turmas />} />
             <Route path="/aulas" element={<Aulas />} />
             <Route path="/presenca" element={<Presenca />} />
            <Route path="/atividades" element={<Atividades />} />
            <Route path="/materiais" element={<Materiais />} />
            <Route path="/relatorios" element={<Relatorios />} />
          </Route>

          {/* Admin only routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/configuracoes" element={<Configuracoes />} />
          </Route>

          {/* Teacher routes */}
          <Route element={<ProtectedRoute allowedRoles={['teacher']} />}>
            <Route path="/professor" element={<ProfessorHome />} />
            <Route path="/professor/aulas" element={<ProfessorAulas />} />
            <Route path="/professor/presenca" element={<ProfessorPresenca />} />
            <Route path="/professor/atividades" element={<ProfessorAtividades />} />
            <Route path="/professor/materiais" element={<ProfessorMateriais />} />
            <Route path="/professor/alunos" element={<ProfessorAlunos />} />
          </Route>

          {/* Student routes */}
          <Route element={<ProtectedRoute allowedRoles={['student']} />}>
             <Route path="/aluno" element={<AlunoHome />} />
             <Route path="/aluno/aulas" element={<AlunoAulas />} />
             <Route path="/aluno/atividades" element={<AlunoAtividades />} />
             <Route path="/aluno/materiais" element={<AlunoMateriais />} />
             <Route path="/aluno/progresso" element={<AlunoProgresso />} />
             <Route path="/aluno/perfil" element={<AlunoPerfil />} />
          </Route>
          
          <Route path="/checkin/:token" element={<Checkin />} />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
