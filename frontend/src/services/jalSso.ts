export type JalSsoFormData = {
  targetUrl: string;
  method: string;
  contentType?: string;
  fields: Record<string, string>;
};

type NestWrappedResponse<T> = {
  success?: boolean;
  message?: string;
  meta?: unknown;
  data: T;
};

export async function getJalSsoForm(
  userId: string,
  projectNumber?: string,
): Promise<JalSsoFormData> {
  const res = await fetch('/api/v1/integrations/jal/sso', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: userId, projectNumber }),
  });

  const json = (await res.json()) as NestWrappedResponse<JalSsoFormData>;

  if (!res.ok) {
    throw new Error(
      typeof json.message === 'string' ? json.message : `JAL SSO failed (${res.status})`,
    );
  }

  if (!json.data?.targetUrl || !json.data.method || !json.data.fields) {
    throw new Error('Invalid JAL SSO response from server');
  }

  return json.data;
}

export function redirectToJal(ssoData: JalSsoFormData): void {
  const form = document.createElement('form');
  form.method = ssoData.method;
  form.action = ssoData.targetUrl;
  form.target = '_blank';
  form.style.display = 'none';

  for (const [key, value] of Object.entries(ssoData.fields)) {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = key;
    input.value = value;
    form.appendChild(input);
  }

  document.body.appendChild(form);
  form.submit();
}
