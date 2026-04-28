import { SessionRestorer } from './auth/SessionRestorer';
import { AppRouter } from './router';

function App() {
  return (
    <SessionRestorer>
      <AppRouter />
    </SessionRestorer>
  );
}

export default App;
