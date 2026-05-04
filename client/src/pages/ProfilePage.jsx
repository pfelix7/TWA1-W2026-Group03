import Card from "../components/Card.jsx";

export default function ProfilePage({ user }) {
  return (
    <Card>
      <h2>My Profile</h2>
      <p>
        <strong>Name:</strong> {user.firstName} {user.lastName}
      </p>
      <p>
        <strong>Email:</strong> {user.email}
      </p>
      <p>
        <strong>Role:</strong> {user.role}
      </p>
    </Card>
  );
}
