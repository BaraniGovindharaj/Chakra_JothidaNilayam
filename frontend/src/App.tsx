import Home from './pages/Home';
import 'react-toastify/dist/ReactToastify.css';
import { AppToastContainer } from './component/Toast/Toast';

function App() {
  return (
    <>
      <Home />
      <AppToastContainer />
    </>
  );
}

export default App
