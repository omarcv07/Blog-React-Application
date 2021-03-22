import './App.css';
import DisplayPosts from './components/DisplayPosts';
import CreatePost from './components/CreatePost';
import { withAuthenticator } from 'aws-amplify-react';
import '@aws-amplify/ui/dist/style.css';

function App() {
  return (
    <div className="App">
      <CreatePost />
      <DisplayPosts />
    </div>
  );
}

export default withAuthenticator(App, {
  includeGreetings: true
});
