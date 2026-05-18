export type Role = 'admin' | 'coordinator' | 'teacher' | 'student';

export interface NavItem {
  label: string;
  icon: string;
  path: string;
  activeIcon?: string;
}

export const ROLE_NAVIGATION: Record<Role, NavItem[]> = {
  admin: [
    { label: "Início", icon: "home", path: "/dashboard", activeIcon: "home" },
    { label: "Alunos", icon: "group", path: "/alunos", activeIcon: "person" },
    { label: "Professores", icon: "badge", path: "/professores", activeIcon: "badge" },
    { label: "Turmas", icon: "class", path: "/turmas", activeIcon: "class" },
    { label: "Aulas", icon: "school", path: "/aulas", activeIcon: "school" },
    { label: "Presença", icon: "qr_code_scanner", path: "/presenca", activeIcon: "qr_code_scanner" },
    { label: "Atividades", icon: "assignment", path: "/atividades", activeIcon: "assignment" },
    { label: "Materiais", icon: "menu_book", path: "/materiais", activeIcon: "menu_book" },
    { label: "Relatórios", icon: "assessment", path: "/relatorios", activeIcon: "assessment" },
    { label: "Configurações", icon: "settings", path: "/configuracoes", activeIcon: "settings" },
  ],
  coordinator: [
    { label: "Início", icon: "home", path: "/dashboard", activeIcon: "home" },
    { label: "Alunos", icon: "group", path: "/alunos", activeIcon: "person" },
    { label: "Professores", icon: "badge", path: "/professores", activeIcon: "badge" },
    { label: "Turmas", icon: "class", path: "/turmas", activeIcon: "class" },
    { label: "Aulas", icon: "school", path: "/aulas", activeIcon: "school" },
    { label: "Presença", icon: "qr_code_scanner", path: "/presenca", activeIcon: "qr_code_scanner" },
    { label: "Atividades", icon: "assignment", path: "/atividades", activeIcon: "assignment" },
    { label: "Materiais", icon: "menu_book", path: "/materiais", activeIcon: "menu_book" },
    { label: "Relatórios", icon: "assessment", path: "/relatorios", activeIcon: "assessment" },
  ],
  teacher: [
    { label: "Início", icon: "home", path: "/professor", activeIcon: "home" },
    { label: "Minhas aulas", icon: "school", path: "/professor/aulas", activeIcon: "school" },
    { label: "Presença", icon: "qr_code_scanner", path: "/professor/presenca", activeIcon: "qr_code_scanner" },
    { label: "Atividades", icon: "assignment", path: "/professor/atividades", activeIcon: "assignment" },
    { label: "Materiais", icon: "menu_book", path: "/professor/materiais", activeIcon: "menu_book" },
    { label: "Meus alunos", icon: "group", path: "/professor/alunos", activeIcon: "person" },
  ],
  student: [
    { label: "Início", icon: "home", path: "/aluno", activeIcon: "home" },
    { label: "Minhas aulas", icon: "school", path: "/aluno/aulas", activeIcon: "school" },
    { label: "Atividades", icon: "assignment", path: "/aluno/atividades", activeIcon: "assignment" },
    { label: "Materiais", icon: "menu_book", path: "/aluno/materiais", activeIcon: "menu_book" },
    { label: "Progresso", icon: "trending_up", path: "/aluno/progresso", activeIcon: "trending_up" },
    { label: "Perfil", icon: "person", path: "/aluno/perfil", activeIcon: "person" },
  ]
};
