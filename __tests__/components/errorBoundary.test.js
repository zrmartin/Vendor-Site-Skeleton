import React from 'react';
import { render, fireEvent } from 'test-utils';
import '@testing-library/jest-dom/extend-expect'
import { ErrorBoundary } from '../../components'

//Exmaple of how to write test from https://github.com/facebook/react/issues/11098 

it('renders "There was an error loading this page." when an error is thrown in component render', async () => {
	const spy = jest.spyOn(console, 'error')
	spy.mockImplementation(() => {})

	const Throw = () => {
		throw new Error('error')
	}

	const { findByText } = render(
		<ErrorBoundary>
			<Throw />
		</ErrorBoundary>,
	)

	expect(await findByText('There was an error loading this page.')).toBeDefined()

	spy.mockRestore()
})
