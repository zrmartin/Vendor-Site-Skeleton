import React from 'react';
import { render, fireEvent } from 'test-utils';
import '@testing-library/jest-dom/extend-expect'
import { QuantitySelector } from '../../components'
 
test('Successfully Displays Quantity Selector with correct options for maxQuantity', async () => {
  const quantity = 1
  const maxQuantity = 100
  const setQuantity = jest.fn()
  const { getAllByTestId } = render(<QuantitySelector quantity={quantity} maxQuantity={maxQuantity} setQuantity={setQuantity}/>)
  let options = getAllByTestId('select-option')

  expect(options.length).toEqual(maxQuantity)
});
