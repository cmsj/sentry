import {Client} from 'app/api';
import {t} from 'app/locale';
import {addErrorMessage} from 'app/actionCreators/indicator';

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

  promise.catch(() => {
    addErrorMessage(t('Unable to update key transaction'));
  });

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

  promise.catch(() => {
    addErrorMessage(t('Unable to update key transaction'));
  });

  return promise;
}
