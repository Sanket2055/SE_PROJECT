// theme
import ThemeProvider from './theme';
import Router from './routes';
import './styles/global.css';

function App() {
    return (
        <ThemeProvider>
            <Router />
        </ThemeProvider>
    );
}

export default App;
