export type RootStackParamList = {
  Login: undefined;
  RegisterScreen: undefined;
  Projects: undefined;
  ProjectDetail: { projectId: number };
  CreateProject: undefined;
  CreateTask: undefined;
  InviteUsersScreen: { currentUserId: number; currentUserRole: string; projectId: number };
  EditProjectScreen: { projectId: number };
};
