import { useAuth } from "../context/AuthContext";

const ProfilePage = () => {
  const { user } = useAuth();

  return (
    <section className="card profile-card">
      <p className="eyebrow">Profile</p>
      <h2>User Profile</h2>
      <div className="profile-grid">
        <div>
          <span>Name</span>
          <strong>{user?.name}</strong>
        </div>
        <div>
          <span>Email</span>
          <strong>{user?.email}</strong>
        </div>
      </div>
    </section>
  );
};

export default ProfilePage;
