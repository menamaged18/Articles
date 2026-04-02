import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../store/slices/usersSlice"; 
import './HomeStyle.css';

const Home = () => {
  const dispatch = useDispatch();
  
  // Access the currentUser and token from the Redux state
  const { currentUser, token } = useSelector((state) => state.users);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <div id="HomeContainer">
      {token && currentUser ? (
        <div className="user-profile">
          <h1>Welcome, {currentUser.name}!</h1>
          <div className="user-details">
            <p><strong>Email:</strong> {currentUser.email}</p>
            <p><strong>Role:</strong> {currentUser.role}</p>
            <p><strong>Joined:</strong> {new Date(currentUser.created_at).toLocaleDateString()}</p>
          </div>
          
          <button 
            onClick={handleLogout} 
            className="logout-button"
            style={{ marginTop: '20px', cursor: 'pointer' }}
          >
            Logout
          </button>
        </div>
      ) : (
        <div className="guest-view">
          <h1>Please log in to see your profile.</h1>
          <Link to='/login' className="login-link"> Login </Link>
        </div>
      )}
    </div>
  );
};

export default Home;