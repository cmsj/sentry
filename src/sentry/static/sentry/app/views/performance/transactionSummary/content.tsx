import React from 'react';
import {Location} from 'history';
import styled from '@emotion/styled';

import {Organization} from 'app/types';
import {t} from 'app/locale';
import overflowEllipsis from 'app/styles/overflowEllipsis';
import EventView from 'app/utils/discover/eventView';
import {ContentBox, HeaderBox} from 'app/views/eventsV2/styles';
import Tags from 'app/views/eventsV2/tags';
import EventsV2 from 'app/utils/discover/eventsv2';
import Button from 'app/components/button';
import {IconStar} from 'app/icons';
import space from 'app/styles/space';
import theme from 'app/utils/theme';

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
    const {location, eventView, organization} = this.props;

    return (
      <EventsV2
        eventView={eventView}
        organization={organization}
        location={location}
        keyTransactions
        extraQuery={{
          // only need 1 query to confirm if the transaction is a key transaction
          per_page: 1,
        }}
      >
        {({isLoading, tableData}) => {
          if (isLoading || !tableData) {
            return null;
          }

          const hasResults =
            tableData && tableData.data && tableData.meta && tableData.data.length > 0;

          return <KeyTransactionButton isKeyTransaction={!!hasResults} />;
        }}
      </EventsV2>
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
  isKeyTransaction: boolean;
};

type KeyTransactionButtonState = {
  isKeyTransaction: boolean;
};

class KeyTransactionButton extends React.Component<
  KeyTransactionButtonProps,
  KeyTransactionButtonState
> {
  state: KeyTransactionButtonState = {
    isKeyTransaction: this.props.isKeyTransaction,
  };

  toggleKeyTransaction = () => {
    console.log('toggleKeyTransaction');

    this.setState((prevState: KeyTransactionButtonState) => {
      return {
        isKeyTransaction: !prevState.isKeyTransaction,
      };
    });
  };

  render() {
    const {isKeyTransaction} = this.state;

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
