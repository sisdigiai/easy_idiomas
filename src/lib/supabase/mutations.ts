type MutationResult<T = unknown> = { data: T | null; error: unknown | null };

const unsupported = {
  data: null,
  error: "student_mutations_require_rpc",
};

export async function createStudent(_studentData: unknown): Promise<MutationResult> {
  return unsupported;
}

export async function updateStudent(_id: string, _updates: unknown): Promise<MutationResult> {
  return unsupported;
}

export async function deleteStudent(_id: string): Promise<MutationResult> {
  return unsupported;
}
