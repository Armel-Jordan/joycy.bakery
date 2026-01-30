import { useState } from 'react';
import { auth } from '../firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  User
} from 'firebase/auth';

interface AuthProps {
  user: User | null;
}

export default function Auth({ user }: AuthProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      setEmail('');
      setPassword('');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (user) {
    return (
      <div className="auth-container">
        <p>Connecté en tant que: {user.email}</p>
        <button onClick={handleSignOut} className="btn btn-secondary">
          Déconnexion
        </button>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <h2>{isLogin ? 'Connexion' : 'Inscription'}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="btn btn-primary">
          {isLogin ? 'Se connecter' : "S'inscrire"}
        </button>
      </form>
      {error && <p className="error">{error}</p>}
      <button 
        onClick={() => setIsLogin(!isLogin)} 
        className="btn btn-link"
      >
        {isLogin ? "Créer un compte" : "Déjà un compte ?"}
      </button>
    </div>
  );
}
