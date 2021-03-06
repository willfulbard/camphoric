import React from 'react';
import { useRouteMatch } from 'react-router-dom';
import {
  InputGroup,
  FormControl,
  Container,
  Row,
  Col,
} from 'react-bootstrap';

import Spinner from '../../Spinner';

import RegistrationSearchResult from './RegistrationSearchResult';
import RegistrationEdit from './RegistrationEdit';

import { useCombinedEventInfo, useQuery } from '../hooks';

interface Props {
  event: ApiEvent,
}

function EventAdminRegistrations({ event }: Props) {
  const { url } = useRouteMatch();
  const registrationId = useQuery('registrationId');
  const registrationMap = useCombinedEventInfo(event.id);

  let registrations = Object.values(registrationMap);
  const [searchQuery, setSearchQuery] = React.useState('');

  if (!registrations || !registrations.length) return <Spinner />;

  if (searchQuery.length > 2) {
    registrations = registrations.filter(
      r => r.searchStr.includes(searchQuery.toLowerCase())
    );
  }

  return (
    <Container>
      <Row>
        <Col md={3}>
          <InputGroup className="mb-3">
            <FormControl
              placeholder="search"
              aria-label="search"
              onChange={e => setSearchQuery(e.currentTarget.value)}
            />
          </InputGroup>
          {
            registrations.map(
              r => (
                <RegistrationSearchResult
                  key={r.id}
                  registration={r}
                  searchQuery={searchQuery}
                  path={`${url}?registrationId=${r.id}`}
                  selected={r.id.toString() === registrationId}
                />
              )
            )
          }
        </Col>
        <Col md="9">
          {
            !!registrationMap[registrationId] && (
              <RegistrationEdit
                registration={registrationMap[registrationId]}
                event={event}
              />
            )
          }
        </Col>
      </Row>
    </Container>
  );
}

export default EventAdminRegistrations;
