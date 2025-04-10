// Header.test.js
import { render, screen, fireEvent } from '@testing-library/react';
import Header from '../Header';
import { BrowserRouter } from 'react-router-dom';

test('affiche les liens du dropdown au survol', () => {
    render(
        <BrowserRouter>
            <Header />
        </BrowserRouter>
    );

    const galerieBtn = screen.getByText(/Galerie/i);
    fireEvent.mouseEnter(galerieBtn);

    expect(screen.getByText('Old School')).toBeInTheDocument();
    expect(screen.getByText('Réaliste')).toBeInTheDocument();
});
