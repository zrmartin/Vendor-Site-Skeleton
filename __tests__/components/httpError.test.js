import React from 'react';
import { render, fireEvent } from 'test-utils';
import '@testing-library/jest-dom/extend-expect'
import { HttpError } from '../../components'
 
test('Successfully displays Http error details', async () => {
  const error = {
    code: 404,
    message: "Not Found"
  }
  const { findByText } = render(<HttpError error={error}/>)

  // Error Details is displayed
  expect(await findByText(error.code, { exact: false })).toBeInTheDocument()
  expect(await findByText(error.message, { exact: false })).toBeInTheDocument()
});

test('Successfully loads components when no error is passed', async () => {
  const { findByText } = render(<HttpError />)

  // Error Outline is displayed
  expect(await findByText('Error code', { exact: false })).toBeInTheDocument()
  expect(await findByText('Error Message', { exact: false })).toBeInTheDocument()
});
