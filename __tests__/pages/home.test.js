import React from 'react';
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { render, fireEvent, waitFor, act } from 'test-utils';
import '@testing-library/jest-dom/extend-expect'
import { Home } from '../../pages'
global.fetch = require('isomorphic-fetch');

//https://github.com/vercel/next.js/issues/16864
jest.mock('next/link', () => ({ children }) => children);

