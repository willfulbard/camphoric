import React from 'react';
import {
  InputGroup,
} from 'react-bootstrap';

import ShowRawJSON from './ShowRawJSON';
import createEventEditForm from './createEventEditForm';

interface Props {
  event: ApiEvent,
}

function EventAdminHome({ event }: Props) {
  const formItems = createEventEditForm(event);

  return (
    <>
      <h1>Event Information</h1>
      {
        formItems.map(
          ({ label, field, Input, passProps }) => (
            <InputGroup key={field}>
              <InputGroup.Prepend>
                <InputGroup.Text>{label}</InputGroup.Text>
              </InputGroup.Prepend>
              <Input
                placeholder={label}
                aria-label={label}
                {...passProps}
              />
            </InputGroup>
          )
        )
      } 
      <ShowRawJSON json={event} />
    </>
  );
}

export default EventAdminHome;
