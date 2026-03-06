import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const NotFound = () => {
  const navigate = useNavigate();
  const { isAdmin, isAuthenticated } = useAuth();

  const handleBack = () => {
    if (!isAuthenticated()) navigate("/login");
    else if (isAdmin()) navigate("/admin/dashboard");
    else navigate("/staff/dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-8xl font-bold text-gray-200">404</h1>
        <p className="text-gray-500 mt-3 mb-6">Page not found</p>
        <button onClick={handleBack} className="btn-primary">
          Go Back
        </button>
      </div>
    </div>
  );
};

export default NotFound;