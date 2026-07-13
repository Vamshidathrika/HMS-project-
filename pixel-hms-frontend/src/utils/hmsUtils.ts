export const getHeaders = (contentType: string | null = 'application/json') => {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {};
  if (contentType) headers['Content-Type'] = contentType;
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

export const calculateAge = (dobString?: string): string => {
  if (!dobString) return '35 Yrs';
  try {
    const birthDate = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return `${age} Yrs`;
  } catch (e) {
    return '35 Yrs';
  }
};
