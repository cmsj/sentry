import React from 'react';
import {Location} from 'history';
import styled from '@emotion/styled';

import withApi from 'app/utils/withApi';
import {Client} from 'app/api';
import {Organization} from 'app/types';
import {t} from 'app/locale';
import space from 'app/styles/space';
import theme from 'app/utils/theme';
import overflowEllipsis from 'app/styles/overflowEllipsis';
import EventView from 'app/utils/discover/eventView';
import {ContentBox, HeaderBox} from 'app/views/eventsV2/styles';
import Tags from 'app/views/eventsV2/tags';
import EventsV2 from 'app/utils/discover/eventsv2';
import Button from 'app/components/button';
import {IconStar} from 'app/icons';
import {saveKeyTransaction, deleteKeyTransaction} from 'app/actionCreators/performance';

import SummaryContentTable from './table';
import Breadcrumb from './breadcrumb';
import UserStats from './userStats';

const TOP_SLOWEST_TRANSACTIONS = 5;

type Props = {
  location: Location;
  eventView: EventView;
  transactionName: string;
  organization: Organization;
  totalValues: number | null;
};

class SummaryContent extends React.Component<Props> {
  renderKeyTransactionButton() {
    const {eventView, organization, transactionName} = this.props;

    return (
      <KeyTransactionButton
        transactionName={transactionName}
        eventView={eventView}
        organization={organization}
      />
    );
  }

  render() {
    const {transactionName, location, eventView, organization, totalValues} = this.props;

    return (
      <React.Fragment>
        <HeaderBox>
          <div>
            <Breadcrumb
              organization={organization}
              location={location}
              eventView={eventView}
              transactionName={transactionName}
            />
          </div>
          <KeyTransactionContainer>
            {this.renderKeyTransactionButton()}
          </KeyTransactionContainer>
          <StyledTitleHeader>{transactionName}</StyledTitleHeader>
        </HeaderBox>
        <ContentBox>
          <EventsV2
            location={location}
            eventView={eventView}
            organization={organization}
            extraQuery={{
              per_page: TOP_SLOWEST_TRANSACTIONS,
            }}
          >
            {({isLoading, tableData}) => (
              <SummaryContentTable
                organization={organization}
                location={location}
                eventView={eventView}
                tableData={tableData}
                isLoading={isLoading}
                totalValues={totalValues}
              />
            )}
          </EventsV2>
          <Side>
            <UserStats
              organization={organization}
              location={location}
              eventView={eventView}
            />
            <Tags
              totalValues={totalValues}
              eventView={eventView}
              organization={organization}
              location={location}
            />
          </Side>
        </ContentBox>
      </React.Fragment>
    );
  }
}

type KeyTransactionButtonProps = {
  api: Client;
  eventView: EventView;
  organization: Organization;
  transactionName: string;
};

type KeyTransactionButtonState = {
  isLoading: boolean;
  keyFetchID: symbol | undefined;
  error: null | string;

  isKeyTransaction: boolean;
};

const KeyTransactionButton = withApi(
  class KeyTransactionButtonInner extends React.Component<
    KeyTransactionButtonProps,
    KeyTransactionButtonState
  > {
    state: KeyTransactionButtonState = {
      isLoading: true,
      keyFetchID: undefined,
      error: null,

      isKeyTransaction: false,
    };

    componentDidMount() {
      this.fetchData();
    }

    componentDidUpdate(prevProps: KeyTransactionButtonProps) {
      const orgSlugChanged = prevProps.organization.slug !== this.props.organization.slug;
      const projectsChanged =
        prevProps.eventView.project.length === 1 &&
        this.props.eventView.project.length === 1 &&
        prevProps.eventView.project[0] !== this.props.eventView.project[0];

      if (orgSlugChanged || projectsChanged) {
        this.fetchData();
      }
    }

    fetchData = () => {
      const {organization, eventView, transactionName} = this.props;

      const projects = eventView.project as number[];

      if (projects.length !== 1) {
        return;
      }

      const url = `/organizations/${organization.slug}/is-key-transactions/`;
      const keyFetchID = Symbol('keyFetchID');

      this.setState({isLoading: true, keyFetchID});

      this.props.api
        .requestPromise(url, {
          method: 'GET',
          includeAllArgs: true,
          query: {
            project: projects.map(id => String(id)),
            transaction: transactionName,
          },
        })
        .then(([data, _, _jqXHR]) => {
          if (this.state.keyFetchID !== keyFetchID) {
            // invariant: a different request was initiated after this request
            return;
          }

          this.setState({
            isLoading: false,
            keyFetchID: undefined,
            error: null,
            isKeyTransaction: !!data?.isKey,
          });
        })
        .catch(err => {
          this.setState({
            isLoading: false,
            keyFetchID: undefined,
            error: err.responseJSON.detail,
            isKeyTransaction: false,
          });
        });
    };

    toggleKeyTransaction = () => {
      this.setState((prevState: KeyTransactionButtonState) => {
        const nextIsKeyTransaction = !prevState.isKeyTransaction;

        const {eventView, api, organization, transactionName} = this.props;

        const projects = eventView.project as number[];

        if (nextIsKeyTransaction) {
          saveKeyTransaction(api, organization.slug, projects, transactionName);
        } else {
          deleteKeyTransaction(api, organization.slug, projects, transactionName);
        }

        return {
          isKeyTransaction: !prevState.isKeyTransaction,
        };
      });
    };

    render() {
      const {isKeyTransaction, isLoading} = this.state;

      if (this.props.eventView.project.length !== 1 || isLoading) {
        return null;
      }

      return (
        <Button onClick={this.toggleKeyTransaction}>
          <StyledIconStar
            size="xs"
            color={isKeyTransaction ? theme.yellow : undefined}
            solid={!!isKeyTransaction}
          />
          {t('Key Transaction')}
        </Button>
      );
    }
  }
);

const StyledTitleHeader = styled('span')`
  font-size: ${p => p.theme.headerFontSize};
  color: ${p => p.theme.gray4};
  grid-column: 1/2;
  align-self: center;
  min-height: 30px;
  ${overflowEllipsis};
`;

const Side = styled('div')`
  grid-column: 2/3;
`;

const KeyTransactionContainer = styled('div')`
  display: flex;
  justify-content: flex-end;
`;

const StyledIconStar = styled(IconStar)`
  margin-right: ${space(1)};
`;

export default SummaryContent;
