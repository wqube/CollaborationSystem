interface ApiProblem {
  status?: number;
  title?: string;
}

export const getApiProblem = (error: unknown): ApiProblem => {
  const response = (
    error as { response?: { status?: number; data?: { title?: string } } }
  )?.response;

  return {
    status: response?.status,
    title: response?.data?.title,
  };
};

export const isConflictError = (error: unknown) =>
  getApiProblem(error).status === 409;

export const getProjectCreateErrorMessage = (error: unknown) => {
  if (isConflictError(error)) {
    return 'В системе уже есть проект с таким названием, попробуйте ввести другое';
  }

  return 'Ошибка при создании проекта';
};

export const getSuggestionCreateErrorMessage = (error: unknown) => {
  if (isConflictError(error)) {
    return 'В этом проекте уже есть предложение с таким текстом, попробуйте изменить формулировку';
  }

  return 'Ошибка при создании предложения';
};
