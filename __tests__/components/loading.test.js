import React from 'react';
import { render } from 'test-utils';
import '@testing-library/jest-dom/extend-expect'
import { Loading } from '../../components'

test('Succesfully display Loading Component', async () => {
  const { findByText } = render(<Loading/>)

  // Error Details displayed
  expect(await findByText("Loading", { exact: false })).toBeInTheDocument()
});