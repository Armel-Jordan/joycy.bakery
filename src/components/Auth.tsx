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

  const [showModal, setShowModal] = useState(false);

  if (user) {
    return (
      <div className="auth-user">
        <span className="user-email">{user.email}</span>
        <button onClick={handleSignOut} className="btn btn-secondary btn-sm">
          Déconnexion
        </button>
      </div>
    );
  }

  return (
    <>
      <button onClick={() => setShowModal(true)} className="btn btn-primary btn-sm">
        Connexion
      </button>

      {showModal && (
        <div className="auth-modal" onClick={() => setShowModal(false)}>
          <div className="auth-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={() => setShowModal(false)}>×</button>
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
        </div>
      )}
    </>
  );
}
