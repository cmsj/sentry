import {Client} from 'app/api';

export function saveKeyTransaction(
  api: Client,
  orgId: string,
  projects: number[],
  transactionName: string
): Promise<undefined> {
  const promise: Promise<undefined> = api.requestPromise(
    `/organizations/${orgId}/key-transactions/`,
    {
      method: 'POST',
      query: {
        project: projects.map(id => String(id)),
      },
      data: {transaction: transactionName},
    }
  );

  return promise;
}

export function deleteKeyTransaction(
  api: Client,
  orgId: string,
  projects: number[],
  transactionName: string
): Promise<undefined> {
  const promise: Promise<undefined> = api.requestPromise(
    `/organizations/${orgId}/key-transactions/`,
    {
      method: 'DELETE',
      query: {
        project: projects.map(id => String(id)),
      },
      data: {transaction: transactionName},
    }
  );

  return promise;
}
