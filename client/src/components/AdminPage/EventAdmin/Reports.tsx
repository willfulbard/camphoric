import React from 'react';
// import { useEvent } from '../../../hooks';

interface Props {
  event: ApiEvent,
}

function EventAdminReports({ event }: Props) {
  return (
    <React.Fragment>
      <h1>Reports</h1>
      <pre>{JSON.stringify(event, null, 2)}</pre>
    </React.Fragment>
  );
}

export default EventAdminReports;
